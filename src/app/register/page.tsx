"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Card, Check, DemoNote, Field, Input } from "@/components/ui";
import { LangSwitch } from "@/components/shell/Controls";
import { useT } from "@/lib/useT";
import { MOCK_OTP, NOTICE_VERSION, purposes } from "@/lib/consent";
import { api } from "@/lib/api";
import { usePrefs } from "@/lib/store";
import { maskPhone } from "@/lib/session";

export default function Register() {
  const { tr, lang } = useT(); const router = useRouter();
  const signIn = usePrefs((s) => s.signIn);
  const [step, setStep] = useState<"phone" | "consent" | "otp">("phone");
  const [phone, setPhone] = useState(""); const [err, setErr] = useState("");
  const [grants, setGrants] = useState<Record<string, boolean>>({}); const [full, setFull] = useState(false);
  const [otp, setOtp] = useState(""); const [tries, setTries] = useState(0); const [resends, setResends] = useState(0); const [left, setLeft] = useState(0); const [expired, setExpired] = useState(false);
  useEffect(() => { if (left <= 0) return; const t = setTimeout(() => setLeft(left - 1), 1000); return () => clearTimeout(t); }, [left]);
  const limited = tries >= 3;

  const toConsent = () => { if (!/^[6-9]\d{9}$/.test(phone)) return setErr(tr("Enter a valid 10-digit mobile number starting with 6–9.", "6–9 ರಿಂದ ಆರಂಭವಾಗುವ ಸರಿಯಾದ 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನೀಡಿ.")); setErr(""); setStep("consent"); };
  const toOtp = () => { if (!grants["program-admin"]) return setErr(tr("Required for the application to proceed. Optional items can stay unticked.", "ಅರ್ಜಿ ಮುಂದುವರಿಸಲು ಇದು ಅಗತ್ಯ. ಐಚ್ಛಿಕವನ್ನು ಬಿಡಬಹುದು.")); setErr(""); setLeft(30); setStep("otp"); };
  const verify = () => {
    if (limited) return;
    if (expired) return setErr(tr("This code has expired. Request a new one.", "ಈ ಕೋಡ್ ಅವಧಿ ಮುಗಿದಿದೆ. ಹೊಸದನ್ನು ಕೇಳಿ."));
    if (otp !== MOCK_OTP) { const n = tries + 1; setTries(n); setOtp(""); return setErr(n >= 3 ? tr("Too many wrong attempts. Please wait and try later (demo rate limit).", "ತುಂಬಾ ತಪ್ಪು ಪ್ರಯತ್ನಗಳು. ನಂತರ ಪ್ರಯತ್ನಿಸಿ (ಡೆಮೊ ಮಿತಿ).") : tr(`Wrong code. ${3 - n} attempts left.`, `ತಪ್ಪು ಕೋಡ್. ${3 - n} ಪ್ರಯತ್ನ ಬಾಕಿ.`)); }
    purposes.forEach((p) => grants[p.id] && api.consent.grant(p.id, "register", lang));
    signIn({ userId: `NEW-${phone.slice(-4)}`, name: tr("New applicant", "ಹೊಸ ಅರ್ಜಿದಾರ"), role: "participant", phoneMasked: maskPhone(phone), phone, applicant: true }); router.push("/apply");
  };
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-4 flex items-center justify-between"><Link href="/" className="font-bold text-primary">{tr("Grama Nayaka", "ಗ್ರಾಮ ನಾಯಕ")}</Link><LangSwitch /></div>
      <DemoNote>{tr(`Demo only. No SMS is sent. Use code ${MOCK_OTP} (use 000000 to see the expired-code state). The code is never stored.`, `ಡೆಮೊ ಮಾತ್ರ. SMS ಕಳುಹಿಸುವುದಿಲ್ಲ. ಕೋಡ್ ${MOCK_OTP} ಬಳಸಿ (ಅವಧಿ ಮುಗಿದ ಸ್ಥಿತಿ ನೋಡಲು 000000). ಕೋಡ್ ಸಂಗ್ರಹಿಸುವುದಿಲ್ಲ.`)}</DemoNote>
      <Card className="mt-4 space-y-4">
        {step === "phone" && (<>
          <h1 className="text-xl font-bold">{tr("Register your interest", "ಆಸಕ್ತಿ ನೋಂದಾಯಿಸಿ")}</h1>
          <Field label={tr("Mobile number", "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ")} error={err} required>{(id, a) => (<div className="flex gap-2"><span className="grid place-items-center rounded-xl border border-border bg-accent-soft px-3">+91</span><Input id={id} {...a} inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="9XXXXXXXXX" /></div>)}</Field>
          <Button className="w-full" size="lg" onClick={toConsent}>{tr("Continue", "ಮುಂದುವರಿಸಿ")}</Button>
          <p className="text-center text-sm text-muted">{tr("Already registered?", "ಈಗಾಗಲೇ ನೋಂದಾಯಿಸಿದ್ದೀರಾ?")} <Link href="/signin" className="font-semibold text-primary underline">{tr("Sign in", "ಸೈನ್ ಇನ್")}</Link></p><p className="text-xs text-muted">{tr("Registering does not guarantee selection. ", "ನೋಂದಣಿ ಆಯ್ಕೆಯ ಖಾತರಿಯಲ್ಲ. ")}<Link href="/privacy" className="underline">{tr("Read the privacy notice", "ಗೌಪ್ಯತಾ ಸೂಚನೆ ಓದಿ")}</Link></p>
        </>)}
        {step === "consent" && (<>
          <h1 className="text-xl font-bold">{tr("Privacy notice and your choices", "ಗೌಪ್ಯತಾ ಸೂಚನೆ ಮತ್ತು ನಿಮ್ಮ ಆಯ್ಕೆಗಳು")}</h1>
          <p className="text-sm text-muted">{tr("We use your information to review your application, run training and learning, and communicate about the programme. Nothing is used for political persuasion.", "ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ಅರ್ಜಿ ಪರಿಶೀಲನೆ, ತರಬೇತಿ ಮತ್ತು ಕಲಿಕೆ, ಕಾರ್ಯಕ್ರಮ ಸಂವಹನಕ್ಕೆ ಬಳಸುತ್ತೇವೆ. ರಾಜಕೀಯ ಮನವೊಲಿಕೆಗೆ ಬಳಸುವುದಿಲ್ಲ.")}</p>
          <button className="text-sm font-medium text-primary underline" onClick={() => setFull(!full)} aria-expanded={full}>{full ? tr("Hide full notice", "ಪೂರ್ಣ ಸೂಚನೆ ಮರೆಮಾಡಿ") : tr("Show full notice", "ಪೂರ್ಣ ಸೂಚನೆ ತೋರಿಸಿ")}</button>
          {full && <div className="rounded-xl bg-accent-soft p-3 text-sm">{tr(`Notice v${NOTICE_VERSION}. Purposes, retention and your rights are summarised at /privacy. This is a prototype notice; legal counsel must approve the final text, purposes, retention and legal basis.`, `ಸೂಚನೆ v${NOTICE_VERSION}. ಉದ್ದೇಶ, ಉಳಿಸಿಕೊಳ್ಳುವ ಅವಧಿ ಮತ್ತು ಹಕ್ಕುಗಳ ಸಾರಾಂಶ /privacy ನಲ್ಲಿ. ಇದು ಮಾದರಿ ಸೂಚನೆ; ಅಂತಿಮ ಪಠ್ಯವನ್ನು ಕಾನೂನು ಸಲಹೆಗಾರರು ಅನುಮೋದಿಸಬೇಕು.`)}</div>}
          <fieldset className="space-y-3"><legend className="mb-1 text-sm font-semibold">{tr("Required for the programme", "ಕಾರ್ಯಕ್ರಮಕ್ಕೆ ಅಗತ್ಯ")}</legend>
            {purposes.filter((p) => p.required).map((p) => <Check key={p.id} checked={!!grants[p.id]} onChange={(e) => setGrants({ ...grants, [p.id]: e.target.checked })} label={<><b>{tr(p.en, p.kn)}</b><br /><span className="text-muted">{tr(p.descEn, p.descKn)}</span></>} />)}</fieldset>
          <fieldset className="space-y-3"><legend className="mb-1 text-sm font-semibold">{tr("Optional (you can decline)", "ಐಚ್ಛಿಕ (ನಿರಾಕರಿಸಬಹುದು)")}</legend>
            {purposes.filter((p) => !p.required).map((p) => <Check key={p.id} checked={!!grants[p.id]} onChange={(e) => setGrants({ ...grants, [p.id]: e.target.checked })} label={<><b>{tr(p.en, p.kn)}</b><br /><span className="text-muted">{tr(p.descEn, p.descKn)}</span></>} />)}</fieldset>
          {err && <p role="alert" className="text-sm text-danger">{err}</p>}
          <div className="flex gap-2"><Button variant="secondary" onClick={() => setStep("phone")}>{tr("Back", "ಹಿಂದೆ")}</Button><Button className="flex-1" onClick={toOtp}>{tr("Agree & send code", "ಒಪ್ಪಿ ಕೋಡ್ ಕಳುಹಿಸಿ")}</Button></div>
        </>)}
        {step === "otp" && (<>
          <h1 className="text-xl font-bold">{tr("Verify your number", "ನಿಮ್ಮ ಸಂಖ್ಯೆ ಪರಿಶೀಲಿಸಿ")}</h1>
          <p className="text-sm text-muted">{tr(`Demo code for +91 ${phone.slice(0, 2)}•••••${phone.slice(-3)}.`, `+91 ${phone.slice(0, 2)}•••••${phone.slice(-3)} ಗೆ ಡೆಮೊ ಕೋಡ್.`)}</p>
          <Field label={tr("6-digit code", "6 ಅಂಕಿಯ ಕೋಡ್")} error={err}>{(id, a) => <Input id={id} {...a} inputMode="numeric" maxLength={6} value={otp} disabled={limited} autoComplete="one-time-code" onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); setOtp(v); setExpired(v === "000000"); }} />}</Field>
          <Button className="w-full" size="lg" disabled={otp.length < 6 || limited} onClick={verify}>{tr("Verify", "ಪರಿಶೀಲಿಸಿ")}</Button>
          <Button variant="ghost" disabled={left > 0 || resends >= 3} onClick={() => { setResends(resends + 1); setLeft(30); setExpired(false); setErr(""); setTries(0); }}>{left > 0 ? tr(`Resend in ${left}s`, `${left}ಸೆ ನಂತರ ಮರುಕಳುಹಿಸಿ`) : resends >= 3 ? tr("Resend limit reached", "ಮರುಕಳುಹಿಸುವ ಮಿತಿ ತಲುಪಿದೆ") : tr("Resend code", "ಕೋಡ್ ಮರುಕಳುಹಿಸಿ")}</Button>
        </>)}
      </Card>
    </div>
  );
}
