"use client";
import { useState } from "react";
import { Button, Card, PageHeader, QState, Table, Tabs, Td } from "@/components/ui";
import { useCan } from "@/lib/useCan";
import { downloadText, toCsv } from "@/lib/csv";
import { isComplete } from "@/lib/trainingRules";
import { ChartCard } from "@/components/charts";
import { api, useAct, useMock } from "@/lib/api";
import { getDb, inScope } from "@/lib/db";
import { usePrefs } from "@/lib/store";
import { GRIEVANCE_CATEGORIES } from "@/lib/seed-geo";
import { today } from "@/lib/derive";
import { useT } from "@/lib/useT";

export default function Reports() {
  const { tr, lang } = useT(); const act = useAct(); const role = usePrefs((s) => s.role); const { can } = useCan(); const [tab, setTab] = useState<"apps" | "training" | "lms" | "gr" | "events">("apps");
  const q = useMock(["reports"], () => { const d = getDb(); return { ps: d.participants.filter((p) => inScope(role, p)), apps: d.applications.filter((a) => inScope(role, a)), gs: d.grievances.filter((g) => inScope(role, g)), classes: d.classes, events: d.events, courses: d.courses, progress: d.progress }; });
  const csv = (n: string) => {
    const d = q.data; if (!d) return;
    const tables: Record<string, [string[], (string | number)[][]]> = {
      apps: [["status", "count"], ["Submitted", "Under Review", "Shortlisted", "Approved", "Not Selected"].map((x) => [x, d.apps.filter((a) => a.status === x).length])],
      training: [["session", "start", "registered", "capacity", "status"], d.classes.map((c) => [c.name, c.startDate, c.roster.length, c.capacity, c.status])],
      lms: [["course", "lessons_completed", "lessons_total"], d.courses.map((c) => [c.id, c.lessons.filter((l) => d.progress[l.id]?.done).length, c.lessons.length])],
      gr: [["id", "category", "status", "district", "created"], d.gs.map((g) => [g.id, g.category, g.status, g.district, g.createdAt])],
      events: [["id", "date", "status", "registered", "attended"], d.events.map((e) => [e.id, e.date, e.status, e.registered.length, e.attended.length])],
    };
    const [head, rows] = tables[n]; downloadText(`report-${n}.csv`, toCsv(head, rows));
    act(() => api.report.exportCsv(n), tr("CSV downloaded and logged", "CSV ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ, ದಾಖಲಿಸಲಾಗಿದೆ"));
  };
  return (<div className="space-y-4"><PageHeader title={tr("Reports & Analytics", "ವರದಿಗಳು ಮತ್ತು ವಿಶ್ಲೇಷಣೆ")} sub={tr("Based on demo records. Counts do not imply official resolution. Every chart has a table view.", "ಡೆಮೊ ದಾಖಲೆ ಆಧಾರಿತ. ಸಂಖ್ಯೆಗಳು ಅಧಿಕೃತ ಪರಿಹಾರ ಸೂಚಿಸುವುದಿಲ್ಲ. ಪ್ರತಿ ಚಾರ್ಟ್‌ಗೂ ಕೋಷ್ಟಕ ನೋಟವಿದೆ.")} actions={can("reports", "export") && <Button variant="secondary" onClick={() => csv(tab)}>{tr("Download CSV", "CSV ಡೌನ್‌ಲೋಡ್")}</Button>} />
    <Tabs tabs={[{ id: "apps", label: tr("Applications", "ಅರ್ಜಿ") }, { id: "training", label: tr("Training", "ತರಬೇತಿ") }, { id: "lms", label: "LMS" }, { id: "gr", label: tr("Grievances", "ದೂರು") }, { id: "events", label: tr("Events", "ಕಾರ್ಯಕ್ರಮ") }]} value={tab} onChange={setTab} />
    <QState q={q}>{(d) => { const n = tr("Count", "ಸಂಖ್ಯೆ");
      if (tab === "apps") { const s = ["Submitted", "Under Review", "Shortlisted", "Approved", "Not Selected"]; return <ChartCard title={tr("Applications by status", "ಸ್ಥಿತಿವಾರು ಅರ್ಜಿ")} layout="horizontal" summary={tr(`Denominator: ${d.apps.length} applications in your scope.`, `ಛೇದ: ನಿಮ್ಮ ವ್ಯಾಪ್ತಿಯ ${d.apps.length} ಅರ್ಜಿಗಳು.`)} keys={[n]} rows={s.map((x) => ({ status: x, [n]: d.apps.filter((a) => a.status === x).length }))} />; }
      if (tab === "training") {
        const doneP = (c: (typeof d.classes)[number], p: string) => isComplete(c, p);
        const sessions = d.classes.filter((c) => c.status !== "Cancelled").map((c) => { const done = c.roster.filter((p) => doneP(c, p)).length; return { c, reg: c.roster.length, att: c.roster.filter((p) => (c.attendance[p] ?? []).some((x) => x === "Present" || x === "Late")).length, done, pend: c.roster.length - done, cert: (c.certified ?? []).length }; });
        const group = (key: "district" | "taluk") => Object.entries(d.ps.reduce<Record<string, { reg: number; trained: number }>>((a, p) => { const k = p[key]; const cur = (a[k] ??= { reg: 0, trained: 0 }); cur.reg++; if (p.trainingDone) cur.trained++; return a; }, {})).map(([k, v]) => ({ k, ...v, pend: v.reg - v.trained })).sort((a, b) => b.reg - a.reg);
        const dist = group("district"); const block = group("taluk");
        const dl = (name: string, head: string[], rows: (string | number)[][]) => { downloadText(`${name}.csv`, toCsv(head, rows)); act(() => api.report.exportCsv(name), tr("CSV downloaded and logged", "CSV ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ, ದಾಖಲಿಸಲಾಗಿದೆ")); };
        const exp = (name: string, head: string[], rows: (string | number)[][]) => can("reports", "export") && <Button size="sm" variant="secondary" onClick={() => dl(name, head, rows)}>{tr("Download CSV", "CSV ಡೌನ್‌ಲೋಡ್")}</Button>;
        return (<div className="space-y-5">
          <ChartCard title={tr("Attendance by class (Day 1 / Day 2 present or late)", "ತರಗತಿವಾರು ಹಾಜರಾತಿ")} summary={tr("Denominator: participants rostered in each class.", "ಛೇದ: ಪ್ರತಿ ತರಗತಿಯ ರೋಸ್ಟರ್ ಸದಸ್ಯರು.")} keys={["Day 1", "Day 2"]} rows={d.classes.filter((c) => c.roster.length).map((c) => ({ class: c.id.replace("CL-", ""), "Day 1": c.roster.filter((p) => ["Present", "Late"].includes(c.attendance[p][0])).length, "Day 2": c.roster.filter((p) => ["Present", "Late"].includes(c.attendance[p][1])).length }))} />
          <section className="space-y-2"><div className="flex items-center justify-between"><h2 className="font-bold">{tr("Session-wise report", "ಅವಧಿವಾರು ವರದಿ")}</h2>{exp("training-session-wise", ["session", "start", "registered", "attended", "completed", "pending", "certified", "capacity"], sessions.map((x) => [x.c.name, x.c.startDate, x.reg, x.att, x.done, x.pend, x.cert, x.c.capacity]))}</div>
            <Table head={[tr("Session", "ಅವಧಿ"), tr("Start", "ಆರಂಭ"), tr("Registered", "ನೋಂದಾಯಿತ"), tr("Attended", "ಹಾಜರಾದ"), tr("Completed", "ಪೂರ್ಣ"), tr("Pending", "ಬಾಕಿ"), tr("Certified", "ಪ್ರಮಾಣಿತ"), tr("Capacity", "ಸಾಮರ್ಥ್ಯ")]}>{sessions.map((x) => <tr key={x.c.id}><Td>{x.c.name}</Td><Td>{x.c.startDate}</Td><Td>{x.reg}</Td><Td>{x.att}</Td><Td>{x.done}</Td><Td>{x.pend}</Td><Td>{x.cert}</Td><Td>{x.reg}/{x.c.capacity}</Td></tr>)}</Table></section>
          {([[tr("District-wise report", "ಜಿಲ್ಲಾವಾರು ವರದಿ"), "training-district-wise", tr("District", "ಜಿಲ್ಲೆ"), dist], [tr("Block-wise report", "ಬ್ಲಾಕ್‌ವಾರು ವರದಿ"), "training-block-wise", tr("Block / taluk", "ಬ್ಲಾಕ್ / ತಾಲ್ಲೂಕು"), block]] as const).map(([title, file, col, rows]) => (
            <section key={file} className="space-y-2"><div className="flex items-center justify-between"><h2 className="font-bold">{title}</h2>{exp(file, [col, "volunteers", "trained", "pending", "trained_pct"], rows.map((r) => [r.k, r.reg, r.trained, r.pend, r.reg ? Math.round((r.trained / r.reg) * 100) : 0]))}</div>
              <Table head={[col, tr("Volunteers", "ಸ್ವಯಂಸೇವಕರು"), tr("Trained", "ತರಬೇತಿ ಪಡೆದ"), tr("Pending", "ಬಾಕಿ"), tr("Trained %", "ತರಬೇತಿ %")]}>{rows.map((r) => <tr key={r.k}><Td>{r.k}</Td><Td>{r.reg}</Td><Td>{r.trained}</Td><Td>{r.pend}</Td><Td>{r.reg ? Math.round((r.trained / r.reg) * 100) : 0}%</Td></tr>)}</Table></section>))}
          <p className="text-xs text-muted">{tr("Trained % = volunteers who attended both days ÷ volunteers registered in that area.", "ತರಬೇತಿ % = ಎರಡೂ ದಿನ ಹಾಜರಾದ ಸ್ವಯಂಸೇವಕರು ÷ ಆ ಪ್ರದೇಶದಲ್ಲಿ ನೋಂದಾಯಿತ ಸ್ವಯಂಸೇವಕರು.")}</p></div>); }
      if (tab === "lms") return <ChartCard title={tr("Lessons completed per course", "ಕೋರ್ಸ್‌ವಾರು ಪೂರ್ಣ ಪಾಠ")} summary={tr("Demo learner data; MCQ pass rate uses attempts recorded.", "ಡೆಮೊ ಡೇಟಾ; MCQ ಉತ್ತೀರ್ಣ ದಾಖಲಾದ ಪ್ರಯತ್ನ ಆಧಾರಿತ.")} keys={[n]} rows={d.courses.map((c) => ({ course: c.id, [n]: c.lessons.filter((l) => d.progress[l.id]?.done).length }))} />;
      if (tab === "gr") { const open = d.gs.filter((g) => g.status !== "Closed"); return (<div className="grid gap-4 lg:grid-cols-2"><ChartCard title={tr("Cases by category", "ವರ್ಗವಾರು ಪ್ರಕರಣ")} layout="horizontal" summary={tr(`${d.gs.length} cases. Overdue: ${open.filter((g) => g.followUpDate < today).length} of ${open.length} open (${open.length ? Math.round((open.filter((g) => g.followUpDate < today).length / open.length) * 100) : 0}%). Reopened: ${d.gs.filter((g) => g.status === "Reopened").length}.`, `${d.gs.length} ಪ್ರಕರಣ. ವಿಳಂಬ: ${open.length} ಬಾಕಿಯಲ್ಲಿ ${open.filter((g) => g.followUpDate < today).length}. ಮರುತೆರೆದ: ${d.gs.filter((g) => g.status === "Reopened").length}.`)} keys={[n]} rows={GRIEVANCE_CATEGORIES.map((c) => ({ category: c[lang], [n]: d.gs.filter((g) => g.category === c.id).length })).filter((r) => (r[n] as number) > 0)} />
        <ChartCard kind="line" title={tr("Created vs closed (cumulative by month)", "ರಚಿತ vs ಮುಚ್ಚಿದ (ತಿಂಗಳವಾರು)")} summary={tr("Closed means a confirmed closure in mock records, not an official resolution.", "ಮುಚ್ಚಿದ ಎಂದರೆ ಮಾಕ್ ದಾಖಲೆಯಲ್ಲಿ ದೃಢೀಕೃತ ಮುಚ್ಚುವಿಕೆ; ಅಧಿಕೃತ ಪರಿಹಾರವಲ್ಲ.")} keys={[tr("Created", "ರಚಿತ"), tr("Closed", "ಮುಚ್ಚಿದ")]} rows={["07", "08", "09", "10"].map((m) => ({ month: m, [tr("Created", "ರಚಿತ")]: d.gs.filter((g) => g.createdAt.slice(5, 7) <= m).length, [tr("Closed", "ಮುಚ್ಚಿದ")]: d.gs.filter((g) => g.status === "Closed" && g.createdAt.slice(5, 7) <= m).length }))} /></div>); }
      return <ChartCard title={tr("Event registrations vs attendance", "ಕಾರ್ಯಕ್ರಮ ನೋಂದಣಿ vs ಹಾಜರಾತಿ")} summary={tr("Attendance only counts when recorded by a coordinator.", "ಸಂಯೋಜಕರು ದಾಖಲಿಸಿದಾಗ ಮಾತ್ರ ಹಾಜರಾತಿ ಎಣಿಕೆ.")} keys={[tr("Registered", "ನೋಂದಣಿ"), tr("Attended", "ಹಾಜರು")]} rows={d.events.filter((e) => e.status !== "Draft").map((e) => ({ event: e.id, [tr("Registered", "ನೋಂದಣಿ")]: e.registered.length, [tr("Attended", "ಹಾಜರು")]: e.attended.length }))} />; }}</QState>
    <Card className="text-xs text-muted">{tr("Metric definitions: conversion = approved ÷ received; closure rate = closed ÷ all cases; overdue rate = open cases past follow-up date ÷ open cases.", "ಮಾಪನ ವ್ಯಾಖ್ಯಾನ: ಪರಿವರ್ತನೆ = ಅನುಮೋದಿತ ÷ ಸ್ವೀಕೃತ; ಮುಚ್ಚುವ ದರ = ಮುಚ್ಚಿದ ÷ ಎಲ್ಲಾ ಪ್ರಕರಣ; ವಿಳಂಬ ದರ = ಅನುಸರಣೆ ದಿನಾಂಕ ಮೀರಿದ ಬಾಕಿ ÷ ಬಾಕಿ ಪ್ರಕರಣ.")}</Card></div>);
}
