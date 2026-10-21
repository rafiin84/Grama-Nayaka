"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, UploadSimple, X } from "@phosphor-icons/react";
import { Badge, Button, Card, Check, Confirm, DemoNote, Field, Input, PageHeader, QState, Select, Textarea } from "@/components/ui";
import { api, useAct, useMock } from "@/lib/api";
import { getDb } from "@/lib/db";
import { putBlob, newBlobId } from "@/lib/blobStore";
import { AUDIENCES, FILE_RULES, RESOURCE_TYPES, resourceSchema, validateFile, type ResourceForm as Vals } from "@/lib/resourceRules";
import { useMediaUrl } from "@/lib/useBlobUrl";
import { useT } from "@/lib/useT";
import { today } from "@/lib/derive";
import type { MediaRef, ResourceType } from "@/lib/types";

const blank: Vals = { title: "", short: "", full: "", categoryId: "", topic: "", type: "videoFile", url: "", hasFile: false, language: "en", audience: ["volunteers"], order: 10, status: "Draft", publishDate: "" };
const fileKind = (t: ResourceType) => (t === "videoFile" ? "videoFile" : t === "pdf" ? "pdf" : "document") as "videoFile" | "pdf" | "document";

export function ResourceFormPage({ id }: { id?: string }) {
  const { tr } = useT(); const q = useMock(["resource-form", id], () => { const d = getDb(); return { r: id ? d.resources.find((x) => x.id === id) ?? null : undefined, cats: [...d.resourceCategories].sort((a, b) => a.order - b.order), topics: [...new Set(d.resources.map((r) => r.topic))], nextOrder: Math.max(0, ...d.resources.map((r) => r.order)) + 1 }; });
  return (
    <div className="space-y-4">
      <Link href={id ? `/admin/resources/${id}` : "/admin/resources"} className="inline-flex items-center gap-1 text-sm font-medium text-primary"><ArrowLeft />{tr("Back", "ಹಿಂದೆ")}</Link>
      <QState q={q} isEmpty={(d) => d.r === null} empty={<Card className="py-10 text-center">{tr("Resource not found.", "ಸಂಪನ್ಮೂಲ ಸಿಗಲಿಲ್ಲ.")}</Card>}>{(d) => <Form key={id ?? "new"} data={d} id={id} />}</QState>
    </div>
  );
}
function Form({ data, id }: { data: { r?: ReturnType<typeof getDb>["resources"][number] | null; cats: ReturnType<typeof getDb>["resourceCategories"]; topics: string[]; nextOrder: number }; id?: string }) {
  const { tr, lang, loc } = useT(); const act = useAct(); const router = useRouter(); const r = data.r ?? undefined; const fileRef = useRef<HTMLInputElement>(null); const thumbRef = useRef<HTMLInputElement>(null);
  const initial: Vals = r ? { title: r.title, short: r.short, full: r.full, categoryId: r.categoryId, topic: r.topic, type: r.type, url: r.url ?? "", hasFile: !!r.file, language: r.language, audience: r.audience, order: r.order, status: r.status, publishDate: r.publishDate ?? "" } : { ...blank, categoryId: data.cats[0]?.id ?? "", order: data.nextOrder };
  const f = useForm<Vals>({ resolver: zodResolver(resourceSchema), defaultValues: initial, mode: "onTouched" });
  const { register, control, watch, setValue, handleSubmit, formState: { errors, isDirty, isSubmitting } } = f; const v = watch();
  const [file, setFile] = useState<File | null>(null); const [removeFile, setRemoveFile] = useState(false); const [thumb, setThumb] = useState<File | null>(null); const [removeThumb, setRemoveThumb] = useState(false);
  const [fileErr, setFileErr] = useState(""); const [thumbErr, setThumbErr] = useState(""); const [leave, setLeave] = useState(false); const [saved, setSaved] = useState(false); const [stage, setStage] = useState("");
  const [thumbPreview, setThumbPreview] = useState<string | null>(null); const curThumb = useMediaUrl(!removeThumb ? r?.thumb : undefined);
  const mode = RESOURCE_TYPES.find((t) => t.id === v.type)?.mode ?? "file"; const hasFile = !!file || (!!r?.file && !removeFile);
  const dirty = !saved && (isDirty || !!file || !!thumb || removeFile || removeThumb);
  useEffect(() => { setValue("hasFile", hasFile, { shouldValidate: false }); }, [hasFile, setValue]);
  useEffect(() => { if (!thumb) return setThumbPreview(null); const u = URL.createObjectURL(thumb); setThumbPreview(u); return () => URL.revokeObjectURL(u); }, [thumb]);
  useEffect(() => { if (!dirty) return; const h = (e: BeforeUnloadEvent) => e.preventDefault(); addEventListener("beforeunload", h); return () => removeEventListener("beforeunload", h); }, [dirty]);
  const err = (k: keyof Vals) => errors[k]?.message as string | undefined;

  const pickFile = (fl?: File) => { if (!fl) return; const e = validateFile(fileKind(v.type), fl); if (e) { setFileErr(e); return; } setFileErr(""); setFile(fl); setRemoveFile(false); };
  const pickThumb = (fl?: File) => { if (!fl) return; const e = validateFile("thumb", fl); if (e) { setThumbErr(e); return; } setThumbErr(""); setThumb(fl); setRemoveThumb(false); };

  const submit = () => handleSubmit(async (x) => {
    const values = { ...x };
    let fileRefM: MediaRef | undefined = r?.file && !removeFile ? r.file : undefined; let thumbRefM: MediaRef | undefined = r?.thumb && !removeThumb ? r.thumb : undefined;
    try {
      if (mode === "file" && file) { setStage(tr(`Storing ${file.name}…`, `${file.name} ಉಳಿಸಲಾಗುತ್ತಿದೆ…`)); const blobId = newBlobId(); await putBlob(blobId, file); fileRefM = { name: file.name, size: file.size, mime: file.type || "application/octet-stream", blobId }; }
      if (thumb) { setStage(tr("Storing thumbnail…", "ಥಂಬ್‌ನೇಲ್ ಉಳಿಸಲಾಗುತ್ತಿದೆ…")); const blobId = newBlobId(); await putBlob(blobId, thumb); thumbRefM = { name: thumb.name, size: thumb.size, mime: thumb.type, blobId }; }
    } catch (e) { setStage(""); return void act(() => { throw new Error((e as Error).message); }); }
    setStage("");
    const { hasFile: _h, ...rest } = values; void _h;
    const rid = await act(() => api.resources.save({ ...rest, url: mode === "url" ? rest.url : undefined, file: mode === "file" ? fileRefM : undefined, thumb: thumbRefM }, id), id ? tr("Resource updated", "ಸಂಪನ್ಮೂಲ ನವೀಕರಿಸಲಾಗಿದೆ") : values.status === "Published" ? tr("Resource published", "ಸಂಪನ್ಮೂಲ ಪ್ರಕಟಿಸಲಾಗಿದೆ") : tr("Resource saved", "ಸಂಪನ್ಮೂಲ ಉಳಿಸಲಾಗಿದೆ"));
    if (typeof rid === "string") { setSaved(true); router.push(`/admin/resources/${rid}`); }
  });

  return (
    <form onSubmit={submit()} noValidate className="space-y-4">
      <PageHeader title={r ? tr("Edit learning resource", "ಕಲಿಕಾ ಸಂಪನ್ಮೂಲ ತಿದ್ದಿ") : tr("Add learning resource", "ಕಲಿಕಾ ಸಂಪನ್ಮೂಲ ಸೇರಿಸಿ")} sub={r ? `${r.id} · ${r.status}` : tr("Upload a video, PDF or document, or add a link. Save it as a draft until it is ready to publish.", "ವೀಡಿಯೋ, PDF ಅಥವಾ ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಲಿಂಕ್ ಸೇರಿಸಿ. ಪ್ರಕಟಿಸಲು ಸಿದ್ಧವಾಗುವವರೆಗೆ ಕರಡಾಗಿ ಉಳಿಸಿ.")} actions={r && <Badge tone={r.status === "Published" ? "success" : "warning"}>{r.status}</Badge>} />
      <Card className="space-y-4"><h2 className="font-bold">{tr("About the resource", "ಸಂಪನ್ಮೂಲದ ಬಗ್ಗೆ")}</h2>
        <Field label={tr("Resource title", "ಸಂಪನ್ಮೂಲ ಶೀರ್ಷಿಕೆ")} error={err("title")} required>{(i, a) => <Input id={i} {...a} {...register("title")} />}</Field>
        <Field label={tr("Short description", "ಸಂಕ್ಷಿಪ್ತ ವಿವರಣೆ")} error={err("short")} hint={`${v.short?.length ?? 0}/200`} required>{(i, a) => <Textarea id={i} {...a} rows={2} {...register("short")} />}</Field>
        <Field label={tr("Full description", "ಪೂರ್ಣ ವಿವರಣೆ")} error={err("full")} hint={`${v.full?.length ?? 0}/3000`}>{(i, a) => <Textarea id={i} {...a} rows={5} {...register("full")} />}</Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={tr("Resource category", "ಸಂಪನ್ಮೂಲ ವರ್ಗ")} error={err("categoryId")} required>{(i, a) => <Select id={i} {...a} {...register("categoryId")}><option value="">—</option>{data.cats.map((c) => <option key={c.id} value={c.id}>{loc(c.name)}</option>)}</Select>}</Field>
          <Field label={tr("Topic", "ವಿಷಯ")} error={err("topic")} required>{(i, a) => <><Input id={i} {...a} list="topics" {...register("topic")} /><datalist id="topics">{data.topics.map((t) => <option key={t} value={t} />)}</datalist></>}</Field>
        </div>
      </Card>
      <Card className="space-y-4"><h2 className="font-bold">{tr("Content", "ವಿಷಯ")}</h2>
        <Field label={tr("Content type", "ವಿಷಯ ಪ್ರಕಾರ")} required>{(i) => <Select id={i} {...register("type", { onChange: () => { setFile(null); setRemoveFile(false); setFileErr(""); setValue("url", ""); } })}>{RESOURCE_TYPES.map((t) => <option key={t.id} value={t.id}>{t[lang]}</option>)}</Select>}</Field>
        {mode === "file" ? (
          <div className="space-y-2"><p className="text-sm font-medium">{tr("Upload file", "ಫೈಲ್ ಅಪ್‌ಲೋಡ್")} <span className="text-danger" aria-hidden>{v.status === "Published" || v.status === "Scheduled" ? "*" : ""}</span></p>
            <input ref={fileRef} type="file" aria-label="Upload resource file" accept={FILE_RULES[fileKind(v.type)].exts.map((e) => `.${e}`).join(",")} className="hidden" onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = ""; }} />
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed border-border p-4"><Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}><UploadSimple />{hasFile ? tr("Replace file", "ಫೈಲ್ ಬದಲಿಸಿ") : tr("Choose file", "ಫೈಲ್ ಆರಿಸಿ")}</Button>
              {hasFile ? <span className="flex items-center gap-2 text-sm"><b>{file?.name ?? r?.file?.name}</b><span className="text-muted">{((file?.size ?? r?.file?.size ?? 0) / 1024 / 1024).toFixed(2)} MB</span><button type="button" aria-label="Remove file" className="rounded-full p-1 hover:bg-accent-soft" onClick={() => { setFile(null); setRemoveFile(true); }}><X size={16} /></button></span> : <span className="text-sm text-muted">{FILE_RULES[fileKind(v.type)].label}</span>}</div>
            {(fileErr || err("hasFile")) && <p role="alert" className="text-xs text-danger">{fileErr || err("hasFile")}</p>}
            <p className="text-xs text-muted">{tr("The file is stored in this browser only; this prototype has no server.", "ಫೈಲ್ ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮಾತ್ರ ಉಳಿಯುತ್ತದೆ; ಈ ಮಾದರಿಗೆ ಸರ್ವರ್ ಇಲ್ಲ.")}</p></div>
        ) : (
          <Field label={v.type === "videoLink" ? tr("Video link (YouTube, or direct .mp4 / .webm)", "ವೀಡಿಯೋ ಲಿಂಕ್ (YouTube ಅಥವಾ .mp4 / .webm)") : tr("Website link", "ವೆಬ್‌ಸೈಟ್ ಲಿಂಕ್")} error={err("url")} hint={tr("Must start with https://", "https:// ನಿಂದ ಆರಂಭವಾಗಬೇಕು")} required={v.status === "Published" || v.status === "Scheduled"}>{(i, a) => <Input id={i} {...a} type="url" inputMode="url" placeholder="https://" {...register("url")} />}</Field>
        )}
        <div className="space-y-2"><p className="text-sm font-medium">{tr("Thumbnail image", "ಥಂಬ್‌ನೇಲ್ ಚಿತ್ರ")}</p>
          <input ref={thumbRef} type="file" aria-label="Upload thumbnail" accept=".png,.jpg,.jpeg,.webp" className="hidden" onChange={(e) => { pickThumb(e.target.files?.[0]); e.target.value = ""; }} />
          <div className="flex flex-wrap items-center gap-3">{(thumbPreview || (!removeThumb && curThumb.url)) && <span className="relative block h-16 w-28 overflow-hidden rounded-lg border border-border"><Image src={thumbPreview ?? curThumb.url ?? ""} alt={tr("Thumbnail preview", "ಥಂಬ್‌ನೇಲ್ ಪೂರ್ವವೀಕ್ಷಣೆ")} fill unoptimized sizes="112px" className="object-cover" /></span>}
            <Button type="button" variant="secondary" size="sm" onClick={() => thumbRef.current?.click()}><UploadSimple />{thumbPreview || curThumb.url ? tr("Replace", "ಬದಲಿಸಿ") : tr("Choose image", "ಚಿತ್ರ ಆರಿಸಿ")}</Button>{(thumbPreview || curThumb.url) && <Button type="button" variant="ghost" size="sm" onClick={() => { setThumb(null); setRemoveThumb(true); }}>{tr("Remove", "ತೆಗೆಯಿರಿ")}</Button>}<span className="text-xs text-muted">{FILE_RULES.thumb.label}</span></div>
          {thumbErr && <p role="alert" className="text-xs text-danger">{thumbErr}</p>}</div>
      </Card>
      <Card className="space-y-4"><h2 className="font-bold">{tr("Audience & publishing", "ಪ್ರೇಕ್ಷಕರು ಮತ್ತು ಪ್ರಕಟಣೆ")}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label={tr("Language", "ಭಾಷೆ")} required>{(i) => <Select id={i} {...register("language")}><option value="kn">ಕನ್ನಡ</option><option value="en">English</option><option value="both">{tr("Both", "ಎರಡೂ")}</option></Select>}</Field>
          <Field label={tr("Display order", "ಪ್ರದರ್ಶನ ಕ್ರಮ")} error={err("order")} hint={tr("Lower numbers show first", "ಕಡಿಮೆ ಸಂಖ್ಯೆ ಮೊದಲು")} required>{(i, a) => <Input id={i} {...a} type="number" min={0} max={9999} {...register("order", { valueAsNumber: true })} />}</Field>
          <Field label={tr("Publication status", "ಪ್ರಕಟಣೆ ಸ್ಥಿತಿ")} required>{(i) => <Select id={i} {...register("status")}><option value="Draft">{tr("Draft", "ಕರಡು")}</option><option value="Published">{tr("Published", "ಪ್ರಕಟಿತ")}</option><option value="Scheduled">{tr("Scheduled", "ನಿಗದಿತ")}</option><option value="Archived">{tr("Archived", "ಆರ್ಕೈವ್")}</option></Select>}</Field>
        </div>
        {(v.status === "Scheduled" || v.status === "Published") && <Field label={v.status === "Scheduled" ? tr("Publish date (goes live on this day)", "ಪ್ರಕಟಣೆ ದಿನಾಂಕ (ಈ ದಿನ ಲೈವ್)") : tr("Publish date", "ಪ್ರಕಟಣೆ ದಿನಾಂಕ")} error={err("publishDate")} hint={v.status === "Published" ? tr(`Leave empty to use today (${today})`, `ಖಾಲಿ ಬಿಟ್ಟರೆ ಇಂದು (${today})`) : undefined} required={v.status === "Scheduled"}>{(i, a) => <Input id={i} {...a} type="date" min={v.status === "Scheduled" ? today : undefined} {...register("publishDate")} />}</Field>}
        <Controller control={control} name="audience" render={({ field }) => (<fieldset className="space-y-2"><legend className="text-sm font-medium">{tr("Target audience", "ಗುರಿ ಪ್ರೇಕ್ಷಕರು")} <span aria-hidden className="text-danger">*</span></legend><div className="flex flex-wrap gap-4">{AUDIENCES.map((a) => <Check key={a.id} label={a[lang]} checked={field.value.includes(a.id)} onChange={(e) => field.onChange(e.target.checked ? [...field.value, a.id] : field.value.filter((x) => x !== a.id))} />)}</div>{err("audience") && <p role="alert" className="text-xs text-danger">{err("audience")}</p>}</fieldset>)} />
        <p className="text-xs text-muted">{tr("Volunteers only see a resource when it is Published (or Scheduled and its date has arrived) and Volunteers is ticked.", "ಪ್ರಕಟಿತ (ಅಥವಾ ನಿಗದಿತ ದಿನ ಬಂದಿರುವ) ಮತ್ತು 'ಸ್ವಯಂಸೇವಕರು' ಆಯ್ಕೆಯಾಗಿದ್ದರೆ ಮಾತ್ರ ಸ್ವಯಂಸೇವಕರಿಗೆ ಕಾಣುತ್ತದೆ.")}</p>
      </Card>
      {Object.keys(errors).length > 0 && <p role="alert" className="text-sm text-danger">{tr("Please fix the highlighted fields.", "ಹೈಲೈಟ್ ಮಾಡಿದ ಕ್ಷೇತ್ರಗಳನ್ನು ಸರಿಪಡಿಸಿ.")}</p>}
      {stage && <p role="status" className="text-sm text-muted">{stage}</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="lg" disabled={isSubmitting}>{r ? tr("Save changes", "ಬದಲಾವಣೆ ಉಳಿಸಿ") : v.status === "Published" ? tr("Publish", "ಪ್ರಕಟಿಸಿ") : tr("Save", "ಉಳಿಸಿ")}</Button>
        {(!r || r.status !== "Published") && v.status !== "Draft" && <Button type="button" variant="secondary" size="lg" disabled={isSubmitting} onClick={() => { setValue("status", "Draft"); void submit()(); }}>{tr("Save as draft", "ಕರಡಾಗಿ ಉಳಿಸಿ")}</Button>}
        <Button type="button" variant="secondary" size="lg" onClick={() => (dirty ? setLeave(true) : router.push(r ? `/admin/resources/${r.id}` : "/admin/resources"))}>{tr("Cancel", "ರದ್ದುಮಾಡಿ")}</Button>
      </div>
      <DemoNote>{tr("Frontend prototype: resources are saved in this browser, not on a server.", "ಫ್ರಂಟೆಂಡ್ ಮಾದರಿ: ಸಂಪನ್ಮೂಲಗಳು ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಉಳಿಯುತ್ತವೆ, ಸರ್ವರ್‌ನಲ್ಲಿ ಅಲ್ಲ.")}</DemoNote>
      <Confirm open={leave} onClose={() => setLeave(false)} onConfirm={() => router.push(r ? `/admin/resources/${r.id}` : "/admin/resources")} danger title={tr("Discard changes?", "ಬದಲಾವಣೆ ತ್ಯಜಿಸುವಿರಾ?")} confirmLabel={tr("Discard", "ತ್ಯಜಿಸಿ")} body={tr("You have unsaved changes on this form.", "ಈ ಫಾರ್ಮ್‌ನಲ್ಲಿ ಉಳಿಸದ ಬದಲಾವಣೆಗಳಿವೆ.")} />
    </form>
  );
}
