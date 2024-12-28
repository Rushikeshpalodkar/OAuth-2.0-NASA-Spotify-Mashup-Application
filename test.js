const{client_id, client_secret} = require('./auth/credenttials.json')
let base64data = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
console.log(`Basic ${base64data}`);
// const client_id = '0038ea2272e54fe7ba6062c5c044cd60'; // Your Spotify Client ID
// const redirect_uri = 'http://localhost:3000/callback'; // Your registered redirect URI
// const scopes = 'playlist-modify-public'; // Example scope

// const authorizationUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${encodeURIComponent(scopes)}`;
// console.log(authorizationUrl);
