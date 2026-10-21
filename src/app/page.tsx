"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpenText, Buildings, ChalkboardTeacher, ChartBar, ChatsCircle, CheckCircle, GraduationCap, MapPinLine, Sparkle, UsersThree, VideoCamera, FilePdf, Question } from "@phosphor-icons/react";
import { LangSwitch, ThemeToggle } from "@/components/shell/Controls";
import { useDb } from "@/lib/db";
import { homeStats, TARGET_VOLUNTEERS } from "@/lib/homeStats";
import { usePrefs } from "@/lib/store";
import { useT } from "@/lib/useT";
import { cn } from "@/lib/utils";

function useMounted() { const [m, setM] = useState(false); useEffect(() => setM(true), []); return m; }
function Count({ to, ready }: { to: number; ready: boolean }) {
  const reduce = useReducedMotion(); const [v, setV] = useState(0);
  useEffect(() => { if (!ready) return; if (reduce) return setV(to); const c = animate(0, to, { duration: 0.9, onUpdate: (x) => setV(Math.round(x)) }); return () => c.stop(); }, [to, ready, reduce]);
  return <>{ready ? v.toLocaleString("en-IN") : "—"}</>;
}
const Section = ({ id, eyebrow, title, sub, children, tone }: { id: string; eyebrow: string; title: string; sub?: string; children: React.ReactNode; tone?: "soft" | "dark" }) => (
  <section id={id} className={cn("scroll-mt-28 py-14 md:py-20", tone === "soft" && "bg-accent-soft", tone === "dark" && "bg-deep text-white")}>
    <div className="mx-auto max-w-6xl px-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">{eyebrow}</p><h2 className="mt-2 max-w-3xl text-3xl font-bold md:text-4xl">{title}</h2>{sub && <p className={cn("mt-3 max-w-2xl", tone === "dark" ? "text-white/75" : "text-muted")}>{sub}</p>}<div className="mt-8">{children}</div></div>
  </section>
);

