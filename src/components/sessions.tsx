"use client";
import { useRef, useState } from "react";
import { FilePdf, Trash, UploadSimple } from "@phosphor-icons/react";
import { Badge, Button, Card, Check, Confirm, DemoNote, Field, Input, Modal, Textarea } from "@/components/ui";
import { api, useAct } from "@/lib/api";
import { getDb } from "@/lib/db";
import { useT } from "@/lib/useT";
import { isComplete } from "@/lib/trainingRules";
import { putBlob, newBlobId } from "@/lib/blobStore";
import { useMediaUrl } from "@/lib/useBlobUrl";
import { validateFile } from "@/lib/resourceRules";
import type { TrainingClass } from "@/lib/types";

/** Per-session counts: registered, attended (any day present/late), completed (both days), pending (not yet completed). */
export function sessionCounts(c: TrainingClass) {
  const attended = c.roster.filter((p) => (c.attendance[p] ?? []).some((x) => x === "Present" || x === "Late")).length;
  const completed = c.roster.filter((p) => isComplete(c, p)).length;
  return { registered: c.roster.length, attended, completed, pending: c.roster.length - completed, waitlisted: c.waitlist.length };
}
export function CountsRow({ c }: { c: TrainingClass }) {
  const { tr } = useT(); const n = sessionCounts(c);
  return (<dl className="grid grid-cols-4 gap-1 text-center text-xs">{[[tr("Registered", "ನೋಂದಾಯಿತ"), n.registered], [tr("Attended", "ಹಾಜರಾದ"), n.attended], [tr("Completed", "ಪೂರ್ಣ"), n.completed], [tr("Pending", "ಬಾಕಿ"), n.pending]].map(([l, v]) => <div key={String(l)} className="rounded-lg bg-accent-soft py-1.5"><dd className="text-base font-bold text-primary">{v}</dd><dt className="text-muted">{l}</dt></div>)}</dl>);
}

export function RescheduleModal({ session, onClose }: { session: TrainingClass | null; onClose: () => void }) {
  const { tr } = useT(); const act = useAct(); const [date, setDate] = useState(""); const [reason, setReason] = useState("");
  return (<Modal open={!!session} onClose={onClose} title={session ? `${tr("Reschedule", "ಮರುನಿಗದಿ")}: ${session.name}` : ""} footer={<Button onClick={async () => { const r = await act(() => api.sessions.reschedule(session!.id, date, reason), tr("Session rescheduled; registered volunteers notified (mock)", "ಅವಧಿ ಮರುನಿಗದಿ; ನೋಂದಾಯಿತರಿಗೆ ಸೂಚನೆ (ಮಾಕ್)")); if (r !== undefined) { onClose(); setDate(""); setReason(""); } }}>{tr("Reschedule", "ಮರುನಿಗದಿ ಮಾಡಿ")}</Button>}>
    <p className="text-sm text-muted">{tr("Current start", "ಈಗಿನ ಆರಂಭ")}: {session?.startDate}</p>
    <Field label={tr("New start date", "ಹೊಸ ಆರಂಭದ ದಿನಾಂಕ")} required>{(i) => <Input id={i} type="date" value={date} onChange={(e) => setDate(e.target.value)} />}</Field>
    <Field label={tr("Reason (required)", "ಕಾರಣ (ಅಗತ್ಯ)")}>{(i) => <Textarea id={i} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />}</Field></Modal>);
}
export function CancelModal({ session, onClose }: { session: TrainingClass | null; onClose: () => void }) {
  const { tr } = useT(); const act = useAct(); const [reason, setReason] = useState("");
  return (<Modal open={!!session} onClose={onClose} title={session ? `${tr("Cancel", "ರದ್ದು")}: ${session.name}` : ""} footer={<Button variant="danger" onClick={async () => { const r = await act(() => api.sessions.cancel(session!.id, reason), tr("Session cancelled; volunteers notified (mock)", "ಅವಧಿ ರದ್ದು; ಸ್ವಯಂಸೇವಕರಿಗೆ ಸೂಚನೆ (ಮಾಕ್)")); if (r !== undefined) { onClose(); setReason(""); } }}>{tr("Cancel session", "ಅವಧಿ ರದ್ದುಮಾಡಿ")}</Button>}>
    <p className="text-sm text-muted">{session && tr(`${session.roster.length} registered volunteer(s) would be notified (mock — nothing is sent). Records are kept.`, `${session.roster.length} ನೋಂದಾಯಿತ ಸ್ವಯಂಸೇವಕರಿಗೆ ಸೂಚನೆ (ಮಾಕ್ — ಏನೂ ಕಳುಹಿಸಿಲ್ಲ). ದಾಖಲೆಗಳು ಉಳಿಯುತ್ತವೆ.`)}</p>
    <Field label={tr("Reason (required)", "ಕಾರಣ (ಅಗತ್ಯ)")}>{(i) => <Textarea id={i} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />}</Field></Modal>);
}
export function DeleteSession({ session, onClose }: { session: TrainingClass | null; onClose: () => void }) {
  const { tr } = useT(); const act = useAct();
  return <Confirm open={!!session} onClose={onClose} danger onConfirm={async () => { const r = await act(() => api.sessions.remove(session!.id), tr("Session deleted", "ಅವಧಿ ಅಳಿಸಲಾಗಿದೆ")); if (r !== undefined) onClose(); }} title={tr("Delete this session?", "ಈ ಅವಧಿ ಅಳಿಸುವಿರಾ?")} confirmLabel={tr("Delete", "ಅಳಿಸಿ")} body={tr("Only empty sessions with no attendance can be deleted. Otherwise cancel it; records are preserved.", "ಖಾಲಿ ಮತ್ತು ಹಾಜರಾತಿ ಇಲ್ಲದ ಅವಧಿಗಳನ್ನು ಮಾತ್ರ ಅಳಿಸಬಹುದು. ಇಲ್ಲದಿದ್ದರೆ ರದ್ದುಮಾಡಿ; ದಾಖಲೆಗಳು ಉಳಿಯುತ್ತವೆ.")} />;
}

