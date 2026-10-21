import type { DbData } from "./db";
import { gps } from "./seed-geo";

export const TARGET_VOLUNTEERS = 100000; // the initiative's stated target; every other figure is derived from app records.

/** Aggregates computed only from records in the app's store. */
export function homeStats(d: DbData) {
  const ok = (a?: string[]) => !!a && a.every((x) => x === "Present" || x === "Late");
  // Trained = both training days attended; a session is conducted once every rostered volunteer has both days recorded.
  const trained = d.participants.filter((p) => d.classes.some((c) => c.roster.includes(p.id) && ok(c.attendance[p.id]))).length;
  const sessionsDone = d.classes.filter((c) => c.roster.length > 0 && c.roster.every((p) => (c.attendance[p] ?? []).length === 2 && c.attendance[p].every((x) => x !== "Not Recorded"))).length;
  const villages = new Set(d.participants.map((p) => p.gp));
  const byDistrict = Object.entries(d.participants.reduce<Record<string, number>>((a, p) => ((a[p.district] = (a[p.district] ?? 0) + 1), a), {})).sort((a, b) => b[1] - a[1]);
  const statusCount = (s: string) => d.grievances.filter((g) => g.status === s).length;
  const lessons = d.courses.filter((c) => c.status === "Published").flatMap((c) => c.lessons);
  return {
    registered: d.applications.length, trained, sessionsTotal: d.classes.length, sessionsDone,
    perSession: sessionsDone ? Math.round(trained / sessionsDone) : 0,
    villagesEnrolled: villages.size, villagesPending: Math.max(0, gps.length - villages.size), gpTotal: gps.length, byDistrict,
    raised: d.grievances.length, resolved: statusCount("Closed"), statusCount,
    courses: d.courses.filter((c) => c.status === "Published"),
    kinds: { video: lessons.filter((l) => l.type === "video").length, reading: lessons.filter((l) => l.type === "reading").length, quiz: lessons.filter((l) => l.type === "quiz").length },
  };
}
