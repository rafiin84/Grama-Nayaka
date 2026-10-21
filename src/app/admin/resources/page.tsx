"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowUp, Plus } from "@phosphor-icons/react";
import { Badge, Button, Card, Confirm, Empty, Field, Input, Modal, PageHeader, QState, Select, Table, Tabs, Td, statusTone } from "@/components/ui";
import { ResourceThumb, typeLabel } from "@/components/ResourceViewer";
import { api, useAct, useMock } from "@/lib/api";
import { getDb } from "@/lib/db";
import { RESOURCE_TYPES, AUDIENCES } from "@/lib/resourceRules";
import { useCan } from "@/lib/useCan";
import { useT } from "@/lib/useT";
import { cn } from "@/lib/utils";
import type { ResourceStatus } from "@/lib/types";

const stTone = (s: ResourceStatus) => statusTone(s === "Published" ? "Published" : s === "Draft" ? "Draft" : s === "Scheduled" ? "Pending" : "Withdrawn");
export default function ResourcesAdmin() {
  const { tr, lang, loc } = useT(); const act = useAct(); const { can } = useCan(); const [tab, setTab] = useState<"list" | "cats">("list");
  const [f, setF] = useState({ q: "", cat: "", type: "", status: "", lang: "", aud: "" }); const [sel, setSel] = useState<string[]>([]); const [bulk, setBulk] = useState<null | "cat" | "delete">(null); const [bcat, setBcat] = useState(""); const [report, setReport] = useState<string | null>(null);
  const [catDlg, setCatDlg] = useState<{ id?: string; en: string; kn: string } | null>(null); const [catDel, setCatDel] = useState<string | null>(null);
  const q = useMock(["resources"], () => { const d = getDb(); return { rs: [...d.resources].sort((a, b) => a.order - b.order), cats: [...d.resourceCategories].sort((a, b) => a.order - b.order) }; });
  return (
    <div className="space-y-4">
      <PageHeader title={tr("Learning Resources", "ಕಲಿಕಾ ಸಂಪನ್ಮೂಲಗಳು")} sub={tr("Videos, PDFs, documents and links for volunteers. Save as a draft, then publish.", "ಸ್ವಯಂಸೇವಕರಿಗಾಗಿ ವೀಡಿಯೋ, PDF, ದಾಖಲೆ ಮತ್ತು ಲಿಂಕ್‌ಗಳು. ಕರಡಾಗಿ ಉಳಿಸಿ, ನಂತರ ಪ್ರಕಟಿಸಿ.")} actions={can("resources", "create") && <Link href="/admin/resources/new"><Button><Plus />{tr("Add resource", "ಸಂಪನ್ಮೂಲ ಸೇರಿಸಿ")}</Button></Link>} />
      <Tabs tabs={[{ id: "list", label: tr("Resources", "ಸಂಪನ್ಮೂಲಗಳು") }, { id: "cats", label: tr("Categories", "ವರ್ಗಗಳು") }]} value={tab} onChange={setTab} />
      <QState q={q} isEmpty={(d) => d.rs.length === 0 && tab === "list"} empty={<Empty title={tr("No resources yet", "ಇನ್ನೂ ಸಂಪನ್ಮೂಲಗಳಿಲ್ಲ")} hint={tr("Add the first video, PDF, document or link.", "ಮೊದಲ ವೀಡಿಯೋ, PDF, ದಾಖಲೆ ಅಥವಾ ಲಿಂಕ್ ಸೇರಿಸಿ.")} action={can("resources", "create") ? <Link href="/admin/resources/new"><Button>{tr("Add resource", "ಸಂಪನ್ಮೂಲ ಸೇರಿಸಿ")}</Button></Link> : undefined} />}>{(d) => {
        const catName = (id: string) => { const c = d.cats.find((x) => x.id === id); return c ? loc(c.name) : "—"; };
        if (tab === "cats") return (<>
          <div className="flex justify-end">{can("resources", "edit") && <Button onClick={() => setCatDlg({ en: "", kn: "" })}><Plus />{tr("Add category", "ವರ್ಗ ಸೇರಿಸಿ")}</Button>}</div>
          {d.cats.length === 0 ? <Empty title={tr("No categories", "ವರ್ಗಗಳಿಲ್ಲ")} /> : <Table head={[tr("Category", "ವರ್ಗ"), tr("Resources", "ಸಂಪನ್ಮೂಲ"), tr("Order", "ಕ್ರಮ"), ""]}>{d.cats.map((c, i) => { const n = d.rs.filter((r) => r.categoryId === c.id).length; return (
            <tr key={c.id}><Td><b>{c.name.en}</b><p className="text-xs text-muted">{c.name.kn || tr("(no Kannada name)", "(ಕನ್ನಡ ಹೆಸರಿಲ್ಲ)")}</p></Td><Td>{n}</Td>
              <Td><div className="flex gap-1"><Button size="sm" variant="ghost" aria-label="Move up" disabled={i === 0} onClick={() => act(() => api.categories.move(c.id, -1))}><ArrowUp size={16} /></Button><Button size="sm" variant="ghost" aria-label="Move down" disabled={i === d.cats.length - 1} onClick={() => act(() => api.categories.move(c.id, 1))}><ArrowDown size={16} /></Button></div></Td>
              <Td>{can("resources", "edit") && <div className="flex gap-1"><Button size="sm" variant="secondary" onClick={() => setCatDlg({ id: c.id, en: c.name.en, kn: c.name.kn })}>{tr("Rename", "ಮರುಹೆಸರಿಸಿ")}</Button><Button size="sm" variant="danger" onClick={() => setCatDel(c.id)}>{tr("Delete", "ಅಳಿಸಿ")}</Button></div>}</Td></tr>); })}</Table>}
          <Modal open={!!catDlg} onClose={() => setCatDlg(null)} title={catDlg?.id ? tr("Rename category", "ವರ್ಗ ಮರುಹೆಸರಿಸಿ") : tr("Add category", "ವರ್ಗ ಸೇರಿಸಿ")} footer={<Button onClick={async () => { const x = catDlg!; const r = await act(() => (x.id ? api.categories.rename(x.id, x.en, x.kn) : api.categories.add(x.en, x.kn)), tr("Category saved", "ವರ್ಗ ಉಳಿಸಲಾಗಿದೆ")); if (r !== undefined) setCatDlg(null); }}>{tr("Save", "ಉಳಿಸಿ")}</Button>}>
            {catDlg && <><Field label="Name (English)" required>{(i) => <Input id={i} value={catDlg.en} onChange={(e) => setCatDlg({ ...catDlg, en: e.target.value })} />}</Field><Field label="ಹೆಸರು (ಕನ್ನಡ)">{(i) => <Input id={i} value={catDlg.kn} onChange={(e) => setCatDlg({ ...catDlg, kn: e.target.value })} />}</Field></>}</Modal>
          <Confirm open={!!catDel} onClose={() => setCatDel(null)} danger onConfirm={async () => { const r = await act(() => api.categories.remove(catDel!), tr("Category deleted", "ವರ್ಗ ಅಳಿಸಲಾಗಿದೆ")); if (r !== undefined) setCatDel(null); }} title={tr("Delete this category?", "ಈ ವರ್ಗ ಅಳಿಸುವಿರಾ?")} confirmLabel={tr("Delete", "ಅಳಿಸಿ")} body={tr("A category that still has resources cannot be deleted. Move or delete those first.", "ಇನ್ನೂ ಸಂಪನ್ಮೂಲಗಳಿರುವ ವರ್ಗ ಅಳಿಸಲಾಗದು. ಮೊದಲು ಅವನ್ನು ಸರಿಸಿ ಅಥವಾ ಅಳಿಸಿ.")} /></>);
        const list = d.rs.filter((r) => (!f.q || (r.title + r.topic + r.short).toLowerCase().includes(f.q.toLowerCase())) && (!f.cat || r.categoryId === f.cat) && (!f.type || r.type === f.type) && (!f.status || r.status === f.status) && (!f.lang || r.language === f.lang) && (!f.aud || r.audience.includes(f.aud as "volunteers")));
        const allOn = list.length > 0 && list.every((r) => sel.includes(r.id));
        const runBulk = async (fn: () => { done: number; skipped?: { id: string; reason: string }[] }) => { const r = await act(fn); if (r) { setReport(r.skipped?.length ? `${r.done} ${tr("done", "ಪೂರ್ಣ")}. ${r.skipped.map((s) => `${d.rs.find((x) => x.id === s.id)?.title ?? s.id}: ${s.reason}`).join(" · ")}` : null); setSel([]); setBulk(null); } };
        return (<>
          <Card className="grid gap-2 p-4 sm:grid-cols-3 lg:grid-cols-6">
            <Input aria-label="Search" placeholder={tr("Search title or topic", "ಶೀರ್ಷಿಕೆ ಅಥವಾ ವಿಷಯ ಹುಡುಕಿ")} value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} className="lg:col-span-2" />
            <Select aria-label="Category" value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value })}><option value="">{tr("All categories", "ಎಲ್ಲಾ ವರ್ಗ")}</option>{d.cats.map((c) => <option key={c.id} value={c.id}>{loc(c.name)}</option>)}</Select>
            <Select aria-label="Type" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option value="">{tr("All types", "ಎಲ್ಲಾ ವಿಧ")}</option>{RESOURCE_TYPES.map((t) => <option key={t.id} value={t.id}>{t[lang]}</option>)}</Select>
            <Select aria-label="Status" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="">{tr("All statuses", "ಎಲ್ಲಾ ಸ್ಥಿತಿ")}</option>{["Draft", "Published", "Scheduled", "Archived"].map((s) => <option key={s}>{s}</option>)}</Select>
            <Select aria-label="Audience" value={f.aud} onChange={(e) => setF({ ...f, aud: e.target.value })}><option value="">{tr("Any audience", "ಯಾವುದೇ ಪ್ರೇಕ್ಷಕ")}</option>{AUDIENCES.map((a) => <option key={a.id} value={a.id}>{a[lang]}</option>)}</Select>
            {Object.values(f).some(Boolean) && <Button variant="ghost" size="sm" onClick={() => setF({ q: "", cat: "", type: "", status: "", lang: "", aud: "" })}>{tr("Reset", "ಮರುಹೊಂದಿಸಿ")}</Button>}
          </Card>
          {sel.length > 0 && <Card className="flex flex-wrap items-center gap-2 border-primary/40 bg-accent-soft p-3" role="region" aria-label="Bulk actions"><b className="mr-2 text-sm">{sel.length} {tr("selected", "ಆಯ್ಕೆ")}</b>
            {can("resources", "edit") && <><Button size="sm" onClick={() => runBulk(() => api.resources.bulkStatus(sel, "Published"))}>{tr("Publish", "ಪ್ರಕಟಿಸಿ")}</Button><Button size="sm" variant="secondary" onClick={() => runBulk(() => api.resources.bulkStatus(sel, "Archived"))}>{tr("Archive", "ಆರ್ಕೈವ್")}</Button><Button size="sm" variant="secondary" onClick={() => { setBcat(d.cats[0]?.id ?? ""); setBulk("cat"); }}>{tr("Move to category…", "ವರ್ಗಕ್ಕೆ ಸರಿಸಿ…")}</Button></>}
            {can("resources", "delete") && <Button size="sm" variant="danger" onClick={() => setBulk("delete")}>{tr("Delete…", "ಅಳಿಸಿ…")}</Button>}<Button size="sm" variant="ghost" onClick={() => setSel([])}>{tr("Clear", "ತೆರವುಗೊಳಿಸಿ")}</Button></Card>}
          {report && <Card className="border-warning/50 text-sm" role="status">{report}</Card>}
          {list.length === 0 ? <Empty title={tr("No resources match your filters", "ಫಿಲ್ಟರ್‌ಗೆ ಹೊಂದುವ ಸಂಪನ್ಮೂಲಗಳಿಲ್ಲ")} /> : <Table head={[" ", tr("Resource", "ಸಂಪನ್ಮೂಲ"), tr("Category", "ವರ್ಗ"), tr("Type", "ವಿಧ"), tr("Status", "ಸ್ಥಿತಿ"), tr("Order", "ಕ್ರಮ"), ""]}>{list.map((r) => (
            <tr key={r.id} className={cn(sel.includes(r.id) && "bg-accent-soft/60")}>
              <Td><input type="checkbox" aria-label={`Select ${r.title}`} checked={sel.includes(r.id)} onChange={(e) => setSel(e.target.checked ? [...sel, r.id] : sel.filter((x) => x !== r.id))} className="h-4 w-4 accent-[var(--primary)]" /></Td>
              <Td><div className="flex items-start gap-3"><ResourceThumb r={r} className="h-12 w-20 shrink-0" /><div className="min-w-0"><Link href={`/admin/resources/${r.id}`} className="font-semibold text-primary hover:underline">{r.title}</Link><p className="text-xs text-muted">{r.id} · {r.topic} · {r.language === "both" ? "ಕನ್ನಡ + EN" : r.language === "kn" ? "ಕನ್ನಡ" : "EN"}</p></div></div></Td>
              <Td>{catName(r.categoryId)}</Td><Td>{typeLabel(r.type, lang)}</Td>
              <Td><Badge tone={stTone(r.status)}>{r.status}</Badge>{r.publishDate && <p className="mt-1 text-xs text-muted">{r.publishDate}</p>}</Td><Td>{r.order}</Td>
              <Td><div className="flex gap-1"><Link href={`/admin/resources/${r.id}`}><Button size="sm" variant="secondary">{tr("View", "ನೋಡಿ")}</Button></Link>{can("resources", "edit") && <Link href={`/admin/resources/${r.id}/edit`}><Button size="sm" variant="secondary">{tr("Edit", "ತಿದ್ದಿ")}</Button></Link>}</div></Td></tr>))}</Table>}
          {list.length > 0 && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={allOn} onChange={(e) => setSel(e.target.checked ? [...new Set([...sel, ...list.map((r) => r.id)])] : sel.filter((x) => !list.some((r) => r.id === x)))} className="h-4 w-4 accent-[var(--primary)]" />{tr(`Select all ${list.length} shown`, `ತೋರಿಸಿದ ಎಲ್ಲಾ ${list.length} ಆಯ್ಕೆಮಾಡಿ`)}</label>}
          <Modal open={bulk === "cat"} onClose={() => setBulk(null)} title={tr(`Move ${sel.length} resource(s)`, `${sel.length} ಸಂಪನ್ಮೂಲ ಸರಿಸಿ`)} footer={<Button onClick={() => runBulk(() => { api.resources.bulkCategory(sel, bcat); return { done: sel.length }; })}>{tr("Move", "ಸರಿಸಿ")}</Button>}><Select aria-label="Category" value={bcat} onChange={(e) => setBcat(e.target.value)}>{d.cats.map((c) => <option key={c.id} value={c.id}>{loc(c.name)}</option>)}</Select></Modal>
          <Confirm open={bulk === "delete"} onClose={() => setBulk(null)} danger onConfirm={() => runBulk(() => api.resources.bulkDelete(sel))} title={tr(`Delete ${sel.length} resource(s)?`, `${sel.length} ಸಂಪನ್ಮೂಲ ಅಳಿಸುವಿರಾ?`)} confirmLabel={tr("Delete", "ಅಳಿಸಿ")} body={tr("Uploaded files are removed too. Consider archiving instead.", "ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಫೈಲ್‌ಗಳನ್ನೂ ತೆಗೆಯಲಾಗುತ್ತದೆ. ಬದಲಿಗೆ ಆರ್ಕೈವ್ ಮಾಡುವುದನ್ನು ಪರಿಗಣಿಸಿ.")} /></>);
      }}</QState>
    </div>
  );
}
