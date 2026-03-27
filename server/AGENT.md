# Server AGENT.md — Firebase Cloud Functions Backend

## Entry Point

`index.js` is the only entry point. It exports all five Firebase Functions directly — there is no Express app, no routing layer, and no middleware. `app.js`, `routes/`, and `middleware/` have all been deleted.

---

## All Exported Functions

### Scheduled

| Export | Trigger | Description |
|--------|---------|-------------|
| `pollSpotifyStreamsJob` | `onSchedule` every 15 min | Fetches all users with a Spotify token from Firestore, refreshes expired tokens, saves recent plays for each user. |

---

### Callable (invoked from client via Firebase Functions SDK)

| Export | Auth required | Input (`request.data`) | Returns |
|--------|--------------|------------------------|---------|
| `refreshUserStreams` | Yes | `{ timeZone }` | `{ success: 1 }` |
| `notifyUserEmailEntered` | Yes | `{ email }` | `{ success: true }` |

Both callables derive `userId` from `request.auth.uid` — they never trust a value sent from the client. Unauthenticated calls throw `HttpsError('unauthenticated')`.

---

### HTTP / onRequest (Spotify OAuth — require browser redirects, cannot be callable)

| Export | Method | Description |
|--------|--------|-------------|
| `spotifyAuthorise` | GET | Redirects the user's browser to Spotify's OAuth authorisation page. Scopes: `user-top-read user-read-recently-played`. Redirect URI: `{FRONTEND_URL}/spotify/callback`. |
| `spotifyCallback` | GET | Exchanges the OAuth `?code=` for `access_token`, `refresh_token`, `expires_in` and returns them as JSON. Called by `SpotifyAuth.jsx` after Spotify redirects the user back. |

CORS is enabled on both via `onRequest({ cors: true })`.

---

## Services

### `services/spotifyService.js`

| Function | Exported | Description |
|----------|----------|-------------|
| `pollSpotifyStreams()` | Yes | Polls all users with a Spotify token. |
| `refreshUserStreams(userID, timeZone)` | Yes | Fetches and saves recent plays for a single user. |
| `fetchSpotifyStreams(accessToken)` | No | Calls Spotify `/v1/me/player/recently-played?limit=6`. |
| `saveStreamsToDatabase(uid, streams, accessToken, timeZone)` | No | Writes each stream to Firestore. Document ID encodes the local play timestamp. |
| `getArtistImageUrl(artistId, accessToken)` | No | Calls Spotify `/v1/artists/{id}` for the artist image URL. |
| `getNewToken(spotifyRefreshToken, userID)` | No | Exchanges a refresh token for a new access token; updates Firestore. Throws on failure. |

---

## Config

`config/firebaseConfig.js` — initialises `firebase-admin` via Application Default Credentials. Exports only `db` (Firestore). Storage is accessed directly from the client SDK; the server never touches it.

---

## Environment Variables

Set via `firebase functions:config:set` or a `.env` file recognised by the Functions runtime.

| Variable | Used by |
|----------|---------|
| `SPOTIFY_CLIENT_ID` | `spotifyAuthorise`, `spotifyCallback`, `getNewToken` |
| `SPOTIFY_CLIENT_SECRET` | `spotifyCallback`, `getNewToken` |
| `FRONTEND_URL` | `spotifyAuthorise`, `spotifyCallback` (redirect URI) |
| `EMAIL_PASS` | `notifyUserEmailEntered` |

---

## Firestore Data Model

```
Users/
  {uid}/
    spotifyAccessToken: string | null
    spotifyRefreshToken: string | null
    tokenExpiresAt: number (epoch ms)
    userTimeZone: string (IANA tz)
    emailEntered: boolean
    accountVerified: boolean
    spotifyAccountEmail: string

    UserStreaming/
      {YYYY-MM-DD}/
        Streams/
          {YYYY-MM-DD HH:mm:ss Z}/   ← document ID = local play timestamp
            artist, song, song_image_url, artist_id, artist_image_url: string

    UserEntries/
      {YYYY-MM-DD}/
        outputData: object  (EditorJS block data)
```

Firebase Storage (written by client SDK only):
```
Users/{uid}/{date}/Images/{timestamp}-{filename}
```
Rules in `storage.rules` restrict read/write to the owning authenticated user.
