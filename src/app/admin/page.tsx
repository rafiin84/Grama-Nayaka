"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CheckCircle, ClipboardText, Clock, DownloadSimple, FunnelSimple, MapPinLine, UsersThree, Warning } from "@phosphor-icons/react";
import { Badge, Button, Card, Empty, Field, Input, Modal, PageHeader, QState, Select } from "@/components/ui";
import { ChartCard } from "@/components/charts";
import { useMock } from "@/lib/api";
import { getDb } from "@/lib/db";
import { adminStats, emptyFilters, type DashFilters } from "@/lib/adminStats";
import { downloadText, toCsv } from "@/lib/csv";
import { districts, gpOptions, talukOptions } from "@/lib/geo";
import { today } from "@/lib/derive";
import { usePrefs } from "@/lib/store";
import { useT } from "@/lib/useT";
import { cn } from "@/lib/utils";

const daysAgo = (n: number) => new Date(new Date(today).getTime() - n * 86400000).toISOString().slice(0, 10);

export default function Overview() {
  const { tr } = useT(); const role = usePrefs((s) => s.role); const router = useRouter(); const [f, setF] = useState<DashFilters>(emptyFilters); const [fo, setFo] = useState(false);
  const q = useMock(["dash", JSON.stringify(f)], () => { const d = getDb(); return { s: adminStats(d, role, f), villages: d.villages, statuses: ["Open", "In Progress", "Follow-up Due", "Escalated", "Closure Pending", "Closed", "Reopened"] }; });
  if (role === "trainer") { if (typeof window !== "undefined") router.replace("/admin/training"); return null; }
  const set = (p: Partial<DashFilters>) => setF({ ...f, ...p });
  const active = Object.entries(f).some(([, v]) => v);

  return (
    <div className="space-y-5">
      <PageHeader title={tr("Admin dashboard", "ಅಡ್ಮಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್")} sub={tr("Every figure is counted from the app's records, inside your role's scope and the filters below. This prototype holds demo data.", "ಪ್ರತಿ ಅಂಕಿಯನ್ನೂ ಆ್ಯಪ್ ದಾಖಲೆಗಳಿಂದ, ನಿಮ್ಮ ಪಾತ್ರದ ವ್ಯಾಪ್ತಿ ಮತ್ತು ಕೆಳಗಿನ ಫಿಲ್ಟರ್‌ಗಳೊಳಗೆ ಎಣಿಸಲಾಗಿದೆ. ಈ ಮಾದರಿ ಡೆಮೊ ಡೇಟಾ ಹೊಂದಿದೆ.")}
        actions={<div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => setFo(true)}><FunnelSimple />{tr("Filters", "ಫಿಲ್ಟರ್")}{active && <span className="ml-1 h-2 w-2 rounded-full bg-saffron" aria-label={tr("Filters applied", "ಫಿಲ್ಟರ್ ಅನ್ವಯಿಸಲಾಗಿದೆ")} />}</Button><Button variant="secondary" disabled={!q.data} onClick={() => { const s = q.data!.s; downloadText("dashboard-report.csv", toCsv(["metric", "value"], [["Volunteers registered", s.registered], ["Volunteers trained", s.trained], ["Volunteers pending training", s.pendingTraining], ["Training sessions", s.sessionsTotal], ["Sessions conducted", s.sessionsConducted], ["Villages enrolled", s.villagesEnrolled], ["Villages pending enrollment", s.villagesPending], ["Districts", s.districts], ["Blocks / taluks", s.blocks], ["Gram Panchayats", s.gps], ["Grievances submitted", s.grievances.submitted], ["Grievances pending action", s.grievances.pendingAction], ["Grievances awaiting official response", s.grievances.awaitingResponse], ["Grievances closed", s.grievances.closed], ["Learning resources", s.resources], ["Active users", s.activeUsers], ["Inactive users", s.inactiveUsers]])); }}><DownloadSimple />{tr("Download report", "ವರದಿ ಡೌನ್‌ಲೋಡ್")}</Button></div>} />

      {/* Filters */}
      <Modal open={fo} onClose={() => setFo(false)} title={tr("Filters", "ಫಿಲ್ಟರ್")} footer={<><Button variant="secondary" onClick={() => setF(emptyFilters)}>{tr("Clear all", "ಎಲ್ಲಾ ತೆರವು")}</Button><Button onClick={() => setFo(false)}>{tr("Done", "ಮುಗಿದಿದೆ")}</Button></>}><div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold text-muted">{tr("Quick range", "ತ್ವರಿತ ಅವಧಿ")}</span>
          <div className="flex flex-wrap items-center gap-2 text-sm">{[[tr("Last 30 days", "ಕಳೆದ 30 ದಿನ"), daysAgo(30)], [tr("Last 90 days", "ಕಳೆದ 90 ದಿನ"), daysAgo(90)]].map(([l, from]) => <button key={l} onClick={() => set({ from, to: today })} className={cn("rounded-full border px-3 py-1", f.from === from ? "border-transparent bg-primary text-primary-fg" : "border-border bg-card")}>{l}</button>)}<button onClick={() => set({ from: "", to: "" })} className={cn("rounded-full border px-3 py-1", !f.from && !f.to ? "border-transparent bg-primary text-primary-fg" : "border-border bg-card")}>{tr("All time", "ಎಲ್ಲಾ ಕಾಲ")}</button>{active && <Button size="sm" variant="ghost" onClick={() => setF(emptyFilters)}>{tr("Reset", "ಮರುಹೊಂದಿಸಿ")}</Button>}</div></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={tr("District", "ಜಿಲ್ಲೆ")}>{(i) => <Select id={i} value={f.district} onChange={(e) => set({ district: e.target.value, taluk: "", gp: "", village: "" })}><option value="">{tr("All in scope", "ವ್ಯಾಪ್ತಿಯ ಎಲ್ಲಾ")}</option>{districts.map((x) => <option key={x}>{x}</option>)}</Select>}</Field>
          <Field label={tr("Block / taluk", "ಬ್ಲಾಕ್ / ತಾಲ್ಲೂಕು")}>{(i) => <Select id={i} value={f.taluk} onChange={(e) => set({ taluk: e.target.value, gp: "", village: "" })}><option value="">{tr("All", "ಎಲ್ಲಾ")}</option>{talukOptions(f.district).map((x) => <option key={x}>{x}</option>)}</Select>}</Field>
          <Field label="Gram Panchayat">{(i) => <Select id={i} value={f.gp} onChange={(e) => set({ gp: e.target.value, village: "" })}><option value="">{tr("All", "ಎಲ್ಲಾ")}</option>{gpOptions(f.taluk).map((x) => <option key={x}>{x}</option>)}</Select>}</Field>
          <Field label={tr("Village", "ಗ್ರಾಮ")}>{(i) => <Select id={i} value={f.village} onChange={(e) => set({ village: e.target.value })}><option value="">{tr("All", "ಎಲ್ಲಾ")}</option>{(q.data?.villages ?? []).filter((v) => (!f.district || v.district === f.district) && (!f.taluk || v.taluk === f.taluk) && (!f.gp || v.gp === f.gp)).map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</Select>}</Field>
          <Field label={tr("From", "ಇಂದ")}>{(i) => <Input id={i} type="date" value={f.from} max={f.to || undefined} onChange={(e) => set({ from: e.target.value })} />}</Field>
          <Field label={tr("To", "ವರೆಗೆ")}>{(i) => <Input id={i} type="date" value={f.to} min={f.from || undefined} onChange={(e) => set({ to: e.target.value })} />}</Field>
          <Field label={tr("Training status", "ತರಬೇತಿ ಸ್ಥಿತಿ")}>{(i) => <Select id={i} value={f.training} onChange={(e) => set({ training: e.target.value as DashFilters["training"] })}><option value="">{tr("Any", "ಯಾವುದೇ")}</option><option value="trained">{tr("Trained", "ತರಬೇತಿ ಪೂರ್ಣ")}</option><option value="pending">{tr("Pending training", "ತರಬೇತಿ ಬಾಕಿ")}</option></Select>}</Field>
          <Field label={tr("Grievance status", "ದೂರು ಸ್ಥಿತಿ")}>{(i) => <Select id={i} value={f.gStatus} onChange={(e) => set({ gStatus: e.target.value })}><option value="">{tr("Any", "ಯಾವುದೇ")}</option>{(q.data?.statuses ?? []).map((x) => <option key={x}>{x}</option>)}</Select>}</Field>
        </div>
      </div></Modal>

      <QState q={q}>{({ s }) => (<>
        {/* Attention */}
        <section aria-labelledby="attn">
          <div className="mb-3 flex items-center justify-between"><h2 id="attn" className="text-lg font-bold">{tr("Needs attention", "ಗಮನ ಬೇಕು")}</h2>{(() => { const n = s.approvals.applications + s.overdueCount + s.approvals.villages + s.pendingTraining; return n === 0 ? <span className="inline-flex items-center gap-1 text-sm font-medium text-success"><CheckCircle size={18} weight="fill" />{tr("All clear", "ಎಲ್ಲವೂ ಸರಿಯಾಗಿದೆ")}</span> : <span className="text-sm text-muted">{tr(`${n} items to review`, `${n} ಅಂಶಗಳು ಪರಿಶೀಲನೆಗೆ`)}</span>; })()}</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {([[ClipboardText, s.approvals.applications, tr("Application awaiting review", "ಅರ್ಜಿ ಪರಿಶೀಲನೆಗೆ ಬಾಕಿ"), tr("Applications awaiting review", "ಅರ್ಜಿಗಳು ಪರಿಶೀಲನೆಗೆ ಬಾಕಿ"), "/admin/applications"], [Clock, s.overdueCount, tr("Grievance with overdue follow-up", "ವಿಳಂಬ ಅನುಸರಣೆಯ ದೂರು"), tr("Grievances with overdue follow-up", "ವಿಳಂಬ ಅನುಸರಣೆಯ ದೂರುಗಳು"), "/admin/grievances"], [MapPinLine, s.approvals.villages, tr("Village pending enrollment", "ನೋಂದಣಿ ಬಾಕಿ ಗ್ರಾಮ"), tr("Villages pending enrollment", "ನೋಂದಣಿ ಬಾಕಿ ಗ್ರಾಮಗಳು"), "/admin/villages"], [UsersThree, s.pendingTraining, tr("Volunteer pending training", "ತರಬೇತಿ ಬಾಕಿ ಸ್ವಯಂಸೇವಕ"), tr("Volunteers pending training", "ತರಬೇತಿ ಬಾಕಿ ಸ್ವಯಂಸೇವಕರು"), "/admin/users"]] as const).map(([Icon, n, one, many, href]) => (
              <Link key={href} href={href} className={cn("group flex items-center gap-4 rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md", n > 0 ? "border-transparent bg-gradient-to-br from-forest to-deep text-white shadow-sm" : "border-primary/25 bg-accent-soft")}>
                <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-2xl", n > 0 ? "bg-white/15 text-white" : "bg-primary/15 text-primary")}>{n === 0 ? <CheckCircle size={26} weight="fill" /> : <Icon size={26} weight="duotone" />}</span>
                <span className="min-w-0 flex-1"><span className={cn("block text-3xl font-bold leading-none", n === 0 && "text-primary")}>{n}</span><span className={cn("mt-1 block text-sm", n > 0 ? "text-white/80" : "text-muted")}>{n === 1 ? one : many}</span></span>
                <ArrowRight className={cn("shrink-0 transition group-hover:translate-x-1", n > 0 ? "text-white/80" : "text-muted group-hover:text-primary")} />
              </Link>))}
          </div>
        </section>

        {/* Stats: every KPI card in one scrolling row */}
        <section aria-labelledby="stats"><h2 id="stats" className="mb-2 text-lg font-bold">{tr("Stats", "ಅಂಕಿಅಂಶ")}</h2><div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-3">{([
          [tr("Volunteers & training", "ಸ್ವಯಂಸೇವಕರು ಮತ್ತು ತರಬೇತಿ"), [[tr("Volunteers registered", "ನೋಂದಾಯಿತ ಸ್ವಯಂಸೇವಕರು"), s.registered, tr("Volunteer accounts in scope (not deleted)", "ವ್ಯಾಪ್ತಿಯ ಸ್ವಯಂಸೇವಕ ಖಾತೆಗಳು (ಅಳಿಸದ)")], [tr("Volunteers trained", "ತರಬೇತಿ ಪಡೆದವರು"), s.trained, tr("Attended both training days", "ಎರಡೂ ದಿನ ಹಾಜರಾದವರು")], [tr("Pending training", "ತರಬೇತಿ ಬಾಕಿ"), s.pendingTraining, tr("Registered minus trained", "ನೋಂದಾಯಿತ ಮೈನಸ್ ತರಬೇತಿ ಪಡೆದವರು")], [tr("Training sessions", "ತರಬೇತಿ ಅವಧಿಗಳು"), s.sessionsTotal, tr(`${s.sessionsConducted} conducted (all rostered attendance recorded)`, `${s.sessionsConducted} ನಡೆದಿವೆ (ಎಲ್ಲರ ಹಾಜರಾತಿ ದಾಖಲು)`)]]],
          [tr("Villages & geography", "ಗ್ರಾಮಗಳು ಮತ್ತು ಭೌಗೋಳಿಕತೆ"), [[tr("Villages enrolled", "ನೋಂದಾಯಿತ ಗ್ರಾಮಗಳು"), s.villagesEnrolled, tr(`of ${s.villagesTotal} on record`, `ದಾಖಲಾದ ${s.villagesTotal} ರಲ್ಲಿ`)], [tr("Pending enrollment", "ನೋಂದಣಿ ಬಾಕಿ"), s.villagesPending, tr("Villages with status Pending", "ಸ್ಥಿತಿ 'ಬಾಕಿ' ಇರುವ ಗ್ರಾಮಗಳು")], [tr("Districts / blocks", "ಜಿಲ್ಲೆಗಳು / ಬ್ಲಾಕ್‌ಗಳು"), `${s.districts} / ${s.blocks}`, tr("From master data, in scope", "ಮಾಸ್ಟರ್ ಡೇಟಾ, ವ್ಯಾಪ್ತಿಯೊಳಗೆ")], [tr("Gram Panchayats", "ಗ್ರಾಮ ಪಂಚಾಯತ್‌ಗಳು"), s.gps, tr("From master data, in scope", "ಮಾಸ್ಟರ್ ಡೇಟಾ, ವ್ಯಾಪ್ತಿಯೊಳಗೆ")]]],
          [tr("Grievances", "ದೂರುಗಳು"), [[tr("Submitted", "ಸಲ್ಲಿಸಿದ"), s.grievances.submitted, tr("All cases in scope and filters", "ವ್ಯಾಪ್ತಿ ಮತ್ತು ಫಿಲ್ಟರ್‌ನ ಎಲ್ಲಾ ಪ್ರಕರಣ")], [tr("Pending action", "ಕ್ರಮ ಬಾಕಿ"), s.grievances.pendingAction, tr("Open, In Progress or Reopened", "ತೆರೆದ, ಪ್ರಗತಿಯಲ್ಲಿರುವ ಅಥವಾ ಮರುತೆರೆದ")], [tr("Awaiting official response", "ಅಧಿಕೃತ ಉತ್ತರಕ್ಕೆ ಕಾಯುತ್ತಿದೆ"), s.grievances.awaitingResponse, tr("Follow-up due or Escalated", "ಅನುಸರಣೆ ಬಾಕಿ ಅಥವಾ ಹೆಚ್ಚಿನ ಹಂತ")], [tr("Resolved & closed", "ಪರಿಹರಿಸಿ ಮುಚ್ಚಿದ"), s.grievances.closed, tr(`+ ${s.grievances.closurePending} awaiting confirmation`, `+ ${s.grievances.closurePending} ದೃಢೀಕರಣಕ್ಕೆ ಬಾಕಿ`)]]],
          [tr("Learning & users", "ಕಲಿಕೆ ಮತ್ತು ಬಳಕೆದಾರರು"), [[tr("Learning resources", "ಕಲಿಕಾ ಸಂಪನ್ಮೂಲ"), s.resources, tr(`Published lessons in ${s.courses} courses`, `${s.courses} ಕೋರ್ಸ್‌ಗಳಲ್ಲಿ ಪ್ರಕಟಿತ ಪಾಠಗಳು`)], [tr("Active users", "ಸಕ್ರಿಯ ಬಳಕೆದಾರರು"), s.activeUsers, tr("Accounts with status Active", "ಸ್ಥಿತಿ ಸಕ್ರಿಯ ಇರುವ ಖಾತೆಗಳು")], [tr("Inactive users", "ನಿಷ್ಕ್ರಿಯ ಬಳಕೆದಾರರು"), s.inactiveUsers, tr("Inactive or suspended", "ನಿಷ್ಕ್ರಿಯ ಅಥವಾ ತಡೆ")], [tr("Applications", "ಅರ್ಜಿಗಳು"), s.applications, tr(`${s.approved} approved`, `${s.approved} ಅನುಮೋದಿತ`)]]],
        ] as [string, [string, string | number, string][]][]).flatMap(([, items]) => items).map(([l, v, h]) => <Card key={l} className="w-60 shrink-0 p-4 md:p-4" title={h}><p className="text-sm text-muted">{l}</p><p className="mt-1 text-3xl font-bold">{v}</p><p className="mt-1 text-xs text-muted">{h}</p></Card>)}</div></section>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard kind="line" title={tr("Volunteers registered per month", "ತಿಂಗಳವಾರು ನೋಂದಾಯಿತ ಸ್ವಯಂಸೇವಕರು")} summary={tr("Accounts by month created, within your filters.", "ರಚಿಸಿದ ತಿಂಗಳ ಪ್ರಕಾರ ಖಾತೆಗಳು, ನಿಮ್ಮ ಫಿಲ್ಟರ್‌ಗಳೊಳಗೆ.")} keys={[tr("Volunteers", "ಸ್ವಯಂಸೇವಕರು")]} rows={s.trendVolunteers.map((r) => ({ month: r.month, [tr("Volunteers", "ಸ್ವಯಂಸೇವಕರು")]: r.count }))} />
          <ChartCard kind="line" title={tr("Grievances created vs closed", "ದೂರುಗಳು: ರಚಿತ vs ಮುಚ್ಚಿದ")} summary={tr("By month. Closed means a confirmed closure in the app's records.", "ತಿಂಗಳವಾರು. ಮುಚ್ಚಿದ ಎಂದರೆ ಆ್ಯಪ್ ದಾಖಲೆಯಲ್ಲಿ ದೃಢೀಕೃತ ಮುಚ್ಚುವಿಕೆ.")} keys={[tr("Created", "ರಚಿತ"), tr("Closed", "ಮುಚ್ಚಿದ")]} rows={s.trendGrievances.map((r) => ({ month: r.month, [tr("Created", "ರಚಿತ")]: r.created, [tr("Closed", "ಮುಚ್ಚಿದ")]: r.closed }))} />
          <ChartCard title={tr("Training status by district", "ಜಿಲ್ಲೆವಾರು ತರಬೇತಿ ಸ್ಥಿತಿ")} summary={tr("Trained and pending volunteers in each district.", "ಪ್ರತಿ ಜಿಲ್ಲೆಯ ತರಬೇತಿ ಪಡೆದ ಮತ್ತು ಬಾಕಿ ಸ್ವಯಂಸೇವಕರು.")} keys={[tr("Trained", "ತರಬೇತಿ ಪಡೆದ"), tr("Pending", "ಬಾಕಿ")]} rows={s.byDistrict.map((r) => ({ district: r.district, [tr("Trained", "ತರಬೇತಿ ಪಡೆದ")]: r.trained, [tr("Pending", "ಬಾಕಿ")]: r.pending }))} />
          <ChartCard title={tr("Grievances by status", "ಸ್ಥಿತಿವಾರು ದೂರುಗಳು")} layout="horizontal" summary={tr("Number of cases in each status.", "ಪ್ರತಿ ಸ್ಥಿತಿಯ ಪ್ರಕರಣಗಳು.")} keys={[tr("Cases", "ಪ್ರಕರಣ")]} rows={s.grievanceStatus.map((r) => ({ status: r.status, [tr("Cases", "ಪ್ರಕರಣ")]: r.count }))} />
        </div>

        {/* Activity, approvals, alerts */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card><h2 className="font-bold">{tr("Pending approvals", "ಬಾಕಿ ಅನುಮೋದನೆಗಳು")}</h2><ul className="mt-3 space-y-2 text-sm">{([[tr("Applications to review", "ಪರಿಶೀಲಿಸಬೇಕಾದ ಅರ್ಜಿಗಳು"), s.approvals.applications, "/admin/applications"], [tr("Points to validate", "ದೃಢೀಕರಿಸಬೇಕಾದ ಅಂಕಗಳು"), s.approvals.points, "/admin/rewards"], [tr("Redemptions to approve", "ಅನುಮೋದಿಸಬೇಕಾದ ರಿಡೆಂಪ್ಶನ್"), s.approvals.redemptions, "/admin/rewards"], [tr("Villages to enroll", "ನೋಂದಣಿಗೆ ಗ್ರಾಮಗಳು"), s.approvals.villages, "/admin/villages"]] as [string, number, string][]).map(([l, n, h]) => <li key={l}><Link href={h} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-accent-soft"><span>{l}</span><Badge tone={n > 0 ? "warning" : "success"}>{n}</Badge></Link></li>)}</ul></Card>
          <Card><h2 className="flex items-center gap-2 font-bold"><Warning size={18} className="text-warning" />{tr("Alerts", "ಎಚ್ಚರಿಕೆಗಳು")}</h2>{s.alerts.length === 0 ? <p className="mt-3 text-sm text-muted">{tr("No alerts right now.", "ಈಗ ಯಾವುದೇ ಎಚ್ಚರಿಕೆ ಇಲ್ಲ.")}</p> : <ul className="mt-3 space-y-2 text-sm">{s.alerts.map((a) => <li key={a.id}><Link href={a.href} className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-accent-soft"><span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", a.tone === "danger" ? "bg-danger" : "bg-warning")} />{a.text}</Link></li>)}</ul>}</Card>
          <Card><div className="flex items-center justify-between"><h2 className="font-bold">{tr("Recent activity", "ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ")}</h2><Link href="/admin/audit" className="text-xs text-primary underline">{tr("Audit log", "ಆಡಿಟ್ ಲಾಗ್")}</Link></div>{s.recent.length === 0 ? <Empty title={tr("No activity yet", "ಇನ್ನೂ ಚಟುವಟಿಕೆ ಇಲ್ಲ")} /> : <ul className="mt-3 space-y-2 text-sm">{s.recent.map((a) => <li key={a.id}><p className="font-medium">{a.action}</p><p className="text-xs text-muted">{a.at} · {a.actor} · {a.resourceId}</p></li>)}</ul>}</Card>
        </div></>)}</QState>
    </div>
  );
}
