"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getDb, nid, now, inScope, roleUsers, useDb } from "./db";
import type * as T from "./types";
import { usePrefs } from "./store";
import { ME } from "./seed";

const sleep = (ms = 250) => new Promise((r) => setTimeout(r, ms));
export class ApiError extends Error {}
let failNext = false;
export const injectError = () => { failNext = true; };
async function call<R>(fn: () => R, ms?: number): Promise<R> {
  await sleep(ms);
  if (failNext) { failNext = false; throw new ApiError("Demo error injected. Please retry."); }
  return fn();
}
const role = () => usePrefs.getState().role;
const actor = () => roleUsers[role()].name;
const roleLabel = (r: T.Role) => ({ state: "State Administrator", district: "District Coordinator", ac: "AC Coordinator", local: "Taluk/GP Coordinator", trainer: "Trainer", participant: "Participant" })[r];
const audit = (action: string, resourceType: string, resourceId: string, before?: string, after?: string) =>
  getDb().log({ actor: actor(), role: roleLabel(role()), action, resourceType, resourceId, before, after });

/** Reads: typed, async, cached by TanStack Query. */
export function useMock<R>(key: unknown[], fn: () => R) {
  const r = usePrefs((s) => s.role);
  const v = useDb((s) => s.audit.length + s.grievances.length + s.ledger.length + s.applications.length + s.notifications.filter((n) => n.read).length + s.requests.length + s.redemptions.length + s.templates.length + s.enrolled.length);
  return useQuery({ queryKey: [...key, r, v, JSON.stringify(Object.keys(useDb.getState().progress).length)], queryFn: () => call(fn, 180), placeholderData: (p) => p });
}
/** Writes: returns act(fn, message) — simulates latency, invalidates reads, shows toast. */
export function useAct() {
  const qc = useQueryClient();
  return async function act<R>(fn: () => R, msg?: string): Promise<R | undefined> {
    try { const res = await call(fn, 350); await qc.invalidateQueries(); if (msg) toast.success(msg); return res; }
    catch (e) { toast.error((e as Error).message); return undefined; }
  };
}

