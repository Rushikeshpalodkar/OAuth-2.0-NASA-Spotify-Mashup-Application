# OAuth-2.0-NASA-Spotify-Mashup-Application
This application combines NASA's Astronomy Picture of the Day (APOD) API with Spotify's API to create a seamless mashup. Users can select a date to fetch NASA's APOD, and the application uses the title and description to generate a personalized Spotify playlist. OAuth 2.0 is implemented for secure Spotify authentication.


# NASA + Spotify Mashup

This project combines NASA's Astronomy Picture of the Day (APOD) API with Spotify's API to create a mashup application. The application allows users to fetch NASA's APOD data for a specific date and find Spotify tracks related to the image title, seamlessly integrating both APIs through synchronous server-side requests.

---

## **Features**
- **NASA APOD Integration**: Fetches space imagery and related information based on the user-specified date.
- **Spotify Integration**: Uses Spotify's API to search for tracks related to the NASA APOD title.
- **OAuth 2.0 Authentication**: Implements Spotify's three-legged OAuth for user authentication.
- **Dynamic Results**: Displays the NASA image and explanation alongside a list of Spotify tracks with clickable links.
- **Token Caching**: Caches Spotify access tokens to minimize repeated authentication requests.

---

## **Technologies Used**
- **Node.js**: Core application runtime.
- **HTTP/HTTPS Modules**: For handling server requests and interacting with APIs.
- **querystring**: For building query strings.
- **File System (fs)**: For caching Spotify access tokens.

---

## **Prerequisites**
1. **Node.js**: Install the latest version of Node.js from [Node.js Official Website](https://nodejs.org/).
2. **Spotify Developer Account**: Register and create a new application at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications).
3. **NASA API Key**: Obtain your API key from [NASA Open APIs](https://api.nasa.gov/).

---

## **Setup Instructions**

### 1. Clone the Repository
```bash
$ git clone <repository_url>
$ cd NASA+Spotify
```

### 2. Install Dependencies
No third-party dependencies are required as the project uses Node.js core modules only.

### 3. Configure Credentials
Create an `auth/credentials.json` file and add the following:
```json
{
  "client_id": "your_spotify_client_id",
  "client_secret": "your_spotify_client_secret",
  "redirect_uri": "http://localhost:3000/callback",
  "nasa_api_key": "your_nasa_api_key"
}
```

### 4. Run the Server
```bash
$ node index.js
```
The server will start at `http://localhost:3000`.

---

## **Application Workflow**

1. **Home Page**:
   - User accesses `http://localhost:3000` and sees a form to input a date.

2. **Search Request**:
   - User submits the date.
   - The server fetches NASA APOD data and checks if a valid Spotify token exists.

3. **Spotify Authentication**:
   - If the token is missing or expired, the user is redirected to Spotify’s login page for authorization.
   - After login, Spotify redirects back with an authorization code.

4. **Token Exchange**:
   - The server exchanges the code for an access token and caches it.

5. **Spotify Search**:
   - The server uses the NASA APOD title to search Spotify for related tracks.

6. **Render Results**:
   - NASA APOD data (title, image, and explanation) and Spotify tracks are displayed dynamically.

---

## **Caching Mechanism**
- **Token Caching**:
  - Tokens are stored in `auth/user-token.json`.
  - Expiration is checked before each Spotify API call.

---

## **Error Handling**
1. **Invalid Date**:
   - If the user enters an invalid or missing date, an error message is displayed.

2. **NASA API Errors**:
   - Handles network errors or invalid responses gracefully.

3. **Spotify Token Errors**:
   - Redirects to `/authorize` if the token is invalid or expired.

4. **Spotify Search Errors**:
   - Logs issues related to Spotify search queries.

---

## **Endpoints**

### **1. Home Page** (`/`)
- **Description**: Serves the main HTML page with a date input form.

### **2. Authorization** (`/authorize`)
- **Description**: Redirects to Spotify's OAuth login page.

### **3. Callback** (`/callback`)
- **Description**: Handles Spotify's OAuth callback and caches the access token.

### **4. Search** (`/search?date=<YYYY-MM-DD>`)
- **Description**: Fetches NASA APOD data and Spotify tracks.

---

## **Screencast Guide**

### **What to Cover**
1. **Project Overview**:
   - APIs used, their purpose, and endpoints.

2. **Sequence Diagram**:
   - Walk through the flow of HTTP requests and responses.

3. **Code Walkthrough**:
   - Highlight key functions (e.g., `handle_search`, `fetch_nasa_data`, `search_spotify_tracks`).

4. **Demo**:
   - Run the application and show:
     - Inputting a date.
     - Fetching NASA APOD data.
     - Displaying Spotify search results dynamically.

5. **Discussion**:
   - How caching is implemented.
   - Synchronous API call guarantees.

---

## **License**
This project is licensed under the MIT License. See `LICENSE` for details.

---

## **Acknowledgments**
- [NASA APOD API](https://api.nasa.gov/)
- [Spotify API](https://developer.spotify.com/documentation/web-api/)
- Node.js Core Modules for enabling this lightweight implementation.

