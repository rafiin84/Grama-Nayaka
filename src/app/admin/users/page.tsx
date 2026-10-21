"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { Copy, DownloadSimple, Plus, UploadSimple, Warning } from "@phosphor-icons/react";
import { Badge, Button, Card, Confirm, DemoNote, Empty, Field, Input, Modal, PageHeader, QState, Select, Table, Td, Textarea, statusTone } from "@/components/ui";
import { api, useAct, useMock, validateUser, type NewUser } from "@/lib/api";
import { getDb, inScope } from "@/lib/db";
import { downloadText, parseCsv, toCsv } from "@/lib/csv";
import { talukOptions, districts } from "@/lib/geo";
import { assignableRoles, RBAC_ROLES } from "@/lib/rbac";
import { trainingStatusOf } from "@/lib/trainingRules";
import { useCan } from "@/lib/useCan";
import { usePrefs } from "@/lib/store";
import { useT } from "@/lib/useT";
import { cn } from "@/lib/utils";
import type { RbacRole, User } from "@/lib/types";

const roleLabel = (r: RbacRole, lang: "kn" | "en") => RBAC_ROLES.find((x) => x.id === r)?.[lang] ?? r;
const TEMPLATE = "name,phone,email,role,district,taluk,gp\nAsha Demo,9000000501,asha.demo@example.org,volunteer,Mysuru,Nanjangud,Hosahalli GP\n";
const parseRole = (v: string): RbacRole | null => { const k = v.trim().toLowerCase().replace(/[\s_-]/g, ""); return RBAC_ROLES.find((r) => r.id.toLowerCase() === k || r.en.toLowerCase().replace(/[\s_-]/g, "") === k)?.id ?? null; };
const norm = (p: string) => p.replace(/\D/g, "").slice(-10);
type F = { q: string; role: string; status: string; district: string; taluk: string; training: string; village: string };
const noF: F = { q: "", role: "", status: "", district: "", taluk: "", training: "", village: "" };

