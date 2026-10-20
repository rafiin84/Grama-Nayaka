"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Check, DemoNote, Field, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { api, useAct } from "@/lib/api";
import { useDb } from "@/lib/db";
import { GRIEVANCE_CATEGORIES, gps, districtOf, taluks } from "@/lib/seed-geo";
import { useT } from "@/lib/useT";

const schema = z.object({ category: z.string().min(1), title: z.string().min(8).max(100), description: z.string().min(20).max(800), locality: z.string().min(2), gp: z.string().min(1), observed: z.string().min(1), urgency: z.enum(["Low", "Medium", "High"]), residentRef: z.string().optional(), lang: z.string(), notice: z.boolean().refine((v) => v) });
type F = z.infer<typeof schema>;
export default function NewGrievance() {
  const { tr, lang } = useT(); const act = useAct(); const router = useRouter(); const residents = useDb((s) => s.residents); const [file, setFile] = useState<File | null>(null); const [fileErr, setFileErr] = useState(""); const ref = useRef<HTMLInputElement>(null);
  const f = useForm<F>({ resolver: zodResolver(schema), defaultValues: { urgency: "Medium", lang, notice: false, category: "", gp: "Hosahalli GP", observed: "2026-10-19" } });
  const e = f.formState.errors; const m = (k: keyof F, s: string) => (e[k] ? s : undefined); const req = tr("Required or too short.", "ಅಗತ್ಯ ಅಥವಾ ತುಂಬಾ ಚಿಕ್ಕದು.");
  const onFile = (x?: File) => { setFileErr(""); if (!x) return setFile(null); if (!/^image\/(png|jpe?g)$/.test(x.type)) return setFileErr(tr("Only JPG or PNG images.", "JPG ಅಥವಾ PNG ಮಾತ್ರ.")); if (x.size > 5 * 1024 * 1024) return setFileErr(tr("Max 5 MB.", "ಗರಿಷ್ಠ 5 MB.")); setFile(x); };
  const submit = f.handleSubmit(async (v) => { const tk = gps.find((g) => g.name === v.gp)?.taluk ?? ""; const id = await act(() => api.grievances.create({ title: v.title, category: v.category, description: v.description, locality: v.locality, gp: v.gp, district: districtOf(tk), urgency: v.urgency, residentRef: v.residentRef ? `R-••${v.residentRef.slice(-3)}` : undefined, observed: v.observed, nextAction: "Collect details and first follow-up", followUpDate: "2026-10-27" }), tr("Issue logged", "ಸಮಸ್ಯೆ ದಾಖಲಿಸಲಾಗಿದೆ")); if (id) router.push(`/app/grievances/${id}`); });
  void taluks;
  return (<div className="mx-auto max-w-xl space-y-4"><PageHeader title={tr("Log an issue", "ಸಮಸ್ಯೆ ದಾಖಲಿಸಿ")} sub={tr("Record only what is needed. Do not add Aadhaar, voter ID or opinions about people.", "ಅಗತ್ಯವಿರುವುದನ್ನು ಮಾತ್ರ ದಾಖಲಿಸಿ. ಆಧಾರ್, ಮತದಾರ ಗುರುತು ಅಥವಾ ವ್ಯಕ್ತಿಗಳ ಬಗ್ಗೆ ಅಭಿಪ್ರಾಯ ಬೇಡ.")} />
    <Card className="space-y-4">
      <Field label={tr("Category", "ವರ್ಗ")} error={m("category", req)} required>{(id, a) => <Select id={id} {...a} {...f.register("category")}><option value="">—</option>{GRIEVANCE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c[lang]}</option>)}</Select>}</Field>
      <Field label={tr("Title", "ಶೀರ್ಷಿಕೆ")} error={m("title", req)} required>{(id, a) => <Input id={id} {...a} {...f.register("title")} />}</Field>
      <Field label={tr("Description", "ವಿವರಣೆ")} error={m("description", req)} hint={tr("At least 20 characters.", "ಕನಿಷ್ಠ 20 ಅಕ್ಷರ.")} required>{(id, a) => <Textarea id={id} {...a} {...f.register("description")} />}</Field>
      <div className="grid gap-3 sm:grid-cols-2"><Field label={tr("Locality / ward", "ಸ್ಥಳ / ವಾರ್ಡ್")} error={m("locality", req)} required>{(id, a) => <Input id={id} {...a} {...f.register("locality")} />}</Field><Field label={tr("Date observed", "ಗಮನಿಸಿದ ದಿನಾಂಕ")} required>{(id) => <Input id={id} type="date" {...f.register("observed")} />}</Field></div>
      <Field label={tr("Gram Panchayat", "ಗ್ರಾಮ ಪಂಚಾಯತ್")}>{(id) => <Select id={id} {...f.register("gp")}>{gps.map((g) => <option key={g.name}>{g.name}</option>)}</Select>}</Field>
      <div className="grid gap-3 sm:grid-cols-2"><Field label={tr("Urgency", "ತುರ್ತು")}>{(id) => <Select id={id} {...f.register("urgency")}><option>Low</option><option>Medium</option><option>High</option></Select>}</Field><Field label={tr("Preferred language", "ಆದ್ಯತೆಯ ಭಾಷೆ")}>{(id) => <Select id={id} {...f.register("lang")}><option value="kn">ಕನ್ನಡ</option><option value="en">English</option></Select>}</Field></div>
      <Field label={tr("Linked resident (optional)", "ಲಿಂಕ್ ಮಾಡಿದ ನಿವಾಸಿ (ಐಚ್ಛಿಕ)")} hint={tr("Only a masked reference is stored on the case.", "ಪ್ರಕರಣದಲ್ಲಿ ಮರೆಮಾಡಿದ ಉಲ್ಲೇಖ ಮಾತ್ರ ಉಳಿಯುತ್ತದೆ.")}>{(id) => <Select id={id} {...f.register("residentRef")}><option value="">—</option>{residents.slice(0, 5).map((r) => <option key={r.id} value={r.id}>{r.id} · {r.locality}</option>)}</Select>}</Field>
      <div><p className="text-sm font-medium">{tr("Photo evidence (optional)", "ಫೋಟೋ ಸಾಕ್ಷ್ಯ (ಐಚ್ಛಿಕ)")}</p><input ref={ref} type="file" accept="image/png,image/jpeg" className="mt-1 text-sm" onChange={(x) => onFile(x.target.files?.[0])} />{file && <p className="text-xs text-muted">{file.name} ({Math.round(file.size / 1024)} KB) — {tr("not uploaded in demo", "ಡೆಮೊದಲ್ಲಿ ಅಪ್‌ಲೋಡ್ ಆಗುವುದಿಲ್ಲ")}</p>}{fileErr && <p role="alert" className="text-xs text-danger">{fileErr}</p>}</div>
      <Check {...f.register("notice")} label={tr("I have told any resident involved why this is recorded and they agree (notice given).", "ಈ ದಾಖಲೆ ಏಕೆ ಎಂದು ಸಂಬಂಧಿತ ನಿವಾಸಿಗೆ ತಿಳಿಸಿದ್ದೇನೆ ಮತ್ತು ಅವರು ಒಪ್ಪಿದ್ದಾರೆ.")} />{e.notice && <p role="alert" className="text-xs text-danger">{tr("Please confirm.", "ದೃಢೀಕರಿಸಿ.")}</p>}
      <DemoNote>{tr("This creates a tracking record only. Nothing is filed with any authority.", "ಇದು ಟ್ರ್ಯಾಕಿಂಗ್ ದಾಖಲೆ ಮಾತ್ರ. ಯಾವ ಪ್ರಾಧಿಕಾರಕ್ಕೂ ಸಲ್ಲಿಸುವುದಿಲ್ಲ.")}</DemoNote>
      <Button size="lg" className="w-full" disabled={f.formState.isSubmitting} onClick={submit}>{tr("Create issue", "ಸಮಸ್ಯೆ ರಚಿಸಿ")}</Button></Card></div>);
}
