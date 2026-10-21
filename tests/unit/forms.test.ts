import { describe, expect, it } from "vitest";
import { nextId } from "@/lib/ids";
import { checkInvite, hashCode, makeInvite, newActivationCode } from "@/lib/credentials";
import { sha256 } from "@/lib/hash";
import { isComplete, sessionErrors, trainingStatusOf, validateSession, endDateOf } from "@/lib/trainingRules";
import { resourceSchema, validateFile, youtubeId, isLive, visibleTo } from "@/lib/resourceRules";
import { userFormSchema } from "@/lib/userForm";
import { initial } from "@/lib/initialData";
import type { LearningResource, TrainingClass } from "@/lib/types";

describe("ids", () => {
  it("never reuses an id that already exists, even after the counter restarts", () => { const taken = new Set(["LR-5001", "LR-5002"]); const a = nextId("LR", (i) => taken.has(i), { n: 5000 }); expect(a).toBe("LR-5003"); });
});
describe("activation codes", () => {
  it("sha256 matches known vectors", () => { expect(sha256("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"); expect(sha256("")).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"); });
  it("codes look right and are not repeated", () => { const a = newActivationCode(); expect(a).toMatch(/^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/); expect(newActivationCode()).not.toBe(a); });
  it("stores only a hash, and verifies, expires and rejects wrong codes", () => {
    const { code, invite } = makeInvite("2026-10-20"); expect(JSON.stringify(invite)).not.toContain(code); expect(JSON.stringify(invite)).not.toContain(code.replace(/-/g, "")); expect(invite.tokenHash).toBe(hashCode(code));
    expect(checkInvite(invite, code, "2026-10-21")).toBe("ok"); expect(checkInvite(invite, code.toLowerCase(), "2026-10-21")).toBe("ok"); expect(checkInvite(invite, "AAAA-BBBB-CCCC", "2026-10-21")).toBe("invalid"); expect(checkInvite(invite, code, "2026-12-01")).toBe("expired"); expect(checkInvite({ ...invite, usedAt: "2026-10-21" }, code, "2026-10-22")).toBe("used");
  });
});
describe("user form schema", () => {
  const ok = { name: "Asha K", phone: "9000000700", email: "", dob: "2000-01-01", address: "", role: "volunteer" as const, district: "Mysuru", taluk: "Nanjangud", gp: "Hosahalli GP", villageId: "", sessionId: "", status: "Active" as const, reason: "" };
  it("accepts a valid volunteer", () => { expect(userFormSchema.safeParse(ok).success).toBe(true); });
  it("rejects under-18, bad phone, bad email, missing location, and volunteer-only fields on staff", () => {
    expect(userFormSchema.safeParse({ ...ok, dob: "2015-01-01" }).success).toBe(false); expect(userFormSchema.safeParse({ ...ok, phone: "123" }).success).toBe(false); expect(userFormSchema.safeParse({ ...ok, email: "nope" }).success).toBe(false); expect(userFormSchema.safeParse({ ...ok, gp: "" }).success).toBe(false); expect(userFormSchema.safeParse({ ...ok, role: "trainer", sessionId: "CL-A1" }).success).toBe(false); expect(userFormSchema.safeParse({ ...ok, role: "trainer" }).success).toBe(true);
  });
});
describe("training sessions", () => {
  const base = { name: "Session X", cohort: "A", startDate: "2026-12-01", location: "Mysuru", room: "Hall 9", capacity: 50, trainerId: "T-4", registrationDeadline: "2026-11-25" };
  it("draft needs the basics; publish needs everything", () => { expect(validateSession({ ...base, room: "", trainerId: "", registrationDeadline: "", location: "" }, "draft")).toBeNull(); const e = sessionErrors({ ...base, room: "", trainerId: "", registrationDeadline: "", location: "" }, "publish"); expect(Object.keys(e).sort()).toEqual(["location", "registrationDeadline", "room", "trainerId"]); });
  it("capacity 30–100 and deadline on or before start", () => { expect(sessionErrors({ ...base, capacity: 20 }, "draft").capacity).toBeTruthy(); expect(sessionErrors({ ...base, capacity: 101 }, "draft").capacity).toBeTruthy(); expect(sessionErrors({ ...base, registrationDeadline: "2026-12-02" }, "draft").registrationDeadline).toBeTruthy(); expect(sessionErrors(base, "publish")).toEqual({}); });
  it("end date is the day after the start (2-day programme)", () => { expect(endDateOf("2026-12-01")).toBe("2026-12-02"); expect(endDateOf("2026-12-31")).toBe("2027-01-01"); });
  it("completion = both days attended OR an approved exception", () => {
    const c = { attendance: { P1: ["Present", "Late"], P2: ["Present", "Absent"], P3: ["Not Recorded", "Not Recorded"] }, exceptions: { P3: { reason: "x", by: "a", at: "t" } } } as unknown as TrainingClass;
    expect(isComplete(c, "P1")).toBe(true); expect(isComplete(c, "P2")).toBe(false); expect(isComplete(c, "P3")).toBe(true);
  });
  it("volunteer training status is derived", () => {
    const cls = [{ id: "C", status: "Scheduled", roster: ["P1", "P2", "P3"], attendance: { P1: ["Present", "Present"], P2: ["Present", "Not Recorded"], P3: ["Not Recorded", "Not Recorded"] } }] as unknown as TrainingClass[];
    expect([trainingStatusOf(cls, "P1"), trainingStatusOf(cls, "P2"), trainingStatusOf(cls, "P3"), trainingStatusOf(cls, "P9"), trainingStatusOf(cls, undefined)]).toEqual(["Completed", "In progress", "Registered", "Not registered", "Not registered"]);
  });
  it("seed sessions are published and valid", () => { initial().classes.forEach((c) => { expect(c.publish).toBe("Published"); expect(c.registrationDeadline! <= c.startDate).toBe(true); }); });
});
describe("learning resources", () => {
  const base = { title: "A resource", short: "A short enough description.", full: "", categoryId: "RC-1", topic: "Topic", type: "link" as const, url: "https://example.org/x", hasFile: false, language: "en" as const, audience: ["volunteers" as const], order: 1, status: "Published" as const, publishDate: "" };
  it("accepts a valid published link", () => { expect(resourceSchema.safeParse(base).success).toBe(true); });
  it("requires https, a link or file to publish, and a date to schedule", () => {
    expect(resourceSchema.safeParse({ ...base, url: "http://x.org" }).success).toBe(false); expect(resourceSchema.safeParse({ ...base, url: "" }).success).toBe(false); expect(resourceSchema.safeParse({ ...base, url: "", status: "Draft" }).success).toBe(true);
    expect(resourceSchema.safeParse({ ...base, type: "pdf", url: "", hasFile: false }).success).toBe(false); expect(resourceSchema.safeParse({ ...base, type: "pdf", url: "", hasFile: true }).success).toBe(true); expect(resourceSchema.safeParse({ ...base, status: "Scheduled", publishDate: "" }).success).toBe(false); expect(resourceSchema.safeParse({ ...base, status: "Scheduled", publishDate: "2026-12-30" }).success).toBe(true);
    expect(resourceSchema.safeParse({ ...base, audience: [] }).success).toBe(false); expect(resourceSchema.safeParse({ ...base, order: -1 }).success).toBe(false); expect(resourceSchema.safeParse({ ...base, type: "videoLink", url: "https://example.org/page" }).success).toBe(false); expect(resourceSchema.safeParse({ ...base, type: "videoLink", url: "https://youtu.be/dQw4w9WgXcQ" }).success).toBe(true);
  });
  it("validates uploads by type and size", () => { expect(validateFile("pdf", { name: "a.pdf", size: 1000 })).toBeNull(); expect(validateFile("pdf", { name: "a.exe", size: 1000 })).toMatch(/Unsupported/); expect(validateFile("pdf", { name: "a.pdf", size: 21 * 1024 * 1024 })).toMatch(/larger/); expect(validateFile("videoFile", { name: "v.webm", size: 5 })).toBeNull(); expect(validateFile("thumb", { name: "t.gif", size: 5 })).toMatch(/Unsupported/); expect(validateFile("pdf", { name: "a.pdf", size: 0 })).toMatch(/empty/); });
  it("extracts YouTube ids from common URL shapes only", () => { expect(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ"); expect(youtubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ"); expect(youtubeId("https://youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ"); expect(youtubeId("https://example.org/watch?v=dQw4w9WgXcQ")).toBeNull(); expect(youtubeId("not a url")).toBeNull(); });
  it("volunteers see only live resources aimed at them", () => {
    const r = (o: Partial<LearningResource>) => ({ status: "Published", audience: ["volunteers"], publishDate: "2026-09-01", ...o }) as LearningResource; const t = "2026-10-20";
    expect(visibleTo(r({}), "volunteers", t)).toBe(true); expect(visibleTo(r({ status: "Draft" }), "volunteers", t)).toBe(false); expect(visibleTo(r({ status: "Archived" }), "volunteers", t)).toBe(false); expect(visibleTo(r({ audience: ["trainers"] }), "volunteers", t)).toBe(false);
    expect(isLive(r({ status: "Scheduled", publishDate: "2026-12-01" }), t)).toBe(false); expect(isLive(r({ status: "Scheduled", publishDate: "2026-10-20" }), t)).toBe(true); expect(isLive(r({ publishDate: "2026-11-01" }), t)).toBe(false);
  });
  it("seed library has valid published items and a draft that stays hidden", () => { const d = initial(); expect(d.resources.filter((x) => visibleTo(x, "volunteers", "2026-10-20")).length).toBeGreaterThanOrEqual(3); expect(d.resources.find((x) => x.status === "Draft")).toBeTruthy(); d.resources.forEach((x) => expect(d.resourceCategories.some((c) => c.id === x.categoryId)).toBe(true)); });
});
