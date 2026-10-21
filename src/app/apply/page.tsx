"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle } from "@phosphor-icons/react";
import { Button, Card, Check, DemoNote, Field, Input, Progress, Select, Textarea } from "@/components/ui";
import { LangSwitch } from "@/components/shell/Controls";
import { useT } from "@/lib/useT";
import { acs, districts, gps, taluks } from "@/lib/seed-geo";
import { api, useAct } from "@/lib/api";
import { useDb } from "@/lib/db";
import { usePrefs } from "@/lib/store";

const ageOf = (dob: string) => { const b = new Date(dob); if (isNaN(+b)) return NaN; const n = new Date("2026-10-20"); let a = n.getFullYear() - b.getFullYear(); if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--; return a; };
const schema = z.object({
  name: z.string().min(2, "name").max(80),
  dob: z.string().refine((v) => { const a = ageOf(v); return a >= 20 && a <= 35; }, "age"),
  gender: z.string().min(1, "req"),
  district: z.string().min(1, "req"), ac: z.string().min(1, "req"), taluk: z.string().min(1, "req"), gp: z.string().min(1, "req"),
  education: z.string().min(1, "req"), institution: z.string().min(2, "req").max(100), field: z.string().min(2, "req").max(80), year: z.string().min(1, "req"),
  motivation: z.string().min(40, "short").max(600, "long"), experience: z.string().max(400).optional(),
  confirm: z.boolean().refine((v) => v, "confirm"),
});
type F = z.infer<typeof schema>;
const stepFields: FieldPath<F>[][] = [["name", "dob", "gender"], ["district", "ac", "taluk", "gp"], ["education", "institution", "field", "year"], ["motivation"], [], [], ["confirm"]];

