# Server

Express server using TypeScript. Firebase Admin connects the server to Cloud
Firestore and verifies Firebase Authentication ID tokens. Express handles
profile reads and writes and serves username suggestions and avatar previews.

## Firebase setup

1. Open the [Firebase Console](https://console.firebase.google.com/) and select the project used by the frontend. Go to **Firestore → Create database** if needed. Create the `(default)` database in **Standard edition** and start in **Production mode** so browser access is denied by default. [Firestore setup](https://firebase.google.com/docs/firestore/quickstart)
2. Copy `server/.env.example` to `server/.env`. Set `FIREBASE_PROJECT_ID` to the same value as `VITE_FIREBASE_PROJECT_ID` in the client. The server loads `server/.env` when started from the `server` directory.
3. Provide Application Default Credentials (ADC) to the server. On Google Cloud, use an attached service account with the **Cloud Datastore User** (`roles/datastore.user`) role on the Firestore project. For local development, use existing ADC or generate a key under **Project settings → Service accounts → Firebase Admin SDK → Generate new private key**. Store the JSON outside the repository and set `GOOGLE_APPLICATION_CREDENTIALS` in `server/.env` to its absolute path. Keep credentials on the server. [Admin SDK setup](https://firebase.google.com/docs/admin/setup) · [Firestore IAM roles](https://cloud.google.com/firestore/docs/security/iam)

## Development

```sh
npm install
npm run dev
```

The server defaults to port `3000`. Set the `PORT` environment variable to override it.

```sh
npm run typecheck
npm run build
npm start
```

## API

Profile and generation requests require `Authorization: Bearer <Firebase ID token>`, with
the token returned by Firebase's `getIdToken()`. The backend stores profile
documents under `users/{uid}/profiles` using the verified UID. Send JSON bodies
with `Content-Type: application/json`.

| Method and path | Input | Success response |
| --- | --- | --- |
| `GET /api/profiles` | None | `200` array of profiles |
| `POST /api/profiles` | `firstName`, `username`, `service`. Optionally include `picture` with `variant` and `comments`. | `201` created profile with its Firestore ID |
| `PUT /api/profiles/:profileId/username` | `username` | `200` updated profile |
| `PUT /api/profiles/:profileId/picture` | `picture`, optional `variant` and `comments` | `200` updated profile |
| `DELETE /api/profiles/:profileId` | None | `204`, including repeated deletes |
| `GET /api/usernames?name=Sam` | `name` | `200` with `{ "candidates": [...] }` |
| `GET /api/picture?username=sam123&variant=0` | `username`, optional `variant` | `200` with `picture`, `variant`, and `source: "pollinations"` |

Profiles have `id`, `firstName`, `username`, `service`, `picture`, `variant`,
and `comments` fields. A profile can be created before a picture is selected.
Picture values are HTTP(S) or SVG data URLs. Invalid input returns `400`, and
updates to a missing profile return `404`.

### Generation providers

- Set `GEMINI_API_KEY` in `server/.env` to a [Google AI Studio API key](https://aistudio.google.com/apikey). Username generation uses Gemini 3.5 Flash-Lite, which has a free tier. A missing key returns `503`. [Gemini pricing](https://aistudio.google.com/docs/pricing#gemini-3.5-flash-lite)
- Set `POLLINATIONS_API_KEY` in `server/.env` to a [Pollinations secret key](https://enter.pollinations.ai/) for live image generation. The route uses FLUX.1 Schnell, which can use free Quest credits and still costs credits per generation. A missing key returns `503`. Generated media URLs are publicly readable by anyone with the link. [Pollinations API](https://gen.pollinations.ai/docs) · [Free Quest credits](https://pollinations.ai/)

Restart the server after changing its environment. Both keys stay in the server
environment. Generation routes require Firebase authentication and validate inputs
before contacting either provider. Gemini receives the name separately from the
fixed system instruction and the server validates the returned candidates.
Pollinations receives a server-composed prompt and a seed derived from the username
and variant. Provider HTTP errors return `502` with a safe explanation,
`upstreamStatus`, and a recognized `upstreamCode` when available. Timeouts
return `504`. Use a free-tier Gemini project and a Pollinations key without a
paid balance for testing.
