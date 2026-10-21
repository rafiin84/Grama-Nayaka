import type * as T from "./types";

export const normPhone = (p: string) => p.replace(/\D/g, "").slice(-10);
const PHONE = /^[6-9]\d{9}$/; const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export type NewUser = {
  name: string; phone: string; email: string; role: T.RbacRole; district: string; taluk: string; gp: string;
  dob?: string; address?: string; villageId?: string; sessionId?: string; status?: "Active" | "Inactive" | "Suspended";
};
export const ageOn = (dob: string, todayIso: string) => { const b = new Date(dob + "T00:00:00Z"); const t = new Date(todayIso + "T00:00:00Z"); if (isNaN(+b)) return NaN; let a = t.getUTCFullYear() - b.getUTCFullYear(); if (t.getUTCMonth() < b.getUTCMonth() || (t.getUTCMonth() === b.getUTCMonth() && t.getUTCDate() < b.getUTCDate())) a--; return a; };
/** Validation shared by single add and CSV import. Returns an error string or null. */
export function validateUser(u: NewUser, users: T.User[], ignoreId?: string): string | null {
  if (u.name.trim().length < 2) return "Name is required (2+ characters).";
  if (!PHONE.test(normPhone(u.phone))) return "Phone must be a valid 10-digit mobile number.";
  if (u.email && !EMAIL.test(u.email)) return "Email is not valid.";
  if (u.dob) { const a = ageOn(u.dob, "2026-10-20"); if (!Number.isFinite(a) || a < 18 || a > 100) return "Date of birth must give an age between 18 and 100."; }
  if ((u.address ?? "").length > 300) return "Address must be 300 characters or fewer.";
  const d = users.find((x) => x.status !== "Deleted" && x.id !== ignoreId && (normPhone(x.phone) === normPhone(u.phone) || (!!u.email && x.email.toLowerCase() === u.email.toLowerCase())));
  if (d) return `Possible duplicate of ${d.name} (${d.id}) — same phone or email.`;
  if (u.role === "volunteer" && (!u.district || !u.taluk || !u.gp)) return "Volunteers need a district, block/taluk and Gram Panchayat.";
  return null;
}
