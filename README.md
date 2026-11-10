# Profile Generator

A simple React frontend with four screens:

- Choose a username: enter a first name, choose a username and service, and confirm to continue.
- Choose a picture: generate a placeholder picture, select it, and save the complete profile.
- Saved profiles: see the profiles you created and download their JSON data.
- Profile details: review a profile, reroll its picture with comments, and download the picture.

## Run

```sh
npm install
npm run dev
```

```sh
npm run build
npm run lint
```

## Files

- `src/App.jsx`: navigation and shared profile state.
- `src/pages/Home.jsx`: create profile screen.
- `src/pages/Picture.jsx`: picture selection and save screen.
- `src/pages/Profiles.jsx`: saved profile list.
- `src/pages/ProfileDetail.jsx`: review and reroll screen.
- `src/utils/avatar.js`: placeholder pictures and JSON downloads.
- `src/styles/index.css`: basic styles.

## Not implemented yet

Server requests and OpenAI image generation are not connected. Usernames and pictures are local placeholders. Reroll comments are saved but do not affect pictures yet. Profiles reset when the page refreshes.

When adding OpenAI later, call it from your server and keep the API key there.
