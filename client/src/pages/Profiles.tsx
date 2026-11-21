import { downloadProfile } from "../utils/avatar";

import type { Profile } from "../types";

interface ProfilesProps {
  profiles: Profile[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  onOpen: (id: string) => void;
}

export default function Profiles({ profiles, loading, error, onRetry, onOpen }: ProfilesProps) {
  return (
    <section>
      <h2>Saved profiles</h2>
      {loading && <p role="status">Loading profiles…</p>}
      {error && (
        <div>
          <p role="alert">{error}</p>
          <button onClick={onRetry}>Retry</button>
        </div>
      )}
      {!loading && !error && profiles.length === 0 && (
        <p>No profiles yet. Create one to get started.</p>
      )}
      <ul>
        {profiles.map((profile) => (
          <li className="profile-row" key={profile.id}>
            <button onClick={() => onOpen(profile.id)}>
              {profile.service}: {profile.username}
            </button>
            <button onClick={() => downloadProfile(profile)}>
              Download profile
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
