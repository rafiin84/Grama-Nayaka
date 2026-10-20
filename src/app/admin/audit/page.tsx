"use client";
import { useState } from "react";
import { Badge, Empty, Input, Modal, PageHeader, QState, Select, Table, Td } from "@/components/ui";
import { useMock } from "@/lib/api";
import { getDb } from "@/lib/db";
import { useT } from "@/lib/useT";
import type { AuditEntry } from "@/lib/types";

export default function Audit() {
  const { tr } = useT(); const [actor, setActor] = useState(""); const [action, setAction] = useState(""); const [rt, setRt] = useState(""); const [from, setFrom] = useState(""); const [sel, setSel] = useState<AuditEntry | null>(null);
  const q = useMock(["audit"], () => getDb().audit);
  const mask = (s?: string) => (s ?? "—").replace(/\b[A-Z]{3}••••\d{3}\b/g, "•••").replace(/\+91 [\d•X-]+/g, "+91 ••••");
  return (<div className="space-y-4"><PageHeader title={tr("Audit Log", "ಆಡಿಟ್ ಲಾಗ್")} sub={tr("Append-only in this demo: entries cannot be edited or deleted. Sensitive values are masked.", "ಈ ಡೆಮೊದಲ್ಲಿ ಸೇರಿಸಲು ಮಾತ್ರ: ನಮೂದುಗಳನ್ನು ತಿದ್ದಲು ಅಥವಾ ಅಳಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ. ಸೂಕ್ಷ್ಮ ಮೌಲ್ಯಗಳು ಮರೆಮಾಡಲಾಗಿದೆ.")} />
    <QState q={q} isEmpty={(d) => d.length === 0} empty={<Empty title={tr("No entries", "ನಮೂದುಗಳಿಲ್ಲ")} />}>{(all) => { const f = all.filter((a) => (!actor || a.actor.toLowerCase().includes(actor.toLowerCase())) && (!action || a.action === action) && (!rt || a.resourceType === rt) && (!from || a.at.slice(0, 10) >= from));
      return (<><div className="grid gap-2 sm:grid-cols-4"><Input aria-label="Actor" placeholder={tr("Actor", "ಕರ್ತೃ")} value={actor} onChange={(e) => setActor(e.target.value)} /><Select aria-label="Action" value={action} onChange={(e) => setAction(e.target.value)}><option value="">{tr("All actions", "ಎಲ್ಲಾ ಕ್ರಿಯೆ")}</option>{[...new Set(all.map((a) => a.action))].map((a) => <option key={a}>{a}</option>)}</Select><Select aria-label="Resource" value={rt} onChange={(e) => setRt(e.target.value)}><option value="">{tr("All resources", "ಎಲ್ಲಾ ಸಂಪನ್ಮೂಲ")}</option>{[...new Set(all.map((a) => a.resourceType))].map((a) => <option key={a}>{a}</option>)}</Select><Input aria-label="From date" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        {f.length === 0 ? <Empty title={tr("No matching entries", "ಹೊಂದುವ ನಮೂದುಗಳಿಲ್ಲ")} /> : <Table head={[tr("Time", "ಸಮಯ"), tr("Actor", "ಕರ್ತೃ"), tr("Action", "ಕ್ರಿಯೆ"), tr("Resource", "ಸಂಪನ್ಮೂಲ"), ""]}>{f.map((a) => <tr key={a.id}><Td>{a.at}</Td><Td>{a.actor}<p className="text-xs text-muted">{a.role}</p></Td><Td><Badge>{a.action}</Badge></Td><Td>{a.resourceType} · {a.resourceId}</Td><Td><button className="text-primary underline" onClick={() => setSel(a)}>{tr("Details", "ವಿವರ")}</button></Td></tr>)}</Table>}</>); }}</QState>
    <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.action ?? ""}>{sel && <dl className="space-y-2 text-sm"><div><dt className="text-muted">Timestamp</dt><dd>{sel.at}</dd></div><div><dt className="text-muted">Actor / role</dt><dd>{sel.actor} · {sel.role}</dd></div><div><dt className="text-muted">Resource</dt><dd>{sel.resourceType} · {sel.resourceId}</dd></div><div><dt className="text-muted">Before</dt><dd>{mask(sel.before)}</dd></div><div><dt className="text-muted">After</dt><dd>{mask(sel.after)}</dd></div><p className="text-xs text-muted">{tr("Read-only.", "ಓದಲು ಮಾತ್ರ.")}</p></dl>}</Modal></div>);
}
