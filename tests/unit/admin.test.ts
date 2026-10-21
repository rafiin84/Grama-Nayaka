import { describe, expect, it } from "vitest";
import { ACTIONS, MODULES, RBAC_ROLES, assignableRoles, can, defaultRbac, moduleForPath, roleOfSession } from "@/lib/rbac";
import { canOpen, navFor } from "@/lib/nav";
import { parseCsv, toCsv } from "@/lib/csv";
import { validateUser } from "@/lib/userRules";
import { users } from "@/lib/seed";
import { initial } from "@/lib/initialData";
import { adminStats, emptyFilters } from "@/lib/adminStats";

describe("rbac", () => {
  const rbac = defaultRbac();
  it("every session role maps to a defined RBAC role", () => { Object.values(roleOfSession).forEach((r) => expect(RBAC_ROLES.some((x) => x.id === r)).toBe(true)); });
  it("Super Admin has every action on every module", () => { MODULES.forEach((m) => ACTIONS.forEach((a) => expect(can(rbac, "state", m.id, a.id)).toBe(true))); });
  it("only Super Admin can open Roles; only roles with settings.view open Settings", () => { expect(canOpen("state", "/admin/roles", rbac)).toBe(true); expect(canOpen("district", "/admin/roles", rbac)).toBe(false); expect(canOpen("district", "/admin/settings", rbac)).toBe(false); });
  it("Block Admin cannot delete users, Trainer cannot see users", () => { expect(can(rbac, "ac", "users", "delete")).toBe(false); expect(can(rbac, "trainer", "users", "view")).toBe(false); });
  it("only Super Admin can assign Super Admin; Block Admin only volunteers", () => { expect(assignableRoles("state")).toContain("superAdmin"); expect(assignableRoles("district")).not.toContain("superAdmin"); expect(assignableRoles("ac")).toEqual(["volunteer"]); expect(assignableRoles("participant")).toEqual([]); });
  it("navigation follows the matrix", () => { const hrefs = (r: Parameters<typeof navFor>[0]) => navFor(r, rbac).map((n) => n.href); expect(hrefs("content")).toContain("/admin/lms"); expect(hrefs("content")).not.toContain("/admin/users"); expect(hrefs("state")).toContain("/admin/roles"); });
  it("editing the matrix changes access", () => { const m = defaultRbac(); m.contentManager.modules.users = ["view"]; expect(canOpen("content", "/admin/users", m)).toBe(true); expect(canOpen("content", "/admin/users", rbac)).toBe(false); });
  it("maps every admin path to a module", () => { ["/admin", "/admin/users", "/admin/villages", "/admin/training/CL-A1", "/admin/attendance", "/admin/grievances/G-1"].forEach((p) => expect(moduleForPath(p)).toBeTruthy()); expect(moduleForPath("/admin/nope")).toBeNull(); });
});

describe("csv", () => {
  it("parses quotes, commas and newlines", () => { expect(parseCsv('a,b\n"x, y","he said ""hi"""\n')).toEqual([["a", "b"], ["x, y", 'he said "hi"']]); });
  it("neutralises spreadsheet formulas on export", () => { expect(toCsv(["n"], [["=SUM(A1)"], ["+1"], ["ok"]])).toBe("n\r\n'=SUM(A1)\r\n'+1\r\nok"); });
  it("skips blank lines and handles CRLF", () => { expect(parseCsv("a,b\r\n\r\n1,2\r\n")).toEqual([["a", "b"], ["1", "2"]]); });
});

describe("user validation", () => {
  const base = { name: "Test Person", phone: "9000000777", email: "t@example.org", role: "volunteer" as const, district: "Mysuru", taluk: "Nanjangud", gp: "Hosahalli GP" };
  it("accepts a valid new volunteer", () => { expect(validateUser(base, users)).toBeNull(); });
  it("rejects bad phone and email", () => { expect(validateUser({ ...base, phone: "12345" }, users)).toMatch(/Phone/); expect(validateUser({ ...base, email: "nope" }, users)).toMatch(/Email/); });
  it("detects duplicate phone or email, but not against itself", () => { const u = users[1]; expect(validateUser({ ...base, phone: u.phone }, users)).toMatch(/duplicate/i); expect(validateUser({ ...base, email: u.email.toUpperCase() }, users)).toMatch(/duplicate/i); expect(validateUser({ ...base, name: u.name, phone: u.phone, email: u.email, role: u.role, district: u.district, taluk: u.taluk, gp: u.gp }, users, u.id)).toBeNull(); });
  it("volunteers need a full location", () => { expect(validateUser({ ...base, gp: "" }, users)).toMatch(/Gram Panchayat/); });
  it("seed phones are valid so seeded users can be edited", () => { users.forEach((u) => expect(validateUser({ name: u.name, phone: u.phone, email: u.email, role: u.role, district: u.district, taluk: u.taluk, gp: u.gp }, users, u.id)).toBeNull()); });
});

describe("dashboard statistics come from records", () => {
  it("counts volunteers, trained and pending from users and attendance", () => {
    const d = initial(); const s = adminStats(d, "state", emptyFilters);
    expect(s.registered).toBe(d.users.filter((u) => u.role === "volunteer" && u.status !== "Deleted").length);
    expect(s.trained + s.pendingTraining).toBe(s.registered);
  });
  it("changes when the data changes (no hard-coded figures)", () => {
    const d = initial(); const before = adminStats(d, "state", emptyFilters);
    d.villages.push({ id: "V-X", name: "New", gp: "Hosahalli GP", taluk: "Nanjangud", district: "Mysuru", status: "Pending", volunteerIds: [] });
    d.grievances[0].status = "Closed";
    const after = adminStats(d, "state", emptyFilters);
    expect(after.villagesPending).toBe(before.villagesPending + 1); expect(after.grievances.closed).toBeGreaterThan(before.grievances.closed);
  });
  it("respects district scope and filters", () => {
    const d = initial(); const all = adminStats(d, "state", emptyFilters); const mysuru = adminStats(d, "district", emptyFilters);
    expect(mysuru.registered).toBeLessThanOrEqual(all.registered); expect(mysuru.districts).toBe(1);
    const filt = adminStats(d, "state", { ...emptyFilters, district: "Mandya" }); expect(filt.registered).toBeLessThanOrEqual(all.registered);
  });
  it("filters volunteers by training status", () => { const d = initial(); const t = adminStats(d, "state", { ...emptyFilters, training: "trained" }); expect(t.pendingTraining).toBe(0); const p = adminStats(d, "state", { ...emptyFilters, training: "pending" }); expect(p.trained).toBe(0); });
  it("date range filters grievances", () => { const d = initial(); const s = adminStats(d, "state", { ...emptyFilters, from: "2099-01-01" }); expect(s.grievances.submitted).toBe(0); });
});
