"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getDb, nid, now, inScope, roleUsers, useDb } from "./db";
import { actorName } from "./scope";
import type * as T from "./types";
import type { DbData } from "./db";
import { assignableRoles, defaultRbac, roleOfSession } from "./rbac";
import { makeInvite } from "./credentials";
import { isComplete, validateSession, type SessionInput } from "./trainingRules";
import { resourceSchema, validateFile, type ResourceForm } from "./resourceRules";
import { delBlob } from "./blobStore";
import { today as DEMO_TODAY } from "./derive";
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
const actor = () => actorName(role());
const roleLabel = (r: T.Role) => ({ state: "Super Admin", district: "District Admin", ac: "Block Admin (AC)", local: "Block Admin (GP)", coordinator: "Training Coordinator", trainer: "Trainer", grievance: "Grievance Manager", content: "Content Manager", participant: "Volunteer" })[r];
const audit = (action: string, resourceType: string, resourceId: string, before?: string, after?: string) =>
  getDb().log({ actor: actor(), role: roleLabel(role()), action, resourceType, resourceId, before, after });

/** Reads: typed, async, cached by TanStack Query. */
export function useMock<R>(key: unknown[], fn: () => R) {
  const r = usePrefs((s) => s.role); const sel = usePrefs((s) => s.scopeSel);
  const v = useDb((s) => s.audit.length + s.grievances.length + s.ledger.length + s.applications.length + s.notifications.filter((n) => n.read).length + s.requests.length + s.redemptions.length + s.templates.length + s.enrolled.length);
  return useQuery({ queryKey: [...key, r, JSON.stringify(sel), v, JSON.stringify(Object.keys(useDb.getState().progress).length)], queryFn: () => call(fn, 180), placeholderData: (p) => p });
}
/** Writes: returns act(fn, message) — simulates latency, invalidates reads, shows toast. */
export function useAct() {
  const qc = useQueryClient();
  return async function act<R>(fn: () => R, msg?: string): Promise<R | undefined> {
    try { const res = await call(fn, 350); await qc.invalidateQueries(); if (msg) toast.success(msg); return (res === undefined ? (true as unknown as R) : res); } // undefined is reserved for "failed"
    catch (e) { toast.error((e as Error).message); return undefined; }
  };
}


const complete = (a?: [T.AttStatus, T.AttStatus]) => !!a && a.every((x) => x === "Present" || x === "Late");
/** Keeps derived training state in step with attendance: participant completion and class status. */
const syncTraining = (s: DbData) => {
  s.participants.forEach((p) => { p.trainingDone = s.classes.some((c) => c.roster.includes(p.id) && isComplete(c, p.id)); });
  s.classes.forEach((c) => {
    if (c.status === "Cancelled") return;
    const rec = c.roster.flatMap((p) => c.attendance[p] ?? []);
    c.status = rec.length && rec.every((a) => a !== "Not Recorded") ? "Completed" : rec.some((a) => a !== "Not Recorded") ? "In Progress" : "Scheduled";
  });
};

import { validateUser, type NewUser } from "./userRules";
export { validateUser };
export type { NewUser };
const isSuper = () => roleOfSession[role()] === "superAdmin";
const assertSuper = (what: string) => { if (!isSuper()) throw new ApiError(`Only the Super Admin can ${what}.`); };
const activeSupers = (us: T.User[]) => us.filter((u) => u.role === "superAdmin" && u.status === "Active");
const nextPid = (ps: T.Participant[]) => `P-${Math.max(1039, ...ps.map((p) => Number(p.id.slice(2)))) + 1}`;
const mkParticipant = (s: DbData, id: string, u: NewUser | T.User, appId: string): T.Participant => ({ id, appId, name: u.name, district: u.district, ac: s.applications.find((a) => a.id === appId)?.ac ?? "—", taluk: u.taluk, gp: u.gp, trainingDone: false, lmsProgress: 0, points: 0, publicLeaderboard: false, phoneMasked: "+91 ••••• ••••" });
const mkUser = (s: DbData, u: NewUser, participantId?: string): T.User => ({ id: nid("U"), name: u.name.trim(), phone: u.phone, email: u.email.trim(), role: u.role, status: "Active", district: u.district, taluk: u.taluk, gp: u.gp, participantId, createdAt: now().slice(0, 10), dob: u.dob || undefined, address: u.address?.trim() || undefined });
const noRoom = (s: DbData, c: Pick<T.TrainingClass, "id" | "cohort" | "room" | "trainerId">) => {
  const clash = s.classes.find((x) => x.id !== c.id && x.cohort === c.cohort && x.status !== "Cancelled" && (x.room === c.room || x.trainerId === c.trainerId));
  return clash ? `Conflict with ${clash.name}: same ${clash.room === c.room ? "room" : "trainer"} on the same days.` : null;
};

