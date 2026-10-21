import { sha256 } from "./hash";
import type { User } from "./types";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid misreading
/** Random one-time activation code, e.g. K7QM-2XNP-8TDA. Shown once to the admin; only its hash is stored. */
export function newActivationCode(): string {
  const bytes = new Uint8Array(12); globalThis.crypto.getRandomValues(bytes);
  const chars = [...bytes].map((b) => ALPHABET[b % ALPHABET.length]);
  return [chars.slice(0, 4), chars.slice(4, 8), chars.slice(8, 12)].map((g) => g.join("")).join("-");
}
export const hashCode = (code: string) => sha256(`gn-activation:${code.replace(/-/g, "").toUpperCase()}`);
export function makeInvite(nowIso: string, days = 7): { code: string; invite: NonNullable<User["invite"]> } {
  const code = newActivationCode(); const exp = new Date(new Date(nowIso).getTime() + days * 86400000).toISOString().slice(0, 10);
  return { code, invite: { tokenHash: hashCode(code), expiresAt: exp } };
}
export function checkInvite(invite: User["invite"], code: string, todayIso: string): "ok" | "invalid" | "expired" | "used" {
  if (!invite) return "invalid"; if (invite.usedAt) return "used"; if (todayIso > invite.expiresAt) return "expired";
  return hashCode(code) === invite.tokenHash ? "ok" : "invalid";
}
