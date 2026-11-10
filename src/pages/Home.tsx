import { useState } from "react";

import type { FormEvent } from "react";
import type { ProfileDraft } from "../types";

interface HomeProps {
  draft: ProfileDraft | null;
  onConfirm: (profile: ProfileDraft) => void;
}

export default function Home({ draft, onConfirm }: HomeProps) {
  const [firstName, setFirstName] = useState(draft?.firstName || "");
  const [candidates, setCandidates] = useState(draft?.candidates || []);
  const [username, setUsername] = useState(draft?.username || "");
  const [service, setService] = useState(draft?.service || "");

  function findCandidates(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = firstName.trim().toLowerCase().replace(/\s+/g, "");
    if (!name) return;

    // Replace these demo names with a server response later.
    setCandidates([`${name}123`, `${name}_online`, `hello_${name}`]);
    setUsername("");
  }

  return (
    <section>
      <h2>Step 1: Choose a username</h2>
      <form onSubmit={findCandidates}>
        <label htmlFor="first-name">First name</label>
        <input
          id="first-name"
          value={firstName}
          onChange={(event) => {
            setFirstName(event.target.value);
            setCandidates([]);
            setUsername("");
          }}
          required
          maxLength={40}
        />
        <button type="submit">Find usernames</button>
      </form>

      <h3>Username candidates</h3>
      {candidates.length === 0 && (
        <p>Enter your first name to see candidates.</p>
      )}
      <ul>
        {candidates.map((candidate) => (
          <li key={candidate}>
            <label>
              <input
                type="radio"
                name="username"
                checked={username === candidate}
                onChange={() => setUsername(candidate)}
              />
              {candidate}
            </label>
          </li>
        ))}
      </ul>

      <label htmlFor="service">Website or service</label>
      <input
        id="service"
        type="text"
        value={service}
        onChange={(event) => setService(event.target.value)}
        placeholder="e.g. Instagram or example.com"
      />
      <button
        disabled={!username || !service.trim()}
        onClick={() =>
          onConfirm({
            firstName: firstName.trim(),
            username,
            service: service.trim(),
            candidates,
          })
        }
      >
        Confirm username and continue
      </button>
    </section>
  );
}
