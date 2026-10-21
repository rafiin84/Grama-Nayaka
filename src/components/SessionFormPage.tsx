"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, FilePdf, UploadSimple, X } from "@phosphor-icons/react";
import { Badge, Button, Card, Confirm, DemoNote, Field, Input, PageHeader, QState, Select, Textarea } from "@/components/ui";
import { api, useAct, useMock } from "@/lib/api";
import { getDb } from "@/lib/db";
import { putBlob, newBlobId } from "@/lib/blobStore";
import { validateFile } from "@/lib/resourceRules";
import { districts } from "@/lib/seed-geo";
import { trainers } from "@/lib/seed";
import { DURATION_DAYS, endDateOf, sessionErrors, type SessionErrors } from "@/lib/trainingRules";
import { useT } from "@/lib/useT";

interface Vals { name: string; description: string; cohort: "A" | "B" | "C"; startDate: string; region: string; location: string; room: string; capacity: string; trainerId: string; coordinatorId: string; registrationDeadline: string }
const blank: Vals = { name: "", description: "", cohort: "A", startDate: "", region: "Mysuru", location: "Mysuru Training Institute (fictional placeholder)", room: "", capacity: "60", trainerId: "", coordinatorId: "", registrationDeadline: "" };

export function SessionFormPage({ classId }: { classId?: string }) {
  const { tr } = useT(); const q = useMock(["session-form", classId], () => { const d = getDb(); return { c: classId ? d.classes.find((x) => x.id === classId) ?? null : undefined, coordinators: d.users.filter((u) => u.role === "trainingCoordinator" && u.status === "Active") }; });
  return (
    <div className="space-y-4">
      <Link href={classId ? `/admin/training/${classId}` : "/admin/training"} className="inline-flex items-center gap-1 text-sm font-medium text-primary"><ArrowLeft />{tr("Back", "ಹಿಂದೆ")}</Link>
      <QState q={q} isEmpty={(d) => d.c === null} empty={<Card className="py-10 text-center">{tr("Session not found.", "ಅವಧಿ ಸಿಗಲಿಲ್ಲ.")}</Card>}>{(d) => <Form key={classId ?? "new"} c={d.c ?? undefined} coordinators={d.coordinators} />}</QState>
    </div>
  );
}
function Form({ c, coordinators }: { c?: NonNullable<ReturnType<typeof getDb>["classes"][number]>; coordinators: { id: string; name: string }[] }) {
  const { tr } = useT(); const act = useAct(); const router = useRouter(); const fileRef = useRef<HTMLInputElement>(null);
  const initial: Vals = c ? { name: c.name, description: c.description ?? "", cohort: c.cohort, startDate: c.startDate, region: c.region ?? "", location: c.location ?? "", room: c.room, capacity: String(c.capacity), trainerId: c.trainerId, coordinatorId: c.coordinatorId ?? "", registrationDeadline: c.registrationDeadline ?? "" } : blank;
  const [v, setV] = useState<Vals>(initial); const [errs, setErrs] = useState<SessionErrors>({}); const [files, setFiles] = useState<File[]>([]); const [fileErr, setFileErr] = useState(""); const [leave, setLeave] = useState(false); const [busy, setBusy] = useState(false); const [saved, setSaved] = useState(false);
  const dirty = !saved && (JSON.stringify(v) !== JSON.stringify(initial) || files.length > 0);
  useEffect(() => { if (!dirty) return; const h = (e: BeforeUnloadEvent) => e.preventDefault(); addEventListener("beforeunload", h); return () => removeEventListener("beforeunload", h); }, [dirty]);
  const set = <K extends keyof Vals>(k: K, val: Vals[K]) => { setV((p) => ({ ...p, [k]: val })); setErrs((e) => ({ ...e, [k]: undefined })); };
  const published = c?.publish === "Published"; const locked = !!c; // cohort and start date change through Reschedule
  const input = () => ({ name: v.name, description: v.description, cohort: v.cohort, startDate: v.startDate, location: v.location, room: v.room, capacity: Number(v.capacity), trainerId: v.trainerId, registrationDeadline: v.registrationDeadline || undefined, region: v.region || undefined, coordinatorId: v.coordinatorId || undefined });
  const addFiles = (list: FileList | null) => { if (!list) return; const next: File[] = []; for (const f of Array.from(list)) { const e = validateFile("document", f); const okMedia = /\.(png|jpe?g|mp4)$/i.test(f.name) && f.size <= 25 * 1024 * 1024; if (e && !okMedia) { setFileErr(`${f.name}: ${e}`); continue; } next.push(f); } if (next.length) setFileErr(""); setFiles((p) => [...p, ...next]); };
  const submit = async (mode: "draft" | "publish") => {
    const e = sessionErrors(input(), mode); setErrs(e); if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const mats: { name: string; size: number; mime: string; blobId: string }[] = [];
      for (const f of files) { const blobId = newBlobId(); await putBlob(blobId, f); mats.push({ name: f.name, size: f.size, mime: f.type, blobId }); }
      let id = c?.id;
      if (!c) { const r = await act(() => api.sessions.create({ ...input(), materials: mats }, mode), mode === "publish" ? tr("Session published", "ಅವಧಿ ಪ್ರಕಟಿಸಲಾಗಿದೆ") : tr("Draft saved", "ಕರಡು ಉಳಿಸಲಾಗಿದೆ")); id = typeof r === "string" ? r : undefined; }
      else { const r = await act(() => { api.sessions.update(c.id, input(), mode); mats.forEach((m) => api.sessions.addMaterial(c.id, m)); }, published && mode === "publish" ? tr("Session updated", "ಅವಧಿ ನವೀಕರಿಸಲಾಗಿದೆ") : mode === "publish" ? tr("Session published", "ಅವಧಿ ಪ್ರಕಟಿಸಲಾಗಿದೆ") : tr("Draft saved", "ಕರಡು ಉಳಿಸಲಾಗಿದೆ")); if (r === undefined) id = undefined; }
      if (id) { setSaved(true); router.push(`/admin/training/${id}`); }
    } finally { setBusy(false); }
  };
  const end = endDateOf(v.startDate);
  return (
    <div className="space-y-4">
      <PageHeader title={c ? tr("Edit training session", "ತರಬೇತಿ ಅವಧಿ ತಿದ್ದಿ") : tr("Add training session", "ತರಬೇತಿ ಅವಧಿ ಸೇರಿಸಿ")} sub={c ? `${c.id} · ${c.publish === "Draft" ? tr("Draft", "ಕರಡು") : tr("Published", "ಪ್ರಕಟಿತ")}` : tr("Save a draft while you plan, then publish to open it for registration.", "ಯೋಜಿಸುವಾಗ ಕರಡು ಉಳಿಸಿ, ನೋಂದಣಿಗೆ ತೆರೆಯಲು ಪ್ರಕಟಿಸಿ.")} actions={c && <Badge tone={published ? "success" : "warning"}>{published ? tr("Published", "ಪ್ರಕಟಿತ") : tr("Draft", "ಕರಡು")}</Badge>} />
      <Card className="space-y-4"><h2 className="font-bold">{tr("Session details", "ಅವಧಿ ವಿವರ")}</h2>
        <Field label={tr("Training session name", "ತರಬೇತಿ ಅವಧಿಯ ಹೆಸರು")} error={errs.name} required>{(i, a) => <Input id={i} {...a} value={v.name} onChange={(e) => set("name", e.target.value)} />}</Field>
        <Field label={tr("Description", "ವಿವರಣೆ")} error={errs.description} hint={`${v.description.length}/600`}>{(i, a) => <Textarea id={i} {...a} rows={3} value={v.description} onChange={(e) => set("description", e.target.value)} />}</Field>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={tr("Cohort (fixes the days)", "ಕೋಹಾರ್ಟ್ (ದಿನ ನಿಗದಿ)")}>{(i) => <Select id={i} disabled={locked} value={v.cohort} onChange={(e) => set("cohort", e.target.value as Vals["cohort"])}><option value="A">A · {tr("days 1–2", "ದಿನ 1–2")}</option><option value="B">B · {tr("days 3–4", "ದಿನ 3–4")}</option><option value="C">C · {tr("days 5–6", "ದಿನ 5–6")}</option></Select>}</Field>
          <Field label={tr("Start date", "ಆರಂಭದ ದಿನಾಂಕ")} error={errs.startDate} hint={locked ? tr("Use Reschedule to change it.", "ಬದಲಿಸಲು ಮರುನಿಗದಿ ಬಳಸಿ.") : undefined} required>{(i, a) => <Input id={i} {...a} type="date" disabled={locked} value={v.startDate} onChange={(e) => set("startDate", e.target.value)} />}</Field>
          <Field label={tr("End date", "ಅಂತಿಮ ದಿನಾಂಕ")} hint={tr("Calculated from the start date", "ಆರಂಭದ ದಿನಾಂಕದಿಂದ ಲೆಕ್ಕ")}>{(i) => <Input id={i} type="date" readOnly value={end} />}</Field>
          <Field label={tr("Duration", "ಅವಧಿ")} hint={tr("Fixed: attendance is recorded for two days", "ನಿಗದಿ: ಎರಡು ದಿನ ಹಾಜರಾತಿ")}>{(i) => <Input id={i} readOnly value={`${DURATION_DAYS} ${tr("days", "ದಿನ")}`} />}</Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={tr("Training location", "ತರಬೇತಿ ಸ್ಥಳ")} error={errs.location} required>{(i, a) => <Input id={i} {...a} value={v.location} onChange={(e) => set("location", e.target.value)} />}</Field>
          <Field label={tr("District / region", "ಜಿಲ್ಲೆ / ಪ್ರದೇಶ")}>{(i) => <Select id={i} value={v.region} onChange={(e) => set("region", e.target.value)}><option value="">—</option>{districts.map((x) => <option key={x}>{x}</option>)}</Select>}</Field>
          <Field label={tr("Room", "ಕೊಠಡಿ")} error={errs.room} required>{(i, a) => <Input id={i} {...a} value={v.room} onChange={(e) => set("room", e.target.value)} />}</Field>
          <Field label={tr("Session capacity (30–100)", "ಅವಧಿ ಸಾಮರ್ಥ್ಯ (30–100)")} error={errs.capacity} required>{(i, a) => <Input id={i} {...a} type="number" min={30} max={100} value={v.capacity} onChange={(e) => set("capacity", e.target.value)} />}</Field>
          <Field label={tr("Trainer", "ತರಬೇತುದಾರ")} error={errs.trainerId} required>{(i, a) => <Select id={i} {...a} value={v.trainerId} onChange={(e) => set("trainerId", e.target.value)}><option value="">—</option>{trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select>}</Field>
          <Field label={tr("Coordinator", "ಸಂಯೋಜಕ")}>{(i) => <Select id={i} value={v.coordinatorId} onChange={(e) => set("coordinatorId", e.target.value)}><option value="">—</option>{coordinators.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</Select>}</Field>
          <Field label={tr("Registration deadline", "ನೋಂದಣಿ ಕೊನೆಯ ದಿನಾಂಕ")} error={errs.registrationDeadline} hint={tr("Required to publish; on or before the start date", "ಪ್ರಕಟಿಸಲು ಅಗತ್ಯ; ಆರಂಭದ ದಿನ ಅಥವಾ ಮೊದಲು")}>{(i, a) => <Input id={i} {...a} type="date" max={v.startDate || undefined} value={v.registrationDeadline} onChange={(e) => set("registrationDeadline", e.target.value)} />}</Field>
        </div>
      </Card>
      <Card className="space-y-3"><div className="flex items-center justify-between"><h2 className="font-bold">{tr("Supporting documents", "ಪೂರಕ ದಾಖಲೆಗಳು")}</h2><input ref={fileRef} type="file" multiple className="hidden" aria-label="Add supporting documents" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} /><Button type="button" size="sm" variant="secondary" onClick={() => fileRef.current?.click()}><UploadSimple />{tr("Add files", "ಫೈಲ್ ಸೇರಿಸಿ")}</Button></div>
        {files.length === 0 ? <p className="text-sm text-muted">{c ? tr("New files are added to the existing materials on save.", "ಉಳಿಸಿದಾಗ ಹೊಸ ಫೈಲ್‌ಗಳು ಈಗಿನ ಸಾಮಗ್ರಿಗೆ ಸೇರುತ್ತವೆ.") : tr("Optional. PDF, Office documents, images (video up to 25 MB), 20 MB each.", "ಐಚ್ಛಿಕ. PDF, ಆಫೀಸ್ ದಾಖಲೆ, ಚಿತ್ರ, ತಲಾ 20 MB (ವೀಡಿಯೋ 25 MB).")}</p> : <ul className="divide-y divide-border text-sm">{files.map((f, i) => <li key={i} className="flex items-center justify-between py-2"><span className="flex items-center gap-2"><FilePdf size={18} className="text-primary" />{f.name} <span className="text-xs text-muted">{(f.size / 1024).toFixed(0)} KB</span></span><Button type="button" size="sm" variant="ghost" aria-label={`Remove ${f.name}`} onClick={() => setFiles(files.filter((_, k) => k !== i))}><X size={16} /></Button></li>)}</ul>}
        {fileErr && <p role="alert" className="text-sm text-danger">{fileErr}</p>}
        <DemoNote>{tr("Files are stored in this browser only; this prototype has no server.", "ಫೈಲ್‌ಗಳು ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮಾತ್ರ ಉಳಿಯುತ್ತವೆ; ಈ ಮಾದರಿಗೆ ಸರ್ವರ್ ಇಲ್ಲ.")}</DemoNote></Card>
      {Object.values(errs).some(Boolean) && <p role="alert" className="text-sm text-danger">{tr("Please fix the highlighted fields.", "ಹೈಲೈಟ್ ಮಾಡಿದ ಕ್ಷೇತ್ರಗಳನ್ನು ಸರಿಪಡಿಸಿ.")}</p>}
      <div className="flex flex-wrap gap-2">
        {(!c || c.publish === "Draft") && <Button type="button" variant="secondary" size="lg" disabled={busy} onClick={() => submit("draft")}>{tr("Save draft", "ಕರಡು ಉಳಿಸಿ")}</Button>}
        <Button type="button" size="lg" disabled={busy} onClick={() => submit("publish")}>{published ? tr("Update", "ನವೀಕರಿಸಿ") : tr("Publish", "ಪ್ರಕಟಿಸಿ")}</Button>
        <Button type="button" variant="secondary" size="lg" onClick={() => (dirty ? setLeave(true) : router.push(c ? `/admin/training/${c.id}` : "/admin/training"))}>{tr("Cancel", "ರದ್ದುಮಾಡಿ")}</Button>
      </div>
      <Confirm open={leave} onClose={() => setLeave(false)} onConfirm={() => router.push(c ? `/admin/training/${c.id}` : "/admin/training")} danger title={tr("Discard changes?", "ಬದಲಾವಣೆ ತ್ಯಜಿಸುವಿರಾ?")} confirmLabel={tr("Discard", "ತ್ಯಜಿಸಿ")} body={tr("You have unsaved changes on this form.", "ಈ ಫಾರ್ಮ್‌ನಲ್ಲಿ ಉಳಿಸದ ಬದಲಾವಣೆಗಳಿವೆ.")} />
    </div>
  );
}
