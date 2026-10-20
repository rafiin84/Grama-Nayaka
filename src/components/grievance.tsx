"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Warning } from "@phosphor-icons/react";
import { Badge, Button, Card, Confirm, DemoNote, Empty, Field, Input, Modal, PageHeader, QState, Select, Stat, Table, Td, Textarea, statusTone } from "@/components/ui";
import { api, useAct, useMock } from "@/lib/api";
import { getDb, inScope, roleUsers } from "@/lib/db";
import { GRIEVANCE_CATEGORIES } from "@/lib/seed-geo";
import { usePrefs } from "@/lib/store";
import { useT } from "@/lib/useT";
import { today } from "@/lib/derive";
import { ME, participants } from "@/lib/seed";
import type { GStatus } from "@/lib/types";

const statuses: GStatus[] = ["Open", "In Progress", "Follow-up Due", "Escalated", "Closure Pending", "Closed", "Reopened"];
export const catLabel = (id: string, lang: "kn" | "en") => { const c = GRIEVANCE_CATEGORIES.find((x) => x.id === id); return c ? c[lang] : id; };
const overdue = (g: { followUpDate: string; status: GStatus }) => g.status !== "Closed" && g.followUpDate < today;

export function GrievanceList({ admin }: { admin?: boolean }) {
  const { tr, lang } = useT(); const role = usePrefs((s) => s.role); const base = admin ? "/admin/grievances" : "/app/grievances";
  const [f, setF] = useState({ status: "", cat: "", urg: "", q: "", mine: false }); const [view, setView] = useState<"cases" | "followups">("cases");
  const q = useMock(["grievances", admin], () => getDb().grievances.filter((g) => (admin ? inScope(role, g) : g.ownerId === ME)));
  return (
    <div className="space-y-4">
      <PageHeader title={tr("Grievances", "ದೂರುಗಳು")} sub={tr("Track community issues. A case is not 'resolved' because it was submitted or referred; closure needs an outcome and confirmation.", "ಸಮುದಾಯ ಸಮಸ್ಯೆಗಳನ್ನು ಗಮನಿಸಿ. ಸಲ್ಲಿಕೆ ಅಥವಾ ಉಲ್ಲೇಖದಿಂದ ಪರಿಹಾರವಾಗುವುದಿಲ್ಲ; ಮುಚ್ಚಲು ಫಲಿತಾಂಶ ಮತ್ತು ದೃಢೀಕರಣ ಬೇಕು.")} actions={!admin || role === "local" ? <Link href="/app/grievances/new"><Button><Plus />{tr("New issue", "ಹೊಸ ಸಮಸ್ಯೆ")}</Button></Link> : undefined} />
      <QState q={q} isEmpty={(d) => d.length === 0} empty={<Empty title={tr("No grievances yet", "ಇನ್ನೂ ದೂರುಗಳಿಲ್ಲ")} hint={tr("Log your first local issue to start tracking it.", "ಮೊದಲ ಸ್ಥಳೀಯ ಸಮಸ್ಯೆ ದಾಖಲಿಸಿ.")} action={<Link href="/app/grievances/new"><Button>{tr("Log an issue", "ಸಮಸ್ಯೆ ದಾಖಲಿಸಿ")}</Button></Link>} />}>{(all) => {
        const list = all.filter((g) => (!f.status || g.status === f.status) && (!f.cat || g.category === f.cat) && (!f.urg || g.urgency === f.urg) && (!f.q || (g.title + g.id + g.locality).toLowerCase().includes(f.q.toLowerCase())));
        const due = [...all].filter((g) => g.status !== "Closed").sort((a, b) => a.followUpDate.localeCompare(b.followUpDate));
        return (<>
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-6">{(["Open", "In Progress", "Follow-up Due", "Escalated", "Closed", "Reopened"] as GStatus[]).map((s) => <button key={s} onClick={() => setF({ ...f, status: f.status === s ? "" : s })} className="text-left"><Stat label={s} value={all.filter((g) => g.status === s).length} /></button>)}</div>
          <div className="flex gap-2"><Button size="sm" variant={view === "cases" ? "primary" : "secondary"} onClick={() => setView("cases")}>{tr("Cases", "ಪ್ರಕರಣಗಳು")}</Button><Button size="sm" variant={view === "followups" ? "primary" : "secondary"} onClick={() => setView("followups")}>{tr("Follow-up planner", "ಅನುಸರಣಾ ಯೋಜನೆ")}</Button></div>
          {view === "cases" ? <>
            <div className="grid gap-2 sm:grid-cols-4"><Input aria-label="Search" placeholder={tr("Search", "ಹುಡುಕಿ")} value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
              <Select aria-label="Category" value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value })}><option value="">{tr("All categories", "ಎಲ್ಲಾ ವರ್ಗ")}</option>{GRIEVANCE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c[lang]}</option>)}</Select>
              <Select aria-label="Status" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="">{tr("All statuses", "ಎಲ್ಲಾ ಸ್ಥಿತಿ")}</option>{statuses.map((s) => <option key={s}>{s}</option>)}</Select>
              <Select aria-label="Urgency" value={f.urg} onChange={(e) => setF({ ...f, urg: e.target.value })}><option value="">{tr("Any urgency", "ಯಾವುದೇ ತುರ್ತು")}</option>{["High", "Medium", "Low"].map((s) => <option key={s}>{s}</option>)}</Select></div>
            {list.length === 0 ? <Empty title={tr("No cases match your filters", "ಫಿಲ್ಟರ್‌ಗೆ ಹೊಂದುವ ಪ್ರಕರಣವಿಲ್ಲ")} action={<Button variant="secondary" onClick={() => setF({ status: "", cat: "", urg: "", q: "", mine: false })}>{tr("Clear filters", "ಫಿಲ್ಟರ್ ತೆಗೆಯಿರಿ")}</Button>} /> :
              <Table head={[tr("Issue", "ಸಮಸ್ಯೆ"), tr("Locality", "ಸ್ಥಳ"), tr("Status", "ಸ್ಥಿತಿ"), tr("Next action", "ಮುಂದಿನ ಕ್ರಮ"), tr("Owner", "ಮಾಲೀಕ")]}>{list.map((g) => (
                <tr key={g.id}><Td><Link href={`${base}/${g.id}`} className="font-medium text-primary hover:underline">{g.title}</Link><p className="text-xs text-muted">{g.id} · {catLabel(g.category, lang)} · {g.residentRef ?? tr("no resident linked", "ನಿವಾಸಿ ಲಿಂಕ್ ಇಲ್ಲ")}</p></Td><Td>{g.locality}</Td><Td><Badge tone={statusTone(g.status)}>{g.status}</Badge>{overdue(g) && <Badge tone="danger" className="ml-1">{tr("Overdue", "ವಿಳಂಬ")}</Badge>}<p className="mt-1 text-xs text-muted">{g.timeline.at(-1)?.at.slice(0, 10)}</p></Td><Td>{g.nextAction}<p className="text-xs text-muted">{g.followUpDate}</p></Td><Td>{participants.find((p) => p.id === g.ownerId)?.name ?? g.ownerId}</Td></tr>))}</Table>}</> :
            <FollowUps items={due} base={base} />}
        </>); }}</QState>
    </div>
  );
}

