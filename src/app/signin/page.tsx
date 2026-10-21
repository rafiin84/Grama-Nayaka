"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Card, DemoNote, Field, Input } from "@/components/ui";
import { LangSwitch } from "@/components/shell/Controls";
import { MOCK_OTP } from "@/lib/consent";
import { useDb } from "@/lib/db";
import { homeFor } from "@/lib/nav";
import { RBAC_ROLES } from "@/lib/rbac";
import { signInResult, last10, maskPhone, type SignInResult } from "@/lib/session";
import { usePrefs } from "@/lib/store";
import { INSTANT_ACCESS } from "@/lib/config";
import { useT } from "@/lib/useT";
import { toast } from "sonner";

export default function SignIn() {
  const { tr, lang } = useT(); const router = useRouter(); const signIn = usePrefs((s) => s.signIn); const session = usePrefs((s) => s.session); const users = useDb((s) => s.users);
  const [step, setStep] = useState<"phone" | "otp" | "denied">("phone"); const [phone, setPhone] = useState(""); const [otp, setOtp] = useState(""); const [err, setErr] = useState(""); const [tries, setTries] = useState(0); const [expired, setExpired] = useState(false); const [left, setLeft] = useState(0); const [resends, setResends] = useState(0); const [denied, setDenied] = useState<Exclude<SignInResult, { ok: true }> | null>(null); const [busy, setBusy] = useState(false);
  useEffect(() => { if (left <= 0) return; const t = setTimeout(() => setLeft(left - 1), 1000); return () => clearTimeout(t); }, [left]);
  const limited = tries >= 3;
  const demo = users.filter((u) => u.status === "Active").slice(0, 12);

  const send = () => { if (!/^[6-9]\d{9}$/.test(phone)) return setErr(tr("Enter a valid 10-digit mobile number starting with 6–9.", "6–9 ರಿಂದ ಆರಂಭವಾಗುವ ಸರಿಯಾದ 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನೀಡಿ.")); setErr(""); setStep("otp"); setLeft(30); setTries(0); setExpired(false); setOtp(""); };
  const verify = async () => {
    if (limited || busy) return;
    if (expired) return setErr(tr("This code has expired. Request a new one.", "ಈ ಕೋಡ್ ಅವಧಿ ಮುಗಿದಿದೆ. ಹೊಸದನ್ನು ಕೇಳಿ."));
    if (otp !== MOCK_OTP) { const n = tries + 1; setTries(n); setOtp(""); return setErr(n >= 3 ? tr("Too many wrong attempts. Please try again later (demo rate limit).", "ತುಂಬಾ ತಪ್ಪು ಪ್ರಯತ್ನಗಳು. ನಂತರ ಪ್ರಯತ್ನಿಸಿ (ಡೆಮೊ ಮಿತಿ).") : tr(`Wrong code. ${3 - n} attempts left.`, `ತಪ್ಪು ಕೋಡ್. ${3 - n} ಪ್ರಯತ್ನ ಬಾಕಿ.`)); }
    setBusy(true); await new Promise((r) => setTimeout(r, 400)); // simulated network call
    const r = signInResult(users, phone); setBusy(false);
    if (!r.ok && r.reason === "not-found") {
      // Registered but not yet approved: no account exists, so match the pending application instead.
      const db = useDb.getState(); const app = db.applications.find((x) => last10(x.phone).length === 10 && last10(x.phone) === last10(phone));
      if (app) { db.patch((d) => { d.myApplicationId = app.id; }); signIn({ userId: `NEW-${last10(phone).slice(-4)}`, name: app.name, role: "participant", phoneMasked: maskPhone(phone), phone, applicant: true, demo: INSTANT_ACCESS }); toast.success(tr(`Signed in as ${app.name}`, `${app.name} ಆಗಿ ಸೈನ್ ಇನ್ ಆಗಿದೆ`)); router.push(INSTANT_ACCESS ? "/choose" : "/app"); return; }
    }
    if (!r.ok) { setDenied(r); setStep("denied"); return; }
    signIn(r.session); toast.success(tr(`Signed in as ${r.session.name}`, `${r.session.name} ಆಗಿ ಸೈನ್ ಇನ್ ಆಗಿದೆ`)); router.push(homeFor(r.session.role));
  };
  const reasonText = (d: typeof denied) => d?.reason === "not-found" ? tr("No account is linked to this number. If you are new, register first.", "ಈ ಸಂಖ್ಯೆಗೆ ಯಾವುದೇ ಖಾತೆ ಲಿಂಕ್ ಆಗಿಲ್ಲ. ಹೊಸಬರಾದರೆ ಮೊದಲು ನೋಂದಾಯಿಸಿ.") : d?.reason === "deleted" ? tr("This account has been removed. Contact programme support.", "ಈ ಖಾತೆ ತೆಗೆಯಲಾಗಿದೆ. ಕಾರ್ಯಕ್ರಮ ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ.") : tr("This account is not active. Contact your coordinator.", "ಈ ಖಾತೆ ಸಕ್ರಿಯವಿಲ್ಲ. ನಿಮ್ಮ ಸಂಯೋಜಕರನ್ನು ಸಂಪರ್ಕಿಸಿ.");

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-4 flex items-center justify-between"><Link href="/" className="font-bold text-primary">{tr("Grama Nayaka", "ಗ್ರಾಮ ನಾಯಕ")}</Link><LangSwitch /></div>
      <DemoNote>{tr(`Demo only. No SMS is sent. The code is ${MOCK_OTP} (use 000000 to see the expired-code state). It is never stored.`, `ಡೆಮೊ ಮಾತ್ರ. SMS ಕಳುಹಿಸುವುದಿಲ್ಲ. ಕೋಡ್ ${MOCK_OTP} (ಅವಧಿ ಮುಗಿದ ಸ್ಥಿತಿ ನೋಡಲು 000000). ಇದನ್ನು ಸಂಗ್ರಹಿಸುವುದಿಲ್ಲ.`)}</DemoNote>
      <Card className="mt-4 space-y-4">
        {session && step === "phone" && <p className="rounded-xl bg-accent-soft p-3 text-sm">{tr(`You are signed in as ${session.name}. Signing in again replaces this session.`, `ನೀವು ${session.name} ಆಗಿ ಸೈನ್ ಇನ್ ಆಗಿದ್ದೀರಿ. ಮತ್ತೆ ಸೈನ್ ಇನ್ ಮಾಡಿದರೆ ಈ ಅವಧಿ ಬದಲಾಗುತ್ತದೆ.`)}</p>}
        {step === "phone" && (<>
          <h1 className="text-xl font-bold">{tr("Sign in", "ಸೈನ್ ಇನ್")}</h1>
          <p className="text-sm text-muted">{tr("Enter your registered mobile number. We will send a one-time code to verify it.", "ನಿಮ್ಮ ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನೀಡಿ. ಪರಿಶೀಲಿಸಲು ಒಂದು ಬಾರಿಯ ಕೋಡ್ ಕಳುಹಿಸುತ್ತೇವೆ.")}</p>
          <Field label={tr("Mobile number", "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ")} error={err} required>{(id, a) => (<div className="flex gap-2"><span className="grid place-items-center rounded-xl border border-border bg-accent-soft px-3">+91</span><Input id={id} {...a} inputMode="numeric" maxLength={10} autoComplete="tel-national" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="9XXXXXXXXX" /></div>)}</Field>
          <Button className="w-full" size="lg" onClick={send}>{tr("Send OTP", "OTP ಕಳುಹಿಸಿ")}</Button>
          <p className="text-center text-sm text-muted">{tr("New here?", "ಹೊಸಬರೇ?")} <Link href="/register" className="font-semibold text-primary underline">{tr("Register", "ನೋಂದಾಯಿಸಿ")}</Link></p>
          <details className="rounded-xl border border-border p-3 text-sm"><summary className="cursor-pointer font-medium">{tr("Demo accounts (fictional numbers)", "ಡೆಮೊ ಖಾತೆಗಳು (ಕಾಲ್ಪನಿಕ ಸಂಖ್ಯೆ)")}</summary>
            <ul className="mt-2 space-y-1">{demo.map((u) => <li key={u.id}><button type="button" onClick={() => setPhone(last10(u.phone))} className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1 text-left hover:bg-accent-soft"><span>{u.name} <span className="text-xs text-muted">· {RBAC_ROLES.find((r) => r.id === u.role)?.[lang]}</span></span><span className="font-mono text-xs">{last10(u.phone)}</span></button></li>)}</ul></details>
        </>)}
        {step === "otp" && (<>
          <h1 className="text-xl font-bold">{tr("Enter the code", "ಕೋಡ್ ನಮೂದಿಸಿ")}</h1>
          <p className="text-sm text-muted">{tr(`A one-time code was sent to +91 ${phone.slice(0, 2)}•••••${phone.slice(-3)}.`, `+91 ${phone.slice(0, 2)}•••••${phone.slice(-3)} ಗೆ ಒಂದು ಬಾರಿಯ ಕೋಡ್ ಕಳುಹಿಸಲಾಗಿದೆ.`)} <button type="button" className="text-primary underline" onClick={() => { setStep("phone"); setErr(""); }}>{tr("Change number", "ಸಂಖ್ಯೆ ಬದಲಿಸಿ")}</button></p>
          <Field label={tr("6-digit code", "6 ಅಂಕಿಯ ಕೋಡ್")} error={err}>{(id, a) => <Input id={id} {...a} inputMode="numeric" maxLength={6} autoComplete="one-time-code" disabled={limited} value={otp} onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); setOtp(v); setExpired(v === "000000"); }} onKeyDown={(e) => e.key === "Enter" && otp.length === 6 && verify()} />}</Field>
          <Button className="w-full" size="lg" disabled={otp.length < 6 || limited || busy} onClick={verify}>{busy ? tr("Verifying…", "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…") : tr("Verify & sign in", "ಪರಿಶೀಲಿಸಿ ಸೈನ್ ಇನ್")}</Button>
          <Button variant="ghost" disabled={left > 0 || resends >= 3} onClick={() => { setResends(resends + 1); setLeft(30); setExpired(false); setErr(""); setTries(0); }}>{left > 0 ? tr(`Resend in ${left}s`, `${left}ಸೆ ನಂತರ ಮರುಕಳುಹಿಸಿ`) : resends >= 3 ? tr("Resend limit reached", "ಮರುಕಳುಹಿಸುವ ಮಿತಿ ತಲುಪಿದೆ") : tr("Resend code", "ಕೋಡ್ ಮರುಕಳುಹಿಸಿ")}</Button>
        </>)}
        {step === "denied" && (<>
          <h1 className="text-xl font-bold">{tr("Number verified, but we can't sign you in", "ಸಂಖ್ಯೆ ಪರಿಶೀಲಿತ, ಆದರೆ ಸೈನ್ ಇನ್ ಸಾಧ್ಯವಿಲ್ಲ")}</h1>
          <p role="alert" className="text-sm">{reasonText(denied)}</p>
          <div className="flex flex-wrap gap-2">{denied?.reason === "not-found" && <Link href="/register"><Button>{tr("Register", "ನೋಂದಾಯಿಸಿ")}</Button></Link>}<Button variant="secondary" onClick={() => { setStep("phone"); setPhone(""); setOtp(""); setDenied(null); }}>{tr("Use another number", "ಬೇರೆ ಸಂಖ್ಯೆ ಬಳಸಿ")}</Button></div>
        </>)}
      </Card>
    </div>
  );
}