function MaterialRow({ m, canEdit, onRemove }: { m: NonNullable<TrainingClass["materials"]>[number]; canEdit: boolean; onRemove: () => void }) {
  const { tr } = useT(); const { url, missing } = useMediaUrl(m.blobId ? { name: m.name, size: m.size, mime: m.mime ?? "application/octet-stream", blobId: m.blobId } : undefined);
  return (
    <li className="flex items-center justify-between gap-2 py-2"><span className="flex min-w-0 items-center gap-2"><FilePdf size={18} className="shrink-0 text-primary" />
      {url ? <a href={url} download={m.name} target="_blank" rel="noreferrer" className="truncate text-primary underline">{m.name}</a> : <span className="truncate">{m.name}</span>}
      <span className="shrink-0 text-xs text-muted">{(m.size / 1024).toFixed(0)} KB · {m.uploadedAt.slice(0, 10)}{!m.blobId && ` · ${tr("name only", "ಹೆಸರು ಮಾತ್ರ")}`}{missing && ` · ${tr("file not in this browser", "ಫೈಲ್ ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿಲ್ಲ")}`}</span></span>
      {canEdit && <Button size="sm" variant="ghost" aria-label={`Remove ${m.name}`} onClick={onRemove}><Trash size={16} /></Button>}</li>
  );
}
export function Materials({ c, canEdit }: { c: TrainingClass; canEdit: boolean }) {
  const { tr } = useT(); const act = useAct(); const input = useRef<HTMLInputElement>(null);
  const upload = async (f: File) => { const e = validateFile("document", f); const okMedia = /\.(png|jpe?g|mp4)$/i.test(f.name) && f.size <= 25 * 1024 * 1024; if (e && !okMedia) return void act(() => { throw new Error(e); }); const blobId = newBlobId(); try { await putBlob(blobId, f); } catch (er) { return void act(() => { throw new Error((er as Error).message); }); } await act(() => api.sessions.addMaterial(c.id, { name: f.name, size: f.size, mime: f.type, blobId }), tr("Document uploaded", "ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ")); };
  return (
    <Card className="space-y-3"><div className="flex items-center justify-between"><h2 className="font-bold">{tr("Training materials & supporting documents", "ತರಬೇತಿ ಸಾಮಗ್ರಿ ಮತ್ತು ಪೂರಕ ದಾಖಲೆಗಳು")}</h2>{canEdit && <><input ref={input} type="file" className="hidden" aria-label="Upload training material" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void upload(f); }} /><Button size="sm" variant="secondary" onClick={() => input.current?.click()}><UploadSimple />{tr("Upload file", "ಫೈಲ್ ಅಪ್‌ಲೋಡ್")}</Button></>}</div>
      {(c.materials ?? []).length === 0 ? <p className="text-sm text-muted">{tr("No materials yet.", "ಇನ್ನೂ ಸಾಮಗ್ರಿ ಇಲ್ಲ.")}</p> : <ul className="divide-y divide-border text-sm">{(c.materials ?? []).map((m) => <MaterialRow key={m.id} m={m} canEdit={canEdit} onRemove={() => act(() => api.sessions.removeMaterial(c.id, m.id), tr("Material removed", "ಸಾಮಗ್ರಿ ತೆಗೆಯಲಾಗಿದೆ"))} />)}</ul>}
      <DemoNote>{tr("Files are kept in this browser only (no server in this prototype). PDF, Office documents, images and MP4 up to 20 MB (video 25 MB).", "ಫೈಲ್‌ಗಳು ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮಾತ್ರ ಉಳಿಯುತ್ತವೆ (ಈ ಮಾದರಿಯಲ್ಲಿ ಸರ್ವರ್ ಇಲ್ಲ). 20 MB ವರೆಗೆ PDF, ಆಫೀಸ್ ದಾಖಲೆ, ಚಿತ್ರ, MP4 (ವೀಡಿಯೋ 25 MB).")}</DemoNote></Card>
  );
}
export function CertBadge({ c, pid, canIssue }: { c: TrainingClass; pid: string; canIssue: boolean }) {
  const { tr } = useT(); const act = useAct(); const ok = isComplete(c, pid); const has = (c.certified ?? []).includes(pid);
  if (has) return <Badge tone="success">{tr("Certified", "ಪ್ರಮಾಣಿತ")}</Badge>;
  if (!ok) return <Badge>{tr("Not eligible yet", "ಇನ್ನೂ ಅರ್ಹರಲ್ಲ")}</Badge>;
  return canIssue ? <Button size="sm" onClick={() => act(() => api.sessions.certify(c.id, pid), tr("Sample certificate issued", "ಮಾದರಿ ಪ್ರಮಾಣಪತ್ರ ನೀಡಲಾಗಿದೆ"))}>{tr("Issue certificate", "ಪ್ರಮಾಣಪತ್ರ ನೀಡಿ")}</Button> : <Badge tone="warning">{tr("Eligible", "ಅರ್ಹ")}</Badge>;
}

