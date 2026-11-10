import { useState } from "react";
import Home from "./pages/Home.jsx";
import Profiles from "./pages/Profiles.jsx";
import ProfileDetail from "./pages/ProfileDetail.jsx";
import Picture from "./pages/Picture.jsx";
import Login from "./pages/Login.jsx";

export default function App() {
  const [page, setPage] = useState("login");
  const [profiles, setProfiles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const selectedProfile = profiles.find((profile) => profile.id === selectedId);

  function saveProfile(profile) {
    // TODO: Send the selected picture to the server and save its URL on the
    // confirmed username's database record before updating the local profile list.
    setProfiles([...profiles, profile]);
    setDraft(null);
    setPage("profiles");
  }

  function openProfile(id) {
    setSelectedId(id);
    setPage("detail");
  }

  function updateProfile(updatedProfile) {
    setProfiles(
      profiles.map((profile) =>
        profile.id === updatedProfile.id ? updatedProfile : profile,
      ),
    );
  }

  return (
    <main>
      <h1>Profile Generator</h1>
      {page !== "login" && <nav aria-label="Main navigation">
        <button onClick={() => setPage("create")} disabled={page === "create"}>
          Create profile
        </button>
        <button
          onClick={() => setPage("profiles")}
          disabled={page === "profiles"}
        >
          Saved profiles
        </button>
      </nav>}

      {page === "login" && <Login onLogin={() => setPage("profiles")} />}

      {page === "create" && (
        <Home
          draft={draft}
          onConfirm={(profile) => {
            // TODO: Send the confirmed username, first name, and service to the
            // server to save in the database. Keep the returned record ID in the draft.
            setDraft(profile);
            setPage("picture");
          }}
        />
      )}
      {page === "picture" && draft && (
        <Picture
          draft={draft}
          onSave={saveProfile}
          onBack={() => setPage("create")}
        />
      )}
      {page === "profiles" && (
        <Profiles profiles={profiles} onOpen={openProfile} />
      )}
      {page === "detail" && selectedProfile && (
        <ProfileDetail
          key={selectedProfile.id}
          profile={selectedProfile}
          onUpdate={updateProfile}
          onBack={() => setPage("profiles")}
        />
      )}
    </main>
  );
}