function FollowUps({ items, base }: { items: ReturnType<typeof getDb>["grievances"]; base: string }) {
  const { tr } = useT(); const act = useAct(); const [sel, setSel] = useState<string | null>(null); const [date, setDate] = useState("2026-10-27"); const [reason, setReason] = useState("");
  const groups = [[tr("Overdue", "ವಿಳಂಬ"), items.filter((g) => g.followUpDate < today)], [tr("Today", "ಇಂದು"), items.filter((g) => g.followUpDate === today)], [tr("This week", "ಈ ವಾರ"), items.filter((g) => g.followUpDate > today && g.followUpDate <= "2026-10-27")]] as const;
  return (<div className="space-y-4"><DemoNote>{tr("Reminders are shown in-app only. No messages are sent.", "ಜ್ಞಾಪನೆಗಳು ಆ್ಯಪ್‌ನಲ್ಲಿ ಮಾತ್ರ. ಯಾವ ಸಂದೇಶವೂ ಕಳುಹಿಸುವುದಿಲ್ಲ.")}</DemoNote>
    {groups.map(([label, list]) => <div key={label}><h2 className="mb-2 font-bold">{label} ({list.length})</h2>{list.length === 0 ? <p className="text-sm text-muted">—</p> : <div className="space-y-2">{list.map((g) => <Card key={g.id} className="flex flex-wrap items-center justify-between gap-2"><div><Link href={`${base}/${g.id}`} className="font-medium hover:underline">{g.title}</Link><p className="text-xs text-muted">{g.nextAction} · {g.followUpDate}</p></div><div className="flex gap-2"><Link href={`/app/ai?tab=draft&g=${g.id}`}><Button size="sm" variant="secondary">{tr("Draft message", "ಸಂದೇಶ ಕರಡು")}</Button></Link><Button size="sm" variant="secondary" onClick={() => setSel(g.id)}>{tr("Snooze", "ಮುಂದೂಡಿ")}</Button></div></Card>)}</div>}</div>)}
    <Modal open={!!sel} onClose={() => setSel(null)} title={tr("Reschedule follow-up", "ಅನುಸರಣೆ ಮರುನಿಗದಿ")} footer={<Button onClick={async () => { await act(() => api.grievances.reschedule(sel!, date, reason), tr("Follow-up rescheduled", "ಅನುಸರಣೆ ಮರುನಿಗದಿ")); setSel(null); setReason(""); }}>{tr("Save", "ಉಳಿಸಿ")}</Button>}>
      <Field label={tr("New date", "ಹೊಸ ದಿನಾಂಕ")}>{(id) => <Input id={id} type="date" value={date} onChange={(e) => setDate(e.target.value)} />}</Field><Field label={tr("Reason (required)", "ಕಾರಣ (ಅಗತ್ಯ)")}>{(id) => <Textarea id={id} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />}</Field></Modal></div>);
}

