"use client";
import Link from "next/link";
import { useState } from "react";
import { Badge, Card, Empty, Input, QState, Select } from "@/components/ui";
import { ResourceThumb, typeLabel } from "@/components/ResourceViewer";
import { useMock } from "@/lib/api";
import { getDb } from "@/lib/db";
import { RESOURCE_TYPES, visibleTo } from "@/lib/resourceRules";
import { today } from "@/lib/derive";
import { useT } from "@/lib/useT";
import { cn } from "@/lib/utils";

/** Published resources targeted at volunteers. Draft, archived and not-yet-due items never appear here. */
export function ResourceLibrary() {
  const { tr, lang, loc } = useT(); const [q, setQ] = useState(""); const [cat, setCat] = useState(""); const [type, setType] = useState("");
  const data = useMock(["library"], () => { const d = getDb(); return { rs: d.resources.filter((r) => visibleTo(r, "volunteers", today)).sort((a, b) => a.order - b.order), cats: [...d.resourceCategories].sort((a, b) => a.order - b.order) }; });
  return (
    <QState q={data} isEmpty={(d) => d.rs.length === 0} empty={<Empty title={tr("No resources published yet", "ಇನ್ನೂ ಸಂಪನ್ಮೂಲಗಳನ್ನು ಪ್ರಕಟಿಸಿಲ್ಲ")} hint={tr("Videos, PDFs and links will appear here when your programme team publishes them.", "ನಿಮ್ಮ ಕಾರ್ಯಕ್ರಮ ತಂಡ ಪ್ರಕಟಿಸಿದಾಗ ವೀಡಿಯೋ, PDF ಮತ್ತು ಲಿಂಕ್‌ಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.")} />}>{(d) => {
      const used = d.cats.filter((c) => d.rs.some((r) => r.categoryId === c.id)); const list = d.rs.filter((r) => (!cat || r.categoryId === cat) && (!type || r.type === type) && (!q || (r.title + r.topic + r.short).toLowerCase().includes(q.toLowerCase())));
      return (<div className="space-y-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label={tr("Categories", "ವರ್ಗಗಳು")}>{[{ id: "", n: tr("All", "ಎಲ್ಲಾ") }, ...used.map((c) => ({ id: c.id, n: loc(c.name) }))].map((c) => <button key={c.id} type="button" aria-pressed={cat === c.id} onClick={() => setCat(c.id)} className={cn("rounded-full border px-3 py-1.5 text-sm font-medium", cat === c.id ? "border-transparent bg-primary text-primary-fg" : "border-border bg-card")}>{c.n}</button>)}</div>
        <div className="grid gap-2 sm:grid-cols-3"><Input aria-label="Search resources" placeholder={tr("Search resources", "ಸಂಪನ್ಮೂಲ ಹುಡುಕಿ")} value={q} onChange={(e) => setQ(e.target.value)} className="sm:col-span-2" /><Select aria-label="Type" value={type} onChange={(e) => setType(e.target.value)}><option value="">{tr("All types", "ಎಲ್ಲಾ ವಿಧ")}</option>{RESOURCE_TYPES.map((t) => <option key={t.id} value={t.id}>{t[lang]}</option>)}</Select></div>
        {list.length === 0 ? <Empty title={tr("Nothing matches", "ಏನೂ ಹೊಂದಿಕೆಯಾಗಿಲ್ಲ")} /> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((r) => (
          <Link key={r.id} href={`/app/learning/resources/${r.id}`}><Card className="flex h-full flex-col gap-3 p-4 transition hover:-translate-y-1 hover:border-primary hover:shadow-lg"><ResourceThumb r={r} className="aspect-video w-full" />
            <div className="flex flex-wrap gap-1"><Badge tone="info">{typeLabel(r.type, lang)}</Badge><Badge>{r.language === "both" ? "ಕನ್ನಡ + English" : r.language === "kn" ? "ಕನ್ನಡ" : "English"}</Badge></div>
            <h2 className="font-bold">{r.title}</h2><p className="text-sm text-muted">{r.short}</p><p className="mt-auto text-xs text-muted">{loc(d.cats.find((c) => c.id === r.categoryId)?.name ?? { en: "", kn: "" })} · {r.topic}</p></Card></Link>))}</div>}
      </div>);
    }}</QState>
  );
}
