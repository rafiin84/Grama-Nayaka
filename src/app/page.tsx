"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpenText, Buildings, ChalkboardTeacher, ChartBar, ChatsCircle, CheckCircle, GraduationCap, MapPinLine, Sparkle, UsersThree, VideoCamera, FilePdf, Question, UsersFour } from "@phosphor-icons/react";
import { LangSwitch, ThemeToggle } from "@/components/shell/Controls";
import { useDb } from "@/lib/db";
import { homeStats } from "@/lib/homeStats";
import { PROGRAM_FIGURES as F } from "@/lib/programFigures";
import { Photo, TrainingVideoPlayer } from "@/components/Media";
import { CREDITS } from "@/lib/credits";
import { usePrefs } from "@/lib/store";
import { AuthControl } from "@/components/shell/AuthControl";
import { homeFor } from "@/lib/nav";
import { useT } from "@/lib/useT";
import { cn } from "@/lib/utils";

function useMounted() { const [m, setM] = useState(false); useEffect(() => setM(true), []); return m; }
function Count({ to, ready }: { to: number; ready: boolean }) {
  const reduce = useReducedMotion(); const [v, setV] = useState(0);
  useEffect(() => { if (!ready) return; if (reduce) return setV(to); const c = animate(0, to, { duration: 0.9, onUpdate: (x) => setV(Math.round(x)) }); return () => c.stop(); }, [to, ready, reduce]);
  return <>{ready ? v.toLocaleString("en-IN") : "—"}</>;
}
const Section = ({ id, eyebrow, title, sub, children, tone, bg, bare }: { id: string; eyebrow: string; title: string; sub?: string; children: React.ReactNode; tone?: "soft" | "dark" ; bg?: React.ReactNode; bare?: boolean }) => (
  <section id={id} className={cn("relative isolate scroll-mt-28 overflow-hidden py-14 md:py-20", tone === "soft" && "bg-accent-soft", tone === "dark" && "bg-deep text-white")}>
    {bg}
    <div className="relative mx-auto max-w-6xl px-4">{!bare && <><p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">{eyebrow}</p><h2 className="mt-2 max-w-3xl text-3xl font-bold md:text-4xl">{title}</h2>{sub && <p className={cn("mt-3 max-w-2xl", tone === "dark" ? "text-white/75" : "text-muted")}>{sub}</p>}</>}<div className={bare ? "" : "mt-8"}>{children}</div></div>
  </section>
);

export default function Landing() {
  const { t, tr, loc } = useT(); const role = usePrefs((s) => s.role); const mounted = useMounted(); const db = useDb(); const s = homeStats(db);
  const session = usePrefs((st) => st.session); const signed = mounted && !!session;
  const admin = role !== "participant" && role !== "trainer";
  const go = (p: string, a: string) => (admin ? a : role === "trainer" ? a : p);
  const nf = (n: number) => n.toLocaleString("en-IN"); const openG = F.grievancesRaised - F.grievancesClosed; const rate = Math.round((F.grievancesClosed / F.grievancesRaised) * 100); const perVillage = Math.round(F.villagers / F.villages);
  const nav = [["about", tr("About", "ಬಗ್ಗೆ")], ["how", tr("How it works", "ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ")], ["features", tr("Features", "ಸೌಲಭ್ಯಗಳು")], ["impact", tr("Impact", "ಪರಿಣಾಮ")], ["learning", tr("Learning", "ಕಲಿಕೆ")], ["faq", "FAQ"]];
  const steps = [
    [ChalkboardTeacher, tr("Train volunteers", "ಸ್ವಯಂಸೇವಕರಿಗೆ ತರಬೇತಿ"), tr("Volunteers attend a 2-day training programme in Mysuru.", "ಸ್ವಯಂಸೇವಕರು ಮೈಸೂರಿನಲ್ಲಿ 2 ದಿನದ ತರಬೇತಿಯಲ್ಲಿ ಭಾಗವಹಿಸುತ್ತಾರೆ.")],
    [BookOpenText, tr("Learn & understand", "ಕಲಿಯಿರಿ ಮತ್ತು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ"), tr("Videos, readings and quizzes on Gram Panchayat governance.", "ಗ್ರಾಮ ಪಂಚಾಯತ್ ಆಡಳಿತದ ವೀಡಿಯೋ, ಓದು ಮತ್ತು ರಸಪ್ರಶ್ನೆಗಳು.")],
    [MapPinLine, tr("Cover villages", "ಗ್ರಾಮಗಳನ್ನು ಒಳಗೊಳ್ಳಿ"), tr(`Volunteers are linked to their district, taluk and Gram Panchayat. ${nf(F.villages)} villages covered so far.`, `ಸ್ವಯಂಸೇವಕರನ್ನು ಅವರ ಜಿಲ್ಲೆ, ತಾಲ್ಲೂಕು ಮತ್ತು ಗ್ರಾಮ ಪಂಚಾಯತ್‌ಗೆ ಜೋಡಿಸಲಾಗುತ್ತದೆ. ಇದುವರೆಗೆ ${nf(F.villages)} ಗ್ರಾಮಗಳು.`)],
    [ChatsCircle, tr("Raise grievances", "ದೂರುಗಳನ್ನು ದಾಖಲಿಸಿ"), tr(`Record issues found in the village, with a reference ID. ${nf(F.grievancesRaised)} raised so far.`, `ಹಳ್ಳಿಯಲ್ಲಿ ಕಂಡ ಸಮಸ್ಯೆಗಳನ್ನು ಉಲ್ಲೇಖ ಐಡಿಯೊಂದಿಗೆ ದಾಖಲಿಸಿ. ಇದುವರೆಗೆ ${nf(F.grievancesRaised)} ದಾಖಲಾಗಿವೆ.`)],
    [Sparkle, tr("Follow up & resolve", "ಅನುಸರಿಸಿ ಮತ್ತು ಪರಿಹರಿಸಿ"), tr(`Track progress; AI helps draft messages to officials. People decide. ${nf(F.grievancesClosed)} closed (${rate}%).`, `ಪ್ರಗತಿ ಗಮನಿಸಿ; ಅಧಿಕಾರಿಗಳಿಗೆ ಸಂದೇಶ ಕರಡಿಗೆ AI ನೆರವು. ನಿರ್ಧಾರ ಜನರದ್ದು. ${nf(F.grievancesClosed)} ಮುಚ್ಚಲಾಗಿದೆ (${rate}%).`)],
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
          <Link href="/" className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-fg"><UsersThree size={20} weight="fill" /></span><span className="max-sm:hidden"><span className="block font-bold leading-tight">{t.appName}</span><span className="hidden text-[11px] text-muted sm:block">{t.appNameLocal}</span></span></Link>
          <nav aria-label="Sections" className="hidden items-center gap-6 text-sm font-medium lg:flex">{nav.map(([id, l]) => <a key={id} href={`#${id}`} className="hover:text-primary">{l}</a>)}</nav>
          <div className="flex items-center gap-2"><LangSwitch /><ThemeToggle /><AuthControl /></div>
        </div>
        <nav aria-label="Sections" className="flex gap-4 overflow-x-auto border-t border-border px-4 py-2 text-sm lg:hidden">{nav.map(([id, l]) => <a key={id} href={`#${id}`} className="whitespace-nowrap text-muted">{l}</a>)}</nav>
      </header>

      {/* A. Hero: full-screen image with the copy and headline figures on top */}
      <section className="relative isolate flex min-h-[max(600px,calc(100svh-96px))] flex-col overflow-hidden bg-neutral-900 text-white">
        <Image src="/hero.jpg" alt={tr("A young volunteer on a village street at sunset", "ಸೂರ್ಯಾಸ್ತದ ವೇಳೆ ಹಳ್ಳಿಯ ರಸ್ತೆಯಲ್ಲಿ ಯುವ ಸ್ವಯಂಸೇವಕ")} fill priority sizes="100vw" className="-z-20 object-cover object-[68%_22%] md:object-[62%_24%]" />
        <div aria-hidden className="absolute inset-y-0 left-0 -z-10 w-full bg-gradient-to-r from-black/70 via-black/40 to-transparent backdrop-blur-[3px] max-md:bg-black/55 md:w-[70%] md:[-webkit-mask-image:linear-gradient(to_right,#000_55%,transparent)] md:[mask-image:linear-gradient(to_right,#000_55%,transparent)]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
        <span className="absolute right-4 top-4 rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-white/80 backdrop-blur md:right-6">{tr("Illustrative image", "ವಿವರಣಾತ್ಮಕ ಚಿತ್ರ")}</span>

        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 pb-8 pt-14 md:pt-10">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm backdrop-blur"><span className="h-2 w-2 rounded-full bg-saffron" />{tr(`${nf(F.gramaNayakas)} Grama Nayakas · ${nf(F.villages)} villages`, `${nf(F.gramaNayakas)} ಗ್ರಾಮ ನಾಯಕರು · ${nf(F.villages)} ಗ್ರಾಮಗಳು`)}</span>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.1] md:text-6xl lg:text-[64px]">{tr("Grama Nayaka – Empowering Villages, Enabling Change", "ಗ್ರಾಮ ನಾಯಕ – ಗ್ರಾಮಗಳ ಸಬಲೀಕರಣ, ಬದಲಾವಣೆಗೆ ಶಕ್ತಿ")}</h1>
          <p className="mt-5 max-w-xl text-base text-white/85 md:text-lg">{tr("Grama Nayaka is a village empowerment initiative that trains volunteers, promotes awareness of Gram Panchayat governance, connects villages to digital resources, and helps communities raise and track grievances until resolution.", "ಗ್ರಾಮ ನಾಯಕ ಒಂದು ಗ್ರಾಮ ಸಬಲೀಕರಣ ಉಪಕ್ರಮ: ಸ್ವಯಂಸೇವಕರಿಗೆ ತರಬೇತಿ, ಗ್ರಾಮ ಪಂಚಾಯತ್ ಆಡಳಿತದ ಅರಿವು, ಹಳ್ಳಿಗಳಿಗೆ ಡಿಜಿಟಲ್ ಸಂಪನ್ಮೂಲ, ಮತ್ತು ದೂರುಗಳನ್ನು ಪರಿಹಾರವಾಗುವವರೆಗೆ ದಾಖಲಿಸಿ ಗಮನಿಸಲು ಸಮುದಾಯಗಳಿಗೆ ನೆರವು.")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href={signed ? homeFor(session!.role) : "/register"} className={cn(btn, "bg-saffron text-[#2b1700]")}>{signed ? tr("Open my home", "ನನ್ನ ಮುಖಪುಟ ತೆರೆಯಿರಿ") : tr("Register", "ನೋಂದಾಯಿಸಿ")} <ArrowRight weight="bold" /></Link>
            <Link href={go("/app/learning", "/admin/lms")} className={cn(btn, "border border-white/40 bg-white/10 backdrop-blur")}>{tr("Explore Learning Resources", "ಕಲಿಕಾ ಸಂಪನ್ಮೂಲ ನೋಡಿ")}</Link>
            <Link href={go("/app/grievances/new", "/admin/grievances")} className={cn(btn, "border border-white/40 bg-white/10 backdrop-blur")}>{tr("Raise a Grievance", "ದೂರು ದಾಖಲಿಸಿ")}</Link>
          </div>
          <p className="mt-5 max-w-lg text-sm text-white/65">{t.nonPartisan}</p>
        </div>

        {/* Headline figures over the image */}
        <div className="mx-auto w-full max-w-6xl px-4 pb-6 md:pb-8">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/25 bg-white/20 backdrop-blur-md md:grid-cols-5">
            {([[UsersThree, F.gramaNayakas, tr("Grama Nayakas", "ಗ್ರಾಮ ನಾಯಕರು"), ""], [MapPinLine, F.villages, tr("Villages", "ಗ್ರಾಮಗಳು"), ""], [UsersFour, F.villagers, tr("Villagers", "ಗ್ರಾಮಸ್ಥರು"), ""], [ChatsCircle, F.grievancesRaised, tr("Grievances raised", "ದಾಖಲಾದ ದೂರುಗಳು"), ""], [CheckCircle, F.grievancesClosed, tr("Grievances closed", "ಮುಚ್ಚಿದ ದೂರುಗಳು"), tr(`${Math.round((F.grievancesClosed / F.grievancesRaised) * 100)}% of raised`, `ದಾಖಲಾದವುಗಳ ${Math.round((F.grievancesClosed / F.grievancesRaised) * 100)}%`)]] as const).map(([Icon, n, l, h], i) => (
              <div key={i} className={cn("flex items-center gap-3 bg-black/45 p-4 md:flex-col md:items-start md:gap-2", i === 4 && "col-span-2 md:col-span-1")}>
                <Icon size={22} weight="duotone" className="shrink-0 text-saffron" />
                <div className="min-w-0"><p className="text-2xl font-bold leading-none md:text-[28px]"><Count to={n} ready={mounted} /></p><p className="mt-1 text-sm text-white/80">{l}</p>{h && <p className="text-xs text-white/55">{h}</p>}</div>
              </div>))}
          </div>
          <p className="mt-2 text-center text-[11px] text-white/55">{tr("Headline figures supplied by the Grama Nayaka programme team.", "ಶೀರ್ಷಿಕೆ ಅಂಕಿಅಂಶಗಳನ್ನು ಗ್ರಾಮ ನಾಯಕ ಕಾರ್ಯಕ್ರಮ ತಂಡ ಒದಗಿಸಿದೆ.")}</p>
        </div>
      </section>

      {/* B. About: copy and mini stats beside a full-height photo with the reach card on top */}
      <Section id="about" eyebrow={tr("About the initiative", "ಉಪಕ್ರಮದ ಬಗ್ಗೆ")} title={tr(`${nf(F.gramaNayakas)} Grama Nayakas, ${nf(F.villages)} villages, one connected network`, `${nf(F.gramaNayakas)} ಗ್ರಾಮ ನಾಯಕರು, ${nf(F.villages)} ಗ್ರಾಮಗಳು, ಒಂದು ಸಂಪರ್ಕಿತ ಜಾಲ`)}>
        <div className="grid items-stretch gap-8 lg:grid-cols-2">
          <div className="flex flex-col">
            <p className="text-lg text-muted">{tr(`Across ${nf(F.villages)} villages, ${nf(F.gramaNayakas)} Grama Nayakas are helping ${nf(F.villagers)} villagers understand how their Gram Panchayat works, use public services and follow up on local issues. So far ${nf(F.grievancesRaised)} grievances have been raised through the network, and ${nf(F.grievancesClosed)} of them (${rate}%) have been closed.`, `${nf(F.villages)} ಗ್ರಾಮಗಳಲ್ಲಿ ${nf(F.gramaNayakas)} ಗ್ರಾಮ ನಾಯಕರು ${nf(F.villagers)} ಗ್ರಾಮಸ್ಥರಿಗೆ ತಮ್ಮ ಗ್ರಾಮ ಪಂಚಾಯತ್ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ ಎಂದು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು, ಸಾರ್ವಜನಿಕ ಸೇವೆ ಬಳಸಲು ಮತ್ತು ಸ್ಥಳೀಯ ಸಮಸ್ಯೆಗಳನ್ನು ಅನುಸರಿಸಲು ನೆರವಾಗುತ್ತಿದ್ದಾರೆ. ಈ ಜಾಲದ ಮೂಲಕ ಇದುವರೆಗೆ ${nf(F.grievancesRaised)} ದೂರುಗಳು ದಾಖಲಾಗಿವೆ; ಅವುಗಳಲ್ಲಿ ${nf(F.grievancesClosed)} (${rate}%) ಮುಚ್ಚಲಾಗಿದೆ.`)}</p>
            <ul className="mt-5 space-y-3">{[tr(`${nf(F.gramaNayakas)} Grama Nayakas working in ${nf(F.villages)} villages`, `${nf(F.villages)} ಗ್ರಾಮಗಳಲ್ಲಿ ${nf(F.gramaNayakas)} ಗ್ರಾಮ ನಾಯಕರ ಸೇವೆ`), tr(`${nf(F.villagers)} villagers within reach of a local volunteer`, `${nf(F.villagers)} ಗ್ರಾಮಸ್ಥರಿಗೆ ಸ್ಥಳೀಯ ಸ್ವಯಂಸೇವಕರ ಬೆಂಬಲ`), tr(`${nf(F.grievancesRaised)} grievances raised, each tracked with a reference ID`, `${nf(F.grievancesRaised)} ದೂರುಗಳು ದಾಖಲು, ಪ್ರತಿಯೊಂದಕ್ಕೂ ಉಲ್ಲೇಖ ಐಡಿ`), tr("Learning resources in Kannada and English", "ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಕಲಿಕಾ ಸಂಪನ್ಮೂಲ")].map((x) => <li key={x} className="flex gap-3"><CheckCircle size={22} weight="fill" className="mt-0.5 shrink-0 text-primary" />{x}</li>)}</ul>
            <div className="mt-auto grid grid-cols-3 gap-3 pt-8">{[[nf(F.villagers), tr("Villagers", "ಗ್ರಾಮಸ್ಥರು")], [nf(F.grievancesRaised), tr("Grievances raised", "ದಾಖಲಾದ ದೂರುಗಳು")], [`${rate}%`, tr("Closed", "ಮುಚ್ಚಿದ")]].map(([n, l]) => <div key={l} className="rounded-2xl border border-primary/20 bg-accent-soft p-4"><p className="text-2xl font-bold text-primary md:text-3xl">{n}</p><p className="text-sm text-muted">{l}</p></div>)}</div>
          </div>
          <Photo src="/images/sections/about.jpg" creditId="about" alt={tr("Two women walking with cattle along a village road in rural Karnataka", "ಕರ್ನಾಟಕದ ಹಳ್ಳಿಯ ರಸ್ತೆಯಲ್ಲಿ ದನಗಳೊಂದಿಗೆ ಹೋಗುತ್ತಿರುವ ಇಬ್ಬರು ಮಹಿಳೆಯರು")} className="min-h-[320px] lg:min-h-[460px]" position="center 62%" shade="left" creditPos="bottom">
            <div className="absolute inset-x-4 top-4 rounded-2xl border border-white/25 bg-[#062f26]/80 p-5 text-white backdrop-blur-md sm:right-auto sm:w-[320px]"><p className="text-sm text-white/75">{tr("Our reach", "ನಮ್ಮ ವ್ಯಾಪ್ತಿ")}</p><p className="mt-1 text-5xl font-bold leading-none"><Count to={F.gramaNayakas} ready={mounted} /></p><p className="mt-2 text-white/85">{tr(`Grama Nayakas serving ${nf(F.villages)} villages`, `${nf(F.villages)} ಗ್ರಾಮಗಳಲ್ಲಿ ಸೇವೆ ಸಲ್ಲಿಸುತ್ತಿರುವ ಗ್ರಾಮ ನಾಯಕರು`)}</p></div>
          </Photo>
        </div>
      </Section>

      {/* C. How it works: photo beside a vertical list of equal-height steps */}
      <Section id="how" tone="soft" eyebrow={tr("How it works", "ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ")} title={tr("Five steps from training to resolution", "ತರಬೇತಿಯಿಂದ ಪರಿಹಾರದವರೆಗೆ ಐದು ಹಂತ")}>
        <div className="grid items-stretch gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <Photo src="/images/sections/how.jpg" creditId="how" alt={tr("Women and a facilitator gathered for a community meeting under a village shelter", "ಹಳ್ಳಿಯ ಆವರಣದಲ್ಲಿ ಸಮುದಾಯ ಸಭೆಗೆ ಸೇರಿರುವ ಮಹಿಳೆಯರು ಮತ್ತು ಸಂಯೋಜಕರು")} className="min-h-[280px] lg:min-h-[520px]" position="55% center" />
          <ol className="grid auto-rows-fr gap-3">{steps.map(([Icon, h, b], i) => (
            <li key={i} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4 md:p-5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-saffron text-sm font-bold text-[#2b1700]">{i + 1}</span><div className="min-w-0"><h3 className="flex items-center gap-2 font-bold"><Icon size={20} className="text-primary" weight="duotone" />{h}</h3><p className="mt-1 text-sm text-muted">{b}</p></div></li>))}</ol>
        </div>
      </Section>

      {/* D. Features: banner with the heading on the photo, cards overlapping its lower edge */}
      <Section id="features" bare eyebrow="" title="">
        <div className="relative">
          <Photo src="/images/sections/features.jpg" creditId="features" alt={tr("Three women sitting together on a low wall in a village near Mysuru", "ಮೈಸೂರಿನ ಬಳಿಯ ಹಳ್ಳಿಯಲ್ಲಿ ಕಟ್ಟೆಯ ಮೇಲೆ ಕುಳಿತಿರುವ ಮೂವರು ಮಹಿಳೆಯರು")} className="h-[400px] sm:h-[320px] md:h-[340px]" sizes="(min-width: 1152px) 1120px, 100vw" position="center 6%" shade="left">
            <div className="absolute inset-0 flex flex-col justify-center p-6 pb-20 text-white sm:pb-6 md:p-10"><p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">{tr("Key features", "ಪ್ರಮುಖ ಸೌಲಭ್ಯಗಳು")}</p><h2 className="mt-2 max-w-xl text-2xl font-bold sm:text-3xl md:text-4xl">{tr("Everything volunteers and coordinators need", "ಸ್ವಯಂಸೇವಕರು ಮತ್ತು ಸಂಯೋಜಕರಿಗೆ ಬೇಕಾದ್ದೆಲ್ಲ")}</h2><p className="mt-3 max-w-md text-white/80">{tr(`Built for ${nf(F.gramaNayakas)} volunteers and the coordinators who support them.`, `${nf(F.gramaNayakas)} ಸ್ವಯಂಸೇವಕರು ಮತ್ತು ಅವರನ್ನು ಬೆಂಬಲಿಸುವ ಸಂಯೋಜಕರಿಗಾಗಿ ರೂಪಿಸಲಾಗಿದೆ.`)}</p></div>
          </Photo>
          <div className="relative -mt-12 grid gap-4 px-3 sm:-mt-14 sm:grid-cols-2 md:px-6 lg:grid-cols-3">{features.map(([Icon, h, b, href]) => (
            <Link key={h} href={href} className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-lg"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-primary"><Icon size={26} weight="duotone" /></span><h3 className="mt-4 text-lg font-bold">{h}</h3><p className="mt-1 text-sm text-muted">{b}</p><span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">{tr("Open", "ತೆರೆಯಿರಿ")} <ArrowRight className="transition group-hover:translate-x-1" /></span></Link>))}</div>
        </div>
      </Section>

      {/* E. Impact: the programme figures over a dimmed photo */}
      <Section id="impact" tone="dark" bg={<><Image src="/images/sections/impact.jpg" alt="" fill sizes="100vw" className="-z-20 object-cover opacity-40" /><div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-[#062f26]/90 via-[#062f26]/80 to-[#062f26]/95" /></>} eyebrow={tr("Impact", "ಪರಿಣಾಮ")} title={tr("Where the network stands today", "ಜಾಲ ಇಂದು ಇರುವ ಸ್ಥಿತಿ")} sub={tr("Headline figures supplied by the programme team. Averages and the open count are calculated from them.", "ಶೀರ್ಷಿಕೆ ಅಂಕಿಅಂಶಗಳನ್ನು ಕಾರ್ಯಕ್ರಮ ತಂಡ ಒದಗಿಸಿದೆ. ಸರಾಸರಿ ಮತ್ತು ಬಾಕಿ ಸಂಖ್ಯೆಯನ್ನು ಅವುಗಳಿಂದ ಲೆಕ್ಕಹಾಕಲಾಗಿದೆ.")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {([[F.gramaNayakas, tr("Grama Nayakas", "ಗ್ರಾಮ ನಾಯಕರು"), null], [F.villages, tr("Villages", "ಗ್ರಾಮಗಳು"), null], [F.villagers, tr("Villagers", "ಗ್ರಾಮಸ್ಥರು"), null], [perVillage, tr("Villagers per village (avg.)", "ಪ್ರತಿ ಗ್ರಾಮಕ್ಕೆ ಗ್ರಾಮಸ್ಥರು (ಸರಾಸರಿ)"), null], [F.grievancesRaised, tr("Grievances raised", "ದಾಖಲಾದ ದೂರುಗಳು"), 100], [F.grievancesClosed, tr("Grievances closed", "ಮುಚ್ಚಿದ ದೂರುಗಳು"), rate], [openG, tr("Grievances still open", "ಇನ್ನೂ ಬಾಕಿ ಇರುವ ದೂರುಗಳು"), 100 - rate]] as const).map(([n, l, bar], i) => (
            <div key={i} className="flex flex-col rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm"><p className="text-3xl font-bold"><Count to={n} ready={mounted} /></p><p className="mt-1 text-sm text-white/80">{l}</p><div className="mt-auto pt-3">{bar !== null ? <div className="h-1.5 overflow-hidden rounded-full bg-white/15" aria-hidden><div className="h-full rounded-full bg-saffron" style={{ width: `${mounted ? bar : 0}%`, transition: "width .8s" }} /></div> : <div className="h-1.5" />}</div></div>))}
          <div className="flex flex-col justify-between rounded-2xl border border-saffron/50 bg-saffron/15 p-5"><p className="text-3xl font-bold text-saffron">{rate}%</p><p className="mt-1 text-sm text-white/85">{tr(`closure rate: ${nf(F.grievancesClosed)} of ${nf(F.grievancesRaised)} grievances`, `ಮುಚ್ಚುವ ದರ: ${nf(F.grievancesRaised)} ರಲ್ಲಿ ${nf(F.grievancesClosed)} ದೂರುಗಳು`)}</p></div>
        </div>
        <p className="mt-4 text-[11px] text-white/50">{tr("Background photo", "ಹಿನ್ನೆಲೆ ಚಿತ್ರ")}: <a className="underline" href={CREDITS.impact.source} target="_blank" rel="noreferrer">{CREDITS.impact.author} · {CREDITS.impact.license}</a></p>
      </Section>

      {/* F. Grievance journey */}
      <Section id="journey" eyebrow={tr("Grievance resolution journey", "ದೂರು ಪರಿಹಾರ ಪ್ರಯಾಣ")} title={tr("From a village issue to a confirmed closure", "ಹಳ್ಳಿಯ ಸಮಸ್ಯೆಯಿಂದ ದೃಢೀಕೃತ ಮುಚ್ಚುವಿಕೆವರೆಗೆ")} sub={tr(`${nf(F.grievancesRaised)} grievances raised, ${nf(F.grievancesClosed)} closed (${rate}%), ${nf(openG)} still open. A case is never 'resolved' just because it was submitted or referred; closure needs an outcome summary and confirmation.`, `${nf(F.grievancesRaised)} ದೂರುಗಳು ದಾಖಲು, ${nf(F.grievancesClosed)} ಮುಚ್ಚಲಾಗಿದೆ (${rate}%), ${nf(openG)} ಇನ್ನೂ ಬಾಕಿ. ಸಲ್ಲಿಸಿದ ಅಥವಾ ಉಲ್ಲೇಖಿಸಿದ ಮಾತ್ರಕ್ಕೆ ಪ್ರಕರಣ 'ಪರಿಹಾರ'ವಾಗುವುದಿಲ್ಲ; ಮುಚ್ಚಲು ಫಲಿತಾಂಶ ಸಾರಾಂಶ ಮತ್ತು ದೃಢೀಕರಣ ಬೇಕು.`)}>
        <div className="grid items-stretch gap-6 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col">
            <ol className="grid flex-1 auto-rows-fr gap-3 sm:grid-cols-2 md:grid-cols-3">{journey.map(([st, l], i) => (
              <li key={st} className="rounded-2xl border border-border bg-card p-4"><span className="grid h-7 w-7 place-items-center rounded-full bg-accent-soft text-xs font-bold text-primary">{i + 1}</span><p className="mt-3 font-bold">{st}</p><p className="text-sm text-muted">{l}</p></li>))}</ol>
            <Link href={go("/app/grievances/new", "/admin/grievances")} className="mt-5 inline-flex items-center gap-2 font-semibold text-primary">{tr("Raise a grievance", "ದೂರು ದಾಖಲಿಸಿ")} <ArrowRight /></Link>
          </div>
          <Photo src="/images/sections/journey.jpg" creditId="journey" alt={tr("A Gram Panchayat office in Karnataka with Kannada signboards", "ಕನ್ನಡ ಫಲಕಗಳಿರುವ ಕರ್ನಾಟಕದ ಗ್ರಾಮ ಪಂಚಾಯತ್ ಕಚೇರಿ")} className="min-h-[260px] lg:min-h-full" sizes="(min-width: 1024px) 380px, 100vw" position="center" />
        </div>
      </Section>

      {/* G. Learning */}
      <Section id="learning" tone="soft" eyebrow={tr("Learning & knowledge centre", "ಕಲಿಕೆ ಮತ್ತು ಜ್ಞಾನ ಕೇಂದ್ರ")} title={tr("Courses available in the app today", "ಇಂದು ಆ್ಯಪ್‌ನಲ್ಲಿರುವ ಕೋರ್ಸ್‌ಗಳು")}>
        <div className="mb-5 flex flex-wrap gap-3 text-sm">{[[VideoCamera, tr("Videos", "ವೀಡಿಯೋ"), s.kinds.video], [FilePdf, tr("Readings", "ಓದು ಸಾಮಗ್ರಿ"), s.kinds.reading], [Question, tr("Quizzes", "ರಸಪ್ರಶ್ನೆ"), s.kinds.quiz]].map(([Icon, l, n]) => { const I = Icon as typeof VideoCamera; return <span key={String(l)} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2"><I size={18} className="text-primary" />{mounted ? String(n) : "–"} {String(l)}</span>; })}<Link href={go("/app/learning", "/admin/resources")} className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card px-4 py-2 font-medium text-primary hover:bg-accent-soft">{mounted ? s.libraryCount : "–"} {tr("library resources", "ಗ್ರಂಥಾಲಯ ಸಂಪನ್ಮೂಲಗಳು")} <ArrowRight /></Link></div>
        <div className="grid gap-6 lg:grid-cols-[1fr_minmax(420px,36%)]"><div className="grid gap-4">{(mounted ? s.courses : []).map((c) => (
          <Link key={c.id} href={go(`/app/learning/${c.id}`, "/admin/lms")} className="rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:border-primary hover:shadow-lg"><span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-primary">{c.topic}</span><h3 className="mt-3 font-bold">{loc(c.title)}</h3><p className="mt-1 text-sm text-muted">{loc(c.summary)}</p><p className="mt-3 text-xs text-muted">{c.lessons.length} {tr("modules", "ಮಾಡ್ಯೂಲ್")} · {c.minutes} {tr("min", "ನಿಮಿ")} · {c.languages.map((l) => (l === "kn" ? "ಕನ್ನಡ" : "English")).join(" / ")}</p></Link>))}</div><Photo src="/images/sections/learning.jpg" creditId="learning" alt={tr("Women smiling together in a village learning session with a blackboard behind them", "ಹಿಂದೆ ಕಪ್ಪುಹಲಗೆ ಇರುವ ಗ್ರಾಮ ಕಲಿಕಾ ಅವಧಿಯಲ್ಲಿ ಒಟ್ಟಾಗಿ ನಗುತ್ತಿರುವ ಮಹಿಳೆಯರು")} className="aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[360px]" sizes="(min-width: 1024px) 340px, 100vw" position="center 30%" /></div>
        <Link href={go("/app/learning", "/admin/lms")} className="mt-6 inline-flex items-center gap-2 font-semibold text-primary">{tr("Browse the full learning centre", "ಪೂರ್ಣ ಕಲಿಕಾ ಕೇಂದ್ರ ನೋಡಿ")} <ArrowRight /></Link>
        <p className="mt-2 text-xs text-muted">{tr("Demo course content. Real material must be reviewed and approved before use.", "ಡೆಮೊ ಕೋರ್ಸ್ ವಿಷಯ. ನಿಜವಾದ ಸಾಮಗ್ರಿಯನ್ನು ಬಳಕೆಗೆ ಮೊದಲು ಪರಿಶೀಲಿಸಿ ಅನುಮೋದಿಸಬೇಕು.")}</p>
      </Section>

      {/* H. Training & coverage */}
      <Section id="training" eyebrow={tr("Training sessions & village coverage", "ತರಬೇತಿ ಅವಧಿ ಮತ್ತು ಗ್ರಾಮ ವ್ಯಾಪ್ತಿ")} title={tr("A 2-day training programme in Mysuru", "ಮೈಸೂರಿನಲ್ಲಿ 2 ದಿನದ ತರಬೇತಿ ಕಾರ್ಯಕ್ರಮ")}>
        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-stretch">
          <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
            <div className="grid grid-cols-3 gap-3 text-center">{[["2", tr("days per batch", "ದಿನ ಪ್ರತಿ ಬ್ಯಾಚ್‌ಗೆ")], ["3", tr("cohorts (A, B, C)", "ಕೋಹಾರ್ಟ್ (A, B, C)")], ["3", tr("parallel classes each", "ಸಮಾನಾಂತರ ತರಗತಿ")]].map(([n, l], i) => <div key={i} className="rounded-xl bg-accent-soft py-3"><p className="text-3xl font-bold text-primary">{n}</p><p className="text-xs text-muted">{l}</p></div>)}</div>
            <div className="mt-4"><h3 className="mb-2 font-bold">{tr("Training programme videos", "ತರಬೇತಿ ಕಾರ್ಯಕ್ರಮ ವೀಡಿಯೋಗಳು")}</h3><TrainingVideoPlayer /></div>
            <p className="mt-4 text-sm text-muted">{tr("Each batch attends two consecutive days at the training institute. Cohorts A, B and C run on days 1–2, 3–4 and 5–6, with three parallel classes each.", "ಪ್ರತಿ ಬ್ಯಾಚ್ ತರಬೇತಿ ಸಂಸ್ಥೆಯಲ್ಲಿ ಸತತ ಎರಡು ದಿನ ಹಾಜರಾಗುತ್ತದೆ. ಕೋಹಾರ್ಟ್ A, B, C ದಿನ 1–2, 3–4, 5–6 ರಂದು, ತಲಾ ಮೂರು ಸಮಾನಾಂತರ ತರಗತಿಗಳೊಂದಿಗೆ.")}</p>
            <div className="mt-3 flex flex-wrap gap-5"><Link href={go("/app/training", "/admin/training")} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">{tr("Training details", "ತರಬೇತಿ ವಿವರ")} <ArrowRight /></Link>{admin && <Link href="/admin/reports" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">{tr("Reports", "ವರದಿಗಳು")} <ArrowRight /></Link>}</div>
          </div>
          <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
            <h3 className="flex items-center gap-2 font-bold"><Buildings size={20} className="text-primary" />{tr("Coverage at a glance", "ವ್ಯಾಪ್ತಿ ಒಂದು ನೋಟದಲ್ಲಿ")}</h3>
            <dl className="mt-4 grid flex-1 auto-rows-fr divide-y divide-border">{[[tr("Grama Nayakas", "ಗ್ರಾಮ ನಾಯಕರು"), nf(F.gramaNayakas)], [tr("Villages", "ಗ್ರಾಮಗಳು"), nf(F.villages)], [tr("Villagers", "ಗ್ರಾಮಸ್ಥರು"), nf(F.villagers)], [tr("Villagers per village (avg.)", "ಪ್ರತಿ ಗ್ರಾಮಕ್ಕೆ ಗ್ರಾಮಸ್ಥರು (ಸರಾಸರಿ)"), nf(perVillage)], [tr("Grievances raised", "ದಾಖಲಾದ ದೂರುಗಳು"), nf(F.grievancesRaised)], [tr("Grievances closed", "ಮುಚ್ಚಿದ ದೂರುಗಳು"), `${nf(F.grievancesClosed)} (${rate}%)`]].map(([k, v]) => <div key={k} className="flex items-center justify-between gap-3 py-2"><dt className="text-sm text-muted">{k}</dt><dd className="text-lg font-bold text-primary">{v}</dd></div>)}</dl>
            <div className="mt-4"><div className="flex justify-between text-xs font-medium"><span className="text-primary">{tr("Closed", "ಮುಚ್ಚಿದ")} {rate}%</span><span className="text-warning">{tr("Open", "ಬಾಕಿ")} {100 - rate}%</span></div><div role="img" aria-label={tr(`${rate}% of grievances closed, ${100 - rate}% open`, `${rate}% ದೂರುಗಳು ಮುಚ್ಚಲಾಗಿದೆ, ${100 - rate}% ಬಾಕಿ`)} className="mt-1 flex h-3 overflow-hidden rounded-full bg-border"><div className="bg-primary" style={{ width: `${rate}%` }} /><div className="bg-saffron" style={{ width: `${100 - rate}%` }} /></div></div>
            <p className="mt-3 text-xs text-muted">{tr("Headline figures supplied by the programme team.", "ಶೀರ್ಷಿಕೆ ಅಂಕಿಅಂಶಗಳನ್ನು ಕಾರ್ಯಕ್ರಮ ತಂಡ ಒದಗಿಸಿದೆ.")}</p>
          </div>
        </div>
      </Section>

      {/* FAQ + CTA */}
      <section id="faq" className="scroll-mt-28 bg-accent-soft py-14 md:py-20"><div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-[1fr_1.2fr]">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">FAQ</p><h2 className="mt-2 text-3xl font-bold">{t.faq}</h2><div className="mt-6 rounded-3xl bg-gradient-to-br from-forest to-deep p-6 text-white"><h3 className="text-xl font-bold">{tr(`Join ${nf(F.gramaNayakas)} Grama Nayakas in ${nf(F.villages)} villages`, `${nf(F.villages)} ಗ್ರಾಮಗಳ ${nf(F.gramaNayakas)} ಗ್ರಾಮ ನಾಯಕರೊಂದಿಗೆ ಸೇರಿ`)}</h3><p className="mt-1 text-sm text-white/80">{t.tagline}</p><Link href={signed ? homeFor(session!.role) : "/register"} className={cn(btn, "mt-4 bg-saffron text-[#2b1700]")}>{signed ? tr("Open my home", "ನನ್ನ ಮುಖಪುಟ ತೆರೆಯಿರಿ") : tr("Register", "ನೋಂದಾಯಿಸಿ")} <ArrowRight weight="bold" /></Link></div></div>
        <div className="space-y-3">{faq.map(([q, a]) => <details key={q} className="rounded-2xl border border-border bg-card p-4"><summary className="cursor-pointer font-medium">{q}</summary><p className="mt-2 text-muted">{a}</p></details>)}</div>
      </div></section>

      <footer className="bg-deep py-8 text-sm text-white/75"><div className="mx-auto flex max-w-6xl px-4 flex-wrap items-center justify-between gap-3"><p>{t.appName} · {t.tagline}</p><p className="flex gap-5"><Link href="/privacy" className="underline">{t.privacy}</Link><Link href="/app/help" className="underline">{t.help}</Link><Link href="/apply" className="underline">{t.j1}</Link></p></div><p className="mx-auto mt-3 max-w-6xl px-4 text-xs text-white/55">{t.nonPartisan}</p><details className="mx-auto mt-3 max-w-6xl px-4 text-xs text-white/60"><summary className="cursor-pointer underline-offset-2 hover:underline">{tr("Photo and video credits", "ಚಿತ್ರ ಮತ್ತು ವೀಡಿಯೋ ಕ್ರೆಡಿಟ್‌ಗಳು")}</summary><ul className="mt-2 space-y-1">{Object.values(CREDITS).map((c) => <li key={c.id}><a className="underline" href={c.source} target="_blank" rel="noreferrer">{c.title}</a> · {c.author} · <a className="underline" href={c.licenseUrl} target="_blank" rel="noreferrer">{c.license}</a> · via Wikimedia Commons. {c.note}</li>)}</ul></details></footer>
    </div>
  );
}
void UsersThree;
