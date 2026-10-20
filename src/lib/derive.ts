import type { DbData } from "./db";
import { ME } from "./seed";
export const lmsStats = (d: DbData) => {
  const lessons = d.courses.filter((c) => d.enrolled.includes(c.id)).flatMap((c) => c.lessons);
  const done = lessons.filter((l) => d.progress[l.id]?.done).length;
  return { total: lessons.length, done, pct: lessons.length ? Math.round((done / lessons.length) * 100) : 0 };
};
export const nextLesson = (d: DbData) => {
  for (const c of d.courses.filter((c) => d.enrolled.includes(c.id))) for (const l of c.lessons) if (!d.progress[l.id]?.done) return { course: c, lesson: l };
  return null;
};
export const points = (d: DbData, pid = ME) => d.ledger.filter((l) => l.pid === pid && l.verified).reduce((a, l) => a + l.points, 0);
export const pendingPoints = (d: DbData, pid = ME) => d.ledger.filter((l) => l.pid === pid && !l.verified).reduce((a, l) => a + l.points, 0);
export const level = (pts: number) => (pts >= 500 ? 4 : pts >= 250 ? 3 : pts >= 100 ? 2 : 1);
export const today = "2026-10-20";
