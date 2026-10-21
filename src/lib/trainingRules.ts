import type { AttStatus, TrainingClass } from "./types";

export const DURATION_DAYS = 2; // attendance is recorded for two days per batch
export const endDateOf = (start: string, days = DURATION_DAYS) => { if (!start) return ""; const d = new Date(start + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + days - 1); return d.toISOString().slice(0, 10); };
const present = (x: AttStatus) => x === "Present" || x === "Late";
/** Completed = both days present/late, or an approved completion exception. */
export const isComplete = (c: Pick<TrainingClass, "attendance" | "exceptions">, pid: string) => !!c.exceptions?.[pid] || (!!c.attendance[pid] && c.attendance[pid].length === 2 && c.attendance[pid].every(present));
export interface SessionInput { name: string; description?: string; cohort: string; startDate: string; location: string; room: string; capacity: number; trainerId: string; registrationDeadline?: string; region?: string }
export type SessionErrors = Partial<Record<"name" | "description" | "startDate" | "capacity" | "registrationDeadline" | "location" | "room" | "trainerId", string>>;
/** Field-level errors. `draft` needs the basics; `publish` needs everything. */
export function sessionErrors(i: SessionInput, mode: "draft" | "publish"): SessionErrors {
  const e: SessionErrors = {};
  if (i.name.trim().length < 3) e.name = "Session name is required (3+ characters)."; else if (i.name.length > 80) e.name = "Session name must be 80 characters or fewer.";
  if ((i.description ?? "").length > 600) e.description = "Description must be 600 characters or fewer.";
  if (!i.startDate) e.startDate = "Start date is required.";
  if (!Number.isFinite(i.capacity) || i.capacity < 30 || i.capacity > 100) e.capacity = "Capacity must be between 30 and 100.";
  if (i.registrationDeadline && i.startDate && i.registrationDeadline > i.startDate) e.registrationDeadline = "Registration deadline must be on or before the start date.";
  if (mode === "publish") {
    if (!i.location.trim()) e.location = "Training location is required to publish.";
    if (!i.room.trim()) e.room = "Room is required to publish.";
    if (!i.trainerId) e.trainerId = "Assign a trainer before publishing.";
    if (!i.registrationDeadline) e.registrationDeadline = e.registrationDeadline ?? "Registration deadline is required to publish.";
  }
  return e;
}
/** First error message, or null. */
export function validateSession(i: SessionInput, mode: "draft" | "publish"): string | null { const e = sessionErrors(i, mode); return Object.values(e)[0] ?? null; }

export type VolunteerTrainingStatus = "Not registered" | "Registered" | "In progress" | "Completed";
/** Derived from the roster, attendance and approved exceptions; it is never typed in by hand. */
export function trainingStatusOf(classes: TrainingClass[], pid?: string): VolunteerTrainingStatus {
  if (!pid) return "Not registered";
  const mine = classes.filter((c) => c.roster.includes(pid) && c.status !== "Cancelled");
  if (mine.some((c) => isComplete(c, pid))) return "Completed";
  if (mine.some((c) => (c.attendance[pid] ?? []).some((a) => a !== "Not Recorded"))) return "In progress";
  return mine.length ? "Registered" : "Not registered";
}
