/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { useState } from "react";
import { Button, Card, PageHeader, QState, Select, Stat } from "@/components/ui";
import { ChartCard } from "@/components/charts";
import { api, useAct, useMock } from "@/lib/api";
import { getDb, inScope } from "@/lib/db";
import { usePrefs } from "@/lib/store";
import { districts } from "@/lib/seed-geo";
import { today } from "@/lib/derive";
import { useT } from "@/lib/useT";
import { useRouter } from "next/navigation";

export default function Overview() {
  const { tr } = useT(); const act = useAct(); const role = usePrefs((s) => s.role); const router = useRouter();
  const [dist, setDist] = useState(""); const [cohort, setCohort] = useState(""); const [range, setRange] = useState("90");
  if (role === "trainer") { if (typeof window !== "undefined") router.replace("/admin/training"); return null; }
  return <Inner {...{ tr, act, role, dist, setDist, cohort, setCohort, range, setRange }} />;
}
function Inner({ tr, act, role, dist, setDist, cohort, setCohort, range, setRange }: Record<string, any>) {  
  const q = useMock(["overview", dist, cohort, range], () => {
    const d = getDb(); const apps = d.applications.filter((a: any) => inScope(role, a) && (!dist || a.district === dist)); const ps = d.participants.filter((p: any) => inScope(role, p) && (!dist || p.district === dist) && (!cohort || p.cohort === cohort));
    const gs = d.grievances.filter((g: any) => inScope(role, g) && (!dist || g.district === dist)); const cls = d.classes.filter((c: any) => !cohort || c.cohort === cohort);
    const cap = cls.reduce((a: number, c: any) => a + c.capacity, 0); const fill = cls.reduce((a: number, c: any) => a + c.roster.length, 0);
    const approved = apps.filter((a: any) => a.status === "Approved").length; const done = ps.filter((p: any) => p.trainingDone).length; const lmsDone = ps.filter((p: any) => p.lmsProgress >= 100).length; const field = ps.filter((p: any) => d.grievances.some((g: any) => g.ownerId === p.id)).length;
    const closed = gs.filter((g: any) => g.status === "Closed").length;
    return { apps, ps, gs, cap, fill, approved, done, lmsDone, field, closed, cls, resid: d.residents.filter((r: any) => inScope(role, r)).length, voters: d.voters.length, ev: d.events.reduce((a: number, e: any) => a + e.attended.length, 0), points: d.ledger.filter((l: any) => l.verified).reduce((a: number, l: any) => a + l.points, 0),
      overdue: gs.filter((g: any) => g.status !== "Closed" && g.followUpDate < today), pendingApps: apps.filter((a: any) => a.status === "Submitted" || a.status === "Under Review").length, pendingRules: d.ledger.filter((l: any) => !l.verified).length };
  });
  return (<div className="space-y-4">
    <PageHeader title={tr("What needs attention today", "ಇಂದು ಗಮನ ಬೇಕಾದದ್ದು")} sub={tr("Demo data · Source: mock programme records · Refreshed 2026-10-20 17:40 · Counts are not official statistics.", "ಡೆಮೊ ಡೇಟಾ · ಮೂಲ: ಮಾಕ್ ಕಾರ್ಯಕ್ರಮ ದಾಖಲೆ · ನವೀಕರಣ 2026-10-20 17:40 · ಅಧಿಕೃತ ಅಂಕಿಅಂಶವಲ್ಲ.")} actions={<Button variant="secondary" onClick={() => act(() => api.report.exportCsv("overview"), tr("Report download prepared (mock) and logged", "ವರದಿ ಡೌನ್‌ಲೋಡ್ ಸಿದ್ಧ (ಮಾಕ್), ದಾಖಲಿಸಲಾಗಿದೆ"))}>{tr("Download report (mock)", "ವರದಿ ಡೌನ್‌ಲೋಡ್ (ಮಾಕ್)")}</Button>} />
    <div className="grid gap-2 sm:grid-cols-4"><Select aria-label="Date range" value={range} onChange={(e) => setRange(e.target.value)}><option value="30">{tr("Last 30 days", "ಕಳೆದ 30 ದಿನ")}</option><option value="90">{tr("Last 90 days", "ಕಳೆದ 90 ದಿನ")}</option></Select><Select aria-label="District" value={dist} onChange={(e) => setDist(e.target.value)}><option value="">{tr("All districts in scope", "ವ್ಯಾಪ್ತಿಯ ಎಲ್ಲಾ ಜಿಲ್ಲೆ")}</option>{districts.map((x) => <option key={x}>{x}</option>)}</Select><Select aria-label="Cohort" value={cohort} onChange={(e) => setCohort(e.target.value)}><option value="">{tr("All cohorts", "ಎಲ್ಲಾ ಕೋಹಾರ್ಟ್")}</option>{["A", "B", "C"].map((x) => <option key={x}>{x}</option>)}</Select></div>
    <QState q={q}>{(d: any) => (<> { }
      <Card className="border-warning/40"><h2 className="font-bold">{tr("Needs attention", "ಗಮನ ಬೇಕು")}</h2><ul className="mt-2 space-y-1 text-sm">
        <li><Link className="text-primary underline" href="/admin/applications">{d.pendingApps} {tr("applications awaiting review", "ಅರ್ಜಿಗಳು ಪರಿಶೀಲನೆಗೆ ಕಾಯುತ್ತಿವೆ")}</Link></li>
        <li><Link className="text-primary underline" href="/admin/grievances">{d.overdue.length} {tr("grievances with overdue follow-up", "ದೂರುಗಳ ಅನುಸರಣೆ ವಿಳಂಬ")}</Link></li>
        <li><Link className="text-primary underline" href="/admin/rewards">{d.pendingRules} {tr("points awaiting validation", "ಅಂಕಗಳು ದೃಢೀಕರಣಕ್ಕೆ ಬಾಕಿ")}</Link></li>
        <li><Link className="text-primary underline" href="/admin/training">{tr("Waitlisted participants", "ಕಾಯುವ ಪಟ್ಟಿ")}: {d.cls.reduce((a: number, c: any) => a + c.waitlist.length, 0)}</Link></li></ul></Card>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={tr("Applications received", "ಅರ್ಜಿಗಳು")} value={d.apps.length} hint={tr("All submitted applications in scope", "ವ್ಯಾಪ್ತಿಯ ಎಲ್ಲಾ ಸಲ್ಲಿಸಿದ ಅರ್ಜಿ")} />
        <Stat label={tr("Approved", "ಅನುಮೋದಿತ")} value={d.approved} hint={tr(`Conversion ${d.apps.length ? Math.round((d.approved / d.apps.length) * 100) : 0}% of received`, `ಪರಿವರ್ತನೆ ${d.apps.length ? Math.round((d.approved / d.apps.length) * 100) : 0}%`)} />
        <Stat label={tr("Completed both training days", "ಎರಡೂ ದಿನ ಪೂರ್ಣ")} value={d.done} hint={tr("Of approved participants in scope", "ವ್ಯಾಪ್ತಿಯ ಅನುಮೋದಿತರಲ್ಲಿ")} />
        <Stat label={tr("Training seats filled", "ಭರ್ತಿ ಆಸನ")} value={`${d.fill}/${d.cap}`} hint={tr("Sum of configured class capacities", "ಸಂರಚಿತ ಸಾಮರ್ಥ್ಯದ ಮೊತ್ತ")} />
        <Stat label={tr("LMS completed", "LMS ಪೂರ್ಣ")} value={`${d.lmsDone}/${d.ps.length}`} hint={tr("Participants with 100% of enrolled lessons", "ದಾಖಲಾದ ಎಲ್ಲಾ ಪಾಠ ಮುಗಿಸಿದವರು")} />
        <Stat label={tr("Resident records", "ನಿವಾಸಿ ದಾಖಲೆ")} value={d.resid} hint={tr("Aggregate count only", "ಒಟ್ಟು ಸಂಖ್ಯೆ ಮಾತ್ರ")} />
        <Stat label={tr("Grievances open / closed", "ದೂರು ಬಾಕಿ / ಮುಚ್ಚಿದ")} value={`${d.gs.length - d.closed} / ${d.closed}`} hint={tr(`Closure rate ${d.gs.length ? Math.round((d.closed / d.gs.length) * 100) : 0}% — mock records, not official resolution`, `ಮುಚ್ಚುವ ದರ ${d.gs.length ? Math.round((d.closed / d.gs.length) * 100) : 0}% — ಮಾಕ್ ದಾಖಲೆ`)} />
        <Stat label={tr("Event attendance", "ಕಾರ್ಯಕ್ರಮ ಹಾಜರಾತಿ")} value={d.ev} hint={tr("Recorded check-ins", "ದಾಖಲಾದ ಹಾಜರಿ")} />
        {role !== "participant" && (role === "state" || role === "district" || role === "ac" || role === "local") && <Stat label={tr("Voter-related records", "ಮತದಾರ ಸಂಬಂಧಿತ ದಾಖಲೆ")} value={d.voters} hint={tr("Restricted · count only, not externally verified", "ನಿರ್ಬಂಧಿತ · ಸಂಖ್ಯೆ ಮಾತ್ರ, ಬಾಹ್ಯ ಪರಿಶೀಲನೆ ಇಲ್ಲ")} />}
        <Stat label={tr("Verified points awarded", "ದೃಢೀಕೃತ ಅಂಕ")} value={d.points} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title={tr("Programme funnel", "ಕಾರ್ಯಕ್ರಮ ಫನಲ್")} layout="horizontal" summary={tr(`From ${d.apps.length} applications to ${d.field} participants with field activity.`, `${d.apps.length} ಅರ್ಜಿಗಳಿಂದ ${d.field} ಕ್ಷೇತ್ರ ಚಟುವಟಿಕೆ ಭಾಗವಹಿಸುವವರು.`)} keys={[tr("People", "ಜನರು")]} rows={[{ stage: tr("Applied", "ಅರ್ಜಿ"), [tr("People", "ಜನರು")]: d.apps.length }, { stage: tr("Approved", "ಅನುಮೋದಿತ"), [tr("People", "ಜನರು")]: d.approved }, { stage: tr("Classroom done", "ತರಗತಿ ಪೂರ್ಣ"), [tr("People", "ಜನರು")]: d.done }, { stage: tr("LMS done", "LMS ಪೂರ್ಣ"), [tr("People", "ಜನರು")]: d.lmsDone }, { stage: tr("Field active", "ಕ್ಷೇತ್ರ ಸಕ್ರಿಯ"), [tr("People", "ಜನರು")]: d.field }]} />
        <ChartCard title={tr("Training capacity by class", "ತರಗತಿವಾರು ಸಾಮರ್ಥ್ಯ")} summary={tr("Filled seats vs configured capacity for each class.", "ಪ್ರತಿ ತರಗತಿಯ ಭರ್ತಿ ಆಸನ ಮತ್ತು ಸಂರಚಿತ ಸಾಮರ್ಥ್ಯ.")} keys={[tr("Filled", "ಭರ್ತಿ"), tr("Capacity", "ಸಾಮರ್ಥ್ಯ")]} rows={d.cls.map((c: any) => ({ class: c.id.replace("CL-", ""), [tr("Filled", "ಭರ್ತಿ")]: c.roster.length, [tr("Capacity", "ಸಾಮರ್ಥ್ಯ")]: c.capacity }))} />
        <ChartCard title={tr("Grievances by status", "ಸ್ಥಿತಿವಾರು ದೂರುಗಳು")} layout="horizontal" summary={tr("Counts of cases in each status (mock records).", "ಪ್ರತಿ ಸ್ಥಿತಿಯ ಪ್ರಕರಣ ಸಂಖ್ಯೆ (ಮಾಕ್).")} keys={[tr("Cases", "ಪ್ರಕರಣ")]} rows={["Open", "In Progress", "Follow-up Due", "Escalated", "Closure Pending", "Closed", "Reopened"].map((s) => ({ status: s, [tr("Cases", "ಪ್ರಕರಣ")]: d.gs.filter((g: any) => g.status === s).length }))} />
        <ChartCard kind="line" title={tr("Applications per month", "ತಿಂಗಳವಾರು ಅರ್ಜಿಗಳು")} summary={tr("Demo trend by month received.", "ಸ್ವೀಕರಿಸಿದ ತಿಂಗಳ ಡೆಮೊ ಪ್ರವೃತ್ತಿ.")} keys={[tr("Applications", "ಅರ್ಜಿಗಳು")]} rows={["Jun", "Jul", "Aug", "Sep", "Oct"].map((m, i) => ({ month: m, [tr("Applications", "ಅರ್ಜಿಗಳು")]: [0, d.apps.length, Math.round(d.apps.length * 0.4), Math.round(d.apps.length * 0.2), 1][i] }))} />
      </div>
      <Card><h2 className="font-bold">{tr("Geography comparison (ranked, per participant)", "ಭೌಗೋಳಿಕ ಹೋಲಿಕೆ (ಪ್ರತಿ ಭಾಗವಹಿಸುವವರಿಗೆ)")}</h2><p className="text-xs text-muted">{tr("Average verified points per participant, so population size does not decide the rank. No map data in this demo.", "ಪ್ರತಿ ಭಾಗವಹಿಸುವವರ ಸರಾಸರಿ ದೃಢೀಕೃತ ಅಂಕ; ಜನಸಂಖ್ಯೆ ರ‍್ಯಾಂಕ್ ನಿರ್ಧರಿಸುವುದಿಲ್ಲ. ಈ ಡೆಮೊದಲ್ಲಿ ನಕ್ಷೆ ಇಲ್ಲ.")}</p>
        <ol className="mt-2 text-sm">{Object.entries((d.ps as any[]).reduce((a: Record<string, number[]>, p: any) => { (a[p.district] ??= []).push(p.points); return a; }, {})).map(([k, v]: [string, number[]]) => [k, Math.round(v.reduce((a, b) => a + b, 0) / v.length), v.length] as [string, number, number]).sort((a, b) => b[1] - a[1]).map(([k, avg, n]) => <li key={k} className="flex justify-between border-b border-border py-1"><span>{k} ({n})</span><b>{avg}</b></li>)}</ol></Card></>)}</QState></div>);
}
