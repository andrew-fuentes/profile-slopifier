import { useState } from "react";
import { errorMessage } from "../api";
import type { ProfileApi } from "../api";
import { downloadProfile } from "../utils/avatar";

import type { FormEvent } from "react";
import type { Profile } from "../types";

interface ProfileDetailProps {
  api: ProfileApi;
  profile: Profile;
  busy: boolean;
  onBusyChange: (busy: boolean) => void;
  onUpdate: (profile: Profile) => void;
  onDelete: () => void;
  onBack: () => void;
}

export default function ProfileDetail({ api, profile, busy, onBusyChange, onUpdate, onDelete, onBack }: ProfileDetailProps) {
  const [comments, setComments] = useState(profile.comments);
  const [username, setUsername] = useState(profile.username);
  const [error, setError] = useState("");

  async function run(action: () => Promise<void>) {
    onBusyChange(true);
    setError("");
    try {
      await action();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      onBusyChange(false);
    }
  }

  function reroll(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void run(async () => {
      const { picture, variant } = await api.generatePicture(profile.username, profile.variant + 1);
      const updated = await api.updatePicture(profile.id, { picture, variant, comments: comments.trim() });
      onUpdate(updated);
    });
  }

  function saveUsername(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void run(async () => {
      const updated = await api.updateUsername(profile.id, username.trim());
      setUsername(updated.username);
      onUpdate(updated);
    });
  }

  function deleteProfile() {
    if (!window.confirm(`Delete the profile for ${profile.username}?`)) return;
    void run(async () => {
      await api.deleteProfile(profile.id);
      onDelete();
    });
  }

  return (
    <section>
      <button onClick={onBack} disabled={busy}>Back to profiles</button>
      <h2>{profile.service} profile</h2>
      <p>Name: {profile.firstName}</p>
      <p>Username: {profile.username}</p>
      {profile.picture && (
        <img className="profile-picture" src={profile.picture} alt={`${profile.username} profile picture`} />
      )}
      {error && <p role="alert">{error}</p>}
      {busy && <p role="status">Updating profile…</p>}
      <form onSubmit={saveUsername}>
        <label htmlFor="profile-username">Edit username</label>
        <input
          id="profile-username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          maxLength={80}
          required
          disabled={busy}
        />
        <button type="submit" disabled={busy || !username.trim() || username.trim() === profile.username}>
          Save username
        </button>
      </form>
      <form onSubmit={reroll}>
        <label htmlFor="comments">Picture comments</label>
        <textarea
          id="comments"
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          rows={4}
          maxLength={1000}
          disabled={busy}
        />
        <button type="submit" disabled={busy}>Reroll picture</button>
      </form>

      {profile.picture && (profile.picture.startsWith("data:") ? (
        <a href={profile.picture} download={`${profile.username}.svg`}>Download picture</a>
      ) : (
        <a href={profile.picture} target="_blank" rel="noreferrer">Open picture</a>
      ))}
      <button onClick={() => downloadProfile(profile)}>Download profile</button>
      <button onClick={deleteProfile} disabled={busy}>Delete profile</button>
    </section>
  );
}
