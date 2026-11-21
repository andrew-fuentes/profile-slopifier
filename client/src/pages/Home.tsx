import { useState } from "react";
import { errorMessage } from "../api";
import type { ProfileApi } from "../api";

import type { FormEvent } from "react";
import type { ProfileDraft } from "../types";

interface HomeProps {
  api: ProfileApi;
  draft: ProfileDraft | null;
  onConfirm: (profile: ProfileDraft) => void;
}

export default function Home({ api, draft, onConfirm }: HomeProps) {
  const [firstName, setFirstName] = useState(draft?.firstName || "");
  const [candidates, setCandidates] = useState(draft?.candidates || []);
  const [username, setUsername] = useState(draft?.username || "");
  const [service, setService] = useState(draft?.service || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function findCandidates(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = firstName.trim();
    if (!name) return;

    setLoading(true);
    setError("");
    setCandidates([]);
    setUsername("");
    try {
      setCandidates(await api.findUsernames(name));
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
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
            setError("");
          }}
          required
          disabled={loading}
          maxLength={40}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Finding usernames…" : "Find usernames"}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}

      <h3>Username candidates</h3>
      {!loading && !error && candidates.length === 0 && (
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
        maxLength={200}
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