export function GrievanceDetail({ id, admin }: { id: string; admin?: boolean }) {
  const { tr, lang } = useT(); const act = useAct(); const role = usePrefs((s) => s.role); const router = useRouter();
  const q = useMock(["grievance", id], () => { const d = getDb(); const g = d.grievances.find((x) => x.id === id); return g ? { g, dupes: d.grievances.filter((x) => x.id !== id && x.category === g.category && x.gp === g.gp && x.status !== "Closed"), group: g.groupId ? d.grievances.filter((x) => x.groupId === g.groupId).length : 0 } : null; });
  const [dlg, setDlg] = useState<null | "note" | "status" | "escalate" | "closure" | "reopen" | "reassign">(null); const [text, setText] = useState(""); const [st, setSt] = useState<GStatus>("In Progress"); const [confirmClose, setConfirmClose] = useState(false); const [owner, setOwner] = useState("P-1042");
  const run = async (fn: () => void, msg: string) => { const r = await act(() => { fn(); return true; }, msg); if (r) { setDlg(null); setText(""); } };
  return (
    <QState q={q} isEmpty={(d) => !d} empty={<Empty title={tr("Case not found", "ಪ್ರಕರಣ ಸಿಗಲಿಲ್ಲ")} />}>{(d) => { const { g, dupes, group } = d!; const mine = g.ownerId === ME;
      return (<div className="space-y-4"><PageHeader title={g.title} sub={`${g.id} · ${catLabel(g.category, lang)} · ${g.locality}`} actions={<><Badge tone={statusTone(g.status)}>{g.status}</Badge>{overdue(g) && <Badge tone="danger">{tr("Overdue", "ವಿಳಂಬ")}</Badge>}</>} />
        {dupes.length > 0 && <Card className="flex gap-2 border-warning/50 text-sm"><Warning className="shrink-0 text-warning" size={20} /><p>{tr(`Possible duplicate: ${dupes.length} similar open case(s) in this Panchayat (${dupes.map((x) => x.id).join(", ")}). Not merged automatically; review before deciding.`, `ಸಂಭಾವ್ಯ ನಕಲು: ಈ ಪಂಚಾಯತ್‌ನಲ್ಲಿ ${dupes.length} ಹೋಲುವ ಪ್ರಕರಣ (${dupes.map((x) => x.id).join(", ")}). ಸ್ವಯಂ ವಿಲೀನವಿಲ್ಲ; ನಿರ್ಧರಿಸುವ ಮೊದಲು ಪರಿಶೀಲಿಸಿ.`)}</p></Card>}
        {group > 1 && <Card className="text-sm">{tr(`Linked group issue ${g.groupId}: ${group} reports of the same infrastructure problem. Personal details of other reporters are not shown.`, `ಸಂಬಂಧಿತ ಗುಂಪು ಸಮಸ್ಯೆ ${g.groupId}: ಅದೇ ಮೂಲಸೌಕರ್ಯ ಸಮಸ್ಯೆಯ ${group} ವರದಿ. ಇತರ ವರದಿದಾರರ ವೈಯಕ್ತಿಕ ವಿವರ ತೋರಿಸುವುದಿಲ್ಲ.`)}</Card>}
        <div className="grid gap-4 lg:grid-cols-3"><div className="space-y-4 lg:col-span-2">
          <Card><p>{g.description}</p><dl className="mt-3 grid grid-cols-2 gap-2 text-sm"><div><dt className="text-muted">{tr("Urgency", "ತುರ್ತು")}</dt><dd>{g.urgency}</dd></div><div><dt className="text-muted">{tr("Observed", "ಗಮನಿಸಿದ್ದು")}</dt><dd>{g.observed}</dd></div><div><dt className="text-muted">{tr("Resident (masked)", "ನಿವಾಸಿ (ಮರೆಮಾಡಿದ)")}</dt><dd>{g.residentRef ?? "—"}</dd></div><div><dt className="text-muted">{tr("Owner", "ಮಾಲೀಕ")}</dt><dd>{participants.find((p) => p.id === g.ownerId)?.name ?? g.ownerId}</dd></div><div><dt className="text-muted">{tr("Next action", "ಮುಂದಿನ ಕ್ರಮ")}</dt><dd>{g.nextAction}</dd></div><div><dt className="text-muted">{tr("Follow-up", "ಅನುಸರಣೆ")}</dt><dd>{g.followUpDate}</dd></div></dl>
            {g.pathway && <p className="mt-3 rounded-xl bg-accent-soft p-3 text-sm"><b>{tr("Pathway note", "ಮಾರ್ಗ ಟಿಪ್ಪಣಿ")}:</b> {g.pathway}. {tr("Please verify with the relevant authority.", "ಸಂಬಂಧಿತ ಪ್ರಾಧಿಕಾರದೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ.")}</p>}
            {g.outcome && <p className="mt-3 rounded-xl bg-success/10 p-3 text-sm"><b>{tr("Outcome", "ಫಲಿತಾಂಶ")}:</b> {g.outcome}</p>}</Card>
          <Card><h2 className="mb-3 font-bold">{tr("Timeline", "ಕಾಲರೇಖೆ")}</h2><ol className="space-y-3 border-l-2 border-border pl-4">{[...g.timeline].reverse().map((t, i) => <li key={i} className="relative"><span className="absolute -left-[22px] top-1.5 h-3 w-3 rounded-full bg-primary" /><p className="text-sm font-medium">{t.action}{t.from && ` · ${t.from} → ${t.to}`}</p>{t.note && <p className="text-sm text-muted">{t.note}</p>}<p className="text-xs text-muted">{t.at} · {t.actor}</p></li>)}</ol></Card></div>
          <Card className="h-fit space-y-2"><h2 className="font-bold">{tr("Actions", "ಕ್ರಮಗಳು")}</h2>
            <Button className="w-full" variant="secondary" onClick={() => setDlg("note")}>{tr("Add note", "ಟಿಪ್ಪಣಿ ಸೇರಿಸಿ")}</Button>
            <Button className="w-full" variant="secondary" onClick={() => setDlg("status")} disabled={g.status === "Closed"}>{tr("Change status", "ಸ್ಥಿತಿ ಬದಲಿಸಿ")}</Button>
            <Link className="block" href={`/app/ai?tab=pathway&g=${g.id}`}><Button className="w-full" variant="secondary">{tr("Suggest pathway (AI)", "ಮಾರ್ಗ ಸಲಹೆ (AI)")}</Button></Link>
            <Link className="block" href={`/app/ai?tab=draft&g=${g.id}`}><Button className="w-full" variant="secondary">{tr("Draft message", "ಸಂದೇಶ ಕರಡು")}</Button></Link>
            {admin && <Button className="w-full" variant="secondary" onClick={() => setDlg("reassign")}>{tr("Reassign owner", "ಮಾಲೀಕ ಬದಲಿಸಿ")}</Button>}
            <Button className="w-full" variant="secondary" disabled={g.status === "Closed" || g.status === "Escalated"} onClick={() => setDlg("escalate")}>{tr("Escalate", "ಹೆಚ್ಚಿನ ಹಂತಕ್ಕೆ")}</Button>
            {g.status !== "Closed" && g.status !== "Closure Pending" && <Button className="w-full" onClick={() => setDlg("closure")}>{tr("Mark closure pending", "ಮುಚ್ಚಲು ಬಾಕಿ ಎಂದು ಗುರುತಿಸಿ")}</Button>}
            {g.status === "Closure Pending" && <Button className="w-full" disabled={!mine && role === "participant"} onClick={() => setConfirmClose(true)}>{tr("Confirm closure", "ಮುಚ್ಚುವಿಕೆ ದೃಢೀಕರಿಸಿ")}</Button>}
            {g.status === "Closed" && <Button className="w-full" variant="danger" onClick={() => setDlg("reopen")}>{tr("Reopen", "ಮತ್ತೆ ತೆರೆಯಿರಿ")}</Button>}
            <p className="text-xs text-muted">{tr("No message is sent and nothing is filed with any authority from here.", "ಇಲ್ಲಿಂದ ಯಾವ ಸಂದೇಶವೂ ಕಳುಹಿಸುವುದಿಲ್ಲ, ಯಾವ ಪ್ರಾಧಿಕಾರಕ್ಕೂ ಸಲ್ಲಿಸುವುದಿಲ್ಲ.")}</p></Card></div>
        <Modal open={dlg === "note"} onClose={() => setDlg(null)} title={tr("Add note", "ಟಿಪ್ಪಣಿ ಸೇರಿಸಿ")} footer={<Button disabled={!text.trim()} onClick={() => run(() => api.grievances.note(id, text), tr("Note added", "ಟಿಪ್ಪಣಿ ಸೇರಿಸಲಾಗಿದೆ"))}>{tr("Save", "ಉಳಿಸಿ")}</Button>}><Field label={tr("Note (avoid sensitive personal details)", "ಟಿಪ್ಪಣಿ (ಸೂಕ್ಷ್ಮ ವೈಯಕ್ತಿಕ ವಿವರ ಬೇಡ)")}>{(i) => <Textarea id={i} value={text} onChange={(e) => setText(e.target.value)} />}</Field></Modal>
        <Modal open={dlg === "status"} onClose={() => setDlg(null)} title={tr("Change status", "ಸ್ಥಿತಿ ಬದಲಿಸಿ")} footer={<Button onClick={() => run(() => api.grievances.transition(id, st, text), tr("Status updated", "ಸ್ಥಿತಿ ನವೀಕರಿಸಲಾಗಿದೆ"))}>{tr("Save", "ಉಳಿಸಿ")}</Button>}><Select value={st} onChange={(e) => setSt(e.target.value as GStatus)}>{["Open", "In Progress", "Follow-up Due"].map((s) => <option key={s}>{s}</option>)}</Select><Field label={tr("Reason", "ಕಾರಣ")}>{(i) => <Textarea id={i} rows={2} value={text} onChange={(e) => setText(e.target.value)} />}</Field></Modal>
        <Modal open={dlg === "escalate"} onClose={() => setDlg(null)} title={tr("Escalate case", "ಪ್ರಕರಣ ಹೆಚ್ಚಿನ ಹಂತಕ್ಕೆ")} footer={<Button onClick={() => run(() => api.grievances.transition(id, "Escalated", text), tr("Escalated in tracker (nothing sent)", "ಟ್ರ್ಯಾಕರ್‌ನಲ್ಲಿ ಹೆಚ್ಚಿಸಲಾಗಿದೆ (ಏನೂ ಕಳುಹಿಸಿಲ್ಲ)"))}>{tr("Escalate", "ಹೆಚ್ಚಿಸಿ")}</Button>}><Field label={tr("Reason (required)", "ಕಾರಣ (ಅಗತ್ಯ)")}>{(i) => <Textarea id={i} rows={2} value={text} onChange={(e) => setText(e.target.value)} />}</Field></Modal>
        <Modal open={dlg === "closure"} onClose={() => setDlg(null)} title={tr("Mark closure pending", "ಮುಚ್ಚಲು ಬಾಕಿ")} footer={<Button onClick={() => run(() => api.grievances.transition(id, "Closure Pending", text), tr("Awaiting confirmation", "ದೃಢೀಕರಣಕ್ಕೆ ಕಾಯುತ್ತಿದೆ"))}>{tr("Save", "ಉಳಿಸಿ")}</Button>}><Field label={tr("Outcome summary (required)", "ಫಲಿತಾಂಶ ಸಾರಾಂಶ (ಅಗತ್ಯ)")}>{(i) => <Textarea id={i} rows={3} value={text} onChange={(e) => setText(e.target.value)} />}</Field></Modal>
        <Modal open={dlg === "reopen"} onClose={() => setDlg(null)} title={tr("Reopen case", "ಪ್ರಕರಣ ಮತ್ತೆ ತೆರೆಯಿರಿ")} footer={<Button onClick={() => run(() => api.grievances.transition(id, "Reopened", text), tr("Case reopened", "ಪ್ರಕರಣ ಮತ್ತೆ ತೆರೆಯಲಾಗಿದೆ"))}>{tr("Reopen", "ಮತ್ತೆ ತೆರೆಯಿರಿ")}</Button>}><Field label={tr("Reason (required)", "ಕಾರಣ (ಅಗತ್ಯ)")}>{(i) => <Textarea id={i} rows={2} value={text} onChange={(e) => setText(e.target.value)} />}</Field></Modal>
        <Modal open={dlg === "reassign"} onClose={() => setDlg(null)} title={tr("Reassign owner", "ಮಾಲೀಕ ಬದಲಿಸಿ")} footer={<Button onClick={() => run(() => api.grievances.reassign(id, owner), tr("Reassigned", "ಮರುನಿಯೋಜಿಸಲಾಗಿದೆ"))}>{tr("Save", "ಉಳಿಸಿ")}</Button>}><Select value={owner} onChange={(e) => setOwner(e.target.value)}>{participants.filter((p) => inScope(role, p)).map((p) => <option key={p.id} value={p.id}>{p.name} · {p.id}</option>)}</Select><p className="text-xs text-muted">{tr("Only people within your scope are listed.", "ನಿಮ್ಮ ವ್ಯಾಪ್ತಿಯವರು ಮಾತ್ರ ಪಟ್ಟಿಯಲ್ಲಿದ್ದಾರೆ.")} {roleUsers[role].label}</p></Modal>
        <Confirm open={confirmClose} onClose={() => setConfirmClose(false)} onConfirm={() => { run(() => api.grievances.transition(id, "Closed", g.outcome ?? "Confirmed"), tr("Closure confirmed", "ಮುಚ್ಚುವಿಕೆ ದೃಢೀಕೃತ")); setConfirmClose(false); }} title={tr("Confirm closure?", "ಮುಚ್ಚುವಿಕೆ ದೃಢೀಕರಿಸುವಿರಾ?")} confirmLabel={tr("Confirm", "ದೃಢೀಕರಿಸಿ")} body={<>{tr("Outcome: ", "ಫಲಿತಾಂಶ: ")}{g.outcome}</>} />
        <Button variant="ghost" onClick={() => router.back()}>{tr("Back", "ಹಿಂದೆ")}</Button></div>); }}</QState>
  );
}
