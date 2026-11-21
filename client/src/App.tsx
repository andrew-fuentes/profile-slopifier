import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { Auth, User } from "firebase/auth";
import { auth } from "./firebase";
import { createApi, errorMessage } from "./api";
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
        <ProfileWorkspace key={user.uid} auth={auth} user={user} />
      ) : (
        <Login auth={auth} />
      )}
    </main>
  );
}

function ProfileWorkspace({ auth, user }: { auth: Auth; user: User }) {
  const api = useMemo(() => createApi(user), [user]);
  const [page, setPage] = useState<Page>("profiles");
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);
  const [changingProfile, setChangingProfile] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const selectedProfile = profiles.find((profile) => profile.id === selectedId);

  useEffect(() => {
    const controller = new AbortController();
    api.listProfiles(controller.signal).then((saved) => {
      if (!controller.signal.aborted) setProfiles(saved);
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setProfileError(errorMessage(error));
    }).finally(() => {
      if (!controller.signal.aborted) setLoadingProfiles(false);
    });
    return () => controller.abort();
  }, [api, loadAttempt]);

  function retryProfiles() {
    setProfileError("");
    setLoadingProfiles(true);
    setLoadAttempt((attempt) => attempt + 1);
  }

  async function saveProfile(values: Omit<Profile, "id">) {
    setChangingProfile(true);
    try {
      const profile = await api.createProfile(values);
      setProfiles((current) => [...current, profile]);
      setDraft(null);
      setPage("profiles");
      if (profileError) retryProfiles();
    } finally {
      setChangingProfile(false);
    }
  }

  function openProfile(id: string) {
    setSelectedId(id);
    setPage("detail");
  }

  function updateProfile(updatedProfile: Profile) {
    setProfiles((current) =>
      current.map((profile) =>
        profile.id === updatedProfile.id ? updatedProfile : profile,
      ),
    );
  }

  function removeProfile(id: string) {
    setProfiles((current) => current.filter((profile) => profile.id !== id));
    setSelectedId(null);
    setPage("profiles");
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
        <button onClick={() => setPage("create")} disabled={page === "create" || loadingProfiles || changingProfile || signingOut}>
          Create profile
        </button>
        <button
          onClick={() => setPage("profiles")}
          disabled={page === "profiles" || changingProfile || signingOut}
        >
          Saved profiles
        </button>
        <button onClick={handleSignOut} disabled={signingOut || changingProfile}>
          Sign out
        </button>
      </nav>
      {signOutError && <p role="alert">Could not sign out. Try again.</p>}

      {page === "create" && (
        <Home
          api={api}
          draft={draft}
          onConfirm={(profile) => {
            setDraft(profile);
            setPage("picture");
          }}
        />
      )}
      {page === "picture" && draft && (
        <Picture
          api={api}
          draft={draft}
          onSave={saveProfile}
          onBack={() => setPage("create")}
        />
      )}
      {page === "profiles" && (
        <Profiles
          profiles={profiles}
          loading={loadingProfiles}
          error={profileError}
          onRetry={retryProfiles}
          onOpen={openProfile}
        />
      )}
      {page === "detail" && selectedProfile && (
        <ProfileDetail
          key={selectedProfile.id}
          api={api}
          profile={selectedProfile}
          busy={changingProfile}
          onBusyChange={setChangingProfile}
          onUpdate={updateProfile}
          onDelete={() => removeProfile(selectedProfile.id)}
          onBack={() => setPage("profiles")}
        />
      )}
    </>
  );
}
