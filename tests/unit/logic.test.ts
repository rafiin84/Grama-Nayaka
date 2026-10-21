import { describe, expect, it } from "vitest";
import { chat, pathway, compose, VERIFY } from "@/lib/ai";
import { level } from "@/lib/derive";
import { canOpen } from "@/lib/nav";
import { defaultRbac } from "@/lib/rbac";
import { acs, taluks } from "@/lib/seed-geo";
import { classes } from "@/lib/seed";

describe("AI mock", () => {
  it("always adds a verification reminder", () => { expect(chat("water", "", "en").text).toContain(VERIFY.en); expect(chat("ನೀರು", "", "kn").text).toContain(VERIFY.kn); });
  it("never invents a reference number", () => { const r = pathway({ category: "water", where: "x", duration: "2w", tried: "", evidence: false }, "en"); expect(JSON.stringify(r)).not.toMatch(/ref(erence)? ?(no|number)?:? ?[A-Z0-9-]{6,}/i); expect(r.confidence).toBeTruthy(); });
  it("drafts in the selected language", () => { expect(compose("LMS reminder", "Warm", "kn", { issue: "A", location: "", date: "", step: "", sender: "S" })).toContain("ನಮಸ್ಕಾರ"); });
});
describe("permissions", () => {
  it("trainer cannot open records or settings", () => { expect(canOpen("trainer", "/admin/records", defaultRbac())).toBe(false); expect(canOpen("trainer", "/admin/attendance", defaultRbac())).toBe(true); });
  it("participant cannot open admin", () => { expect(canOpen("participant", "/admin", defaultRbac())).toBe(false); });
  it("only state opens settings", () => { expect(canOpen("state", "/admin/settings", defaultRbac())).toBe(true); expect(canOpen("local", "/admin/settings", defaultRbac())).toBe(false); });
});
describe("data model", () => {
  it("class capacities stay within 30–100", () => { classes.forEach((c) => { expect(c.capacity).toBeGreaterThanOrEqual(30); expect(c.capacity).toBeLessThanOrEqual(100); expect(c.roster.length).toBeLessThanOrEqual(c.capacity); }); });
  it("each cohort has three parallel classes over two consecutive days", () => { for (const k of ["A", "B", "C"]) { const cs = classes.filter((c) => c.cohort === k); expect(cs).toHaveLength(3); cs.forEach((c) => expect(c.days[1] - c.days[0]).toBe(1)); } });
  it("a participant is in at most one class per cohort", () => { const seen = new Set<string>(); classes.forEach((c) => c.roster.forEach((p) => { const key = `${c.cohort}:${p}`; expect(seen.has(key)).toBe(false); seen.add(key); })); });
  it("constituencies are a separate relation spanning taluks", () => { expect(acs.some((a) => new Set(a.taluks.map((t) => taluks.find((x) => x.name === t)?.district)).size > 1)).toBe(true); });
  it("levels rise with points", () => { expect(level(0)).toBe(1); expect(level(500)).toBe(4); });
});
