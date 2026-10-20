"use client";
import { useState } from "react";
import { Printer } from "@phosphor-icons/react";
import { Badge, Button, Card, DemoNote, Empty, Modal, PageHeader, QState, Select } from "@/components/ui";
import { useMock } from "@/lib/api";
import { getDb } from "@/lib/db";
import { ME } from "@/lib/seed";
import { useT } from "@/lib/useT";
import type { Certificate } from "@/lib/types";
import type { Lang } from "@/lib/i18n";

export default function Certs() {
  const { tr, loc, lang } = useT(); const [sel, setSel] = useState<Certificate | null>(null); const [cl, setCl] = useState<Lang>(lang);
  const q = useMock(["certs"], () => { const d = getDb(); const me = d.participants.find((p) => p.id === ME)!; const pending = d.courses.filter((c) => d.enrolled.includes(c.id)).map((c) => ({ c, done: c.lessons.filter((l) => d.progress[l.id]?.done).length, total: c.lessons.length })).filter((x) => x.done < x.total); return { certs: d.certificates, pending, name: me.name }; });
  return (<div className="space-y-4"><PageHeader title={tr("Certificates", "ಪ್ರಮಾಣಪತ್ರಗಳು")} sub={tr("Issued only when the configured completion criteria are met.", "ನಿಗದಿತ ಪೂರ್ಣಗೊಳಿಕೆ ಮಾನದಂಡ ಪೂರೈಸಿದಾಗ ಮಾತ್ರ ನೀಡಲಾಗುತ್ತದೆ.")} />
    <QState q={q} isEmpty={(d) => d.certs.length === 0} empty={<Empty title={tr("No certificates yet", "ಇನ್ನೂ ಪ್ರಮಾಣಪತ್ರಗಳಿಲ್ಲ")} />}>{(d) => (<>
      <div className="grid gap-3 sm:grid-cols-2">{d.certs.map((c) => <Card key={c.id} className="space-y-2"><Badge tone="info">{c.kind}</Badge><p className="font-semibold">{loc(c.title)}</p><p className="text-xs text-muted">{c.id} · {c.issued}</p><Button variant="secondary" onClick={() => setSel(c)}>{tr("Preview / print", "ವೀಕ್ಷಿಸಿ / ಮುದ್ರಿಸಿ")}</Button></Card>)}</div>
      {d.pending.length > 0 && <Card><h2 className="font-bold">{tr("In progress — not yet issued", "ಪ್ರಗತಿಯಲ್ಲಿ — ಇನ್ನೂ ನೀಡಿಲ್ಲ")}</h2><ul className="mt-1 text-sm text-muted">{d.pending.map((p) => <li key={p.c.id}>{loc(p.c.title)}: {p.done}/{p.total}</li>)}</ul></Card>}
      <Modal open={!!sel} onClose={() => setSel(null)} title={tr("Certificate preview", "ಪ್ರಮಾಣಪತ್ರ ವೀಕ್ಷಣೆ")} footer={<><Select aria-label="Certificate language" className="w-36" value={cl} onChange={(e) => setCl(e.target.value as Lang)}><option value="kn">ಕನ್ನಡ</option><option value="en">English</option></Select><Button onClick={() => window.print()}><Printer />{tr("Print / Save as PDF", "ಮುದ್ರಿಸಿ / PDF")}</Button></>}>
        {sel && <div id="cert" className="rounded-xl border-4 border-double border-forest bg-white p-6 text-center text-[#14251F]"><p className="text-xs tracking-widest text-[#116149]">GRAMA NAYAKA · ಗ್ರಾಮ ನಾಯಕ</p><p className="mt-3 text-sm">{cl === "kn" ? "ಈ ಮೂಲಕ ಪ್ರಮಾಣೀಕರಿಸಲಾಗಿದೆ" : "This certifies that"}</p><p className="my-2 text-2xl font-bold">{d.name}</p><p className="text-sm">{cl === "kn" ? "ಪೂರ್ಣಗೊಳಿಸಿದ್ದಾರೆ" : "has completed"}</p><p className="my-2 text-lg font-semibold text-[#116149]">{sel.title[cl]}</p><p className="text-xs">{sel.issued} · {sel.id}</p><p className="mt-4 rounded bg-[#E8892E]/20 px-2 py-1 text-[11px]">{cl === "kn" ? "ಮಾದರಿ ಪ್ರಮಾಣಪತ್ರ — ಡೆಮೊ ಮಾತ್ರ; ಅಧಿಕೃತ ಪ್ರಮಾಣಪತ್ರವಲ್ಲ" : "SAMPLE certificate — demo only, not an official credential"}</p></div>}</Modal></>)}</QState>
    <DemoNote>{tr("All certificates are labelled as samples in this prototype.", "ಈ ಮಾದರಿಯಲ್ಲಿ ಎಲ್ಲಾ ಪ್ರಮಾಣಪತ್ರಗಳು ಮಾದರಿ ಎಂದು ಗುರುತಿಸಲ್ಪಟ್ಟಿವೆ.")}</DemoNote></div>);
}
