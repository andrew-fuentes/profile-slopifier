import type { User } from "firebase/auth";
import type { Profile } from "./types";

type ProfileInput = Omit<Profile, "id">;
type PictureInput = Pick<Profile, "picture" | "variant" | "comments">;

function isProfile(value: unknown): value is Profile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Record<string, unknown>;
  return ["id", "firstName", "username", "service", "comments"]
    .every((field) => typeof profile[field] === "string") &&
    (profile.picture === "" || isPictureUrl(profile.picture)) &&
    isVariant(profile.variant);
}

function isVariant(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function isPictureUrl(value: unknown): value is string {
  return typeof value === "string" &&
    /^(https?:\/\/|data:image\/svg\+xml;charset=utf-8,)/i.test(value) &&
    URL.canParse(value);
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The request failed. Try again.";
}

export function createApi(user: User) {
  async function request(path: string, init: RequestInit = {}) {
    const token = await user.getIdToken();
    let response: Response;
    try {
      response = await fetch(`/api${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(init.body && { "Content-Type": "application/json" }),
        },
      });
    } catch (error) {
      if (init.signal?.aborted) throw error;
      throw new Error("Could not reach the backend. Check that the server is running.", { cause: error });
    }

    if (response.ok && response.status === 204) return;
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      if (data && typeof data === "object" && "error" in data && typeof data.error === "string") {
        const status = "upstreamStatus" in data && typeof data.upstreamStatus === "number"
          ? `HTTP ${data.upstreamStatus}` : "";
        const code = "upstreamCode" in data && typeof data.upstreamCode === "string"
          ? data.upstreamCode : "";
        const details = [status, code].filter(Boolean).join(" · ");
        throw new Error(details ? `${data.error} (${details})` : data.error);
      }
      throw new Error(`API request failed (${response.status}).`);
    }
    return data;
  }

  async function writeProfile(path: string, method: "POST" | "PUT", values: object) {
    const data = await request(path, { method, body: JSON.stringify(values) });
    if (!isProfile(data)) throw new Error("The server returned an invalid profile.");
    return data;
  }

  return {
    async listProfiles(signal?: AbortSignal) {
      const data = await request("/profiles", { signal });
      if (!Array.isArray(data) || !data.every(isProfile)) {
        throw new Error("The server returned an invalid profile list.");
      }
      return data;
    },
    createProfile: (values: ProfileInput) => writeProfile("/profiles", "POST", values),
    updateUsername: (id: string, username: string) =>
      writeProfile(`/profiles/${encodeURIComponent(id)}/username`, "PUT", { username }),
    updatePicture: (id: string, values: PictureInput) =>
      writeProfile(`/profiles/${encodeURIComponent(id)}/picture`, "PUT", values),
    async deleteProfile(id: string) {
      await request(`/profiles/${encodeURIComponent(id)}`, { method: "DELETE" });
    },
    async findUsernames(name: string) {
      const data = await request(`/usernames?${new URLSearchParams({ name })}`);
      if (!data || typeof data !== "object" || !("candidates" in data) ||
          !Array.isArray(data.candidates) ||
          !data.candidates.every((candidate): candidate is string => typeof candidate === "string")) {
        throw new Error("The server returned invalid username candidates.");
      }
      return data.candidates;
    },
    async generatePicture(username: string, variant: number) {
      const query = new URLSearchParams({ username, variant: String(variant) });
      const data = await request(`/picture?${query}`);
      if (!data || typeof data !== "object" || !("picture" in data) || !isPictureUrl(data.picture) ||
          !("variant" in data) || !isVariant(data.variant)) {
        throw new Error("The server returned an invalid picture.");
      }
      return { picture: data.picture, variant: data.variant };
    },
  };
}

export type ProfileApi = ReturnType<typeof createApi>;
