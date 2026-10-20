"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge, Button, Card, Check, Empty, Input, Modal, PageHeader, Progress, QState, Select, Table, Td } from "@/components/ui";
import { api, useAct, useMock } from "@/lib/api";
import { getDb, inScope } from "@/lib/db";
import { usePrefs } from "@/lib/store";
import { useT } from "@/lib/useT";
import { districts } from "@/lib/seed-geo";
import type { Participant } from "@/lib/types";

export default function Page() { return <Suspense><P /></Suspense>; }
function P() {
  const { tr } = useT(); const act = useAct(); const role = usePrefs((s) => s.role); const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? ""); const [dist, setDist] = useState(""); const [tdone, setTdone] = useState(""); const [open, setOpen] = useState<Participant | null>(null); const [exp, setExp] = useState(false); const [fields, setFields] = useState<string[]>(["id", "name", "district"]);
  const data = useMock(["people"], () => { const d = getDb(); return { ps: d.participants.filter((p) => inScope(role, p)), gs: d.grievances, ledger: d.ledger, classes: d.classes, certs: d.certificates }; });
  const all = ["id", "name", "district", "gp", "cohort", "lmsProgress", "points"];
  return (<div className="space-y-4"><PageHeader title={tr("Participants", "ಭಾಗವಹಿಸುವವರು")} actions={<Button variant="secondary" onClick={() => setExp(true)}>{tr("Export (mock)", "ರಫ್ತು (ಮಾಕ್)")}</Button>} />
    <div className="grid gap-2 sm:grid-cols-4"><Input aria-label="Search" placeholder={tr("Name or ID", "ಹೆಸರು ಅಥವಾ ಐಡಿ")} value={q} onChange={(e) => setQ(e.target.value)} /><Select aria-label="District" value={dist} onChange={(e) => setDist(e.target.value)}><option value="">{tr("All districts", "ಎಲ್ಲಾ ಜಿಲ್ಲೆ")}</option>{districts.map((d) => <option key={d}>{d}</option>)}</Select><Select aria-label="Training" value={tdone} onChange={(e) => setTdone(e.target.value)}><option value="">{tr("Any training status", "ಯಾವುದೇ ತರಬೇತಿ ಸ್ಥಿತಿ")}</option><option value="y">{tr("Completed", "ಪೂರ್ಣ")}</option><option value="n">{tr("Not completed", "ಪೂರ್ಣವಲ್ಲ")}</option></Select></div>
    <QState q={data} isEmpty={(d) => d.ps.length === 0} empty={<Empty title={tr("No participants in your scope", "ನಿಮ್ಮ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಭಾಗವಹಿಸುವವರಿಲ್ಲ")} />}>{(d) => { const f = d.ps.filter((p) => (!q || (p.name + p.id).toLowerCase().includes(q.toLowerCase())) && (!dist || p.district === dist) && (!tdone || (tdone === "y") === p.trainingDone));
      return f.length === 0 ? <Empty title={tr("No matches", "ಹೊಂದಿಕೆ ಇಲ್ಲ")} /> : <Table head={[tr("Participant", "ಭಾಗವಹಿಸುವವರು"), tr("Location", "ಸ್ಥಳ"), tr("Training", "ತರಬೇತಿ"), "LMS", tr("Points", "ಅಂಕ"), ""]}>{f.map((p) => <tr key={p.id}><Td><b>{p.name}</b><p className="text-xs text-muted">{p.id} · {p.phoneMasked}</p></Td><Td>{p.gp}<p className="text-xs text-muted">{p.district}</p></Td><Td><Badge tone={p.trainingDone ? "success" : "warning"}>{p.trainingDone ? tr("Completed", "ಪೂರ್ಣ") : tr("Pending", "ಬಾಕಿ")}</Badge></Td><Td className="w-32"><Progress value={p.lmsProgress} label="LMS" /></Td><Td>{p.points}</Td><Td><Button size="sm" variant="secondary" onClick={() => setOpen(p)}>{tr("Profile", "ಪ್ರೊಫೈಲ್")}</Button></Td></tr>)}</Table>; }}</QState>
    <Modal open={!!open} onClose={() => setOpen(null)} title={open ? `${open.name} · ${open.id}` : ""}>{open && data.data && (() => { const d = data.data!; const cls = d.classes.find((c) => c.roster.includes(open.id)); return (<div className="space-y-3 text-sm"><p>{tr("Application", "ಅರ್ಜಿ")}: {open.appId}</p><p>{tr("Class", "ತರಗತಿ")}: {cls ? `${cls.name} · ${cls.attendance[open.id]?.join(" / ")}` : "—"}</p><p>LMS: {open.lmsProgress}%</p><p>{tr("Grievances handled", "ನಿರ್ವಹಿಸಿದ ದೂರುಗಳು")}: {d.gs.filter((g) => g.ownerId === open.id).length}</p><p>{tr("Points ledger entries", "ಅಂಕ ನಮೂದುಗಳು")}: {d.ledger.filter((l) => l.pid === open.id).length}</p><p className="text-xs text-muted">{tr("Phone and identity references are masked. Access is logged.", "ಫೋನ್ ಮತ್ತು ಗುರುತಿನ ಉಲ್ಲೇಖ ಮರೆಮಾಡಲಾಗಿದೆ. ಪ್ರವೇಶ ದಾಖಲಾಗುತ್ತದೆ.")}</p></div>); })()}</Modal>
    <Modal open={exp} onClose={() => setExp(false)} title={tr("Export participants (mock)", "ಭಾಗವಹಿಸುವವರ ರಫ್ತು (ಮಾಕ್)")} footer={<Button disabled={fields.length === 0} onClick={async () => { await act(() => api.report.exportCsv(`participants: ${fields.join(",")}`), tr("Export prepared (mock) and logged in audit", "ರಫ್ತು ಸಿದ್ಧ (ಮಾಕ್), ಆಡಿಟ್‌ನಲ್ಲಿ ದಾಖಲು")); setExp(false); }}>{tr("Confirm export", "ರಫ್ತು ದೃಢೀಕರಿಸಿ")}</Button>}><p className="text-sm text-muted">{tr("Choose only the fields you need. Sensitive fields (phone, identity) are not offered.", "ಅಗತ್ಯ ಕ್ಷೇತ್ರಗಳನ್ನು ಮಾತ್ರ ಆರಿಸಿ. ಸೂಕ್ಷ್ಮ ಕ್ಷೇತ್ರಗಳು (ಫೋನ್, ಗುರುತು) ಲಭ್ಯವಿಲ್ಲ.")}</p>{all.map((f) => <Check key={f} label={f} checked={fields.includes(f)} onChange={(e) => setFields(e.target.checked ? [...fields, f] : fields.filter((x) => x !== f))} />)}</Modal></div>);
}
void Card;
