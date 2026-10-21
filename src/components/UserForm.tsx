"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "@phosphor-icons/react";
import { Badge, Button, Card, Confirm, DemoNote, Field, Input, PageHeader, QState, Select, Textarea } from "@/components/ui";
import { ActivationCodeDialog } from "@/components/ActivationCode";
import { api, useAct, useMock } from "@/lib/api";
import { getDb } from "@/lib/db";
import { gpOptions, talukOptions, districts } from "@/lib/geo";
import { assignableRoles, RBAC_ROLES } from "@/lib/rbac";
import { trainingStatusOf } from "@/lib/trainingRules";
import { usePrefs } from "@/lib/store";
import { userFormSchema, type UserFormValues } from "@/lib/userForm";
import { useT } from "@/lib/useT";

const blank: UserFormValues = { name: "", phone: "", email: "", dob: "", address: "", role: "volunteer", district: "", taluk: "", gp: "", villageId: "", sessionId: "", status: "Active", reason: "" };

export function UserFormPage({ userId }: { userId?: string }) {
  const { tr, lang } = useT(); const q = useMock(["user-form", userId], () => { const d = getDb(); const u = userId ? d.users.find((x) => x.id === userId) : undefined; const pid = u?.participantId; return { u: u ?? null, classes: d.classes, villages: d.villages, curSession: d.classes.find((c) => pid && c.roster.includes(pid) && c.status !== "Cancelled")?.id ?? "", curVillage: d.villages.find((v) => pid && v.volunteerIds.includes(pid))?.id ?? "" }; });
  return (
    <div className="space-y-4">
      <Link href={userId ? `/admin/users/${userId}` : "/admin/users"} className="inline-flex items-center gap-1 text-sm font-medium text-primary"><ArrowLeft />{tr("Back", "ಹಿಂದೆ")}</Link>
      <QState q={q} isEmpty={(d) => !!userId && !d.u} empty={<Card className="py-10 text-center">{tr("Account not found.", "ಖಾತೆ ಸಿಗಲಿಲ್ಲ.")}</Card>}>{(d) => <Inner key={userId ?? "new"} data={d} lang={lang} />}</QState>
    </div>
  );
}