export default function Apply() {
  const { tr } = useT(); const act = useAct();
  const draft = useDb((s) => s.appDraft) as Partial<F>; const [step, setStep] = useState(0); const [ref, setRef] = useState<string | null>(null); const [saved, setSaved] = useState(false);
  const f = useForm<F>({ resolver: zodResolver(schema), defaultValues: { gender: "", district: "", ac: "", taluk: "", gp: "", education: "", year: "", confirm: false, ...draft }, mode: "onTouched" });
  const { register, watch, trigger, formState: { errors, isDirty }, getValues, setValue } = f;
  const district = watch("district"), taluk = watch("taluk"), dob = watch("dob");
  useEffect(() => { if (!isDirty || ref) return; const h = (e: BeforeUnloadEvent) => { e.preventDefault(); }; addEventListener("beforeunload", h); return () => removeEventListener("beforeunload", h); }, [isDirty, ref]);
  const tks = useMemo(() => taluks.filter((t) => !district || t.district === district), [district]);
  const acOpts = acs; // constituencies are independent of the district → taluk tree
  const gpOpts = gps.filter((g) => !taluk || g.taluk === taluk);
  const titles = [tr("Personal details", "ವೈಯಕ್ತಿಕ ವಿವರ"), tr("Location", "ಸ್ಥಳ"), tr("Education", "ಶಿಕ್ಷಣ"), tr("Motivation", "ಪ್ರೇರಣೆ"), tr("Identity check (simulation)", "ಗುರುತಿನ ಪರಿಶೀಲನೆ (ಸಿಮ್ಯುಲೇಶನ್)"), tr("Review", "ಪರಿಶೀಲಿಸಿ"), tr("Confirm & submit", "ಖಚಿತಪಡಿಸಿ ಸಲ್ಲಿಸಿ")];
  const msg = (k?: string) => k ? ({ req: tr("This field is required.", "ಈ ಕ್ಷೇತ್ರ ಅಗತ್ಯ."), name: tr("Enter your full name (2–80 characters).", "ಪೂರ್ಣ ಹೆಸರು ನೀಡಿ (2–80)."), age: tr("Applicants must be aged 20 to 35.", "ಅರ್ಜಿದಾರರು 20 ರಿಂದ 35 ವರ್ಷದವರಾಗಿರಬೇಕು."), short: tr("Please write at least 40 characters.", "ಕನಿಷ್ಠ 40 ಅಕ್ಷರ ಬರೆಯಿರಿ."), long: tr("Maximum 600 characters.", "ಗರಿಷ್ಠ 600 ಅಕ್ಷರ."), confirm: tr("Please confirm to submit.", "ಸಲ್ಲಿಸಲು ದೃಢೀಕರಿಸಿ.") } as Record<string, string>)[k] ?? k : undefined;
  const err = (n: keyof F) => msg(errors[n]?.message as string | undefined);
  const next = async () => { if (await trigger(stepFields[step])) setStep(step + 1); };
  const saveDraft = async () => { await act(() => api.applications.saveDraft(getValues() as never), tr("Draft saved (demo)", "ಕರಡು ಉಳಿಸಲಾಗಿದೆ (ಡೆಮೊ)")); setSaved(true); };
  const submit = f.handleSubmit(async (v) => { const id = await act(() => api.applications.submit({ ...v, age: ageOf(v.dob), phone: usePrefs.getState().session?.phone })); if (id) { setRef(id); usePrefs.getState().renameSession(v.name.trim()); } });

  if (ref) return (
    <div className="mx-auto max-w-lg px-4 py-10"><Card className="space-y-3 text-center"><CheckCircle size={48} weight="fill" className="mx-auto text-success" />
      <h1 className="text-2xl font-bold">{tr("Application submitted", "ಅರ್ಜಿ ಸಲ್ಲಿಸಲಾಗಿದೆ")}</h1><p className="text-sm text-muted">{tr("Reference", "ಉಲ್ಲೇಖ")}</p><p className="text-xl font-mono font-bold">{ref}</p>
      <p className="text-sm">{tr("Your application will be reviewed manually by people. Registering does not guarantee selection. You can track the status anytime.", "ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ಜನರು ಕೈಯಾರೆ ಪರಿಶೀಲಿಸುತ್ತಾರೆ. ನೋಂದಣಿ ಆಯ್ಕೆಯ ಖಾತರಿಯಲ್ಲ. ಸ್ಥಿತಿಯನ್ನು ಯಾವಾಗ ಬೇಕಾದರೂ ನೋಡಬಹುದು.")}</p>
      <Link href="/app/status"><Button size="lg" className="w-full">{tr("Track my application", "ನನ್ನ ಅರ್ಜಿ ಸ್ಥಿತಿ ನೋಡಿ")}</Button></Link></Card></div>);

  const v = getValues();
  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <div className="mb-3 flex items-center justify-between"><Link href="/" className="font-bold text-primary">← {tr("Home", "ಮುಖಪುಟ")}</Link><LangSwitch /></div>
      <p className="text-sm text-muted">{tr(`Step ${step + 1} of 7`, `ಹಂತ ${step + 1} / 7`)}</p><Progress value={((step + 1) / 7) * 100} label="Progress" />
      <Card className="mt-4 space-y-4">
        <h1 className="text-xl font-bold">{titles[step]}</h1>
        {step === 0 && <>
          <Field label={tr("Full name", "ಪೂರ್ಣ ಹೆಸರು")} error={err("name")} required>{(id, a) => <Input id={id} {...a} {...register("name")} autoComplete="name" />}</Field>
          <Field label={tr("Date of birth", "ಹುಟ್ಟಿದ ದಿನಾಂಕ")} error={err("dob")} hint={dob && !isNaN(ageOf(dob)) ? tr(`Age: ${ageOf(dob)}`, `ವಯಸ್ಸು: ${ageOf(dob)}`) : tr("Eligible age is 20–35.", "ಅರ್ಹ ವಯಸ್ಸು 20–35.")} required>{(id, a) => <Input id={id} {...a} type="date" {...register("dob")} />}</Field>
          <Field label={tr("Gender", "ಲಿಂಗ")} error={err("gender")} required>{(id, a) => <Select id={id} {...a} {...register("gender")}><option value="">—</option>{["Female", "Male", "Non-binary", "Prefer not to say"].map((g) => <option key={g}>{g}</option>)}</Select>}</Field>
          <p className="text-xs text-muted">{tr("Mobile number was verified in the previous step (demo).", "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಹಿಂದಿನ ಹಂತದಲ್ಲಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ (ಡೆಮೊ).")}</p></>}
        {step === 1 && <>
          <Field label={tr("District", "ಜಿಲ್ಲೆ")} error={err("district")} required>{(id, a) => <Select id={id} {...a} {...register("district", { onChange: () => { setValue("taluk", ""); setValue("gp", ""); } })}><option value="">—</option>{districts.map((d) => <option key={d}>{d}</option>)}</Select>}</Field>
          <Field label={tr("Assembly constituency", "ವಿಧಾನಸಭಾ ಕ್ಷೇತ್ರ")} error={err("ac")} hint={tr("Constituencies are listed independently; they may cross taluk and district boundaries.", "ಕ್ಷೇತ್ರಗಳು ಸ್ವತಂತ್ರವಾಗಿ ಪಟ್ಟಿಯಾಗಿವೆ; ತಾಲ್ಲೂಕು/ಜಿಲ್ಲೆ ಗಡಿ ದಾಟಬಹುದು.")} required>{(id, a) => <Select id={id} {...a} {...register("ac")}><option value="">—</option>{acOpts.map((d) => <option key={d.name}>{d.name}</option>)}</Select>}</Field>
          <Field label={tr("Taluk", "ತಾಲ್ಲೂಕು")} error={err("taluk")} required>{(id, a) => <Select id={id} {...a} {...register("taluk", { onChange: () => setValue("gp", "") })}><option value="">—</option>{tks.map((d) => <option key={d.name}>{d.name}</option>)}</Select>}</Field>
          <Field label={tr("Gram Panchayat", "ಗ್ರಾಮ ಪಂಚಾಯತ್")} error={err("gp")} required>{(id, a) => <Select id={id} {...a} {...register("gp")} disabled={!taluk}><option value="">—</option>{gpOpts.map((d) => <option key={d.name}>{d.name}</option>)}</Select>}</Field></>}
        {step === 2 && <>
          <Field label={tr("Highest qualification", "ಅತ್ಯುನ್ನತ ವಿದ್ಯಾರ್ಹತೆ")} error={err("education")} required>{(id, a) => <Select id={id} {...a} {...register("education")}><option value="">—</option>{["SSLC", "PUC", "Diploma", "Bachelor's", "Master's", "Other"].map((g) => <option key={g}>{g}</option>)}</Select>}</Field>
          <Field label={tr("Institution", "ಸಂಸ್ಥೆ")} error={err("institution")} required>{(id, a) => <Input id={id} {...a} {...register("institution")} />}</Field>
          <Field label={tr("Field of study", "ಅಧ್ಯಯನ ಕ್ಷೇತ್ರ")} error={err("field")} required>{(id, a) => <Input id={id} {...a} {...register("field")} />}</Field>
          <Field label={tr("Completion year / status", "ಪೂರ್ಣಗೊಂಡ ವರ್ಷ / ಸ್ಥಿತಿ")} error={err("year")} required>{(id, a) => <Select id={id} {...a} {...register("year")}><option value="">—</option><option>Currently studying</option>{[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map((y) => <option key={y}>{y}</option>)}</Select>}</Field></>}
        {step === 3 && <>
          <Field label={tr("Why do you want to become a Grama Nayaka?", "ನೀವು ಗ್ರಾಮ ನಾಯಕ ಏಕೆ ಆಗಬೇಕು?")} error={err("motivation")} hint={`${watch("motivation")?.length ?? 0}/600`} required>{(id, a) => <Textarea id={id} {...a} rows={6} {...register("motivation")} />}</Field>
          <Field label={tr("Relevant experience (optional)", "ಸಂಬಂಧಿತ ಅನುಭವ (ಐಚ್ಛಿಕ)")}>{(id) => <Textarea id={id} {...register("experience")} />}</Field></>}
        {step === 4 && <>
          <DemoNote>{tr("Simulation only. No Aadhaar number or OTP is requested or stored, and nothing is checked with any government system.", "ಸಿಮ್ಯುಲೇಶನ್ ಮಾತ್ರ. ಆಧಾರ್ ಸಂಖ್ಯೆ ಅಥವಾ OTP ಕೇಳುವುದಿಲ್ಲ, ಸಂಗ್ರಹಿಸುವುದಿಲ್ಲ; ಯಾವ ಸರ್ಕಾರಿ ವ್ಯವಸ್ಥೆಯಲ್ಲೂ ಪರಿಶೀಲಿಸುವುದಿಲ್ಲ.")}</DemoNote>
          <p className="rounded-xl bg-accent-soft p-3 text-sm">{tr("Status: Simulated – not verified. Reference: VR-DEMO-0001. A reviewer may ask for documents later.", "ಸ್ಥಿತಿ: ಸಿಮ್ಯುಲೇಶನ್ – ಪರಿಶೀಲಿಸಿಲ್ಲ. ಉಲ್ಲೇಖ: VR-DEMO-0001. ಪರಿಶೀಲಕರು ನಂತರ ದಾಖಲೆ ಕೇಳಬಹುದು.")}</p></>}
        {step === 5 && <dl className="space-y-2 text-sm">{([[0, tr("Name", "ಹೆಸರು"), v.name], [0, tr("Date of birth", "ಹುಟ್ಟಿದ ದಿನಾಂಕ"), v.dob], [1, tr("Location", "ಸ್ಥಳ"), [v.gp, v.taluk, v.district, v.ac].join(", ")], [2, tr("Education", "ಶಿಕ್ಷಣ"), `${v.education}, ${v.institution}, ${v.field} (${v.year})`], [3, tr("Motivation", "ಪ್ರೇರಣೆ"), v.motivation]] as [number, string, string][]).map(([s, k, val]) => <div key={k} className="flex justify-between gap-3 border-b border-border pb-2"><div><dt className="text-muted">{k}</dt><dd className="break-words">{val}</dd></div><button className="text-primary underline" onClick={() => setStep(s)}>{tr("Edit", "ತಿದ್ದಿ")}</button></div>)}</dl>}
        {step === 6 && <>
          <Check {...register("confirm")} label={tr("I confirm my details are correct and I have read the privacy notice. I understand selection is decided by manual review and is not guaranteed.", "ನನ್ನ ವಿವರ ಸರಿಯಾಗಿದೆ, ಗೌಪ್ಯತಾ ಸೂಚನೆ ಓದಿದ್ದೇನೆ. ಆಯ್ಕೆ ಕೈಯಾರೆ ಪರಿಶೀಲನೆಯಿಂದ ನಿರ್ಧಾರವಾಗುತ್ತದೆ, ಖಾತರಿಯಲ್ಲ ಎಂದು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ.")} />
          {err("confirm") && <p role="alert" className="text-xs text-danger">{err("confirm")}</p>}
          <Link href="/privacy" target="_blank" className="text-sm text-primary underline">{tr("Privacy notice", "ಗೌಪ್ಯತಾ ಸೂಚನೆ")}</Link></>}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {step > 0 && <Button variant="secondary" onClick={() => setStep(step - 1)}>{tr("Back", "ಹಿಂದೆ")}</Button>}
          <Button variant="ghost" onClick={saveDraft}>{tr("Save draft", "ಕರಡು ಉಳಿಸಿ")}</Button>
          <div className="flex-1" />
          {step < 6 ? <Button onClick={next}>{tr("Next", "ಮುಂದೆ")}</Button> : <Button onClick={submit} disabled={f.formState.isSubmitting}>{tr("Submit application", "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ")}</Button>}
        </div>
        {isDirty && !saved && <p className="text-xs text-warning">{tr("Unsaved changes", "ಉಳಿಸದ ಬದಲಾವಣೆಗಳು")}</p>}
        {saved && <p className="text-xs text-success">{tr("Draft saved. You can resume later from this page.", "ಕರಡು ಉಳಿಸಲಾಗಿದೆ. ನಂತರ ಇಲ್ಲಿಂದ ಮುಂದುವರಿಸಬಹುದು.")}</p>}
      </Card>
    </div>
  );
}
