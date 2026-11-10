import { useState } from "react";
import { avatarUrl, downloadProfile } from "../utils/avatar.js";

export default function ProfileDetail({ profile, onUpdate, onBack }) {
  const [comments, setComments] = useState(profile.comments);

  function reroll(event) {
    event.preventDefault();
    // Demo only: comments are saved, and the placeholder color changes.
    onUpdate({
      ...profile,
      picture: avatarUrl(profile.username, profile.variant),
      variant: profile.variant + 1,
      comments: comments.trim(),
    });
  }

  return (
    <section>
      <button onClick={onBack}>Back to profiles</button>
      <h2>{profile.service} profile</h2>
      <p>Name: {profile.firstName}</p>
      <p>Username: {profile.username}</p>
      <img
        className="profile-picture"
        src={profile.picture}
        alt={`${profile.username} profile picture`}
      />
      <form onSubmit={reroll}>
        <label htmlFor="comments">Comments for the next picture</label>
        <textarea
          id="comments"
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          rows={4}
          maxLength={1000}
        />
        <button type="submit">Reroll picture</button>
      </form>

      <a href={profile.picture} download={`${profile.username}.svg`}>
        Download picture
      </a>
      <button onClick={() => downloadProfile(profile)}>Download profile</button>
    </section>
  );
}
