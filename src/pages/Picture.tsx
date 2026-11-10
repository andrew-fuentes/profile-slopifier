import { useState } from "react";
import { avatarUrl } from "../utils/avatar";

import type { Profile, ProfileDraft } from "../types";

interface PictureProps {
  draft: ProfileDraft;
  onSave: (profile: Profile) => void;
  onBack: () => void;
}

export default function Picture({ draft, onSave, onBack }: PictureProps) {
  const [picture, setPicture] = useState("");
  const [variant, setVariant] = useState(0);
  const [selected, setSelected] = useState(false);

  function generatePicture() {
    // Replace this placeholder with a server-side OpenAI request later.
    setPicture(avatarUrl(draft.username, variant));
    setVariant(variant + 1);
    setSelected(false);
  }

  function saveProfile() {
    if (!picture || !selected) return;
    onSave({
      id: crypto.randomUUID(),
      firstName: draft.firstName,
      username: draft.username,
      service: draft.service,
      picture,
      variant,
      comments: "",
    });
  }

  return (
    <section>
      <button onClick={onBack}>Back to username</button>
      <h2>Step 2: Choose a picture</h2>
      <p>Username: {draft.username}</p>
      <p>Service: {draft.service}</p>
      <button onClick={generatePicture}>
        {picture ? "Generate another picture" : "Generate picture"}
      </button>
      {picture && (
        <div>
          <img
            className="profile-picture"
            src={picture}
            alt="Profile picture preview"
          />
          <label>
            <input
              type="checkbox"
              checked={selected}
              onChange={(event) => setSelected(event.target.checked)}
            />
            Use this picture
          </label>
        </div>
      )}
      <button onClick={saveProfile} disabled={!selected}>
        Save profile
      </button>
    </section>
  );
}
