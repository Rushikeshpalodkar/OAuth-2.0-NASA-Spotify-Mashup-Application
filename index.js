const http = require("http");
const https = require("https");
const fs = require("fs");
const querystring = require("querystring");

const port = 3000;
const server = http.createServer();

const { client_id, client_secret, redirect_uri, nasa_api_key } = require("./auth/credentials.json");

server.on("request", handle_request);

// Handel Browesr Request 
function handle_request(req, res) {
  console.log(`New request for ${req.url}`);
  if (req.url === "/") {
    console.log("Serving the home page.");
    const homePage = fs.createReadStream("html/main.html");
    res.writeHead(200, { "Content-Type": "text/html" });
    homePage.pipe(res);
}
else if (req.url.startsWith("/authorize")) {
    console.log("Redirecting user to Spotify OAuth login page...");
    const spotifyAuthUrl =
        `https://accounts.spotify.com/authorize?` +
        querystring.stringify({

            client_id,
            response_type: "code",
            redirect_uri,
            scope: "playlist-modify-public",
        });
    res.writeHead(302, { Location: spotifyAuthUrl });
    res.end();
  } else if (req.url.startsWith("/callback")) {
    handle_spotify_callback(req, res);
  } else if (req.url.startsWith("/search")) {
    console.log("Handling NASA search...");
    handle_search(req, res);
  } else {
    console.log("404 Not Found for URL:", req.url);
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
}

function handle_spotify_callback(req, res) {
    const code = new URL(req.url, `http://localhost:${port}`).searchParams.get("code");
    if (!code) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Authorization code is missing.");
        return;
    }

    const postData = querystring.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri,
        client_id,
        client_secret,
    });

    const options = {
        hostname: "accounts.spotify.com",
        path: "/api/token",
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(postData),
        },
    };

    const tokenRequest = https.request(options, (tokenResponse) => {
        let body = "";
        tokenResponse.on("data", (chunk) => (body += chunk));
        tokenResponse.on("end", () => {
            const tokenData = JSON.parse(body);
            if (tokenData.error) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Failed to fetch access token.");
                return;
            }

            // Cache the token
            fs.writeFileSync("./auth/user-token.json", JSON.stringify(tokenData));
            console.log("Spotify token cached successfully.");

            res.writeHead(302, { Location: "/" }); // Example flow search?date=2024-12-18
            res.end();
        });
    });

    tokenRequest.on("error", (err) => {
        console.error("Error fetching Spotify token:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error fetching Spotify token.");
    });

    tokenRequest.end(postData);
}


function handle_search(req, res) {
    const date = new URL(req.url, `http://localhost:${port}`).searchParams.get("date");
    if (!date) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Date is required.");
        return;
    }

    console.log(`Handling NASA search for date: ${date}`);

    fetch_nasa_data(date, res, (nasaResult) => {
        if (!nasaResult) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Failed to fetch NASA data.");
            return;
        }
        const tokenData = get_cached_token();
        if (!tokenData) {
            res.writeHead(302, { Location: "/authorize" });
            res.end();
            return;
        }
        search_spotify_tracks(tokenData.access_token, nasaResult.title, res, nasaResult);
    });
}


function fetch_nasa_data(date, res, callback) {
    const nasaUrl = `https://api.nasa.gov/planetary/apod?api_key=${nasa_api_key}&date=${date}`;
    

    https.get(nasaUrl, (nasaRes) => {
        let data = "";
        nasaRes.on("data", (chunk) => (data += chunk));
        nasaRes.on("end", () => {
            try {
                const nasaResult = JSON.parse(data);
                if (!nasaResult.title) {
                    
                    callback(null);
                    return;
                }
             
                callback(nasaResult);
            } catch (err) {
                callback(null);
            }
        });
    }).on("error", (err) => {
        console.error("Error fetching NASA API data:", err.message);
        callback(null);
    });
}



function get_cached_token() {
  const tokenFile = "./auth/user-token.json";
  if (!fs.existsSync(tokenFile)) {
    console.warn("Token file does not exist.");
    return null;
  }

  const tokenData = JSON.parse(fs.readFileSync(tokenFile));
  if (new Date(tokenData.expiration) <= Date.now()) {
    return null;
  }

  return tokenData;
}



function search_spotify_tracks(accessToken, query, res, nasaResult) {
    const searchQuery = querystring.stringify({ type: "track", q: query });
    const options = {
      hostname: "api.spotify.com",
      path: `/v1/search?${searchQuery}`,
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    };
  
    const searchRequest = https.request(options, (searchResponse) => {
      let data = "";
      searchResponse.on("data", (chunk) => (data += chunk));
      searchResponse.on("end", () => {
        const spotifyResult = JSON.parse(data);
        render_results(nasaResult, spotifyResult, res);
      });
    });
    searchRequest.end();
  }
  

function render_results(nasaResult, spotifyResult, res) {
  const tracks = spotifyResult.tracks.items
    .map(
      (track) =>
        `<li><a href="${track.external_urls.spotify}" target="_blank">${track.name} by ${track.artists
          .map((a) => a.name)
          .join(", ")}</a></li>`
    )
    .join("");

  const html = `
      <h1>${nasaResult.title}</h1>
      <img src="${nasaResult.url}" alt="${nasaResult.title}" style="max-width: 100%; height: auto;" />
      <p>${nasaResult.explanation}</p>
      <h2>Spotify Tracks</h2>
      <ul>${tracks}</ul>
  `;

  console.log("Generated HTML response.");
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(html);
}



server.listen(port, () => console.log(`Server running at http://localhost:${port}`));
