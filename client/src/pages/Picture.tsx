import { useState } from "react";
import { errorMessage } from "../api";
import type { ProfileApi } from "../api";

import type { Profile, ProfileDraft } from "../types";

interface PictureProps {
  api: ProfileApi;
  draft: ProfileDraft;
  onSave: (profile: Omit<Profile, "id">) => Promise<void>;
  onBack: () => void;
}

export default function Picture({ api, draft, onSave, onBack }: PictureProps) {
  const [preview, setPreview] = useState<Awaited<ReturnType<ProfileApi["generatePicture"]>> | null>(null);
  const [selected, setSelected] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const busy = generating || saving;

  async function generatePicture() {
    setGenerating(true);
    setError("");
    setSelected(false);
    try {
      setPreview(await api.generatePicture(draft.username, preview ? preview.variant + 1 : 0));
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setGenerating(false);
    }
  }

  async function saveProfile() {
    if (!preview || !selected) return;
    setSaving(true);
    setError("");
    try {
      await onSave({
        firstName: draft.firstName,
        username: draft.username,
        service: draft.service,
        picture: preview.picture,
        variant: preview.variant,
        comments: "",
      });
    } catch (cause) {
      setError(errorMessage(cause));
      setSaving(false);
    }
  }

  return (
    <section>
      <button onClick={onBack} disabled={saving}>Back to username</button>
      <h2>Step 2: Choose a picture</h2>
      <p>Username: {draft.username}</p>
      <p>Service: {draft.service}</p>
      <button onClick={generatePicture} disabled={busy}>
        {generating ? "Generating picture…" : preview ? "Generate another picture" : "Generate picture"}
      </button>
      {error && <p role="alert">{error}</p>}
      {preview && (
        <div>
          <img
            className="profile-picture"
            src={preview.picture}
            alt="Profile picture preview"
          />
          <label>
            <input
              type="checkbox"
              checked={selected}
              disabled={busy}
              onChange={(event) => setSelected(event.target.checked)}
            />
            Use this picture
          </label>
        </div>
      )}
      <button onClick={saveProfile} disabled={!selected || busy}>
        {saving ? "Saving…" : "Save profile"}
      </button>
    </section>
  );
}
