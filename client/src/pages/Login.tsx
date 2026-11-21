import { useState } from "react";
import { FirebaseError } from "firebase/app";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import type { Auth } from "firebase/auth";

export default function Login({ auth }: { auth: Auth }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setPending(true);
    setError("");

    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (cause) {
      const code = cause instanceof FirebaseError ? cause.code : undefined;

      switch (code) {
        case "auth/popup-closed-by-user":
          break;
        case "auth/popup-blocked":
          setError("Allow pop-ups for this site and try again.");
          break;
        case "auth/unauthorized-domain":
          setError("Add this hostname to Firebase Authentication’s authorized domains.");
          break;
        case "auth/operation-not-allowed":
          setError("Enable Google as a sign-in provider in Firebase Authentication.");
          break;
        default:
          setError("Could not sign in with Google. Try again.");
      }
      setPending(false);
    }
  }

  return (
    <section>
      <h2>Login</h2>
      <button type="button" onClick={handleLogin} disabled={pending}>
        {pending ? "Signing in…" : "Continue with Google"}
      </button>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
