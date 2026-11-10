import { downloadProfile } from "../utils/avatar";

import type { Profile } from "../types";

interface ProfilesProps {
  profiles: Profile[];
  onOpen: (id: string) => void;
}

export default function Profiles({ profiles, onOpen }: ProfilesProps) {
  return (
    <section>
      <h2>Saved profiles</h2>
      {profiles.length === 0 && (
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