type FormData = { u: ReturnType<typeof getDb>["users"][number] | null; classes: ReturnType<typeof getDb>["classes"]; villages: ReturnType<typeof getDb>["villages"]; curSession: string; curVillage: string };
function Inner({ data, lang }: { data: FormData; lang: "kn" | "en" }) {
  const { tr } = useT(); const act = useAct(); const router = useRouter(); const role = usePrefs((s) => s.role); const assignable = assignableRoles(role);
  const u = data.u; const initial: UserFormValues = u ? { ...blank, name: u.name, phone: u.phone, email: u.email, dob: u.dob ?? "", address: u.address ?? "", role: u.role, district: u.district, taluk: u.taluk, gp: u.gp, villageId: data.curVillage, sessionId: data.curSession, status: u.status === "Deleted" ? "Inactive" : u.status } : { ...blank, role: assignable.includes("volunteer") ? "volunteer" : assignable[0] ?? "volunteer" };
  const f = useForm<UserFormValues>({ resolver: zodResolver(userFormSchema), defaultValues: initial, mode: "onTouched" });
  const { register, watch, setValue, handleSubmit, formState: { errors, isDirty, isSubmitting } } = f;
  const v = watch(); const [leave, setLeave] = useState(false); const [done, setDone] = useState<{ id: string; code: string; name: string } | null>(null); const [formErr, setFormErr] = useState("");
  useEffect(() => { if (!isDirty || done) return; const h = (e: BeforeUnloadEvent) => e.preventDefault(); addEventListener("beforeunload", h); return () => removeEventListener("beforeunload", h); }, [isDirty, done]);
  const vil = data.villages.filter((x) => x.gp === v.gp && (x.status !== "Inactive" || x.id === initial.villageId));
  const sessions = data.classes.filter((c) => c.status !== "Cancelled" && (c.publish !== "Draft" || c.id === initial.sessionId));
  const training = u?.participantId ? trainingStatusOf(data.classes, u.participantId) : v.sessionId ? "Registered" : "Not registered";
  const err = (k: keyof UserFormValues) => errors[k]?.message as string | undefined;
  const roleOptions = [...new Set([...(u ? [u.role] : []), ...assignable])];

  const submit = handleSubmit(async (x) => {
    setFormErr("");
    if (!u) {
      const r = await act(() => api.users.add({ name: x.name, phone: x.phone, email: x.email, role: x.role, district: x.district, taluk: x.taluk, gp: x.gp, dob: x.dob || undefined, address: x.address || undefined, villageId: x.villageId || undefined, sessionId: x.sessionId || undefined, status: x.status }), tr("Account created", "ಖಾತೆ ರಚಿಸಲಾಗಿದೆ"));
      if (r && typeof r === "object") setDone({ id: r.id, code: r.code, name: x.name }); else setFormErr(tr("Could not create the account. Check the message above and try again.", "ಖಾತೆ ರಚಿಸಲಾಗಲಿಲ್ಲ. ಮೇಲಿನ ಸಂದೇಶ ನೋಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."));
      return;
    }
    const patch: Record<string, unknown> = {}; (["name", "phone", "email", "dob", "address", "role", "district", "taluk", "gp"] as const).forEach((k) => { if (x[k] !== initial[k]) patch[k] = x[k]; });
    if (x.villageId !== initial.villageId) patch.villageId = x.villageId; if (x.sessionId !== initial.sessionId) patch.sessionId = x.sessionId;
    if (x.status !== initial.status && x.status !== "Active" && x.reason.trim().length < 3) { setFormErr(tr("Give a reason for deactivating or suspending this account.", "ಈ ಖಾತೆ ನಿಷ್ಕ್ರಿಯ ಅಥವಾ ತಡೆಹಿಡಿಯಲು ಕಾರಣ ನೀಡಿ.")); return; }
    let ok = true;
    if (Object.keys(patch).length) ok = (await act(() => api.users.update(u.id, patch), tr("Changes saved", "ಬದಲಾವಣೆ ಉಳಿಸಲಾಗಿದೆ"))) !== undefined;
    if (ok && x.status !== initial.status) ok = (await act(() => api.users.setStatus(u.id, x.status, x.reason), tr("Account status updated", "ಖಾತೆ ಸ್ಥಿತಿ ನವೀಕರಿಸಲಾಗಿದೆ"))) !== undefined;
    if (ok) { f.reset(x); router.push(`/admin/users/${u.id}`); }
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <PageHeader title={u ? tr("Edit volunteer / user", "ಸ್ವಯಂಸೇವಕ / ಬಳಕೆದಾರ ತಿದ್ದಿ") : tr("Add volunteer / user", "ಸ್ವಯಂಸೇವಕ / ಬಳಕೆದಾರ ಸೇರಿಸಿ")} sub={u ? `${u.id} · ${u.name}` : tr("Create the account, place the volunteer in a village and register them for training in one step.", "ಖಾತೆ ರಚಿಸಿ, ಸ್ವಯಂಸೇವಕರನ್ನು ಗ್ರಾಮಕ್ಕೆ ಮತ್ತು ತರಬೇತಿಗೆ ಒಂದೇ ಹಂತದಲ್ಲಿ ನೋಂದಾಯಿಸಿ.")} />
      <Card className="space-y-4"><h2 className="font-bold">{tr("Personal details", "ವೈಯಕ್ತಿಕ ವಿವರ")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={tr("Full name", "ಪೂರ್ಣ ಹೆಸರು")} error={err("name")} required>{(i, a) => <Input id={i} {...a} {...register("name")} autoComplete="off" />}</Field>
          <Field label={tr("Mobile number", "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ")} error={err("phone")} hint={tr("Use fictional numbers in this demo", "ಈ ಡೆಮೊದಲ್ಲಿ ಕಾಲ್ಪನಿಕ ಸಂಖ್ಯೆ ಬಳಸಿ")} required>{(i, a) => <Input id={i} {...a} {...register("phone")} inputMode="numeric" />}</Field>
          <Field label={tr("Email address", "ಇಮೇಲ್ ವಿಳಾಸ")} error={err("email")}>{(i, a) => <Input id={i} {...a} type="email" {...register("email")} />}</Field>
          <Field label={tr("Date of birth", "ಹುಟ್ಟಿದ ದಿನಾಂಕ")} error={err("dob")} hint={tr("Optional. Age 18–100.", "ಐಚ್ಛಿಕ. ವಯಸ್ಸು 18–100.")}>{(i, a) => <Input id={i} {...a} type="date" {...register("dob")} max="2008-10-20" />}</Field>
        </div>
        <Field label={tr("Address", "ವಿಳಾಸ")} error={err("address")} hint={`${v.address?.length ?? 0}/300`}>{(i, a) => <Textarea id={i} {...a} rows={2} {...register("address")} />}</Field>
      </Card>
      <Card className="space-y-4"><h2 className="font-bold">{tr("Role & location", "ಪಾತ್ರ ಮತ್ತು ಸ್ಥಳ")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={tr("User role", "ಬಳಕೆದಾರ ಪಾತ್ರ")} error={err("role")} hint={tr("You can only assign roles below your own.", "ನಿಮ್ಮ ಪಾತ್ರದ ಕೆಳಗಿನ ಪಾತ್ರ ಮಾತ್ರ ನಿಯೋಜಿಸಬಹುದು.")} required>{(i, a) => <Select id={i} {...a} {...register("role")}>{roleOptions.map((r) => <option key={r} value={r} disabled={!assignable.includes(r)}>{RBAC_ROLES.find((x) => x.id === r)?.[lang]}</option>)}</Select>}</Field>
          <Field label={tr("Account status", "ಖಾತೆ ಸ್ಥಿತಿ")} error={err("status")}>{(i, a) => <Select id={i} {...a} {...register("status")}><option value="Active">{tr("Active", "ಸಕ್ರಿಯ")}</option><option value="Inactive">{tr("Inactive", "ನಿಷ್ಕ್ರಿಯ")}</option><option value="Suspended">{tr("Suspended", "ತಡೆ")}</option></Select>}</Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label={tr("District", "ಜಿಲ್ಲೆ")} error={err("district")} required={v.role === "volunteer"}>{(i, a) => <Select id={i} {...a} {...register("district", { onChange: () => { setValue("taluk", ""); setValue("gp", ""); setValue("villageId", ""); } })}><option value="">—</option>{districts.map((x) => <option key={x}>{x}</option>)}</Select>}</Field>
          <Field label={tr("Block / taluk", "ಬ್ಲಾಕ್ / ತಾಲ್ಲೂಕು")} error={err("taluk")} required={v.role === "volunteer"}>{(i, a) => <Select id={i} {...a} disabled={!v.district} {...register("taluk", { onChange: () => { setValue("gp", ""); setValue("villageId", ""); } })}><option value="">—</option>{talukOptions(v.district).map((x) => <option key={x}>{x}</option>)}</Select>}</Field>
          <Field label="Gram Panchayat" error={err("gp")} required={v.role === "volunteer"}>{(i, a) => <Select id={i} {...a} disabled={!v.taluk} {...register("gp", { onChange: () => setValue("villageId", "") })}><option value="">—</option>{gpOptions(v.taluk).map((x) => <option key={x}>{x}</option>)}</Select>}</Field>
        </div>
        {v.role === "volunteer" && <div className="grid gap-3 sm:grid-cols-2">
          <Field label={tr("Village", "ಗ್ರಾಮ")} error={err("villageId")} hint={vil.length || !v.gp ? tr("Use “Assign villages” on the profile for more than one.", "ಒಂದಕ್ಕಿಂತ ಹೆಚ್ಚಿಗೆ ಪ್ರೊಫೈಲ್‌ನ “ಗ್ರಾಮ ನಿಯೋಜಿಸಿ” ಬಳಸಿ.") : tr("No villages are registered under this Gram Panchayat yet. Add one in Village Enrollment.", "ಈ ಗ್ರಾಮ ಪಂಚಾಯತ್‌ನಲ್ಲಿ ಇನ್ನೂ ಗ್ರಾಮಗಳಿಲ್ಲ. ಗ್ರಾಮ ನೋಂದಣಿಯಲ್ಲಿ ಸೇರಿಸಿ.")}>{(i, a) => <Select id={i} {...a} disabled={!v.gp} {...register("villageId")}><option value="">—</option>{vil.map((x) => <option key={x.id} value={x.id}>{x.name}{x.status !== "Enrolled" ? ` (${x.status})` : ""}</option>)}</Select>}</Field>
          <Field label={tr("Assigned training session", "ನಿಯೋಜಿತ ತರಬೇತಿ ಅವಧಿ")} error={err("sessionId")} hint={tr("Only published sessions with free seats are listed.", "ಪ್ರಕಟಿತ ಮತ್ತು ಖಾಲಿ ಆಸನವಿರುವ ಅವಧಿಗಳು ಮಾತ್ರ.")}>{(i, a) => <Select id={i} {...a} {...register("sessionId")}><option value="">{tr("Not registered", "ನೋಂದಾಯಿಸಿಲ್ಲ")}</option>{sessions.map((c) => <option key={c.id} value={c.id} disabled={c.roster.length >= c.capacity && c.id !== initial.sessionId}>{c.name} · {c.startDate} · {c.roster.length}/{c.capacity}</option>)}</Select>}</Field>
        </div>}
        {v.role === "volunteer" && <p className="flex items-center gap-2 text-sm"><span className="text-muted">{tr("Training status", "ತರಬೇತಿ ಸ್ಥಿತಿ")}:</span><Badge tone={training === "Completed" ? "success" : training === "Not registered" ? "neutral" : "info"}>{training}</Badge><span className="text-xs text-muted">{tr("Updates automatically from the session and attendance.", "ಅವಧಿ ಮತ್ತು ಹಾಜರಾತಿಯಿಂದ ಸ್ವಯಂ ನವೀಕರಣ.")}</span></p>}
        {u && v.status !== initial.status && v.status !== "Active" && <Field label={tr("Reason (required)", "ಕಾರಣ (ಅಗತ್ಯ)")}>{(i) => <Textarea id={i} rows={2} {...register("reason")} />}</Field>}
      </Card>
      {!u && <DemoNote>{tr("After saving you will see a one-time activation code for the new account. No password is created or stored.", "ಉಳಿಸಿದ ನಂತರ ಹೊಸ ಖಾತೆಗೆ ಒಂದು ಬಾರಿಯ ಸಕ್ರಿಯಗೊಳಿಸುವ ಕೋಡ್ ತೋರಿಸಲಾಗುತ್ತದೆ. ಪಾಸ್‌ವರ್ಡ್ ರಚಿಸುವುದಿಲ್ಲ ಅಥವಾ ಸಂಗ್ರಹಿಸುವುದಿಲ್ಲ.")}</DemoNote>}
      {formErr && <p role="alert" className="text-sm text-danger">{formErr}</p>}
      {Object.keys(errors).length > 0 && <p role="alert" className="text-sm text-danger">{tr("Please fix the highlighted fields.", "ಹೈಲೈಟ್ ಮಾಡಿದ ಕ್ಷೇತ್ರಗಳನ್ನು ಸರಿಪಡಿಸಿ.")}</p>}
      <div className="flex flex-wrap gap-2"><Button type="submit" size="lg" disabled={isSubmitting}>{u ? tr("Save changes", "ಬದಲಾವಣೆ ಉಳಿಸಿ") : tr("Create account", "ಖಾತೆ ರಚಿಸಿ")}</Button><Button type="button" variant="secondary" size="lg" onClick={() => (isDirty ? setLeave(true) : router.push(u ? `/admin/users/${u.id}` : "/admin/users"))}>{tr("Cancel", "ರದ್ದುಮಾಡಿ")}</Button></div>
      <Confirm open={leave} onClose={() => setLeave(false)} onConfirm={() => router.push(u ? `/admin/users/${u.id}` : "/admin/users")} title={tr("Discard changes?", "ಬದಲಾವಣೆ ತ್ಯಜಿಸುವಿರಾ?")} confirmLabel={tr("Discard", "ತ್ಯಜಿಸಿ")} danger body={tr("You have unsaved changes on this form.", "ಈ ಫಾರ್ಮ್‌ನಲ್ಲಿ ಉಳಿಸದ ಬದಲಾವಣೆಗಳಿವೆ.")} />
      {done && <ActivationCodeDialog open code={done.code} name={done.name} userId={done.id} onClose={() => router.push(`/admin/users/${done.id}`)} />}
    </form>
  );
}
