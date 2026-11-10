# Server

Minimal Express server using TypeScript. JSON request parsing is enabled, and an
empty router is mounted at `/api`. No endpoints or business logic are implemented.

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

Add future API routes in `src/routes/index.ts`.
