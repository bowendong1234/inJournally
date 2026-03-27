# Client AGENT.md — React Frontend

## Tech Stack
- React (Vite), React Router v6
- Firebase JS SDK (Auth, Firestore, Storage, Functions)
- EditorJS (rich-text editor)
- MUI X DatePicker, dayjs, smooth-scrollbar-react

---

## File Structure

```
src/
├── App.jsx                     # Root router
├── main.jsx                    # Entry point — wraps app in AuthProvider + Router
├── Firebase.jsx                # Firebase init — exports auth, db, storage, functions
├── PrivateRoute.jsx            # Auth guard — redirects to / if unauthenticated
│
├── contexts/
│   └── AuthContext.jsx         # Global auth state via onAuthStateChanged
│
├── pages/
│   ├── LoginPage.jsx
│   ├── SignUpPage.jsx
│   ├── ForgotPasswordPage.jsx
│   ├── EditorPage.jsx          # Main app: TopBar + Editor + Spotify sidebar
│   └── SpotifyAuth.jsx         # Spotify OAuth callback handler (/spotify/callback)
│
├── components/
│   ├── Editor.jsx              # EditorJS wrapper — journal entry + image upload
│   ├── TopBar.jsx              # Date picker navigation bar
│   ├── Spotify.jsx             # Spotify streaming data sidebar
│   ├── Song.jsx                # Single song row (rank + album art + stream count badge)
│   ├── TopStream.jsx           # Top song + top artist highlight card
│   ├── EmailInput.jsx          # Spotify allowlist email entry form
│   ├── Login.jsx
│   ├── SignUp.jsx
│   └── ForgotPassword.jsx
│
└── utils/
    └── api.js                  # URL builders — buildApiUrl (legacy) + buildFunctionUrl
```

---

## Routes (`App.jsx`)

| Path | Component | Auth |
|------|-----------|------|
| `/` | `LoginPage` | No |
| `/signup` | `SignUpPage` | No |
| `/forgotpassword` | `ForgotPasswordPage` | No |
| `/spotify/callback` | `SpotifyAuth` | No (reads `localStorage.userID`) |
| `/editor/:date` | `EditorPage` (PrivateRoute) | Yes |

---

## Component Interaction Map

```
App.jsx
└── AuthProvider (AuthContext)
    └── Router
        ├── LoginPage / SignUpPage / ForgotPasswordPage → Firebase Auth
        │
        ├── SpotifyAuth.jsx  (/spotify/callback — Spotify redirects here after OAuth)
        │     ├── Extracts ?code from URL
        │     ├── GET  buildFunctionUrl('spotifyCallback')?code=...
        │     │         → receives { access_token, refresh_token, expires_in }
        │     ├── Writes tokens to Firestore Users/{uid}
        │     └── Navigates to /editor/{today}
        │
        └── PrivateRoute → EditorPage
              ├── TopBar.jsx  (MUI DatePicker → navigate /editor/{date})
              │
              ├── Editor.jsx  (EditorJS)
              │     ├── Reads/writes Firestore: Users/{uid}/UserEntries/{date}
              │     └── Images: uploadBytes + getDownloadURL (Firebase Storage SDK)
              │           Path: Users/{uid}/{date}/Images/{timestamp}-{filename}
              │
              └── Spotify.jsx
                    ├── EmailInput.jsx  (email not yet entered)
                    │     ├── Writes Firestore: Users/{uid}.emailEntered + .spotifyAccountEmail
                    │     └── httpsCallable(functions, 'notifyUserEmailEntered') { email }
                    │
                    ├── "Pending approval" view  (emailEntered && !accountVerified)
                    │
                    └── Authenticated view  (accountVerified)
                          ├── Login button → window.location.href = buildFunctionUrl('spotifyAuthorise')
                          ├── Refresh button → httpsCallable(functions, 'refreshUserStreams') { timeZone }
                          ├── Top Songs view: TopStream.jsx + Song.jsx  (with stream counts)
                          └── All Streams view: chronological list with HH:mm time of day
```

---

## Backend Calls

### `utils/api.js` — URL builders

```js
buildFunctionUrl('spotifyAuthorise')
// → 'https://us-central1-journal-88326.cloudfunctions.net/spotifyAuthorise'
//   when VITE_FUNCTIONS_BASE_URL is set, otherwise '/{functionName}' (relative, needs Hosting rewrite)

buildApiUrl('/some/path')
// → kept for legacy compatibility, currently unused by active code
```

Set `VITE_FUNCTIONS_BASE_URL` in your `.env` files:
- Local: `http://127.0.0.1:5001/journal-88326/us-central1`
- Production: `https://us-central1-journal-88326.cloudfunctions.net`

### HTTP calls (via `buildFunctionUrl`)

| Component | Function | Method | Purpose |
|-----------|----------|--------|---------|
| `Spotify.jsx` | `spotifyAuthorise` | GET (redirect) | Kick off Spotify OAuth flow |
| `SpotifyAuth.jsx` | `spotifyCallback` | GET (fetch) | Exchange OAuth code for tokens |

### Callable functions (via `httpsCallable`)

| Component | Function name | Sends | Server derives |
|-----------|--------------|-------|----------------|
| `Spotify.jsx` | `refreshUserStreams` | `{ timeZone }` | `userId` from auth token |
| `EmailInput.jsx` | `notifyUserEmailEntered` | `{ email }` | `userId` from auth token |

### Firebase Storage (client SDK)

| Component | Operation | Path |
|-----------|-----------|------|
| `Editor.jsx` | `uploadBytes` + `getDownloadURL` | `Users/{uid}/{date}/Images/{timestamp}-{filename}` |

Files use download-token URLs — not public. Rules in `server/storage.rules` restrict access to the owning user.

---

## Direct Firestore Reads/Writes (Client SDK)

| Component | Operation | Path |
|-----------|-----------|------|
| `Spotify.jsx` | `getDoc`, `setDoc` | `Users/{uid}` |
| `Spotify.jsx` | `getDocs` | `Users/{uid}/UserStreaming/{date}/Streams` |
| `SpotifyAuth.jsx` | `updateDoc` | `Users/{uid}` — tokens + timezone |
| `EmailInput.jsx` | `getDoc`, `updateDoc` | `Users/{uid}` — emailEntered, spotifyAccountEmail |
| `Editor.jsx` | `getDoc`, `setDoc` | `Users/{uid}/UserEntries/{date}` |

---

## `Firebase.jsx` Exports

| Export | SDK | Notes |
|--------|-----|-------|
| `firebase` | `firebase/app` | App instance |
| `auth` | `firebase/auth` | Used by AuthContext, Login, SignUp |
| `db` | `firebase/firestore` | Used by all data-reading components |
| `storage` | `firebase/storage` | Used by Editor.jsx image uploader |
| `functions` | `firebase/functions` | Used by Spotify.jsx, EmailInput.jsx |

---

## Auth

- `PrivateRoute` redirects to `/` when `currentUser` is null.
- User ID is persisted to `localStorage` as `userID` on login — used by components that read Firestore directly (Spotify.jsx, EmailInput.jsx, SpotifyAuth.jsx) since `currentUser` may not be available in all contexts.
- Callable functions **do not** receive `userId` from the client — they derive it from the verified Firebase Auth token (`request.auth.uid`).
