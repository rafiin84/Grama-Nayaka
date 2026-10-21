"use client";
import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { Badge, Button, Card, Check, Confirm, Empty, Field, Input, Modal, PageHeader, QState, Select, Table, Td } from "@/components/ui";
import { api, useAct, useMock } from "@/lib/api";
import { getDb, inScope } from "@/lib/db";
import { downloadText, toCsv } from "@/lib/csv";
import { districts, gpOptions, talukOptions } from "@/lib/geo";
import { useCan } from "@/lib/useCan";
import { usePrefs } from "@/lib/store";
import { useT } from "@/lib/useT";
import type { Village } from "@/lib/types";

type Form = { id?: string; name: string; district: string; taluk: string; gp: string; population: string; status: Village["status"]; err?: string };
const blank: Form = { name: "", district: "", taluk: "", gp: "", population: "", status: "Pending" };
const tone = (s: Village["status"]) => (s === "Enrolled" ? "success" : s === "Pending" ? "warning" : "neutral");

export default function VillagesPage() {
  const { tr } = useT(); const act = useAct(); const { can } = useCan(); const role = usePrefs((s) => s.role);
  const [f, setF] = useState({ q: "", status: "", district: "", taluk: "", gp: "" }); const [form, setForm] = useState<Form | null>(null); const [assign, setAssign] = useState<Village | null>(null); const [pick, setPick] = useState<string[]>([]); const [del, setDel] = useState<Village | null>(null);
  const q = useMock(["villages"], () => { const d = getDb(); return { villages: d.villages.filter((v) => inScope(role, v)), ps: d.participants }; });
  return (
    <div className="space-y-4">
      <PageHeader title={tr("Village Enrollment", "ಗ್ರಾಮ ನೋಂದಣಿ")} sub={tr("Register villages under a Gram Panchayat, keep their details current and assign volunteers.", "ಗ್ರಾಮ ಪಂಚಾಯತ್ ಅಡಿಯಲ್ಲಿ ಗ್ರಾಮಗಳನ್ನು ನೋಂದಾಯಿಸಿ, ವಿವರ ನವೀಕರಿಸಿ ಮತ್ತು ಸ್ವಯಂಸೇವಕರನ್ನು ನಿಯೋಜಿಸಿ.")}
        actions={<>{can("villages", "export") && <Button variant="secondary" onClick={() => { const rows = (q.data?.villages ?? []).map((v) => [v.id, v.name, v.gp, v.taluk, v.district, v.status, v.enrolledOn ?? "", v.volunteerIds.length]); downloadText("villages.csv", toCsv(["id", "village", "gp", "block", "district", "status", "enrolled_on", "volunteers"], rows)); act(() => api.report.exportCsv("villages"), tr("Exported", "ರಫ್ತು ಮಾಡಲಾಗಿದೆ")); }}>{tr("Export CSV", "CSV ರಫ್ತು")}</Button>}{can("villages", "create") && <Button onClick={() => setForm(blank)}><Plus />{tr("Add village", "ಗ್ರಾಮ ಸೇರಿಸಿ")}</Button>}</>} />
      <QState q={q} isEmpty={(d) => d.villages.length === 0} empty={<Empty title={tr("No villages in your scope yet", "ನಿಮ್ಮ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಇನ್ನೂ ಗ್ರಾಮಗಳಿಲ್ಲ")} action={can("villages", "create") ? <Button onClick={() => setForm(blank)}>{tr("Add village", "ಗ್ರಾಮ ಸೇರಿಸಿ")}</Button> : undefined} />}>{(d) => {
        const list = d.villages.filter((v) => (!f.q || (v.name + v.gp).toLowerCase().includes(f.q.toLowerCase())) && (!f.status || v.status === f.status) && (!f.district || v.district === f.district) && (!f.taluk || v.taluk === f.taluk) && (!f.gp || v.gp === f.gp));
        const n = (s: Village["status"]) => d.villages.filter((v) => v.status === s).length;
        return (<>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[[tr("Villages on record", "ದಾಖಲಾದ ಗ್ರಾಮಗಳು"), d.villages.length], [tr("Enrolled", "ನೋಂದಾಯಿತ"), n("Enrolled")], [tr("Pending enrollment", "ನೋಂದಣಿ ಬಾಕಿ"), n("Pending")], [tr("Volunteers assigned", "ನಿಯೋಜಿತ ಸ್ವಯಂಸೇವಕರು"), d.villages.reduce((a, v) => a + v.volunteerIds.length, 0)]].map(([l, c]) => <div key={String(l)} className="rounded-2xl border border-primary/20 bg-accent-soft p-4"><p className="text-sm text-muted">{l}</p><p className="mt-1 text-2xl font-bold text-primary">{c}</p></div>)}</div>
          <Card className="grid gap-2 p-4 sm:grid-cols-5">
            <Input aria-label="Search" placeholder={tr("Village or Gram Panchayat", "ಗ್ರಾಮ ಅಥವಾ ಗ್ರಾಮ ಪಂಚಾಯತ್")} value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
            <Select aria-label="Status" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="">{tr("All statuses", "ಎಲ್ಲಾ ಸ್ಥಿತಿ")}</option>{["Enrolled", "Pending", "Inactive"].map((s) => <option key={s}>{s}</option>)}</Select>
            <Select aria-label="District" value={f.district} onChange={(e) => setF({ ...f, district: e.target.value, taluk: "", gp: "" })}><option value="">{tr("All districts", "ಎಲ್ಲಾ ಜಿಲ್ಲೆ")}</option>{districts.map((x) => <option key={x}>{x}</option>)}</Select>
            <Select aria-label="Block" value={f.taluk} onChange={(e) => setF({ ...f, taluk: e.target.value, gp: "" })}><option value="">{tr("All blocks", "ಎಲ್ಲಾ ಬ್ಲಾಕ್")}</option>{talukOptions(f.district).map((x) => <option key={x}>{x}</option>)}</Select>
            <Select aria-label="Gram Panchayat" value={f.gp} onChange={(e) => setF({ ...f, gp: e.target.value })}><option value="">{tr("All Gram Panchayats", "ಎಲ್ಲಾ ಗ್ರಾಮ ಪಂಚಾಯತ್")}</option>{gpOptions(f.taluk).map((x) => <option key={x}>{x}</option>)}</Select>
          </Card>
          {list.length === 0 ? <Empty title={tr("No villages match", "ಹೊಂದುವ ಗ್ರಾಮಗಳಿಲ್ಲ")} /> :
            <Table head={[tr("Village", "ಗ್ರಾಮ"), tr("Gram Panchayat / block", "ಗ್ರಾಮ ಪಂಚಾಯತ್ / ಬ್ಲಾಕ್"), tr("Status", "ಸ್ಥಿತಿ"), tr("Volunteers", "ಸ್ವಯಂಸೇವಕರು"), ""]}>{list.map((v) => (
              <tr key={v.id}><Td><b>{v.name}</b><p className="text-xs text-muted">{v.id}{v.population ? ` · ${tr("pop.", "ಜನಸಂಖ್ಯೆ")} ${v.population.toLocaleString("en-IN")}` : ""}</p></Td><Td>{v.gp}<p className="text-xs text-muted">{v.taluk}, {v.district}</p></Td>
                <Td><Badge tone={tone(v.status)}>{v.status}</Badge>{v.enrolledOn && <p className="mt-1 text-xs text-muted">{v.enrolledOn}</p>}</Td>
                <Td>{v.volunteerIds.length === 0 ? <span className="text-muted">—</span> : v.volunteerIds.map((id) => d.ps.find((p) => p.id === id)?.name ?? id).join(", ")}</Td>
                <Td><div className="flex flex-wrap gap-1">
                  {can("villages", "edit") && <><Button size="sm" variant="secondary" onClick={() => setForm({ id: v.id, name: v.name, district: v.district, taluk: v.taluk, gp: v.gp, population: v.population ? String(v.population) : "", status: v.status })}>{tr("Edit", "ತಿದ್ದಿ")}</Button><Button size="sm" variant="secondary" onClick={() => { setAssign(v); setPick(v.volunteerIds); }}>{tr("Volunteers", "ಸ್ವಯಂಸೇವಕರು")}</Button>
                    {v.status !== "Enrolled" && <Button size="sm" onClick={() => act(() => api.villages.update(v.id, { status: "Enrolled" }), tr("Village enrolled", "ಗ್ರಾಮ ನೋಂದಾಯಿಸಲಾಗಿದೆ"))}>{tr("Enroll", "ನೋಂದಾಯಿಸಿ")}</Button>}
                    {v.status !== "Inactive" && <Button size="sm" variant="ghost" onClick={() => act(() => api.villages.update(v.id, { status: "Inactive" }), tr("Village archived (Inactive)", "ಗ್ರಾಮ ಆರ್ಕೈವ್ (ನಿಷ್ಕ್ರಿಯ)"))}>{tr("Archive", "ಆರ್ಕೈವ್")}</Button>}</>}
                  {can("villages", "delete") && <Button size="sm" variant="danger" onClick={() => setDel(v)}>{tr("Delete", "ಅಳಿಸಿ")}</Button>}</div></Td></tr>))}</Table>}

          <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? tr("Edit village", "ಗ್ರಾಮ ತಿದ್ದಿ") : tr("Add village", "ಗ್ರಾಮ ಸೇರಿಸಿ")} footer={<Button onClick={async () => { const x = form!; const pop = x.population ? Number(x.population) : undefined; if (pop !== undefined && (!Number.isFinite(pop) || pop < 0)) return setForm({ ...x, err: tr("Population must be a positive number", "ಜನಸಂಖ್ಯೆ ಧನಾತ್ಮಕ ಸಂಖ್ಯೆ ಆಗಿರಬೇಕು") }); const r = await act(() => (x.id ? api.villages.update(x.id, { name: x.name, population: pop, status: x.status }) : api.villages.add({ name: x.name, gp: x.gp, taluk: x.taluk, district: x.district, population: pop, status: x.status })), x.id ? tr("Village updated", "ಗ್ರಾಮ ನವೀಕರಿಸಲಾಗಿದೆ") : tr("Village added", "ಗ್ರಾಮ ಸೇರಿಸಲಾಗಿದೆ")); if (r !== undefined || x.id) setForm(null); }}>{tr("Save", "ಉಳಿಸಿ")}</Button>}>
            {form && <>
              <Field label={tr("Village name", "ಗ್ರಾಮದ ಹೆಸರು")} required>{(i) => <Input id={i} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}</Field>
              <div className="grid gap-2 sm:grid-cols-3"><Field label={tr("District", "ಜಿಲ್ಲೆ")} required>{(i) => <Select id={i} disabled={!!form.id} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value, taluk: "", gp: "" })}><option value="">—</option>{districts.map((x) => <option key={x}>{x}</option>)}</Select>}</Field>
                <Field label={tr("Block / taluk", "ಬ್ಲಾಕ್ / ತಾಲ್ಲೂಕು")} required>{(i) => <Select id={i} disabled={!!form.id || !form.district} value={form.taluk} onChange={(e) => setForm({ ...form, taluk: e.target.value, gp: "" })}><option value="">—</option>{talukOptions(form.district).map((x) => <option key={x}>{x}</option>)}</Select>}</Field>
                <Field label="Gram Panchayat" required>{(i) => <Select id={i} disabled={!!form.id || !form.taluk} value={form.gp} onChange={(e) => setForm({ ...form, gp: e.target.value })}><option value="">—</option>{gpOptions(form.taluk).map((x) => <option key={x}>{x}</option>)}</Select>}</Field></div>
              <div className="grid grid-cols-2 gap-2"><Field label={tr("Population (optional)", "ಜನಸಂಖ್ಯೆ (ಐಚ್ಛಿಕ)")}>{(i) => <Input id={i} inputMode="numeric" value={form.population} onChange={(e) => setForm({ ...form, population: e.target.value.replace(/\D/g, "") })} />}</Field><Field label={tr("Status", "ಸ್ಥಿತಿ")}>{(i) => <Select id={i} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Village["status"] })}><option>Pending</option><option>Enrolled</option><option>Inactive</option></Select>}</Field></div>
              {form.err && <p role="alert" className="text-sm text-danger">{form.err}</p>}</>}
          </Modal>
          <Modal open={!!assign} onClose={() => setAssign(null)} title={assign ? `${tr("Volunteers in", "ಸ್ವಯಂಸೇವಕರು")} ${assign.name}` : ""} footer={<Button onClick={async () => { await act(() => api.villages.setVolunteers(assign!.id, pick), tr("Assignments saved", "ನಿಯೋಜನೆ ಉಳಿಸಲಾಗಿದೆ")); setAssign(null); }}>{tr("Save", "ಉಳಿಸಿ")}</Button>}>
            {assign && (() => { const cands = d.ps.filter((p) => p.gp === assign.gp); return cands.length === 0 ? <p className="text-sm text-muted">{tr("No volunteers are registered in this Gram Panchayat yet. Add one in Users & Volunteers first.", "ಈ ಗ್ರಾಮ ಪಂಚಾಯತ್‌ನಲ್ಲಿ ಇನ್ನೂ ಸ್ವಯಂಸೇವಕರಿಲ್ಲ. ಮೊದಲು 'ಬಳಕೆದಾರರು ಮತ್ತು ಸ್ವಯಂಸೇವಕರು' ನಲ್ಲಿ ಸೇರಿಸಿ.")}</p> : cands.map((p) => <Check key={p.id} label={`${p.name} · ${p.id}`} checked={pick.includes(p.id)} onChange={(e) => setPick(e.target.checked ? [...pick, p.id] : pick.filter((x) => x !== p.id))} />); })()}
          </Modal>
          <Confirm open={!!del} onClose={() => setDel(null)} danger onConfirm={async () => { const r = await act(() => api.villages.remove(del!.id), tr("Village deleted", "ಗ್ರಾಮ ಅಳಿಸಲಾಗಿದೆ")); if (r !== undefined) setDel(null); }} title={tr("Delete this village?", "ಈ ಗ್ರಾಮ ಅಳಿಸುವಿರಾ?")} confirmLabel={tr("Delete", "ಅಳಿಸಿ")} body={tr("A village with assigned volunteers cannot be deleted; archive it (Inactive) instead.", "ಸ್ವಯಂಸೇವಕರು ನಿಯೋಜಿತವಿರುವ ಗ್ರಾಮ ಅಳಿಸಲಾಗದು; ಬದಲಿಗೆ ಆರ್ಕೈವ್ (ನಿಷ್ಕ್ರಿಯ) ಮಾಡಿ.")} /></>);
      }}</QState>
    </div>
  );
}