const assertSessionOpen = (st: DbData, sessionId: string, userRole: T.RbacRole) => {
  if (userRole !== "volunteer") throw new ApiError("Only volunteers can be registered for training.");
  const k = st.classes.find((x) => x.id === sessionId); if (!k) throw new ApiError("Training session not found.");
  if (k.status === "Cancelled") throw new ApiError(`${k.name} is cancelled.`);
  if (k.publish === "Draft") throw new ApiError(`${k.name} is a draft. Publish it before registering volunteers.`);
  if (k.roster.length >= k.capacity) throw new ApiError(`${k.name} is full (${k.capacity}/${k.capacity}). Choose another session.`);
  return k;
};
const setVillages = (s: DbData, pid: string, villageIds: string[]) => { s.villages.forEach((v) => { v.volunteerIds = v.volunteerIds.filter((p) => p !== pid); if (villageIds.includes(v.id)) v.volunteerIds.push(pid); }); };

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
      getDb().patch((s) => {
        const a = s.applications.find((x) => x.id === id)!; a.status = status; a.history.push({ status, at: now().slice(0, 10), by: actor() }); if (note) a.internalNotes.push(note);
        if (status === "Approved" && !s.participants.some((p) => p.appId === id)) {
          const n = Math.max(1039, ...s.participants.map((p) => Number(p.id.slice(2)))) + 1;
          s.participants.push({ id: `P-${n}`, appId: id, name: a.name, district: a.district, ac: a.ac, taluk: a.taluk, gp: a.gp, trainingDone: false, lmsProgress: 0, points: 0, publicLeaderboard: false, phoneMasked: "+91 ••••• ••••" });
          if (!s.users.some((u) => u.participantId === `P-${n}`)) s.users.push({ id: nid("U"), name: a.name, phone: a.phone, email: `${a.id.toLowerCase()}@example.org`, role: "volunteer", status: "Active", district: a.district, taluk: a.taluk, gp: a.gp, participantId: `P-${n}`, createdAt: now().slice(0, 10) });
        }
      });
      audit("Application decision", "Application", id, before, status);
    },
  },
  training: {
    assign: (pid: string, classId: string) => {
      const c = getDb().classes.find((x) => x.id === classId)!;
      if (c.roster.includes(pid)) throw new ApiError("Already in this class.");
      if (c.status === "Cancelled") throw new ApiError(`${c.name} is cancelled.`);
      if (c.publish === "Draft") throw new ApiError(`${c.name} is a draft. Publish it before registering volunteers.`);
      const other = getDb().classes.find((x) => x.roster.includes(pid) && x.cohort === c.cohort);
      if (other) throw new ApiError(`Participant is already in ${other.name}. Move instead of double-counting.`);
      getDb().patch((s) => { const k = s.classes.find((x) => x.id === classId)!; if (k.roster.length >= k.capacity) { k.waitlist.push(pid); } else { k.roster.push(pid); k.attendance[pid] = ["Not Recorded", "Not Recorded"]; } });
      audit("Roster assignment", "Class", classId, undefined, pid);
      return c.roster.length >= c.capacity ? "waitlisted" : "assigned";
    },
    /** Register several volunteers at once. Full sessions put the remainder on the waitlist; conflicts are reported per person. */
    assignMany: (pids: string[], classId: string) => {
      const out = { assigned: 0, waitlisted: 0, skipped: [] as { pid: string; reason: string }[] };
      pids.forEach((pid) => { try { const r = api.training.assign(pid, classId); if (r === "waitlisted") out.waitlisted++; else out.assigned++; } catch (e) { out.skipped.push({ pid, reason: (e as Error).message }); } });
      return out;
    },
    /** Approved exception: counts as completed although attendance did not meet the rule. Needs a reason and is audited. */
    markComplete: (classId: string, pid: string, reason: string) => {
      const c = getDb().classes.find((x) => x.id === classId)!; if (!c.roster.includes(pid)) throw new ApiError("This volunteer is not on the session roster.");
      if (isComplete(c, pid)) throw new ApiError("Already completed.");
      if (reason.trim().length < 5) throw new ApiError("Give a reason of at least 5 characters for the exception.");
      getDb().patch((s) => { const k = s.classes.find((x) => x.id === classId)!; (k.exceptions ??= {})[pid] = { reason: reason.trim(), by: actor(), at: now() }; syncTraining(s); });
      audit("Training completion exception", "Class", `${classId}/${pid}`, "Incomplete", `Completed: ${reason.trim()}`);
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
      getDb().patch((s) => { const k = s.classes.find((x) => x.id === classId)!; k.attendance[pid][day - 1] = to; k.attendanceLog.push({ at: now(), by: actor(), pid, day, from, to, reason }); syncTraining(s); });
      audit("Attendance edit", "Attendance", `${classId}/${pid}/Day${day}`, from, to);
    },
    bulk: (classId: string, day: 1 | 2, to: T.AttStatus) => {
      getDb().patch((s) => { const k = s.classes.find((x) => x.id === classId)!; k.roster.forEach((p) => { if (k.attendance[p][day - 1] === "Not Recorded") k.attendance[p][day - 1] = to; }); syncTraining(s); });
      audit("Attendance bulk mark", "Attendance", `${classId}/Day${day}`, "Not Recorded", to);
    },
    completes: complete,
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
  users: {
    /** Creates the account and returns the one-time activation code. Only a hash of the code is stored. */
    add: (u: NewUser) => {
      const st = getDb(); const err = validateUser(u, st.users); if (err) throw new ApiError(err);
      if (!assignableRoles(role()).includes(u.role)) throw new ApiError(u.role === "superAdmin" ? "Only the Super Admin can grant Super Admin." : "You cannot assign that role.");
      if (u.sessionId) assertSessionOpen(st, u.sessionId, u.role);
      if (u.villageId && u.role !== "volunteer") throw new ApiError("Only volunteers can be assigned to a village.");
      const { code, invite } = makeInvite(now()); let uid = "";
      getDb().patch((s) => {
        let pid: string | undefined;
        if (u.role === "volunteer") { pid = nextPid(s.participants); s.participants.push(mkParticipant(s, pid, u, "ADMIN-ADDED")); }
        const nu = mkUser(s, u, pid); nu.invite = invite; if (u.status && u.status !== "Active") nu.status = u.status; uid = nu.id; s.users.unshift(nu);
        if (pid && u.villageId) setVillages(s, pid, [u.villageId]);
        if (pid && u.sessionId) { const k = s.classes.find((x) => x.id === u.sessionId)!; k.roster.push(pid); k.attendance[pid] = ["Not Recorded", "Not Recorded"]; syncTraining(s); }
      });
      audit("User created", "User", uid, undefined, `${u.role}`); return { id: uid, code };
    },
    update: (id: string, patch: Partial<NewUser>) => {
      const st = getDb(); const cur = st.users.find((x) => x.id === id)!; const { sessionId, villageId, status: _ignored, ...fields } = patch; void _ignored;
      const next = { ...cur, ...fields } as T.User;
      const err = validateUser(next as unknown as NewUser, st.users, id); if (err) throw new ApiError(err);
      if (fields.role && fields.role !== cur.role && !assignableRoles(role()).includes(fields.role)) throw new ApiError(fields.role === "superAdmin" ? "Only the Super Admin can grant Super Admin." : "You cannot assign that role.");
      if (cur.role === "superAdmin" && fields.role && fields.role !== "superAdmin") { assertSuper("change a Super Admin's role"); if (activeSupers(st.users).length <= 1) throw new ApiError("At least one active Super Admin must remain."); }
      const pid = cur.participantId; const curClass = pid ? st.classes.find((c) => c.roster.includes(pid) && c.status !== "Cancelled") : undefined;
      if (sessionId !== undefined) {
        if (!pid) throw new ApiError("Only volunteers can be registered for training.");
        if (sessionId === "" && curClass && (curClass.attendance[pid!] ?? []).some((a) => a !== "Not Recorded")) throw new ApiError("Attendance is already recorded for this volunteer, so they cannot be unregistered.");
        if (sessionId && curClass?.id !== sessionId) { if (curClass && (curClass.attendance[pid!] ?? []).some((a) => a !== "Not Recorded")) throw new ApiError("Attendance is already recorded in the current session; it cannot be changed here."); assertSessionOpen(st, sessionId, cur.role); }
      }
      getDb().patch((s) => {
        const u = s.users.find((x) => x.id === id)!; Object.assign(u, fields, { dob: fields.dob || (fields.dob === "" ? undefined : u.dob), address: fields.address !== undefined ? fields.address.trim() || undefined : u.address });
        const p = u.participantId ? s.participants.find((x) => x.id === u.participantId) : undefined; if (p) { p.name = u.name; p.district = u.district; p.taluk = u.taluk; p.gp = u.gp; }
        if (p && villageId !== undefined) setVillages(s, p.id, villageId ? [villageId] : []);
        if (p && sessionId !== undefined) {
          s.classes.forEach((k) => { if (k.roster.includes(p.id) && k.id !== sessionId) { k.roster = k.roster.filter((x) => x !== p.id); delete k.attendance[p.id]; } });
          if (sessionId) { const k = s.classes.find((x) => x.id === sessionId)!; if (!k.roster.includes(p.id)) { k.roster.push(p.id); k.attendance[p.id] = ["Not Recorded", "Not Recorded"]; } }
          syncTraining(s);
        }
      });
      audit("User updated", "User", id, `${cur.role}/${cur.gp}`, `${next.role}/${next.gp}`);
    },
    changeRole: (id: string, to: T.RbacRole) => { const cur = getDb().users.find((x) => x.id === id)!; api.users.update(id, { role: to }); audit("Role changed", "User", id, cur.role, to); },
    assignVillages: (id: string, villageIds: string[]) => {
      const u = getDb().users.find((x) => x.id === id)!; if (!u.participantId) throw new ApiError("Only volunteers can be assigned to villages.");
      if (villageIds.some((v) => !getDb().villages.some((x) => x.id === v))) throw new ApiError("A selected village no longer exists.");
      getDb().patch((s) => setVillages(s, u.participantId!, villageIds)); audit("Volunteer villages assigned", "User", id, undefined, `${villageIds.length} village(s)`);
    },
    setStatus: (id: string, status: "Active" | "Inactive" | "Suspended", reason: string) => {
      const st = getDb(); const cur = st.users.find((x) => x.id === id)!;
      if (status !== "Active" && !reason.trim()) throw new ApiError("A reason is required to deactivate or suspend an account.");
      if (cur.role === "superAdmin" && status !== "Active" && activeSupers(st.users).length <= 1) throw new ApiError("At least one active Super Admin must remain.");
      getDb().patch((s) => { const u = s.users.find((x) => x.id === id)!; u.status = status; u.statusReason = reason || undefined; });
      audit("Account status change", "User", id, cur.status, `${status}${reason ? `: ${reason}` : ""}`);
    },
    /** Issues a fresh one-time activation code (also used for "reset password"). The previous code stops working. */
    reissueInvite: (id: string) => { const { code, invite } = makeInvite(now()); getDb().patch((s) => { const u = s.users.find((x) => x.id === id)!; u.invite = invite; u.passwordReset = now(); }); audit("Activation code reissued", "User", id, undefined, "One-time code (hash stored only)"); return code; },
    remove: (id: string) => {
      const st = getDb(); const cur = st.users.find((x) => x.id === id)!;
      if (cur.role === "superAdmin" && activeSupers(st.users).length <= 1) throw new ApiError("At least one active Super Admin must remain.");
      getDb().patch((s) => { s.users.find((x) => x.id === id)!.status = "Deleted"; });
      audit("User deleted (records preserved)", "User", id, cur.status, "Deleted");
    },
    restore: (id: string) => { getDb().patch((s) => { s.users.find((x) => x.id === id)!.status = "Inactive"; }); audit("User restored", "User", id, "Deleted", "Inactive"); },
    /** Bulk actions report per-account results instead of failing the whole batch. */
    bulkStatus: (ids: string[], status: "Active" | "Inactive" | "Suspended", reason: string) => { const out = { done: 0, skipped: [] as { id: string; reason: string }[] }; ids.forEach((id) => { try { api.users.setStatus(id, status, reason); out.done++; } catch (e) { out.skipped.push({ id, reason: (e as Error).message }); } }); return out; },
    bulkRemove: (ids: string[]) => { const out = { done: 0, skipped: [] as { id: string; reason: string }[] }; ids.forEach((id) => { try { api.users.remove(id); out.done++; } catch (e) { out.skipped.push({ id, reason: (e as Error).message }); } }); return out; },
    bulkAssignSession: (ids: string[], classId: string) => { const out = { done: 0, skipped: [] as { id: string; reason: string }[] }; ids.forEach((id) => { try { api.users.update(id, { sessionId: classId }); out.done++; } catch (e) { out.skipped.push({ id, reason: (e as Error).message }); } }); return out; },
    importRows: (rows: NewUser[]) => {
      const out = { added: 0, errors: [] as { row: number; message: string }[] };
      rows.forEach((r, i) => {
        const err = validateUser(r, getDb().users); if (err) return out.errors.push({ row: i + 2, message: err });
        if (!assignableRoles(role()).includes(r.role)) return out.errors.push({ row: i + 2, message: "You cannot assign the role in this row." });
        const { invite } = makeInvite(now());
        getDb().patch((s) => { let pid: string | undefined; if (r.role === "volunteer") { pid = nextPid(s.participants); s.participants.push(mkParticipant(s, pid, r, "ADMIN-IMPORT")); } const nu = mkUser(s, r, pid); nu.invite = invite; s.users.unshift(nu); }); out.added++;
      });
      audit("Bulk user import", "User", "csv", undefined, `${out.added} added, ${out.errors.length} rejected`); return out;
    },
  },
  villages: {
    add: (v: { name: string; gp: string; taluk: string; district: string; population?: number; status: T.Village["status"] }) => {
      if (v.name.trim().length < 2) throw new ApiError("Village name is required.");
      if (!v.gp || !v.taluk || !v.district) throw new ApiError("Choose district, block/taluk and Gram Panchayat.");
      if (getDb().villages.some((x) => x.gp === v.gp && x.name.toLowerCase() === v.name.trim().toLowerCase())) throw new ApiError("This village is already registered under that Gram Panchayat.");
      const id = nid("V"); getDb().patch((s) => { s.villages.unshift({ ...v, name: v.name.trim(), id, volunteerIds: [], enrolledOn: v.status === "Enrolled" ? now().slice(0, 10) : undefined }); }); audit("Village added", "Village", id, undefined, v.status); return id;
    },
    update: (id: string, patch: Partial<Pick<T.Village, "name" | "population" | "status" | "gp" | "taluk" | "district">>) => {
      const cur = getDb().villages.find((x) => x.id === id)!;
      if (patch.name !== undefined && patch.name.trim().length < 2) throw new ApiError("Village name is required.");
      getDb().patch((s) => { const v = s.villages.find((x) => x.id === id)!; Object.assign(v, patch); if (v.status === "Enrolled" && !v.enrolledOn) v.enrolledOn = now().slice(0, 10); });
      audit("Village updated", "Village", id, cur.status, patch.status ?? cur.status);
    },
    setVolunteers: (id: string, pids: string[]) => { getDb().patch((s) => { s.villages.find((x) => x.id === id)!.volunteerIds = pids; }); audit("Volunteers assigned to village", "Village", id, undefined, `${pids.length} volunteers`); },
    remove: (id: string) => {
      const v = getDb().villages.find((x) => x.id === id)!; if (v.volunteerIds.length) throw new ApiError("This village has assigned volunteers. Unassign them or archive (set Inactive) instead.");
      getDb().patch((s) => { s.villages = s.villages.filter((x) => x.id !== id); }); audit("Village deleted", "Village", id, v.status);
    },
  },
  rbac: {
    setAction: (r: T.RbacRole, m: T.Module, a: T.Action, on: boolean) => {
      assertSuper("change permissions"); if (r === "superAdmin") throw new ApiError("Super Admin permissions are fixed.");
      getDb().patch((s) => { const cur = new Set(s.rbac[r].modules[m] ?? []); if (on) { cur.add(a); cur.add("view"); } else if (a === "view") cur.clear(); else cur.delete(a); s.rbac[r].modules[m] = [...cur]; });
      audit("Permission change", "Role", r, undefined, `${m}.${a}=${on}`);
    },
    setFlag: (r: T.RbacRole, f: "manageUsers" | "changeSettings", on: boolean) => {
      assertSuper("change permissions"); if (r === "superAdmin") throw new ApiError("Super Admin permissions are fixed.");
      getDb().patch((s) => { s.rbac[r][f] = on; }); audit("Permission change", "Role", r, undefined, `${f}=${on}`);
    },
    setScope: (r: T.RbacRole, scope: T.RolePerm["scope"]) => { assertSuper("change permissions"); if (r === "superAdmin") throw new ApiError("Super Admin permissions are fixed."); getDb().patch((s) => { s.rbac[r].scope = scope; }); audit("Role scope change", "Role", r, undefined, scope); },
    reset: () => { assertSuper("reset permissions"); getDb().patch((s) => { s.rbac = defaultRbac(); }); audit("Permissions reset to defaults", "Role", "all"); },
  },
  sessions: {
    create: (c: SessionInput & { coordinatorId?: string; materials?: { name: string; size: number; mime?: string; blobId?: string }[] }, mode: "draft" | "publish" = "publish") => {
      const err = validateSession(c, mode); if (err) throw new ApiError(err);
      const id = nid("CL"); const cohort = c.cohort as "A" | "B" | "C"; const days: [number, number] = cohort === "A" ? [1, 2] : cohort === "B" ? [3, 4] : [5, 6];
      if (c.room.trim()) { const clash = noRoom(getDb(), { id, cohort, room: c.room, trainerId: c.trainerId }); if (clash) throw new ApiError(clash); }
      getDb().patch((s) => { s.classes.push({ id, name: c.name.trim(), description: c.description?.trim() || undefined, cohort, days, startDate: c.startDate, trainerId: c.trainerId, room: c.room.trim(), capacity: c.capacity, roster: [], waitlist: [], attendance: {}, attendanceLog: [], status: "Scheduled", location: c.location.trim(), region: c.region || undefined, registrationDeadline: c.registrationDeadline || undefined, duration: 2, coordinatorId: c.coordinatorId, publish: mode === "publish" ? "Published" : "Draft", materials: (c.materials ?? []).map((m) => ({ id: nid("MT"), name: m.name, size: m.size, mime: m.mime, blobId: m.blobId, uploadedAt: now(), uploadedBy: actor() })), certified: [], exceptions: {} }); s.cycle.classIds.push(id); });
      audit(mode === "publish" ? "Training session published" : "Training session saved as draft", "Class", id, undefined, c.startDate); return id;
    },
    update: (id: string, p: Partial<SessionInput> & { coordinatorId?: string }, mode?: "draft" | "publish") => {
      const st = getDb(); const cur = st.classes.find((x) => x.id === id)!;
      const merged: SessionInput = { name: p.name ?? cur.name, description: p.description ?? cur.description, cohort: cur.cohort, startDate: cur.startDate, location: p.location ?? cur.location ?? "", room: p.room ?? cur.room, capacity: p.capacity ?? cur.capacity, trainerId: p.trainerId ?? cur.trainerId, registrationDeadline: p.registrationDeadline ?? cur.registrationDeadline, region: p.region ?? cur.region };
      const target: "draft" | "publish" = mode ?? (cur.publish === "Draft" ? "draft" : "publish");
      const err = validateSession(merged, target); if (err) throw new ApiError(err);
      if (p.capacity !== undefined && p.capacity < cur.roster.length) throw new ApiError(`Cannot go below the current roster (${cur.roster.length}).`);
      if (target === "draft" && cur.publish === "Published" && cur.roster.length) throw new ApiError("This session already has registered volunteers, so it cannot go back to draft.");
      const clash = noRoom(st, { id, cohort: cur.cohort, room: merged.room, trainerId: merged.trainerId }); if (clash && merged.room.trim()) throw new ApiError(clash);
      getDb().patch((s) => { const k = s.classes.find((x) => x.id === id)!; Object.assign(k, { name: merged.name.trim(), description: merged.description?.trim() || undefined, location: merged.location.trim(), region: merged.region || undefined, room: merged.room.trim(), capacity: merged.capacity, trainerId: merged.trainerId, registrationDeadline: merged.registrationDeadline || undefined, publish: target === "publish" ? "Published" : "Draft" }); if (p.coordinatorId !== undefined) k.coordinatorId = p.coordinatorId || undefined; });
      audit("Training session updated", "Class", id, cur.publish, target === "publish" ? "Published" : "Draft");
    },
    publish: (id: string) => { api.sessions.update(id, {}, "publish"); },
    unpublish: (id: string) => { api.sessions.update(id, {}, "draft"); },
    reschedule: (id: string, startDate: string, reason: string) => {
      if (!startDate) throw new ApiError("Choose a new date."); if (!reason.trim()) throw new ApiError("A reason is required to reschedule.");
      const cur = getDb().classes.find((x) => x.id === id)!;
      if (cur.registrationDeadline && cur.registrationDeadline > startDate) throw new ApiError("The registration deadline must be on or before the new start date. Edit the session first.");
      getDb().patch((s) => { s.classes.find((x) => x.id === id)!.startDate = startDate; }); audit("Training session rescheduled", "Class", id, cur.startDate, `${startDate}: ${reason}`);
    },
    cancel: (id: string, reason: string) => {
      if (!reason.trim()) throw new ApiError("A reason is required to cancel a session.");
      getDb().patch((s) => { const c = s.classes.find((x) => x.id === id)!; c.status = "Cancelled"; c.cancelReason = reason; }); audit("Training session cancelled", "Class", id, undefined, reason);
    },
    remove: (id: string) => {
      const c = getDb().classes.find((x) => x.id === id)!;
      if (c.roster.length || c.attendanceLog.length) throw new ApiError("This session has volunteers or attendance records. Cancel it instead; records are preserved.");
      (c.materials ?? []).forEach((m) => m.blobId && void delBlob(m.blobId));
      getDb().patch((s) => { s.classes = s.classes.filter((x) => x.id !== id); s.cycle.classIds = s.cycle.classIds.filter((x) => x !== id); }); audit("Training session deleted", "Class", id);
    },
    addMaterial: (id: string, m: { name: string; size: number; mime?: string; blobId?: string }) => {
      const e = validateFile("document", m); const okImg = /\.(png|jpe?g|mp4)$/i.test(m.name) && m.size <= 25 * 1024 * 1024; if (e && !okImg) throw new ApiError(e.replace("20 MB", "20 MB (video 25 MB)"));
      getDb().patch((s) => { const c = s.classes.find((x) => x.id === id)!; (c.materials ??= []).push({ id: nid("MT"), name: m.name, size: m.size, mime: m.mime, blobId: m.blobId, uploadedAt: now(), uploadedBy: actor() }); }); audit("Training material added", "Class", id, undefined, m.name);
    },
    removeMaterial: (id: string, mid: string) => { const m = getDb().classes.find((x) => x.id === id)?.materials?.find((x) => x.id === mid); if (m?.blobId) void delBlob(m.blobId); getDb().patch((s) => { const c = s.classes.find((x) => x.id === id)!; c.materials = (c.materials ?? []).filter((x) => x.id !== mid); }); audit("Training material removed", "Class", id, mid); },
    certify: (id: string, pid: string) => {
      const c = getDb().classes.find((x) => x.id === id)!; if (!isComplete(c, pid)) throw new ApiError("Certification needs both training days attended or an approved completion exception.");
      getDb().patch((s) => { const k = s.classes.find((x) => x.id === id)!; k.certified = [...new Set([...(k.certified ?? []), pid])]; }); audit("Training certificate issued (sample)", "Class", `${id}/${pid}`);
    },
  },
  categories: {
    add: (en: string, kn: string) => {
      if (en.trim().length < 2) throw new ApiError("Category name (English) is required.");
      if (getDb().resourceCategories.some((c) => c.name.en.toLowerCase() === en.trim().toLowerCase())) throw new ApiError("A category with this name already exists.");
      const id = nid("RC"); getDb().patch((s) => { s.resourceCategories.push({ id, name: { en: en.trim(), kn: kn.trim() }, order: Math.max(0, ...s.resourceCategories.map((c) => c.order)) + 1 }); }); audit("Resource category added", "Category", id, undefined, en); return id;
    },
    rename: (id: string, en: string, kn: string) => {
      if (en.trim().length < 2) throw new ApiError("Category name (English) is required.");
      if (getDb().resourceCategories.some((c) => c.id !== id && c.name.en.toLowerCase() === en.trim().toLowerCase())) throw new ApiError("A category with this name already exists.");
      getDb().patch((s) => { const c = s.resourceCategories.find((x) => x.id === id)!; c.name = { en: en.trim(), kn: kn.trim() }; }); audit("Resource category renamed", "Category", id, undefined, en);
    },
    move: (id: string, dir: -1 | 1) => { getDb().patch((s) => { const list = [...s.resourceCategories].sort((a, b) => a.order - b.order); const i = list.findIndex((c) => c.id === id); const j = i + dir; if (j < 0 || j >= list.length) return; [list[i].order, list[j].order] = [list[j].order, list[i].order]; s.resourceCategories = list; }); },
    remove: (id: string) => {
      const used = getDb().resources.filter((r) => r.categoryId === id).length; if (used) throw new ApiError(`This category has ${used} resource(s). Move or delete them first.`);
      getDb().patch((s) => { s.resourceCategories = s.resourceCategories.filter((c) => c.id !== id); }); audit("Resource category deleted", "Category", id);
    },
  },
  resources: {
    /** Create (no id) or update. `file` / `thumb` are references to files already stored in this browser. */
    save: (input: Omit<ResourceForm, "hasFile"> & { file?: T.MediaRef; thumb?: T.MediaRef }, id?: string) => {
      const parsed = resourceSchema.safeParse({ ...input, hasFile: !!input.file }); if (!parsed.success) throw new ApiError(parsed.error.issues[0].message);
      if (!getDb().resourceCategories.some((c) => c.id === input.categoryId)) throw new ApiError("The selected category no longer exists.");
      const old = id ? getDb().resources.find((r) => r.id === id) : undefined; const rid = id ?? nid("LR");
      const mode = input.type === "videoFile" || input.type === "pdf" || input.type === "document";
      const rec: T.LearningResource = { id: rid, title: input.title.trim(), short: input.short.trim(), full: input.full.trim(), categoryId: input.categoryId, topic: input.topic.trim(), type: input.type, url: mode ? undefined : input.url?.trim() || undefined, file: mode ? input.file : undefined, thumb: input.thumb, language: input.language, audience: input.audience, order: input.order, status: input.status, publishDate: input.status === "Published" ? input.publishDate || DEMO_TODAY : input.status === "Scheduled" ? input.publishDate : input.publishDate || undefined, createdAt: old?.createdAt ?? DEMO_TODAY, updatedAt: DEMO_TODAY, credit: old?.credit };
      [[old?.file, rec.file], [old?.thumb, rec.thumb]].forEach(([o, n]) => { const ob = (o as T.MediaRef | undefined)?.blobId; if (ob && ob !== (n as T.MediaRef | undefined)?.blobId) void delBlob(ob); });
      getDb().patch((s) => { const i = s.resources.findIndex((r) => r.id === rid); if (i >= 0) s.resources[i] = rec; else s.resources.unshift(rec); });
      audit(old ? "Resource updated" : "Resource created", "Resource", rid, old?.status, rec.status); return rid;
    },
    setStatus: (id: string, status: T.ResourceStatus, publishDate?: string) => {
      const r = getDb().resources.find((x) => x.id === id)!;
      if ((status === "Published" || status === "Scheduled") && !r.url && !r.file) throw new ApiError("Add the file or link before publishing.");
      if (status === "Scheduled" && !publishDate && !r.publishDate) throw new ApiError("Choose the date it should go live.");
      getDb().patch((s) => { const x = s.resources.find((q) => q.id === id)!; x.status = status; x.updatedAt = DEMO_TODAY; if (status === "Published" && !x.publishDate) x.publishDate = DEMO_TODAY; if (publishDate) x.publishDate = publishDate; });
      audit("Resource status change", "Resource", id, r.status, status);
    },
    remove: (id: string) => { const r = getDb().resources.find((x) => x.id === id)!; [r.file, r.thumb].forEach((m) => m?.blobId && void delBlob(m.blobId)); getDb().patch((s) => { s.resources = s.resources.filter((x) => x.id !== id); }); audit("Resource deleted", "Resource", id, r.status); },
    bulkStatus: (ids: string[], status: T.ResourceStatus) => { const out = { done: 0, skipped: [] as { id: string; reason: string }[] }; ids.forEach((id) => { try { api.resources.setStatus(id, status); out.done++; } catch (e) { out.skipped.push({ id, reason: (e as Error).message }); } }); return out; },
    bulkDelete: (ids: string[]) => { ids.forEach((id) => api.resources.remove(id)); return { done: ids.length }; },
    bulkCategory: (ids: string[], categoryId: string) => { if (!getDb().resourceCategories.some((c) => c.id === categoryId)) throw new ApiError("Choose a category."); getDb().patch((s) => { s.resources.forEach((r) => { if (ids.includes(r.id)) r.categoryId = categoryId; }); }); audit("Resources moved to category", "Resource", `${ids.length} items`, undefined, categoryId); },
  },
  report: { exportCsv: (name: string) => audit("Report export", "Report", name) },
};
export { inScope, roleUsers };
