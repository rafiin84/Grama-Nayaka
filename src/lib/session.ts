import type { Role, User } from "./types";
import { trainers } from "./seed";

/** A signed-in person. Created only after the mobile number has been verified with a one-time code. */
export interface Session { userId: string; name: string; role: Role; phoneMasked: string; phone?: string; participantId?: string; trainerId?: string; applicant?: boolean }
export const last10 = (p: string) => p.replace(/\D/g, "").slice(-10);
export const maskPhone = (p: string) => `•••••• ${last10(p).slice(-4)}`;

export function roleForUser(u: Pick<User, "role" | "gp">): Role {
  switch (u.role) {
    case "superAdmin": return "state"; case "districtAdmin": return "district"; case "blockAdmin": return u.gp ? "local" : "ac";
    case "trainingCoordinator": return "coordinator"; case "trainer": return "trainer"; case "grievanceManager": return "grievance"; case "contentManager": return "content"; default: return "participant";
  }
}
export type SignInResult = { ok: true; session: Session } | { ok: false; reason: "not-found" | "inactive" | "suspended" | "deleted" };
/** Looks the verified number up. Inactive, suspended and deleted accounts cannot sign in. */
export function signInResult(users: User[], phone: string): SignInResult {
  const hit = users.filter((u) => last10(u.phone) === last10(phone)).sort((a, b) => (a.status === "Active" ? -1 : 1) - (b.status === "Active" ? -1 : 1))[0];
  if (!hit) return { ok: false, reason: "not-found" };
  if (hit.status === "Inactive") return { ok: false, reason: "inactive" }; if (hit.status === "Suspended") return { ok: false, reason: "suspended" }; if (hit.status === "Deleted") return { ok: false, reason: "deleted" };
  const role = roleForUser(hit);
  return { ok: true, session: { userId: hit.id, name: hit.name, role, phoneMasked: maskPhone(hit.phone), participantId: hit.participantId, trainerId: role === "trainer" ? trainers.find((t) => t.name === hit.name)?.id : undefined } };
}
