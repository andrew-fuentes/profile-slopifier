# Profile Slopifier

A React application built with Vite and TypeScript.

## Firebase Google sign-in

1. Open the [Firebase Console](https://console.firebase.google.com/) and select or create a project. Analytics is optional. On **Project overview**, select the **Web (`</>`)** icon or **Add app → Web**, enter an app nickname, and select **Register app**. For an existing web app, find the same `firebaseConfig` under **Project settings → General → Your apps → SDK setup and configuration**. [Firebase web setup](https://firebase.google.com/docs/web/setup)
2. Open **Authentication → Get started → Sign-in method**. Select **Google**, enable it, choose the project support email, and save. [Firebase Google sign-in](https://firebase.google.com/docs/auth/web/google-signin)
3. Open **Authentication → Settings → Authorized domains**. Add `localhost` to your development project if it is absent. For a deployed frontend, add its hostname to its Firebase project's authorized domains. Enter hostnames without schemes, paths, or ports. [Firebase Authentication FAQ](https://firebase.google.com/docs/auth/faq-and-troubleshooting#limit-authorized-domains)
4. Copy `.env.example` to `.env.local` in this directory and fill in the values from your web app's `firebaseConfig`.

   | Environment variable | Firebase field |
   | --- | --- |
   | `VITE_FIREBASE_API_KEY` | `apiKey` |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
   | `VITE_FIREBASE_PROJECT_ID` | `projectId` |
   | `VITE_FIREBASE_APP_ID` | `appId` |

5. Start or restart Vite, open the localhost URL it prints, and select **Continue with Google**. Confirm your account appears under **Authentication → Users**, refresh to check session restoration, and select **Sign out** to check that the login screen returns. For deployments, set the same variables in the frontend build environment before running `npm run build`.

## Development

```sh
npm install
npm run dev
```

## Checks and production build

```sh
npm run typecheck
npm run lint
npm run build
npm run preview
```

Application code lives in `src/`. Shared profile and navigation types are in
`src/types.ts`. TypeScript checks application code and tool configuration.
The production build runs the type checker before bundling.
