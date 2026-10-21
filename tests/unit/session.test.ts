import { describe, expect, it } from "vitest";
import { isGated, last10, maskPhone, roleForUser, signInResult } from "@/lib/session";
import { users } from "@/lib/seed";
import type { User } from "@/lib/types";

describe("applicant gate", () => {
  const applicant = { userId: "NEW-1", name: "A", role: "participant" as const, phoneMasked: "", applicant: true };
  it("holds applicants back only while approval is required", () => { expect(isGated(applicant, false)).toBe(true); expect(isGated(applicant, true)).toBe(false); });
  it("never gates approved people or signed-out visitors", () => { expect(isGated({ ...applicant, applicant: false }, false)).toBe(false); expect(isGated(null, false)).toBe(false); });
});

describe("sign-in", () => {
  it("normalises phone numbers and masks all but the last four digits", () => { expect(last10("+91 9000001102")).toBe("9000001102"); expect(last10("90000 01102")).toBe("9000001102"); expect(maskPhone("+91 9000001102")).toBe("•••••• 1102"); expect(maskPhone("+91 9000001102")).not.toContain("9000"); });
  it("maps every account role to a session role", () => { const r = (role: User["role"], gp = "") => roleForUser({ role, gp }); expect([r("superAdmin"), r("districtAdmin"), r("blockAdmin", "Hosahalli GP"), r("blockAdmin"), r("trainingCoordinator"), r("trainer"), r("grievanceManager"), r("contentManager"), r("volunteer")]).toEqual(["state", "district", "local", "ac", "coordinator", "trainer", "grievance", "content", "participant"]); });
  it("signs in an active volunteer with their participant id", () => { const r = signInResult(users, "9000001102"); expect(r.ok).toBe(true); if (r.ok) { expect(r.session.role).toBe("participant"); expect(r.session.participantId).toBe("P-1042"); expect(r.session.name).toBe("Meghana Shetty"); } });
  it("signs in staff with the right role and trainer persona", () => { const a = signInResult(users, "9000000101"); expect(a.ok && a.session.role).toBe("state"); const t = signInResult(users, "9000000106"); expect(t.ok && t.session.role).toBe("trainer"); expect(t.ok && t.session.trainerId).toBe("T-1"); });
  it("refuses unknown, inactive, suspended and deleted accounts", () => {
    expect(signInResult(users, "9123456789")).toEqual({ ok: false, reason: "not-found" }); expect(signInResult(users, "9000001990")).toEqual({ ok: false, reason: "inactive" });
    const mk = (status: User["status"]) => users.map((u) => (u.id === "U-001" ? { ...u, status } : u)); expect(signInResult(mk("Suspended"), "9000000101")).toEqual({ ok: false, reason: "suspended" }); expect(signInResult(mk("Deleted"), "9000000101")).toEqual({ ok: false, reason: "deleted" });
  });
  it("never puts the full phone number in the session", () => { const r = signInResult(users, "9000001102"); expect(r.ok && JSON.stringify(r.session)).not.toContain("9000001102"); });
});