export const api = {
  applications: {
    saveDraft: (d: Record<string, unknown>) => getDb().patch((s) => { s.appDraft = d; }),
    submit: (d: Record<string, unknown>) => {
      const id = `APP-26-${2000 + getDb().applications.length}`;
      getDb().patch((s) => {
        s.applications.unshift({ id, name: String(d.name), phone: "+91 •••••• ••••", dob: String(d.dob), age: Number(d.age), gender: String(d.gender), district: String(d.district), ac: String(d.ac), taluk: String(d.taluk), gp: String(d.gp),
          education: String(d.education), institution: String(d.institution), field: String(d.field), motivation: String(d.motivation), verification: "Simulated – not verified", consentReceipt: nid("CR"), status: "Submitted", submittedAt: now().slice(0, 10),
          history: [{ status: "Submitted", at: now().slice(0, 10), by: "System" }], internalNotes: [] });
        s.myApplicationId = id; s.appDraft = {};
      });
      return id;
    },
    decide: (id: string, status: T.AppStatus, note?: string) => {
      const before = getDb().applications.find((a) => a.id === id)?.status;
      getDb().patch((s) => { const a = s.applications.find((x) => x.id === id)!; a.status = status; a.history.push({ status, at: now().slice(0, 10), by: actor() }); if (note) a.internalNotes.push(note); });
      audit("Application decision", "Application", id, before, status);
    },
  },
  training: {
    assign: (pid: string, classId: string) => {
      const c = getDb().classes.find((x) => x.id === classId)!;
      if (c.roster.includes(pid)) throw new ApiError("Already in this class.");
      const other = getDb().classes.find((x) => x.roster.includes(pid) && x.cohort === c.cohort);
      if (other) throw new ApiError(`Participant is already in ${other.name}. Move instead of double-counting.`);
      getDb().patch((s) => { const k = s.classes.find((x) => x.id === classId)!; if (k.roster.length >= k.capacity) { k.waitlist.push(pid); } else { k.roster.push(pid); k.attendance[pid] = ["Not Recorded", "Not Recorded"]; } });
      audit("Roster assignment", "Class", classId, undefined, pid);
      return c.roster.length >= c.capacity ? "waitlisted" : "assigned";
    },
    move: (pid: string, from: string, to: string) => {
      const dest = getDb().classes.find((x) => x.id === to)!;
      if (dest.roster.length >= dest.capacity) throw new ApiError(`${dest.name} is full (${dest.capacity}/${dest.capacity}).`);
      getDb().patch((s) => { const a = s.classes.find((x) => x.id === from)!; const b = s.classes.find((x) => x.id === to)!; a.roster = a.roster.filter((p) => p !== pid); delete a.attendance[pid]; b.roster.push(pid); b.attendance[pid] = ["Not Recorded", "Not Recorded"]; });
      audit("Roster move", "Class", to, from, to);
    },
    setCapacity: (classId: string, cap: number) => {
      if (cap < 30 || cap > 100) throw new ApiError("Capacity must be between 30 and 100.");
      const c = getDb().classes.find((x) => x.id === classId)!;
      if (cap < c.roster.length) throw new ApiError(`Cannot go below current roster (${c.roster.length}).`);
      getDb().patch((s) => { s.classes.find((x) => x.id === classId)!.capacity = cap; }); audit("Capacity change", "Class", classId, String(c.capacity), String(cap));
    },
    reassignTrainer: (classId: string, trainerId: string) => {
      const c = getDb().classes.find((x) => x.id === classId)!;
      const clash = getDb().classes.find((x) => x.id !== classId && x.trainerId === trainerId && x.cohort === c.cohort);
      if (clash) throw new ApiError(`Conflict: trainer already teaches ${clash.name} on the same days.`);
      getDb().patch((s) => { s.classes.find((x) => x.id === classId)!.trainerId = trainerId; }); audit("Trainer change", "Class", classId, c.trainerId, trainerId);
    },
    cancelCycle: () => { getDb().patch((s) => { s.cycle.status = "Cancelled"; s.classes.forEach((c) => (c.status = "Cancelled")); }); audit("Cycle cancelled", "Cycle", getDb().cycle.id, "In Progress", "Cancelled"); },
  },
  attendance: {
    set: (classId: string, pid: string, day: 1 | 2, to: T.AttStatus, reason = "") => {
      const c = getDb().classes.find((x) => x.id === classId)!; const from = c.attendance[pid]?.[day - 1] ?? "Not Recorded";
      if (from !== "Not Recorded" && !reason.trim()) throw new ApiError("A reason is required to correct recorded attendance.");
      getDb().patch((s) => { const k = s.classes.find((x) => x.id === classId)!; k.attendance[pid][day - 1] = to; k.attendanceLog.push({ at: now(), by: actor(), pid, day, from, to, reason }); });
      audit("Attendance edit", "Attendance", `${classId}/${pid}/Day${day}`, from, to);
    },
    bulk: (classId: string, day: 1 | 2, to: T.AttStatus) => {
      getDb().patch((s) => { const k = s.classes.find((x) => x.id === classId)!; k.roster.forEach((p) => { if (k.attendance[p][day - 1] === "Not Recorded") k.attendance[p][day - 1] = to; }); });
      audit("Attendance bulk mark", "Attendance", `${classId}/Day${day}`, "Not Recorded", to);
    },
    completes: (a?: [T.AttStatus, T.AttStatus]) => !!a && a.every((x) => x === "Present" || x === "Late"),
  },
  lms: {
    enroll: (courseId: string) => { getDb().patch((s) => { if (!s.enrolled.includes(courseId)) s.enrolled.push(courseId); }); },
    watch: (lessonId: string, pct: number, sec: number) => getDb().patch((s) => { const p = (s.progress[lessonId] ??= { done: false }); p.watchedPct = Math.max(p.watchedPct ?? 0, pct); p.positionSec = sec; if (p.watchedPct >= s.settings.videoThreshold) p.done = true; }),
    complete: (lessonId: string) => getDb().patch((s) => { (s.progress[lessonId] ??= { done: false }).done = true; }),
    submitQuiz: (lessonId: string, answers: number[]) => {
      const db = getDb(); const lesson = db.courses.flatMap((c) => c.lessons).find((l) => l.id === lessonId)!;
      const qs = lesson.questionIds!.map((id) => db.questions.find((q) => q.id === id)!);
      const score = qs.filter((q, i) => answers[i] === q.answer).length; const pct = Math.round((score / qs.length) * 100);
      getDb().patch((s) => { const p = (s.progress[lessonId] ??= { done: false }); (p.attempts ??= []).push({ score, total: qs.length, at: now(), answers }); if (pct >= s.settings.passThreshold) p.done = true; });
      return { score, total: qs.length, passed: pct >= db.settings.passThreshold };
    },
    submitReflection: (lessonId: string) => getDb().patch((s) => { const p = (s.progress[lessonId] ??= { done: false }); p.reflection = "In Review"; p.done = true; }),
  },
  grievances: {
    create: (g: Omit<T.Grievance, "id" | "timeline" | "createdAt" | "status" | "ownerId">) => {
      const id = nid("G");
      getDb().patch((s) => { s.grievances.unshift({ ...g, id, status: "Open", ownerId: ME, createdAt: now().slice(0, 10), timeline: [{ at: now().slice(0, 10), actor: ME, action: "Created", to: "Open" }] }); });
      audit("Grievance created", "Grievance", id, undefined, "Open"); return id;
    },
    transition: (id: string, to: T.GStatus, note: string) => {
      const g = getDb().grievances.find((x) => x.id === id)!;
      if ((to === "Reopened" || to === "Closed" || to === "Closure Pending" || to === "Escalated") && !note.trim()) throw new ApiError("A reason / outcome summary is required for this change.");
      if (to === "Closed" && g.status !== "Closure Pending") throw new ApiError("Closure must first be marked 'Closure Pending' with an outcome, then confirmed.");
      getDb().patch((s) => { const k = s.grievances.find((x) => x.id === id)!; k.timeline.push({ at: now(), actor: actor(), action: "Status changed", from: k.status, to, note }); k.status = to; if (to === "Closure Pending") k.outcome = note; });
      audit("Grievance status change", "Grievance", id, g.status, to);
    },
    note: (id: string, note: string) => getDb().patch((s) => { s.grievances.find((x) => x.id === id)!.timeline.push({ at: now(), actor: actor(), action: "Note", note }); }),
    reschedule: (id: string, date: string, reason: string) => {
      if (!reason.trim()) throw new ApiError("Reason required to snooze or reschedule.");
      getDb().patch((s) => { const k = s.grievances.find((x) => x.id === id)!; k.timeline.push({ at: now(), actor: actor(), action: `Follow-up moved ${k.followUpDate} → ${date}`, note: reason }); k.followUpDate = date; });
    },
    reassign: (id: string, ownerId: string) => { getDb().patch((s) => { s.grievances.find((x) => x.id === id)!.ownerId = ownerId; }); audit("Grievance reassigned", "Grievance", id, undefined, ownerId); },
  },
  residents: {
    add: (r: Omit<T.Resident, "id" | "collectedOn">) => { const id = nid("R"); getDb().patch((s) => { s.residents.unshift({ ...r, id, collectedOn: now().slice(0, 10) }); }); audit("Resident added", "Resident", id); return id; },
    request: (id: string) => { getDb().patch((s) => { s.residents.find((x) => x.id === id)!.correction = "Requested"; }); audit("Correction requested", "Resident", id); },
    viewVoter: (id: string) => audit("Sensitive record view", "VoterRecord", id, undefined, "Masked view"),
    setVoterConsent: (id: string, c: T.VoterRecord["consent"]) => { getDb().patch((s) => { s.voters.find((x) => x.id === id)!.consent = c; }); audit("Voter consent update", "VoterRecord", id, undefined, c); },
  },
  events: {
    toggle: (id: string, pid = ME) => getDb().patch((s) => { const e = s.events.find((x) => x.id === id)!; if (e.registered.includes(pid)) { e.registered = e.registered.filter((p) => p !== pid); const nx = e.waitlist.shift(); if (nx) e.registered.push(nx); } else if (e.waitlist.includes(pid)) e.waitlist = e.waitlist.filter((p) => p !== pid); else if (e.registered.length >= e.capacity) e.waitlist.push(pid); else e.registered.push(pid); }),
    save: (e: Partial<T.EventItem> & { id?: string }) => { const id = e.id ?? nid("E"); getDb().patch((s) => { const i = s.events.findIndex((x) => x.id === id); const base: T.EventItem = { id, title: { en: "", kn: "" }, category: "Workshop", date: "", time: "", venue: "", district: "Mysuru", language: "kn", audience: "Participants", capacity: 30, registered: [], waitlist: [], status: "Draft", agenda: [], description: { en: "", kn: "" }, attended: [] }; if (i >= 0) Object.assign(s.events[i], e); else s.events.unshift({ ...base, ...e }); }); audit("Event saved", "Event", id); return id; },
    cancel: (id: string) => { getDb().patch((s) => { s.events.find((x) => x.id === id)!.status = "Cancelled"; }); audit("Event cancelled", "Event", id); },
    attend: (id: string, pid: string) => getDb().patch((s) => { const e = s.events.find((x) => x.id === id)!; e.attended = e.attended.includes(pid) ? e.attended.filter((p) => p !== pid) : [...e.attended, pid]; }),
  },
  rewards: {
    redeem: (rewardId: string) => { getDb().patch((s) => { s.redemptions.unshift({ id: nid("RD"), rewardId, at: now(), status: "Pending" }); }); },
    adjust: (pid: string, points: number, reason: string) => {
      if (!reason.trim()) throw new ApiError("Reason required for a manual adjustment.");
      getDb().patch((s) => { s.ledger.unshift({ id: nid("LG"), pid, at: now().slice(0, 10), category: "Manual adjustment", points, reason, verified: true }); }); audit("Reward adjustment", "Ledger", pid, undefined, `${points}`);
    },
    saveRule: (id: string, patch: Partial<T.RewardRule>) => { getDb().patch((s) => { Object.assign(s.rules.find((r) => r.id === id)!, patch); }); audit("Reward rule change", "Rule", id); },
  },
  notifications: {
    readAll: () => getDb().patch((s) => s.notifications.forEach((n) => (n.read = true))),
    read: (id: string) => getDb().patch((s) => { s.notifications.find((n) => n.id === id)!.read = true; }),
  },
  consent: {
    withdraw: (receiptId: string, reason: string) => { getDb().patch((s) => { const c = s.consents.find((x) => x.receiptId === receiptId)!; c.status = "withdrawn"; c.withdrawalTimestamp = now(); c.withdrawalReason = reason; }); audit("Consent update", "Consent", receiptId, "granted", "withdrawn"); },
    grant: (purposeId: string, sourceScreen: string, lang: "kn" | "en") => { getDb().patch((s) => { s.consents.unshift({ receiptId: nid("CR"), noticeVersion: s.settings.noticeVersion, purposeId, status: "granted", actionTimestamp: now(), language: lang, sourceScreen, subject: ME }); }); },
  },
  requests: { submit: (kind: string) => { const id = nid("REQ"); getDb().patch((s) => { s.requests.unshift({ id, kind, at: now(), status: "Received (demo)" }); }); return id; } },
  templates: {
    save: (t: Partial<T.Template> & { id?: string }) => { const id = t.id ?? nid("TP"); getDb().patch((s) => { const i = s.templates.findIndex((x) => x.id === id); if (i >= 0) Object.assign(s.templates[i], t); else s.templates.unshift({ id, name: "Untitled", purpose: "General", kn: "", en: "", status: "Draft", uses: 0, ...t }); }); return id; },
  },
  settings: { set: (p: Partial<ReturnType<typeof getDb>["settings"]>) => { getDb().patch((s) => { Object.assign(s.settings, p); }); audit("Settings change", "Settings", "program", undefined, JSON.stringify(p)); }, reset: () => getDb().reset() },
  report: { exportCsv: (name: string) => audit("Report export", "Report", name) },
};
export { inScope, roleUsers };