export default function UsersPage() {
  const { tr, lang } = useT(); const act = useAct(); const { can, manageUsers } = useCan(); const role = usePrefs((s) => s.role);
  const [f, setF] = useState<F>(noF); const [sel, setSel] = useState<string[]>([]);
  const [bulk, setBulk] = useState<null | "status" | "session" | "delete">(null); const [bStatus, setBStatus] = useState<"Active" | "Inactive" | "Suspended">("Inactive"); const [bReason, setBReason] = useState(""); const [bSession, setBSession] = useState("");
  const [imp, setImp] = useState<{ rows: { n: number; v: NewUser | null; err?: string }[]; name: string } | null>(null); const [dupOpen, setDupOpen] = useState(false); const [report, setReport] = useState<{ title: string; done: number; skipped: { id: string; reason: string }[] } | null>(null); const file = useRef<HTMLInputElement>(null);
  const q = useMock(["users"], () => { const d = getDb(); return { users: d.users, ps: d.participants, villages: d.villages, classes: d.classes }; });
  const assignable = assignableRoles(role);
  const runBulk = async (title: string, fn: () => { done: number; skipped: { id: string; reason: string }[] }) => { const r = await act(fn); if (r) { setReport({ title, ...r }); setSel([]); setBulk(null); setBReason(""); } };

  return (
    <div className="space-y-4">
      <PageHeader title={tr("Users & Volunteers", "ಬಳಕೆದಾರರು ಮತ್ತು ಸ್ವಯಂಸೇವಕರು")} sub={tr("Create and manage accounts, roles, locations and status. Deleting an account keeps its records.", "ಖಾತೆ, ಪಾತ್ರ, ಸ್ಥಳ ಮತ್ತು ಸ್ಥಿತಿ ನಿರ್ವಹಿಸಿ. ಖಾತೆ ಅಳಿಸಿದರೂ ಅದರ ದಾಖಲೆಗಳು ಉಳಿಯುತ್ತವೆ.")}
        actions={<>
          {can("users", "export") && <Button variant="secondary" onClick={() => { const rows = q.data ? applyFilters(f, { ...q.data, users: scopeUsers(role, q.data.users) }) : []; downloadText("users.csv", toCsv(["id", "name", "role", "status", "district", "taluk", "gp", "created", "last_login"], rows.map((u) => [u.id, u.name, u.role, u.status, u.district, u.taluk, u.gp, u.createdAt, u.lastLogin ?? ""]))); act(() => api.report.exportCsv("users"), tr("Exported (phone and email left out)", "ರಫ್ತು ಮಾಡಲಾಗಿದೆ (ಫೋನ್ ಮತ್ತು ಇಮೇಲ್ ಬಿಟ್ಟು)")); }}><DownloadSimple />{tr("Export CSV", "CSV ರಫ್ತು")}</Button>}
          {can("users", "create") && <><Button variant="secondary" onClick={() => file.current?.click()}><UploadSimple />{tr("Import CSV", "CSV ಆಮದು")}</Button><Link href="/admin/users/new"><Button><Plus />{tr("Add user", "ಬಳಕೆದಾರ ಸೇರಿಸಿ")}</Button></Link></>}
        </>} />
      <input ref={file} type="file" accept=".csv,text/csv" className="hidden" onChange={async (e) => { const fl = e.target.files?.[0]; e.target.value = ""; if (!fl) return; if (fl.size > 1024 * 1024) return void act(() => { throw new Error("File is larger than 1 MB."); }); const text = await fl.text(); const [head, ...body] = parseCsv(text); const idx = (n: string) => head?.findIndex((h) => h.toLowerCase() === n) ?? -1; const cols = ["name", "phone", "email", "role", "district", "taluk", "gp"].map(idx);
        if (!head || cols.some((c) => c < 0)) return setImp({ name: fl.name, rows: [{ n: 1, v: null, err: tr("Header must be: name,phone,email,role,district,taluk,gp", "ಹೆಡರ್ ಹೀಗಿರಬೇಕು: name,phone,email,role,district,taluk,gp") }] });
        const seen = new Set<string>(); const existing = getDb().users;
        setImp({ name: fl.name, rows: body.slice(0, 500).map((r, i) => { const role2 = parseRole(r[cols[3]] ?? ""); const v: NewUser = { name: r[cols[0]] ?? "", phone: r[cols[1]] ?? "", email: r[cols[2]] ?? "", role: role2 ?? "volunteer", district: r[cols[4]] ?? "", taluk: r[cols[5]] ?? "", gp: r[cols[6]] ?? "" };
          let err = !role2 ? tr("Unknown role", "ಅಜ್ಞಾತ ಪಾತ್ರ") : !assignable.includes(role2) ? tr("You cannot assign this role", "ಈ ಪಾತ್ರ ನಿಯೋಜಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ") : validateUser(v, existing); const key = norm(v.phone); if (!err && seen.has(key)) err = tr("Duplicate phone inside this file", "ಈ ಫೈಲ್‌ನಲ್ಲಿ ಫೋನ್ ನಕಲು"); seen.add(key); return { n: i + 2, v, err: err ?? undefined }; }) }); }} />

      <QState q={q} isEmpty={(d) => d.users.length === 0} empty={<Empty title={tr("No accounts yet", "ಇನ್ನೂ ಖಾತೆಗಳಿಲ್ಲ")} action={can("users", "create") ? <Link href="/admin/users/new"><Button>{tr("Add user", "ಬಳಕೆದಾರ ಸೇರಿಸಿ")}</Button></Link> : undefined} />}>{(d) => {
        const scoped = scopeUsers(role, d.users); const live = scoped.filter((u) => u.status !== "Deleted"); const dups = duplicates(live); const list = applyFilters(f, { ...d, users: scoped });
        const villageCount = (u: User) => d.villages.filter((v) => u.participantId && v.volunteerIds.includes(u.participantId)).length;
        const allOn = list.length > 0 && list.every((u) => sel.includes(u.id)); const selUsers = scoped.filter((u) => sel.includes(u.id));
        return (<>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[[tr("Total accounts", "ಒಟ್ಟು ಖಾತೆಗಳು"), live.length], [tr("Active", "ಸಕ್ರಿಯ"), live.filter((u) => u.status === "Active").length], [tr("Inactive / suspended", "ನಿಷ್ಕ್ರಿಯ / ತಡೆ"), live.filter((u) => u.status === "Inactive" || u.status === "Suspended").length], [tr("Volunteers", "ಸ್ವಯಂಸೇವಕರು"), live.filter((u) => u.role === "volunteer").length]].map(([l, n]) => <div key={String(l)} className="rounded-2xl border border-primary/20 bg-accent-soft p-4"><p className="text-sm text-muted">{l}</p><p className="mt-1 text-2xl font-bold text-primary">{n}</p></div>)}</div>
          {dups.length > 0 && <Card className="flex flex-wrap items-center justify-between gap-3 border-warning/50"><p className="flex items-center gap-2 text-sm"><Warning size={20} className="text-warning" />{tr(`${dups.length} possible duplicate group(s) found (same phone, email, or name in the same Gram Panchayat).`, `${dups.length} ಸಂಭಾವ್ಯ ನಕಲು ಗುಂಪು ಕಂಡುಬಂದಿದೆ (ಒಂದೇ ಫೋನ್, ಇಮೇಲ್, ಅಥವಾ ಅದೇ ಗ್ರಾಮ ಪಂಚಾಯತ್‌ನಲ್ಲಿ ಒಂದೇ ಹೆಸರು).`)}</p><Button size="sm" variant="secondary" onClick={() => setDupOpen(true)}>{tr("Review", "ಪರಿಶೀಲಿಸಿ")}</Button></Card>}
          <Card className="grid gap-2 p-4 sm:grid-cols-3 lg:grid-cols-7">
            <Input aria-label="Search" placeholder={tr("Name, phone, email", "ಹೆಸರು, ಫೋನ್, ಇಮೇಲ್")} value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} className="lg:col-span-2" />
            <Select aria-label="Role" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}><option value="">{tr("All roles", "ಎಲ್ಲಾ ಪಾತ್ರ")}</option>{RBAC_ROLES.map((r) => <option key={r.id} value={r.id}>{r[lang]}</option>)}</Select>
            <Select aria-label="Status" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="">{tr("All statuses", "ಎಲ್ಲಾ ಸ್ಥಿತಿ")}</option>{["Active", "Inactive", "Suspended", "Deleted"].map((s) => <option key={s}>{s}</option>)}</Select>
            <Select aria-label="District" value={f.district} onChange={(e) => setF({ ...f, district: e.target.value, taluk: "" })}><option value="">{tr("All districts", "ಎಲ್ಲಾ ಜಿಲ್ಲೆ")}</option>{districts.map((x) => <option key={x}>{x}</option>)}</Select>
            <Select aria-label="Block / taluk" value={f.taluk} onChange={(e) => setF({ ...f, taluk: e.target.value })}><option value="">{tr("All blocks", "ಎಲ್ಲಾ ಬ್ಲಾಕ್")}</option>{talukOptions(f.district).map((x) => <option key={x}>{x}</option>)}</Select>
            <Select aria-label="Training" value={f.training} onChange={(e) => setF({ ...f, training: e.target.value })}><option value="">{tr("Any training status", "ಯಾವುದೇ ತರಬೇತಿ ಸ್ಥಿತಿ")}</option><option value="done">{tr("Trained", "ತರಬೇತಿ ಪೂರ್ಣ")}</option><option value="pending">{tr("Pending training", "ತರಬೇತಿ ಬಾಕಿ")}</option></Select>
            <Select aria-label="Village" value={f.village} onChange={(e) => setF({ ...f, village: e.target.value })} className="lg:col-span-2"><option value="">{tr("All villages", "ಎಲ್ಲಾ ಗ್ರಾಮ")}</option>{d.villages.map((v) => <option key={v.id} value={v.id}>{v.name} · {v.gp}</option>)}</Select>
            {Object.values(f).some(Boolean) && <Button variant="ghost" size="sm" onClick={() => setF(noF)}>{tr("Reset", "ಮರುಹೊಂದಿಸಿ")}</Button>}
          </Card>
          {sel.length > 0 && <Card className="flex flex-wrap items-center gap-2 border-primary/40 bg-accent-soft p-3" role="region" aria-label="Bulk actions"><b className="mr-2 text-sm">{sel.length} {tr("selected", "ಆಯ್ಕೆ")}</b>
            {manageUsers && <><Button size="sm" onClick={() => runBulk(tr("Activate", "ಸಕ್ರಿಯಗೊಳಿಸಿ"), () => api.users.bulkStatus(sel, "Active", ""))}>{tr("Activate", "ಸಕ್ರಿಯಗೊಳಿಸಿ")}</Button><Button size="sm" variant="secondary" onClick={() => { setBStatus("Inactive"); setBulk("status"); }}>{tr("Deactivate / suspend…", "ನಿಷ್ಕ್ರಿಯ / ತಡೆ…")}</Button></>}
            {can("users", "edit") && <Button size="sm" variant="secondary" onClick={() => setBulk("session")}>{tr("Register for session…", "ಅವಧಿಗೆ ನೋಂದಾಯಿಸಿ…")}</Button>}
            {can("users", "delete") && <Button size="sm" variant="danger" onClick={() => setBulk("delete")}>{tr("Delete…", "ಅಳಿಸಿ…")}</Button>}
            <Button size="sm" variant="ghost" onClick={() => setSel([])}>{tr("Clear", "ತೆರವುಗೊಳಿಸಿ")}</Button></Card>}
          {list.length === 0 ? <Empty title={tr("No accounts match your filters", "ಫಿಲ್ಟರ್‌ಗೆ ಹೊಂದುವ ಖಾತೆ ಇಲ್ಲ")} /> :
            <Table head={[" ", tr("Account", "ಖಾತೆ"), tr("Role", "ಪಾತ್ರ"), tr("Location", "ಸ್ಥಳ"), tr("Status", "ಸ್ಥಿತಿ"), tr("Last login", "ಕೊನೆಯ ಲಾಗಿನ್"), "  "]}>{list.map((u) => (
              <tr key={u.id} className={cn(u.status === "Deleted" && "opacity-60", sel.includes(u.id) && "bg-accent-soft/60")}>
                <Td><input type="checkbox" aria-label={`Select ${u.name}`} checked={sel.includes(u.id)} onChange={(e) => setSel(e.target.checked ? [...sel, u.id] : sel.filter((x) => x !== u.id))} className="h-4 w-4 accent-[var(--primary)]" /></Td>
                <Td><Link href={`/admin/users/${u.id}`} className="font-semibold text-primary hover:underline">{u.name}</Link><p className="text-xs text-muted">{u.id} · {mask(u.phone)}</p></Td>
                <Td><Badge tone="info">{roleLabel(u.role, lang)}</Badge>{u.participantId && <p className="mt-1 text-xs text-muted">{trainingStatusOf(d.classes, u.participantId)}</p>}</Td>
                <Td>{u.gp || u.taluk || u.district || "—"}<p className="text-xs text-muted">{[u.taluk, u.district].filter(Boolean).join(", ")}{villageCount(u) > 0 && ` · ${villageCount(u)} ${tr("village(s)", "ಗ್ರಾಮ")}`}</p></Td>
                <Td><Badge tone={statusTone(u.status === "Suspended" || u.status === "Deleted" ? "Rejected" : u.status === "Inactive" ? "Pending" : "Approved")}>{u.status}</Badge>{u.invite && !u.invite.usedAt && <p className="mt-1 text-xs text-warning">{tr("Invite pending", "ಆಹ್ವಾನ ಬಾಕಿ")}</p>}</Td>
                <Td className="text-xs text-muted">{u.lastLogin ?? tr("Never", "ಎಂದಿಗೂ ಇಲ್ಲ")}<br />{tr("Created", "ರಚನೆ")} {u.createdAt}</Td>
                <Td><div className="flex flex-wrap gap-1"><Link href={`/admin/users/${u.id}`}><Button size="sm" variant="secondary">{tr("View", "ನೋಡಿ")}</Button></Link>{can("users", "edit") && u.status !== "Deleted" && <Link href={`/admin/users/${u.id}/edit`}><Button size="sm" variant="secondary">{tr("Edit", "ತಿದ್ದಿ")}</Button></Link>}</div></Td>
              </tr>))}</Table>}
          {list.length > 0 && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={allOn} onChange={(e) => setSel(e.target.checked ? [...new Set([...sel, ...list.map((u) => u.id)])] : sel.filter((x) => !list.some((u) => u.id === x)))} className="h-4 w-4 accent-[var(--primary)]" />{tr(`Select all ${list.length} shown`, `ತೋರಿಸಿದ ಎಲ್ಲಾ ${list.length} ಆಯ್ಕೆಮಾಡಿ`)}</label>}

          <Modal open={bulk === "status"} onClose={() => setBulk(null)} title={tr(`Change status of ${sel.length} account(s)`, `${sel.length} ಖಾತೆಗಳ ಸ್ಥಿತಿ ಬದಲಿಸಿ`)} footer={<Button variant="danger" onClick={() => (bReason.trim().length < 3 ? void act(() => api.users.setStatus(sel[0], bStatus, "")) : runBulk(bStatus, () => api.users.bulkStatus(sel, bStatus, bReason)))}>{tr("Confirm", "ದೃಢೀಕರಿಸಿ")}</Button>}>
            <Select aria-label="New status" value={bStatus} onChange={(e) => setBStatus(e.target.value as "Inactive")}><option value="Inactive">{tr("Inactive", "ನಿಷ್ಕ್ರಿಯ")}</option><option value="Suspended">{tr("Suspended", "ತಡೆ")}</option></Select>
            <Field label={tr("Reason (required)", "ಕಾರಣ (ಅಗತ್ಯ)")}>{(i) => <Textarea id={i} rows={2} value={bReason} onChange={(e) => setBReason(e.target.value)} />}</Field><p className="text-xs text-muted">{selUsers.map((u) => u.name).slice(0, 6).join(", ")}{selUsers.length > 6 && "…"}</p></Modal>
          <Modal open={bulk === "session"} onClose={() => setBulk(null)} title={tr(`Register ${sel.length} volunteer(s) for a session`, `${sel.length} ಸ್ವಯಂಸೇವಕರನ್ನು ಅವಧಿಗೆ ನೋಂದಾಯಿಸಿ`)} footer={<Button disabled={!bSession} onClick={() => runBulk(tr("Register for session", "ಅವಧಿಗೆ ನೋಂದಣಿ"), () => api.users.bulkAssignSession(sel, bSession))}>{tr("Register", "ನೋಂದಾಯಿಸಿ")}</Button>}>
            <Field label={tr("Training session", "ತರಬೇತಿ ಅವಧಿ")} hint={tr("Only published sessions with free seats are shown. People who cannot be registered are listed afterwards.", "ಪ್ರಕಟಿತ ಮತ್ತು ಖಾಲಿ ಆಸನವಿರುವ ಅವಧಿಗಳು ಮಾತ್ರ. ನೋಂದಾಯಿಸಲಾಗದವರನ್ನು ನಂತರ ಪಟ್ಟಿ ಮಾಡಲಾಗುತ್ತದೆ.")}>{(i) => <Select id={i} value={bSession} onChange={(e) => setBSession(e.target.value)}><option value="">—</option>{d.classes.filter((c) => c.status !== "Cancelled" && c.publish !== "Draft" && c.roster.length < c.capacity).map((c) => <option key={c.id} value={c.id}>{c.name} · {c.startDate} · {c.capacity - c.roster.length} {tr("free", "ಖಾಲಿ")}</option>)}</Select>}</Field></Modal>
          <Confirm open={bulk === "delete"} onClose={() => setBulk(null)} danger onConfirm={() => runBulk(tr("Delete", "ಅಳಿಸಿ"), () => api.users.bulkRemove(sel))} title={tr(`Delete ${sel.length} account(s)?`, `${sel.length} ಖಾತೆಗಳನ್ನು ಅಳಿಸುವಿರಾ?`)} confirmLabel={tr("Delete accounts", "ಖಾತೆ ಅಳಿಸಿ")} body={tr("Their records are preserved and accounts can be restored. The last active Super Admin cannot be deleted.", "ಅವರ ದಾಖಲೆಗಳು ಉಳಿಯುತ್ತವೆ; ಖಾತೆಗಳನ್ನು ಮರುಸ್ಥಾಪಿಸಬಹುದು. ಕೊನೆಯ ಸಕ್ರಿಯ ಸೂಪರ್ ಅಡ್ಮಿನ್ ಅನ್ನು ಅಳಿಸಲಾಗದು.")} />
          <Modal open={!!report} onClose={() => setReport(null)} title={report ? `${report.title}: ${report.done} ${tr("done", "ಪೂರ್ಣ")}${report.skipped.length ? `, ${report.skipped.length} ${tr("skipped", "ಬಿಟ್ಟುಬಿಡಲಾಗಿದೆ")}` : ""}` : ""}>{report && (report.skipped.length === 0 ? <p className="text-sm text-success">{tr("All selected accounts were updated.", "ಆಯ್ದ ಎಲ್ಲಾ ಖಾತೆಗಳನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ.")}</p> : <ul className="space-y-1 text-sm">{report.skipped.map((s) => <li key={s.id}><b>{d.users.find((u) => u.id === s.id)?.name ?? s.id}</b>: <span className="text-danger">{s.reason}</span></li>)}</ul>)}</Modal>
          <Modal open={dupOpen} onClose={() => setDupOpen(false)} title={tr("Possible duplicate accounts", "ಸಂಭಾವ್ಯ ನಕಲು ಖಾತೆಗಳು")}><p className="text-sm text-muted">{tr("Nothing is merged automatically. Open each account and deactivate or delete the extra one.", "ಏನೂ ಸ್ವಯಂ ವಿಲೀನವಾಗುವುದಿಲ್ಲ. ಪ್ರತಿ ಖಾತೆ ತೆರೆದು ಹೆಚ್ಚುವರಿಯದನ್ನು ನಿಷ್ಕ್ರಿಯ ಅಥವಾ ಅಳಿಸಿ.")}</p>{dups.map(([why, us]) => <Card key={why} className="space-y-1 p-3 text-sm"><p className="flex items-center gap-1 font-semibold"><Copy size={16} />{why}</p>{us.map((u) => <Link key={u.id} href={`/admin/users/${u.id}`} className="block text-primary underline">{u.name} · {u.id} · {u.gp || u.district}</Link>)}</Card>)}</Modal>
        </>);
      }}</QState>
      <DemoNote>{tr("Excel files: save as CSV first (.xlsx import is not supported). Phone numbers shown are fictional and masked in lists.", "Excel ಫೈಲ್‌ಗಳನ್ನು ಮೊದಲು CSV ಆಗಿ ಉಳಿಸಿ (.xlsx ಆಮದು ಬೆಂಬಲಿತವಲ್ಲ). ತೋರಿಸಿದ ಫೋನ್ ಸಂಖ್ಯೆಗಳು ಕಾಲ್ಪನಿಕ ಮತ್ತು ಪಟ್ಟಿಗಳಲ್ಲಿ ಮರೆಮಾಡಲಾಗಿದೆ.")}</DemoNote>

      <Modal open={!!imp} onClose={() => setImp(null)} title={tr("Import preview", "ಆಮದು ಪೂರ್ವವೀಕ್ಷಣೆ")} footer={imp && <><Button variant="secondary" onClick={() => downloadText("users-template.csv", TEMPLATE)}>{tr("Download template", "ಟೆಂಪ್ಲೇಟ್ ಡೌನ್‌ಲೋಡ್")}</Button><Button disabled={!imp.rows.some((r) => r.v && !r.err)} onClick={async () => { const ok = imp.rows.filter((r) => r.v && !r.err).map((r) => r.v!); const out = await act(() => api.users.importRows(ok), tr("Import finished", "ಆಮದು ಪೂರ್ಣ")); if (out) setImp(null); }}>{tr(`Import ${imp.rows.filter((r) => r.v && !r.err).length} valid row(s)`, `${imp.rows.filter((r) => r.v && !r.err).length} ಸರಿಯಾದ ಸಾಲು ಆಮದು`)}</Button></>}>
        {imp && <><p className="text-sm text-muted">{imp.name} · {imp.rows.length} {tr("rows", "ಸಾಲುಗಳು")} · {imp.rows.filter((r) => r.err).length} {tr("with problems (skipped)", "ಸಮಸ್ಯೆಯೊಂದಿಗೆ (ಬಿಟ್ಟುಬಿಡಲಾಗುತ್ತದೆ)")}</p>
          <div className="max-h-72 overflow-auto rounded-xl border border-border"><table className="w-full text-xs"><tbody>{imp.rows.map((r) => <tr key={r.n} className={cn("border-b border-border", r.err && "bg-danger/10")}><td className="px-2 py-1 text-muted">{r.n}</td><td className="px-2 py-1">{r.v?.name}</td><td className="px-2 py-1">{r.v ? mask(r.v.phone) : ""}</td><td className="px-2 py-1">{r.v?.role}</td><td className="px-2 py-1">{r.err ? <span className="text-danger">{r.err}</span> : <span className="text-success">OK</span>}</td></tr>)}</tbody></table></div></>}
      </Modal>
    </div>
  );
}
const scopeUsers = (role: Parameters<typeof inScope>[0], us: User[]) => us.filter((u) => inScope(role, { district: u.district || undefined, taluk: u.taluk || undefined, gp: u.gp || undefined }) && (role === "state" || role === "coordinator" || role === "grievance" || role === "content" || u.district !== ""));
function applyFilters(f: F, dd: { users: User[]; ps: { id: string; trainingDone: boolean }[]; villages: { id: string; volunteerIds: string[] }[] }) {
  const kw = f.q.trim().toLowerCase();
  return dd.users.filter((u) => (!kw || (u.name + u.phone + u.email + u.id).toLowerCase().includes(kw)) && (!f.role || u.role === f.role) && (f.status ? u.status === f.status : u.status !== "Deleted") && (!f.district || u.district === f.district) && (!f.taluk || u.taluk === f.taluk)
    && (!f.training || (u.participantId ? (dd.ps.find((p) => p.id === u.participantId)?.trainingDone ? "done" : "pending") === f.training : false))
    && (!f.village || (!!u.participantId && !!dd.villages.find((v) => v.id === f.village)?.volunteerIds.includes(u.participantId))));
}
function mask(p: string) { const d = p.replace(/\D/g, ""); return d.length >= 10 ? `••••• •${d.slice(-4)}` : "••••"; }
function duplicates(us: User[]): [string, User[]][] {
  const groups = new Map<string, User[]>();
  us.forEach((u) => { for (const k of [`phone:${norm(u.phone)}`, u.email ? `email:${u.email.toLowerCase()}` : "", u.gp ? `name:${u.name.toLowerCase()}|${u.gp}` : ""]) { if (!k) continue; groups.set(k, [...(groups.get(k) ?? []), u]); } });
  return [...groups.entries()].filter(([, v]) => new Set(v.map((x) => x.id)).size > 1).map(([k, v]) => [k.startsWith("phone") ? "Same phone number" : k.startsWith("email") ? "Same email" : "Same name in the same Gram Panchayat", [...new Map(v.map((x) => [x.id, x])).values()]] as [string, User[]]);
}