export default function Landing() {
  const { t, tr, loc } = useT(); const role = usePrefs((s) => s.role); const mounted = useMounted(); const db = useDb(); const s = homeStats(db);
  const admin = role !== "participant" && role !== "trainer";
  const go = (p: string, a: string) => (admin ? a : role === "trainer" ? a : p);
  const nav = [["about", tr("About", "ಬಗ್ಗೆ")], ["how", tr("How it works", "ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ")], ["features", tr("Features", "ಸೌಲಭ್ಯಗಳು")], ["impact", tr("Impact", "ಪರಿಣಾಮ")], ["learning", tr("Learning", "ಕಲಿಕೆ")], ["faq", "FAQ"]];
  const pct = (n: number, d: number) => (d ? Math.min(100, Math.round((n / d) * 100)) : 0);
  const steps = [
    [ChalkboardTeacher, tr("Train volunteers", "ಸ್ವಯಂಸೇವಕರಿಗೆ ತರಬೇತಿ"), tr("Volunteers attend a 2-day training programme in Mysuru.", "ಸ್ವಯಂಸೇವಕರು ಮೈಸೂರಿನಲ್ಲಿ 2 ದಿನದ ತರಬೇತಿಯಲ್ಲಿ ಭಾಗವಹಿಸುತ್ತಾರೆ.")],
    [BookOpenText, tr("Learn & understand", "ಕಲಿಯಿರಿ ಮತ್ತು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ"), tr("Videos, readings and quizzes on Gram Panchayat governance.", "ಗ್ರಾಮ ಪಂಚಾಯತ್ ಆಡಳಿತದ ವೀಡಿಯೋ, ಓದು ಮತ್ತು ರಸಪ್ರಶ್ನೆಗಳು.")],
    [MapPinLine, tr("Cover villages", "ಗ್ರಾಮಗಳನ್ನು ಒಳಗೊಳ್ಳಿ"), tr("Volunteers are linked to their district, taluk and Gram Panchayat.", "ಸ್ವಯಂಸೇವಕರನ್ನು ಅವರ ಜಿಲ್ಲೆ, ತಾಲ್ಲೂಕು ಮತ್ತು ಗ್ರಾಮ ಪಂಚಾಯತ್‌ಗೆ ಜೋಡಿಸಲಾಗುತ್ತದೆ.")],
    [ChatsCircle, tr("Raise grievances", "ದೂರುಗಳನ್ನು ದಾಖಲಿಸಿ"), tr("Record issues found in the village, with a reference ID.", "ಹಳ್ಳಿಯಲ್ಲಿ ಕಂಡ ಸಮಸ್ಯೆಗಳನ್ನು ಉಲ್ಲೇಖ ಐಡಿಯೊಂದಿಗೆ ದಾಖಲಿಸಿ.")],
    [Sparkle, tr("Follow up & resolve", "ಅನುಸರಿಸಿ ಮತ್ತು ಪರಿಹರಿಸಿ"), tr("Track progress; AI helps draft messages to officials. People decide.", "ಪ್ರಗತಿ ಗಮನಿಸಿ; ಅಧಿಕಾರಿಗಳಿಗೆ ಸಂದೇಶ ಕರಡಿಗೆ AI ನೆರವು. ನಿರ್ಧಾರ ಜನರದ್ದು.")],
  ] as const;
  const features = [
    [ChalkboardTeacher, tr("Volunteer Training", "ಸ್ವಯಂಸೇವಕ ತರಬೇತಿ"), tr("Registration, day-wise attendance and completion tracking.", "ನೋಂದಣಿ, ದಿನವಾರು ಹಾಜರಾತಿ ಮತ್ತು ಪೂರ್ಣಗೊಳಿಕೆ ಗಮನಿಸುವಿಕೆ."), go("/app/training", "/admin/training")],
    [GraduationCap, tr("Learning Centre", "ಕಲಿಕಾ ಕೇಂದ್ರ"), tr("Videos, readings and assessments on governance.", "ಆಡಳಿತದ ವೀಡಿಯೋ, ಓದು ಮತ್ತು ಮೌಲ್ಯಮಾಪನ."), go("/app/learning", "/admin/lms")],
    [MapPinLine, tr("Village Coverage", "ಗ್ರಾಮ ವ್ಯಾಪ್ತಿ"), tr("Volunteer locations by district, taluk and Gram Panchayat.", "ಜಿಲ್ಲೆ, ತಾಲ್ಲೂಕು, ಗ್ರಾಮ ಪಂಚಾಯತ್ ಪ್ರಕಾರ ಸ್ವಯಂಸೇವಕರ ಸ್ಥಳ."), go("/app/community", "/admin/participants")],
    [ChatsCircle, tr("Grievance Management", "ದೂರು ನಿರ್ವಹಣೆ"), tr("Submission, reference IDs, status and follow-up history.", "ಸಲ್ಲಿಕೆ, ಉಲ್ಲೇಖ ಐಡಿ, ಸ್ಥಿತಿ ಮತ್ತು ಅನುಸರಣಾ ಇತಿಹಾಸ."), go("/app/grievances", "/admin/grievances")],
    [Sparkle, tr("AI Communication Assistant", "AI ಸಂವಹನ ಸಹಾಯಕ"), tr("Draft letters, reminders and escalation messages. Never sent for you.", "ಪತ್ರ, ಜ್ಞಾಪನೆ, ಹೆಚ್ಚಿನ ಹಂತದ ಸಂದೇಶ ಕರಡು. ನಿಮ್ಮ ಪರವಾಗಿ ಕಳುಹಿಸುವುದಿಲ್ಲ."), go("/app/ai", "/admin/templates")],
    [ChartBar, tr("Monitoring & Reports", "ಮೇಲ್ವಿಚಾರಣೆ ಮತ್ತು ವರದಿ"), tr("Training, coverage, participation and grievance outcomes.", "ತರಬೇತಿ, ವ್ಯಾಪ್ತಿ, ಭಾಗವಹಿಸುವಿಕೆ ಮತ್ತು ದೂರು ಫಲಿತಾಂಶ."), go("/app/rewards", "/admin/reports")],
  ] as const;
  const journey = [["Open", tr("Reported", "ವರದಿ")], ["In Progress", tr("Owner working", "ಮಾಲೀಕ ಕೆಲಸ ಮಾಡುತ್ತಿದ್ದಾರೆ")], ["Follow-up Due", tr("Follow up with officials", "ಅಧಿಕಾರಿಗಳೊಂದಿಗೆ ಅನುಸರಣೆ")], ["Escalated", tr("Escalated if no response", "ಉತ್ತರ ಇಲ್ಲದಿದ್ದರೆ ಹೆಚ್ಚಿನ ಹಂತ")], ["Closure Pending", tr("Outcome recorded", "ಫಲಿತಾಂಶ ದಾಖಲು")], ["Closed", tr("Confirmed & closed", "ದೃಢೀಕರಿಸಿ ಮುಚ್ಚಲಾಗಿದೆ")]] as const;
  const faq = [[t.faq1q, t.faq1a], [t.faq2q, t.faq2a], [t.faq3q, t.faq3a]];
  const btn = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 md:text-[15px]";

  return (
    <div className="min-h-screen">
      <div className="bg-deep px-4 py-1.5 text-center text-xs text-white">{t.demoBanner}</div>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-fg"><UsersThree size={20} weight="fill" /></span><span><span className="block font-bold leading-tight">{t.appName}</span><span className="hidden text-[11px] text-muted sm:block">{t.appNameLocal}</span></span></Link>
          <nav aria-label="Sections" className="hidden items-center gap-6 text-sm font-medium lg:flex">{nav.map(([id, l]) => <a key={id} href={`#${id}`} className="hover:text-primary">{l}</a>)}</nav>
          <div className="flex items-center gap-2"><LangSwitch /><ThemeToggle /><Link href={go("/register", "/admin")} className="hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-fg sm:inline-block">{admin || role === "trainer" ? tr("Open console", "ಕನ್ಸೋಲ್ ತೆರೆಯಿರಿ") : tr("Register / Sign in", "ನೋಂದಣಿ / ಸೈನ್ ಇನ್")}</Link></div>
        </div>
        <nav aria-label="Sections" className="flex gap-4 overflow-x-auto border-t border-border px-4 py-2 text-sm lg:hidden">{nav.map(([id, l]) => <a key={id} href={`#${id}`} className="whitespace-nowrap text-muted">{l}</a>)}</nav>
      </header>

      {/* A. Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#062f26] via-[#0a4a39] to-[#116149] text-white">
        <div aria-hidden className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "22px 22px" }} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-28 pt-12 md:grid-cols-[1.05fr_1fr] md:pb-32 md:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm"><span className="h-2 w-2 rounded-full bg-saffron" />{tr("Village empowerment initiative", "ಗ್ರಾಮ ಸಬಲೀಕರಣ ಉಪಕ್ರಮ")}</span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.12] md:text-5xl">{tr("Grama Nayaka – Empowering Villages, Enabling Change", "ಗ್ರಾಮ ನಾಯಕ – ಗ್ರಾಮಗಳ ಸಬಲೀಕರಣ, ಬದಲಾವಣೆಗೆ ಶಕ್ತಿ")}</h1>
            <p className="mt-5 max-w-xl text-lg text-white/80">{tr("Grama Nayaka is a village empowerment initiative that trains volunteers, promotes awareness of Gram Panchayat governance, connects villages to digital resources, and helps communities raise and track grievances until resolution.", "ಗ್ರಾಮ ನಾಯಕ ಒಂದು ಗ್ರಾಮ ಸಬಲೀಕರಣ ಉಪಕ್ರಮ: ಸ್ವಯಂಸೇವಕರಿಗೆ ತರಬೇತಿ, ಗ್ರಾಮ ಪಂಚಾಯತ್ ಆಡಳಿತದ ಅರಿವು, ಹಳ್ಳಿಗಳಿಗೆ ಡಿಜಿಟಲ್ ಸಂಪನ್ಮೂಲ, ಮತ್ತು ದೂರುಗಳನ್ನು ಪರಿಹಾರವಾಗುವವರೆಗೆ ದಾಖಲಿಸಿ ಗಮನಿಸಲು ಸಮುದಾಯಗಳಿಗೆ ನೆರವು.")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-nowrap">
              <Link href={go("/register", "/admin")} className={cn(btn, "bg-saffron text-[#2b1700]")}>{admin || role === "trainer" ? tr("Open console", "ಕನ್ಸೋಲ್ ತೆರೆಯಿರಿ") : tr("Get Started", "ಆರಂಭಿಸಿ")} <ArrowRight weight="bold" /></Link>
              <Link href={go("/app/learning", "/admin/lms")} className={cn(btn, "border border-white/40 bg-white/10")}>{tr("Explore Learning Resources", "ಕಲಿಕಾ ಸಂಪನ್ಮೂಲ ನೋಡಿ")}</Link>
              <Link href={go("/app/grievances/new", "/admin/grievances")} className={cn(btn, "border border-white/40 bg-white/10")}>{tr("Raise a Grievance", "ದೂರು ದಾಖಲಿಸಿ")}</Link>
            </div>
            <p className="mt-5 max-w-lg text-sm text-white/65">{t.nonPartisan}</p>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
              <Image src="/hero.jpg" alt={tr("A young volunteer on a village street at sunset", "ಸೂರ್ಯಾಸ್ತದ ವೇಳೆ ಹಳ್ಳಿಯ ರಸ್ತೆಯಲ್ಲಿ ಯುವ ಸ್ವಯಂಸೇವಕ")} fill priority sizes="(min-width: 768px) 520px, 100vw" className="object-cover object-[62%_center]" />
              <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] text-white/90 backdrop-blur">{tr("Illustrative image", "ವಿವರಣಾತ್ಮಕ ಚಿತ್ರ")}</span>
              <div className="absolute inset-x-3 bottom-3 grid grid-cols-2 divide-x divide-white/20 rounded-2xl border border-white/25 bg-[#062f26]/80 py-3 backdrop-blur-md">
                {[[s.trained, tr("Volunteers trained", "ತರಬೇತಿ ಪಡೆದ ಸ್ವಯಂಸೇವಕರು")], [s.villagesEnrolled, tr("Gram Panchayats covered", "ಒಳಗೊಂಡ ಗ್ರಾಮ ಪಂಚಾಯತ್")]].map(([n, l], i) => (
                  <div key={i} className="px-4"><p className="text-2xl font-bold leading-none md:text-3xl"><Count to={n as number} ready={mounted} /></p><p className="mt-1 text-xs text-white/80 md:text-sm">{l as string}</p></div>))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <div className="relative z-10 mx-auto -mt-16 max-w-6xl px-4">
        <div className="grid grid-cols-2 overflow-hidden rounded-3xl border border-border bg-card shadow-xl md:grid-cols-4">
          {[[UsersThree, TARGET_VOLUNTEERS, tr("Target volunteers", "ಗುರಿ ಸ್ವಯಂಸೇವಕರು"), tr("Initiative goal (1 lakh)", "ಉಪಕ್ರಮದ ಗುರಿ (1 ಲಕ್ಷ)")], [CheckCircle, s.registered, tr("Volunteers registered", "ನೋಂದಾಯಿತ ಸ್ವಯಂಸೇವಕರು"), tr("Applications in the app", "ಆ್ಯಪ್‌ನಲ್ಲಿನ ಅರ್ಜಿಗಳು")], [ChalkboardTeacher, s.sessionsDone, tr("Sessions conducted", "ನಡೆದ ಅವಧಿಗಳು"), tr(`of ${s.sessionsTotal} scheduled`, `${s.sessionsTotal} ರಲ್ಲಿ`)], [ChatsCircle, s.resolved, tr("Grievances closed", "ಮುಚ್ಚಿದ ದೂರುಗಳು"), tr(`of ${s.raised} raised`, `${s.raised} ರಲ್ಲಿ`)]].map(([Icon, n, l, h], i) => { const I = Icon as typeof UsersThree; return (
            <div key={i} className={cn("flex flex-col items-start gap-2 p-4 sm:flex-row sm:items-center sm:gap-4 md:p-6", i % 2 === 0 && "border-r border-border md:border-r", i < 2 && "border-b border-border md:border-b-0", i === 1 && "md:border-r", i === 2 && "md:border-r")}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent-soft text-primary sm:h-12 sm:w-12"><I size={26} weight="duotone" /></span>
              <div className="min-w-0"><p className="text-2xl font-bold leading-tight text-primary md:text-3xl"><Count to={n as number} ready={mounted} /></p><p className="text-sm font-medium leading-snug">{l as string}</p><p className="text-xs text-muted">{h as string}</p></div>
            </div>); })}
        </div>
        <p className="mt-2 text-center text-xs text-muted">{tr("Target is the initiative's goal. All other figures are counted from this app's records (demo data in this prototype).", "ಗುರಿ ಉಪಕ್ರಮದ ಲಕ್ಷ್ಯ. ಉಳಿದ ಅಂಕಿಗಳನ್ನು ಈ ಆ್ಯಪ್‌ನ ದಾಖಲೆಗಳಿಂದ ಎಣಿಸಲಾಗಿದೆ (ಈ ಮಾದರಿಯಲ್ಲಿ ಡೆಮೊ ಡೇಟಾ).")}</p>
      </div>

      {/* B. About */}
      <Section id="about" eyebrow={tr("About the initiative", "ಉಪಕ್ರಮದ ಬಗ್ಗೆ")} title={tr("Trained volunteers, informed villages, followed-through issues", "ತರಬೇತಿ ಪಡೆದ ಸ್ವಯಂಸೇವಕರು, ಅರಿವುಳ್ಳ ಹಳ್ಳಿಗಳು, ಅನುಸರಿಸಿದ ಸಮಸ್ಯೆಗಳು")}>
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4 text-muted"><p>{tr("Many village issues stay unresolved because people do not know how Gram Panchayat governance works or whom to approach. Grama Nayaka builds a network of trained volunteers who understand local governance, help residents use public services, and keep issues moving until they are closed.", "ಗ್ರಾಮ ಪಂಚಾಯತ್ ಆಡಳಿತ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ, ಯಾರನ್ನು ಸಂಪರ್ಕಿಸಬೇಕು ಎಂಬುದು ತಿಳಿಯದೆ ಅನೇಕ ಹಳ್ಳಿ ಸಮಸ್ಯೆಗಳು ಬಾಕಿ ಉಳಿಯುತ್ತವೆ. ಸ್ಥಳೀಯ ಆಡಳಿತ ಅರ್ಥಮಾಡಿಕೊಂಡು, ಸಾರ್ವಜನಿಕ ಸೇವೆ ಬಳಸಲು ನೆರವಾಗಿ, ಸಮಸ್ಯೆ ಮುಚ್ಚುವವರೆಗೆ ಮುಂದುವರಿಸುವ ತರಬೇತಿ ಪಡೆದ ಸ್ವಯಂಸೇವಕರ ಜಾಲವನ್ನು ಗ್ರಾಮ ನಾಯಕ ನಿರ್ಮಿಸುತ್ತದೆ.")}</p>
            <ul className="space-y-2 text-foreground">{[tr("Trained volunteers in every Gram Panchayat", "ಪ್ರತಿ ಗ್ರಾಮ ಪಂಚಾಯತ್‌ನಲ್ಲಿ ತರಬೇತಿ ಪಡೆದ ಸ್ವಯಂಸೇವಕರು"), tr("Accessible learning resources in Kannada and English", "ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಸುಲಭ ಕಲಿಕಾ ಸಂಪನ್ಮೂಲ"), tr("Coverage tracking by district, taluk and Gram Panchayat", "ಜಿಲ್ಲೆ, ತಾಲ್ಲೂಕು, ಗ್ರಾಮ ಪಂಚಾಯತ್ ಪ್ರಕಾರ ವ್ಯಾಪ್ತಿ ಗಮನಿಸುವಿಕೆ"), tr("Grievance follow-up with a clear paper trail", "ಸ್ಪಷ್ಟ ದಾಖಲೆಯೊಂದಿಗೆ ದೂರು ಅನುಸರಣೆ")].map((x) => <li key={x} className="flex gap-2"><CheckCircle size={22} weight="fill" className="mt-0.5 shrink-0 text-primary" />{x}</li>)}</ul></div>
          <div className="rounded-3xl bg-gradient-to-br from-forest to-deep p-6 text-white"><p className="text-sm text-white/75">{tr("Our target", "ನಮ್ಮ ಗುರಿ")}</p><p className="mt-1 text-5xl font-bold">1,00,000</p><p className="text-white/85">{tr("volunteers trained (1 lakh)", "ತರಬೇತಿ ಪಡೆದ ಸ್ವಯಂಸೇವಕರು (1 ಲಕ್ಷ)")}</p><div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/20" role="progressbar" aria-valuenow={pct(s.trained, TARGET_VOLUNTEERS)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to target"><div className="h-full rounded-full bg-saffron" style={{ width: `${Math.max(1, (s.trained / TARGET_VOLUNTEERS) * 100)}%` }} /></div><p className="mt-2 text-sm text-white/80">{mounted ? s.trained.toLocaleString("en-IN") : "—"} {tr("trained so far", "ಇದುವರೆಗೆ ತರಬೇತಿ")} · {mounted ? ((s.trained / TARGET_VOLUNTEERS) * 100).toFixed(2) : "—"}%</p></div>
        </div>
      </Section>

      {/* C. How it works */}
      <Section id="how" tone="soft" eyebrow={tr("How it works", "ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ")} title={tr("Five steps from training to resolution", "ತರಬೇತಿಯಿಂದ ಪರಿಹಾರದವರೆಗೆ ಐದು ಹಂತ")}>
        <ol className="grid gap-4 md:grid-cols-5">{steps.map(([Icon, h, b], i) => (
          <li key={i} className="relative rounded-2xl border border-border bg-card p-5"><span className="absolute -top-3 left-4 grid h-7 w-7 place-items-center rounded-full bg-saffron text-sm font-bold text-[#2b1700]">{i + 1}</span><Icon size={30} className="mt-2 text-primary" weight="duotone" /><h3 className="mt-3 font-bold">{h}</h3><p className="mt-1 text-sm text-muted">{b}</p></li>))}</ol>
      </Section>

      {/* D. Features */}
      <Section id="features" eyebrow={tr("Key features", "ಪ್ರಮುಖ ಸೌಲಭ್ಯಗಳು")} title={tr("Everything volunteers and coordinators need", "ಸ್ವಯಂಸೇವಕರು ಮತ್ತು ಸಂಯೋಜಕರಿಗೆ ಬೇಕಾದ್ದೆಲ್ಲ")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map(([Icon, h, b, href]) => (
          <Link key={h} href={href} className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:border-primary hover:shadow-lg"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-primary"><Icon size={26} weight="duotone" /></span><h3 className="mt-4 text-lg font-bold">{h}</h3><p className="mt-1 text-sm text-muted">{b}</p><span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">{tr("Open", "ತೆರೆಯಿರಿ")} <ArrowRight className="transition group-hover:translate-x-1" /></span></Link>))}</div>
      </Section>

      {/* E. Impact */}
      <Section id="impact" tone="dark" eyebrow={tr("Impact dashboard", "ಪರಿಣಾಮ ಫಲಕ")} title={tr("Progress, counted from the app's records", "ಆ್ಯಪ್ ದಾಖಲೆಗಳಿಂದ ಎಣಿಸಿದ ಪ್ರಗತಿ")} sub={tr("Only the 1 lakh target is a goal. Everything else is computed live from records in this prototype, which currently hold demo data.", "1 ಲಕ್ಷ ಮಾತ್ರ ಗುರಿ. ಉಳಿದೆಲ್ಲವೂ ಈ ಮಾದರಿಯ ದಾಖಲೆಗಳಿಂದ ನೇರವಾಗಿ ಲೆಕ್ಕಹಾಕಿದ್ದು; ಅವು ಈಗ ಡೆಮೊ ಡೇಟಾ.")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[[TARGET_VOLUNTEERS, tr("Target volunteers", "ಗುರಿ ಸ್ವಯಂಸೇವಕರು"), 100], [s.registered, tr("Volunteers registered", "ನೋಂದಾಯಿತ"), pct(s.registered, TARGET_VOLUNTEERS)], [s.trained, tr("Volunteers trained", "ತರಬೇತಿ ಪಡೆದವರು"), pct(s.trained, s.registered)], [s.sessionsDone, tr("Training sessions conducted", "ನಡೆದ ತರಬೇತಿ ಅವಧಿ"), pct(s.sessionsDone, s.sessionsTotal)], [s.villagesEnrolled, tr("Gram Panchayats covered", "ಒಳಗೊಂಡ ಗ್ರಾಮ ಪಂಚಾಯತ್"), pct(s.villagesEnrolled, s.gpTotal)], [s.villagesPending, tr("Gram Panchayats without a volunteer", "ಸ್ವಯಂಸೇವಕರಿಲ್ಲದ ಗ್ರಾಮ ಪಂಚಾಯತ್"), pct(s.villagesPending, s.gpTotal)], [s.raised, tr("Grievances raised", "ದಾಖಲಾದ ದೂರುಗಳು"), 100], [s.resolved, tr("Grievances closed", "ಮುಚ್ಚಿದ ದೂರುಗಳು"), pct(s.resolved, s.raised)]].map(([n, l, p], i) => (
            <div key={i} className="rounded-2xl border border-white/15 bg-white/5 p-5"><p className="text-3xl font-bold"><Count to={n as number} ready={mounted} /></p><p className="mt-1 text-sm text-white/80">{l as string}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15" aria-hidden><div className="h-full rounded-full bg-saffron" style={{ width: `${mounted ? (p as number) : 0}%`, transition: "width .8s" }} /></div></div>))}
        </div>
        <p className="mt-3 text-xs text-white/60">{tr("Bars show: registered vs target, trained vs registered, sessions done vs scheduled, covered vs total Gram Panchayats in master data, closed vs raised.", "ಪಟ್ಟಿಗಳು: ಗುರಿಗೆ ನೋಂದಣಿ, ನೋಂದಣಿಗೆ ತರಬೇತಿ, ನಿಗದಿತಕ್ಕೆ ನಡೆದ ಅವಧಿ, ಒಟ್ಟು ಗ್ರಾಮ ಪಂಚಾಯತ್‌ಗೆ ಒಳಗೊಂಡದ್ದು, ದಾಖಲಾದವಕ್ಕೆ ಮುಚ್ಚಿದ್ದು.")}</p>
      </Section>

      {/* F. Grievance journey */}
      <Section id="journey" eyebrow={tr("Grievance resolution journey", "ದೂರು ಪರಿಹಾರ ಪ್ರಯಾಣ")} title={tr("From a village issue to a confirmed closure", "ಹಳ್ಳಿಯ ಸಮಸ್ಯೆಯಿಂದ ದೃಢೀಕೃತ ಮುಚ್ಚುವಿಕೆವರೆಗೆ")} sub={tr("A case is never 'resolved' just because it was submitted or referred. Closure needs an outcome summary and confirmation.", "ಸಲ್ಲಿಸಿದ ಅಥವಾ ಉಲ್ಲೇಖಿಸಿದ ಮಾತ್ರಕ್ಕೆ ಪ್ರಕರಣ 'ಪರಿಹಾರ'ವಾಗುವುದಿಲ್ಲ. ಮುಚ್ಚಲು ಫಲಿತಾಂಶ ಸಾರಾಂಶ ಮತ್ತು ದೃಢೀಕರಣ ಬೇಕು.")}>
        <ol className="grid gap-3 md:grid-cols-6">{journey.map(([st, l], i) => (
          <li key={st} className="relative rounded-2xl border border-border bg-card p-4"><div className="flex items-center justify-between"><span className="text-xs font-bold text-saffron">{i + 1}</span><span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-primary">{mounted ? s.statusCount(st) : "–"}</span></div><p className="mt-2 font-bold">{st}</p><p className="text-sm text-muted">{l}</p></li>))}</ol>
        <p className="mt-3 text-xs text-muted">{tr("Counts are cases currently in each status. A closed case can be reopened with a reason.", "ಸಂಖ್ಯೆಗಳು ಪ್ರತಿ ಸ್ಥಿತಿಯಲ್ಲಿರುವ ಪ್ರಕರಣಗಳು. ಮುಚ್ಚಿದ ಪ್ರಕರಣವನ್ನು ಕಾರಣದೊಂದಿಗೆ ಮತ್ತೆ ತೆರೆಯಬಹುದು.")}</p>
        <Link href={go("/app/grievances/new", "/admin/grievances")} className="mt-5 inline-flex items-center gap-2 font-semibold text-primary">{tr("Raise a grievance", "ದೂರು ದಾಖಲಿಸಿ")} <ArrowRight /></Link>
      </Section>

      {/* G. Learning */}
      <Section id="learning" tone="soft" eyebrow={tr("Learning & knowledge centre", "ಕಲಿಕೆ ಮತ್ತು ಜ್ಞಾನ ಕೇಂದ್ರ")} title={tr("Courses available in the app today", "ಇಂದು ಆ್ಯಪ್‌ನಲ್ಲಿರುವ ಕೋರ್ಸ್‌ಗಳು")}>
        <div className="mb-5 flex flex-wrap gap-3 text-sm">{[[VideoCamera, tr("Videos", "ವೀಡಿಯೋ"), s.kinds.video], [FilePdf, tr("Readings", "ಓದು ಸಾಮಗ್ರಿ"), s.kinds.reading], [Question, tr("Quizzes", "ರಸಪ್ರಶ್ನೆ"), s.kinds.quiz]].map(([Icon, l, n]) => { const I = Icon as typeof VideoCamera; return <span key={String(l)} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2"><I size={18} className="text-primary" />{mounted ? String(n) : "–"} {String(l)}</span>; })}</div>
        <div className="grid gap-4 md:grid-cols-3">{(mounted ? s.courses : []).map((c) => (
          <Link key={c.id} href={go(`/app/learning/${c.id}`, "/admin/lms")} className="rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:border-primary hover:shadow-lg"><span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-primary">{c.topic}</span><h3 className="mt-3 font-bold">{loc(c.title)}</h3><p className="mt-1 text-sm text-muted">{loc(c.summary)}</p><p className="mt-3 text-xs text-muted">{c.lessons.length} {tr("modules", "ಮಾಡ್ಯೂಲ್")} · {c.minutes} {tr("min", "ನಿಮಿ")} · {c.languages.map((l) => (l === "kn" ? "ಕನ್ನಡ" : "English")).join(" / ")}</p></Link>))}</div>
        <Link href={go("/app/learning", "/admin/lms")} className="mt-6 inline-flex items-center gap-2 font-semibold text-primary">{tr("Browse the full learning centre", "ಪೂರ್ಣ ಕಲಿಕಾ ಕೇಂದ್ರ ನೋಡಿ")} <ArrowRight /></Link>
        <p className="mt-2 text-xs text-muted">{tr("Demo course content. Real material must be reviewed and approved before use.", "ಡೆಮೊ ಕೋರ್ಸ್ ವಿಷಯ. ನಿಜವಾದ ಸಾಮಗ್ರಿಯನ್ನು ಬಳಕೆಗೆ ಮೊದಲು ಪರಿಶೀಲಿಸಿ ಅನುಮೋದಿಸಬೇಕು.")}</p>
      </Section>

      {/* H. Training & coverage */}
      <Section id="training" eyebrow={tr("Training sessions & village coverage", "ತರಬೇತಿ ಅವಧಿ ಮತ್ತು ಗ್ರಾಮ ವ್ಯಾಪ್ತಿ")} title={tr("A 2-day training programme in Mysuru", "ಮೈಸೂರಿನಲ್ಲಿ 2 ದಿನದ ತರಬೇತಿ ಕಾರ್ಯಕ್ರಮ")}>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5"><div className="grid grid-cols-3 gap-3 text-center">{[[s.sessionsDone, tr("Sessions conducted", "ನಡೆದ ಅವಧಿ")], [s.trained, tr("Volunteers trained", "ತರಬೇತಿ ಪಡೆದವರು")], [s.perSession, tr("Avg. per session", "ಅವಧಿಗೆ ಸರಾಸರಿ")]].map(([n, l], i) => <div key={i}><p className="text-3xl font-bold text-primary"><Count to={n as number} ready={mounted} /></p><p className="text-xs text-muted">{l as string}</p></div>)}</div>
            <p className="mt-4 text-sm text-muted">{tr("Each batch attends two consecutive days at the training institute. Cohorts A, B and C run on days 1–2, 3–4 and 5–6, with three parallel classes each.", "ಪ್ರತಿ ಬ್ಯಾಚ್ ತರಬೇತಿ ಸಂಸ್ಥೆಯಲ್ಲಿ ಸತತ ಎರಡು ದಿನ ಹಾಜರಾಗುತ್ತದೆ. ಕೋಹಾರ್ಟ್ A, B, C ದಿನ 1–2, 3–4, 5–6 ರಂದು, ತಲಾ ಮೂರು ಸಮಾನಾಂತರ ತರಗತಿಗಳೊಂದಿಗೆ.")}</p>
            <Link href={go("/app/training", "/admin/training")} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">{tr("Training details", "ತರಬೇತಿ ವಿವರ")} <ArrowRight /></Link>{admin && <Link href="/admin/reports" className="mt-3 ml-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">{tr("Reports", "ವರದಿಗಳು")} <ArrowRight /></Link>}</div>
          <div className="rounded-2xl border border-border bg-card p-5"><h3 className="flex items-center gap-2 font-bold"><Buildings size={20} className="text-primary" />{tr("Volunteers by district", "ಜಿಲ್ಲೆವಾರು ಸ್ವಯಂಸೇವಕರು")}</h3>
            <ul className="mt-3 space-y-3">{mounted && s.byDistrict.length === 0 && <li className="text-sm text-muted">{tr("No volunteers yet.", "ಇನ್ನೂ ಸ್ವಯಂಸೇವಕರಿಲ್ಲ.")}</li>}{(mounted ? s.byDistrict : []).map(([d, n]) => <li key={d}><div className="flex justify-between text-sm"><span>{d}</span><b>{n}</b></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-border"><div className="h-full rounded-full bg-primary" style={{ width: `${(n / s.byDistrict[0][1]) * 100}%` }} /></div></li>)}</ul>
            <p className="mt-3 text-xs text-muted">{tr(`${s.villagesEnrolled} of ${s.gpTotal} Gram Panchayats in the master data have a volunteer.`, `ಮಾಸ್ಟರ್ ಡೇಟಾದ ${s.gpTotal} ಗ್ರಾಮ ಪಂಚಾಯತ್‌ಗಳಲ್ಲಿ ${s.villagesEnrolled} ಕ್ಕೆ ಸ್ವಯಂಸೇವಕರಿದ್ದಾರೆ.`)}</p></div>
        </div>
      </Section>

      {/* FAQ + CTA */}
      <section id="faq" className="scroll-mt-28 bg-accent-soft py-14 md:py-20"><div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-[1fr_1.2fr]">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">FAQ</p><h2 className="mt-2 text-3xl font-bold">{t.faq}</h2><div className="mt-6 rounded-3xl bg-gradient-to-br from-forest to-deep p-6 text-white"><h3 className="text-xl font-bold">{tr("Ready to lead in your village?", "ನಿಮ್ಮ ಹಳ್ಳಿಯಲ್ಲಿ ಮುನ್ನಡೆಸಲು ಸಿದ್ಧರೇ?")}</h3><p className="mt-1 text-sm text-white/80">{t.tagline}</p><Link href={go("/register", "/admin")} className={cn(btn, "mt-4 bg-saffron text-[#2b1700]")}>{admin || role === "trainer" ? tr("Open console", "ಕನ್ಸೋಲ್ ತೆರೆಯಿರಿ") : t.ctaRegister} <ArrowRight weight="bold" /></Link></div></div>
        <div className="space-y-3">{faq.map(([q, a]) => <details key={q} className="rounded-2xl border border-border bg-card p-4"><summary className="cursor-pointer font-medium">{q}</summary><p className="mt-2 text-muted">{a}</p></details>)}</div>
      </div></section>

      <footer className="bg-deep py-8 text-sm text-white/75"><div className="mx-auto flex max-w-6xl px-4 flex-wrap items-center justify-between gap-3"><p>{t.appName} · {t.tagline}</p><p className="flex gap-5"><Link href="/privacy" className="underline">{t.privacy}</Link><Link href="/app/help" className="underline">{t.help}</Link><Link href="/apply" className="underline">{t.j1}</Link></p></div><p className="mx-auto mt-3 max-w-6xl px-4 text-xs text-white/55">{t.nonPartisan}</p></footer>
    </div>
  );
}
void UsersThree;
