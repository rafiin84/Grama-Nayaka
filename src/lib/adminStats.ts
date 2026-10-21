import type { DbData } from "./initialData";
import { inScope } from "./scope";
import { districts, gps, taluks, districtOf } from "./seed-geo";
import type { Grievance, Role, User } from "./types";
import { today } from "./derive";

export interface DashFilters { district: string; taluk: string; gp: string; village: string; from: string; to: string; training: "" | "trained" | "pending"; gStatus: string }
export const emptyFilters: DashFilters = { district: "", taluk: "", gp: "", village: "", from: "", to: "", training: "", gStatus: "" };
const talukOfGp = (gp: string) => gps.find((g) => g.name === gp)?.taluk ?? "";
const inRange = (date: string | undefined, f: DashFilters) => !date || ((!f.from || date.slice(0, 10) >= f.from) && (!f.to || date.slice(0, 10) <= f.to));
const month = (d: string) => d.slice(0, 7);

/** Every figure is computed from the app's records, within the acting role's scope and the selected filters. */
export function adminStats(d: DbData, role: Role, f: DashFilters) {
  const village = f.village ? d.villages.find((v) => v.id === f.village) : undefined;
  const geoOk = (r: { district?: string; taluk?: string; gp?: string }) => (!f.district || r.district === f.district) && (!f.taluk || (r.taluk ?? talukOfGp(r.gp ?? "")) === f.taluk) && (!f.gp || r.gp === f.gp);
  const scope = (r: { district?: string; taluk?: string; gp?: string }) => inScope(role, { district: r.district || undefined, taluk: r.taluk || undefined, gp: r.gp || undefined });

  const volunteers = d.users.filter((u) => u.role === "volunteer" && u.status !== "Deleted" && scope(u) && geoOk(u) && inRange(u.createdAt, f) && (!village || (!!u.participantId && village.volunteerIds.includes(u.participantId))));
  const part = (u: User) => d.participants.find((p) => p.id === u.participantId);
  const trainedList = volunteers.filter((u) => part(u)?.trainingDone);
  const volunteersFiltered = f.training === "trained" ? trainedList : f.training === "pending" ? volunteers.filter((u) => !part(u)?.trainingDone) : volunteers;
  const registered = volunteersFiltered.length;
  const trained = volunteersFiltered.filter((u) => part(u)?.trainingDone).length;

  const classes = d.classes.filter((c) => c.status !== "Cancelled" && inRange(c.startDate, f));
  const conducted = classes.filter((c) => c.roster.length > 0 && c.roster.every((p) => (c.attendance[p] ?? []).length === 2 && c.attendance[p].every((x) => x !== "Not Recorded")));

  const vils = d.villages.filter((v) => scope(v) && geoOk(v) && (!village || v.id === village.id));
  const gpInScope = gps.filter((g) => scope({ gp: g.name, taluk: g.taluk, district: districtOf(g.taluk) }) && geoOk({ gp: g.name, taluk: g.taluk, district: districtOf(g.taluk) }));
  const talukInScope = taluks.filter((t) => scope({ taluk: t.name, district: t.district }) && geoOk({ taluk: t.name, district: t.district }));
  const districtInScope = districts.filter((x) => (!f.district || x === f.district) && inScope(role, { district: x }));

  const gAll = d.grievances.filter((g) => scope(g) && geoOk({ district: g.district, gp: g.gp }) && (!village || g.locality.toLowerCase().includes(village.name.toLowerCase())) && inRange(g.createdAt, f));
  const gs = f.gStatus ? gAll.filter((g) => g.status === f.gStatus) : gAll;
  const is = (g: Grievance, ...st: string[]) => st.includes(g.status);
  const lessons = d.courses.filter((c) => c.status === "Published").flatMap((c) => c.lessons);
  const accounts = d.users.filter((u) => u.status !== "Deleted" && scope(u) && geoOk(u));

  const months = [...new Set([...d.users.filter((u) => u.role === "volunteer").map((u) => month(u.createdAt)), ...d.grievances.map((g) => month(g.createdAt))])].sort();
  const trendVolunteers = months.map((m) => ({ month: m, count: volunteers.filter((u) => month(u.createdAt) === m).length }));
  const trendGrievances = months.map((m) => ({ month: m, created: gs.filter((g) => month(g.createdAt) === m).length, closed: gs.filter((g) => g.timeline.some((t) => t.to === "Closed" && month(t.at) === m)).length }));
  const byDistrict = districtInScope.map((x) => { const vs = volunteers.filter((u) => u.district === x); return { district: x, trained: vs.filter((u) => part(u)?.trainingDone).length, pending: vs.filter((u) => !part(u)?.trainingDone).length }; }).filter((r) => r.trained + r.pending > 0);

  const pendingApps = d.applications.filter((a) => scope(a) && (a.status === "Submitted" || a.status === "Under Review"));
  const overdue = gs.filter((g) => g.status !== "Closed" && g.followUpDate < today);
  const alerts: { id: string; tone: "danger" | "warning"; text: string; href: string }[] = [
    ...overdue.slice(0, 3).map((g) => ({ id: `o-${g.id}`, tone: "danger" as const, text: `${g.id} follow-up overdue (${g.followUpDate})`, href: `/admin/grievances/${g.id}` })),
    ...d.classes.filter((c) => c.status !== "Cancelled" && c.capacity > 0 && c.roster.length / c.capacity >= 0.9).map((c) => ({ id: `c-${c.id}`, tone: "warning" as const, text: `${c.name} is at ${Math.round((c.roster.length / c.capacity) * 100)}% capacity`, href: `/admin/training/${c.id}` })),
    ...d.classes.filter((c) => c.status === "Scheduled" && c.roster.length === 0).slice(0, 2).map((c) => ({ id: `e-${c.id}`, tone: "warning" as const, text: `${c.name} has no volunteers registered`, href: `/admin/training/${c.id}` })),
    ...(accounts.filter((u) => u.status === "Suspended").length ? [{ id: "susp", tone: "warning" as const, text: `${accounts.filter((u) => u.status === "Suspended").length} suspended account(s)`, href: "/admin/users" }] : []),
  ];

  return {
    registered, trained, pendingTraining: registered - trained, sessionsTotal: classes.length, sessionsConducted: conducted.length,
    villagesEnrolled: vils.filter((v) => v.status === "Enrolled").length, villagesPending: vils.filter((v) => v.status === "Pending").length, villagesTotal: vils.length,
    districts: districtInScope.length, blocks: talukInScope.length, gps: gpInScope.length,
    grievances: { submitted: gs.length, pendingAction: gs.filter((g) => is(g, "Open", "In Progress", "Reopened")).length, awaitingResponse: gs.filter((g) => is(g, "Follow-up Due", "Escalated")).length, closed: gs.filter((g) => is(g, "Closed")).length, closurePending: gs.filter((g) => is(g, "Closure Pending")).length },
    resources: lessons.length, courses: d.courses.filter((c) => c.status === "Published").length,
    activeUsers: accounts.filter((u) => u.status === "Active").length, inactiveUsers: accounts.filter((u) => u.status === "Inactive" || u.status === "Suspended").length,
    trendVolunteers, trendGrievances, byDistrict,
    grievanceStatus: ["Open", "In Progress", "Follow-up Due", "Escalated", "Closure Pending", "Closed", "Reopened"].map((s) => ({ status: s, count: gs.filter((g) => g.status === s).length })),
    approvals: { applications: pendingApps.length, points: d.ledger.filter((l) => !l.verified).length, redemptions: d.redemptions.filter((r) => r.status === "Pending").length, villages: vils.filter((v) => v.status === "Pending").length },
    overdueCount: overdue.length, alerts, recent: d.audit.slice(0, 8), applications: d.applications.filter(scope).length, approved: d.applications.filter((a) => scope(a) && a.status === "Approved").length,
  };
}
export type AdminStats = ReturnType<typeof adminStats>;
