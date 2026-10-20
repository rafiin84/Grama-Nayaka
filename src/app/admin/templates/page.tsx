"use client";
import { useState } from "react";
import { Badge, Button, Card, DemoNote, Empty, Field, Input, Modal, PageHeader, QState, Textarea, statusTone } from "@/components/ui";
import { api, useAct, useMock } from "@/lib/api";
import { getDb } from "@/lib/db";
import { useT } from "@/lib/useT";
import type { Template } from "@/lib/types";

const KNOWN = ["name", "venue", "date", "issue", "location", "lesson", "step"];
const sample: Record<string, string> = { name: "Ananya", venue: "Mysuru Training Institute (fictional)", date: "14 Sep 2026", issue: "hand pump repair", location: "Hosahalli ward 2", lesson: "The three tiers", step: "a site visit" };
const fill = (s: string) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => sample[k] ?? `⚠${k}`);
const bad = (s: string) => [...s.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).filter((k) => !KNOWN.includes(k));
export default function Templates() {
  const { tr } = useT(); const act = useAct(); const [edit, setEdit] = useState<Partial<Template> | null>(null); const q = useMock(["templates"], () => getDb().templates);
  const miss = edit ? [...bad(edit.en ?? ""), ...bad(edit.kn ?? "")] : [];
  const save = async (status: Template["status"]) => { await act(() => api.templates.save({ ...edit!, status }), tr("Saved", "ಉಳಿಸಲಾಗಿದೆ")); setEdit(null); };
  return (<div className="space-y-4"><PageHeader title={tr("Content & WhatsApp Templates", "ವಿಷಯ ಮತ್ತು WhatsApp ಟೆಂಪ್ಲೇಟ್")} sub={tr("Templates are for preview and copy. Nothing is sent.", "ಟೆಂಪ್ಲೇಟ್‌ಗಳು ಪೂರ್ವವೀಕ್ಷಣೆ ಮತ್ತು ನಕಲಿಗೆ. ಏನೂ ಕಳುಹಿಸುವುದಿಲ್ಲ.")} actions={<Button onClick={() => setEdit({ name: "", purpose: "General", en: "", kn: "" })}>{tr("New template", "ಹೊಸ ಟೆಂಪ್ಲೇಟ್")}</Button>} />
    <QState q={q} isEmpty={(d) => d.length === 0} empty={<Empty title={tr("No templates", "ಟೆಂಪ್ಲೇಟ್ ಇಲ್ಲ")} />}>{(d) => <div className="grid gap-3 md:grid-cols-2">{d.map((t) => <Card key={t.id} className="space-y-2"><div className="flex items-center justify-between"><b>{t.name}</b><Badge tone={statusTone(t.status)}>{t.status}</Badge></div><p className="text-xs text-muted">{t.purpose} · {tr("used", "ಬಳಕೆ")} {t.uses}×</p><p className="rounded-xl bg-accent-soft p-2 text-sm">{fill(t.kn || t.en)}</p><div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => setEdit(t)}>{tr("Edit", "ತಿದ್ದಿ")}</Button>{t.status !== "Archived" && <Button size="sm" variant="ghost" onClick={() => act(() => api.templates.save({ id: t.id, status: "Archived" }), tr("Archived", "ಆರ್ಕೈವ್"))}>{tr("Archive", "ಆರ್ಕೈವ್")}</Button>}</div></Card>)}</div>}</QState>
    <Modal open={!!edit} onClose={() => setEdit(null)} title={tr("Template", "ಟೆಂಪ್ಲೇಟ್")} footer={edit && <><Button variant="secondary" disabled={!edit.name} onClick={() => save("Draft")}>{tr("Save draft", "ಕರಡು ಉಳಿಸಿ")}</Button><Button disabled={!edit.name || miss.length > 0 || !(edit.en && edit.kn)} onClick={() => save("Published")}>{tr("Publish", "ಪ್ರಕಟಿಸಿ")}</Button></>}>{edit && <>
      <Field label={tr("Name", "ಹೆಸರು")}>{(i) => <Input id={i} value={edit.name ?? ""} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />}</Field>
      <Field label="English" hint={`Placeholders: ${KNOWN.map((k) => `{{${k}}}`).join(" ")}`}>{(i) => <Textarea id={i} rows={3} value={edit.en ?? ""} onChange={(e) => setEdit({ ...edit, en: e.target.value })} />}</Field>
      <Field label="ಕನ್ನಡ">{(i) => <Textarea id={i} rows={3} value={edit.kn ?? ""} onChange={(e) => setEdit({ ...edit, kn: e.target.value })} />}</Field>
      {miss.length > 0 && <p role="alert" className="text-sm text-danger">{tr("Unknown placeholders: ", "ಅಜ್ಞಾತ ಪ್ಲೇಸ್‌ಹೋಲ್ಡರ್: ")}{miss.join(", ")}</p>}{!(edit.en && edit.kn) && <p className="text-xs text-warning">{tr("Publishing needs both languages.", "ಪ್ರಕಟಿಸಲು ಎರಡೂ ಭಾಷೆ ಬೇಕು.")}</p>}
      <p className="rounded-xl bg-accent-soft p-2 text-sm"><b>{tr("Preview", "ಪೂರ್ವವೀಕ್ಷಣೆ")} (fictional values):</b><br />{fill(edit.kn ?? "")}<br />{fill(edit.en ?? "")}</p><DemoNote>{tr("No message is sent.", "ಯಾವ ಸಂದೇಶವೂ ಕಳುಹಿಸುವುದಿಲ್ಲ.")}</DemoNote></>}</Modal></div>);
}