export function RegisterVolunteersModal({ session, open, onClose }: { session: TrainingClass; open: boolean; onClose: () => void }) {
  const { tr } = useT(); const act = useAct(); const [pick, setPick] = useState<string[]>([]); const [q, setQ] = useState(""); const [result, setResult] = useState<{ assigned: number; waitlisted: number; skipped: { pid: string; reason: string }[] } | null>(null);
  const d = getDb(); const volunteerPids = new Set(d.users.filter((u) => u.role === "volunteer" && u.status === "Active" && u.participantId).map((u) => u.participantId!));
  const cands = d.participants.filter((p) => volunteerPids.has(p.id) && !d.classes.some((k) => k.cohort === session.cohort && k.status !== "Cancelled" && (k.roster.includes(p.id) || k.waitlist.includes(p.id))) && (!q || (p.name + p.id + p.gp).toLowerCase().includes(q.toLowerCase())));
  const left = session.capacity - session.roster.length;
  return (
    <Modal open={open} onClose={() => { onClose(); setResult(null); setPick([]); }} title={`${tr("Register volunteers", "ಸ್ವಯಂಸೇವಕರನ್ನು ನೋಂದಾಯಿಸಿ")} · ${session.name}`} footer={!result ? <Button disabled={pick.length === 0 || session.publish === "Draft"} onClick={async () => { const r = await act(() => api.training.assignMany(pick, session.id)); if (r && typeof r === "object") { setResult(r); setPick([]); } }}>{tr(`Register ${pick.length}`, `${pick.length} ನೋಂದಾಯಿಸಿ`)}</Button> : <Button onClick={() => { onClose(); setResult(null); }}>{tr("Done", "ಮುಗಿದಿದೆ")}</Button>}>
      {session.publish === "Draft" && <p role="alert" className="rounded-xl bg-warning/15 p-3 text-sm text-foreground">{tr("This session is a draft. Publish it before registering volunteers.", "ಈ ಅವಧಿ ಕರಡು. ಸ್ವಯಂಸೇವಕರನ್ನು ನೋಂದಾಯಿಸುವ ಮೊದಲು ಪ್ರಕಟಿಸಿ.")}</p>}
      {result ? <div className="space-y-2 text-sm"><p className="font-semibold text-success">{tr(`${result.assigned} registered, ${result.waitlisted} waitlisted.`, `${result.assigned} ನೋಂದಾಯಿತ, ${result.waitlisted} ಕಾಯುವ ಪಟ್ಟಿಯಲ್ಲಿ.`)}</p>{result.skipped.length > 0 && <ul className="space-y-1">{result.skipped.map((s) => <li key={s.pid}><b>{d.participants.find((p) => p.id === s.pid)?.name ?? s.pid}</b>: <span className="text-danger">{s.reason}</span></li>)}</ul>}</div> : <>
        <p className="text-sm text-muted">{tr(`${left} seat(s) free. People already in a Cohort ${session.cohort} session are not listed.`, `${left} ಆಸನ ಖಾಲಿ. ಕೋಹಾರ್ಟ್ ${session.cohort} ಅವಧಿಯಲ್ಲಿ ಇರುವವರನ್ನು ಪಟ್ಟಿ ಮಾಡಿಲ್ಲ.`)}</p>
        <Input aria-label="Search volunteers" placeholder={tr("Search name, ID or Gram Panchayat", "ಹೆಸರು, ಐಡಿ ಅಥವಾ ಗ್ರಾಮ ಪಂಚಾಯತ್ ಹುಡುಕಿ")} value={q} onChange={(e) => setQ(e.target.value)} />
        {cands.length === 0 ? <p className="text-sm text-muted">{tr("No eligible volunteers.", "ಅರ್ಹ ಸ್ವಯಂಸೇವಕರಿಲ್ಲ.")}</p> : <div className="max-h-64 space-y-1 overflow-auto">{cands.map((p) => <Check key={p.id} label={<>{p.name} <span className="text-xs text-muted">{p.id} · {p.gp}</span></>} checked={pick.includes(p.id)} onChange={(e) => setPick(e.target.checked ? [...pick, p.id] : pick.filter((x) => x !== p.id))} />)}</div>}
        {pick.length > left && <p className="text-xs text-warning">{tr(`Only ${left} fit; the rest go to the waitlist.`, `${left} ಮಾತ್ರ ಹೊಂದುತ್ತವೆ; ಉಳಿದವರು ಕಾಯುವ ಪಟ್ಟಿಗೆ.`)}</p>}</>}
    </Modal>
  );
}
export function MarkCompleteModal({ session, pid, onClose }: { session: TrainingClass; pid: string | null; onClose: () => void }) {
  const { tr } = useT(); const act = useAct(); const [reason, setReason] = useState(""); const name = pid ? getDb().participants.find((p) => p.id === pid)?.name ?? pid : "";
  return (
    <Modal open={!!pid} onClose={onClose} title={`${tr("Mark training complete", "ತರಬೇತಿ ಪೂರ್ಣ ಎಂದು ಗುರುತಿಸಿ")} · ${name}`} footer={<Button onClick={async () => { const r = await act(() => api.training.markComplete(session.id, pid!, reason), tr("Marked complete (approved exception)", "ಪೂರ್ಣ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ (ಅನುಮೋದಿತ ವಿನಾಯಿತಿ)")); if (r !== undefined) { onClose(); setReason(""); } }}>{tr("Mark complete", "ಪೂರ್ಣ ಗುರುತಿಸಿ")}</Button>}>
      <p className="text-sm text-muted">{tr("Normally completion comes from attendance on both days. Use this only for an approved exception. The reason is recorded in the audit log.", "ಸಾಮಾನ್ಯವಾಗಿ ಎರಡೂ ದಿನದ ಹಾಜರಾತಿಯಿಂದ ಪೂರ್ಣಗೊಳ್ಳುತ್ತದೆ. ಅನುಮೋದಿತ ವಿನಾಯಿತಿಗೆ ಮಾತ್ರ ಇದನ್ನು ಬಳಸಿ. ಕಾರಣ ಆಡಿಟ್ ಲಾಗ್‌ನಲ್ಲಿ ದಾಖಲಾಗುತ್ತದೆ.")}</p>
      <Field label={tr("Reason for the exception (required)", "ವಿನಾಯಿತಿಯ ಕಾರಣ (ಅಗತ್ಯ)")}>{(i) => <Textarea id={i} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />}</Field></Modal>
  );
}
