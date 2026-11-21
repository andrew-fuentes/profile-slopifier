import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { Auth, User } from "firebase/auth";
import { auth } from "./firebase";
import type { Page, Profile, ProfileDraft } from "./types";
import Home from "./pages/Home";
import Profiles from "./pages/Profiles";
import ProfileDetail from "./pages/ProfileDetail";
import Picture from "./pages/Picture";
import Login from "./pages/Login";

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    if (auth) return onAuthStateChanged(auth, setUser);
  }, []);

  return (
    <main>
      <h1>Profile Generator</h1>
      {!auth ? (
        <p role="alert">Set up Firebase in client/.env.local to enable login.</p>
      ) : user === undefined ? (
        <p role="status">Checking sign-in…</p>
      ) : user ? (
        <ProfileWorkspace key={user.uid} auth={auth} />
      ) : (
        <Login auth={auth} />
      )}
    </main>
  );
}

function ProfileWorkspace({ auth }: { auth: Auth }) {
  const [page, setPage] = useState<Page>("profiles");
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const selectedProfile = profiles.find((profile) => profile.id === selectedId);

  function saveProfile(profile: Profile) {
    // TODO: Send the selected picture to the server and save its URL on the
    // confirmed username's database record before updating the local profile list.
    setProfiles([...profiles, profile]);
    setDraft(null);
    setPage("profiles");
  }

  function openProfile(id: string) {
    setSelectedId(id);
    setPage("detail");
  }

  function updateProfile(updatedProfile: Profile) {
    setProfiles(
      profiles.map((profile) =>
        profile.id === updatedProfile.id ? updatedProfile : profile,
      ),
    );
  }

  async function handleSignOut() {
    setSigningOut(true);
    setSignOutError(false);
    try {
      await signOut(auth);
    } catch {
      setSignOutError(true);
      setSigningOut(false);
    }
  }

  return (
    <>
      <nav aria-label="Main navigation">
        <button onClick={() => setPage("create")} disabled={page === "create"}>
          Create profile
        </button>
        <button
          onClick={() => setPage("profiles")}
          disabled={page === "profiles"}
        >
          Saved profiles
        </button>
        <button onClick={handleSignOut} disabled={signingOut}>
          Sign out
        </button>
      </nav>
      {signOutError && <p role="alert">Could not sign out. Try again.</p>}

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
    </>
  );
}
