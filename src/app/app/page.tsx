"use client";
import Link from "next/link";
import { ArrowRight, CalendarBlank, CheckCircle, Circle, Trophy } from "@phosphor-icons/react";
import { Badge, Button, Card, Progress, QState, Select, statusTone } from "@/components/ui";
import { useMock } from "@/lib/api";
import { getDb, useDb } from "@/lib/db";
import { lmsStats, nextLesson, points, today } from "@/lib/derive";
import { useT } from "@/lib/useT";
import { usePrefs, type Stage } from "@/lib/store";
import { ME } from "@/lib/seed";

export default function Home() {
  const { tr, loc, lang } = useT(); const stage = usePrefs((s) => s.stage); const setStage = usePrefs((s) => s.setStage);
  const q = useMock(["home"], () => {
    const d = getDb(); const me = d.applications.find((a) => a.id === d.myApplicationId) ?? d.applications[0];
    return { me, lms: lmsStats(d), next: nextLesson(d), pts: points(d), due: d.grievances.filter((g) => g.ownerId === ME && g.status !== "Closed" && g.followUpDate <= "2026-10-27"),
      ev: d.events.filter((e) => e.status === "Upcoming" && e.registered.includes(ME))[0] ?? d.events.find((e) => e.status === "Upcoming"), unread: d.notifications.filter((n) => !n.read).slice(0, 3), cls: d.classes.find((c) => c.roster.includes(ME)), cycle: d.cycle };
  });
  const stages: { id: Stage; en: string; kn: string }[] = [{ id: "applicant", en: "Applicant", kn: "ಅರ್ಜಿದಾರ" }, { id: "approved", en: "Approved, pre-training", kn: "ಅನುಮೋದಿತ, ತರಬೇತಿ ಮೊದಲು" }, { id: "training", en: "Training in progress", kn: "ತರಬೇತಿ ನಡೆಯುತ್ತಿದೆ" }, { id: "lms", en: "Post-training LMS", kn: "ತರಬೇತಿ ನಂತರ LMS" }, { id: "fieldwork", en: "Fieldwork", kn: "ಕ್ಷೇತ್ರಕಾರ್ಯ" }, { id: "completed", en: "Completed", kn: "ಪೂರ್ಣಗೊಂಡಿದೆ" }];
  const order: Stage[] = ["applicant", "approved", "training", "lms", "fieldwork", "completed"];
  const journey = [tr("Apply", "ಅರ್ಜಿ"), tr("Review", "ಪರಿಶೀಲನೆ"), tr("Classroom", "ತರಗತಿ"), tr("LMS", "LMS"), tr("Community action", "ಸಮುದಾಯ ಕ್ರಿಯೆ"), tr("Recognition", "ಮನ್ನಣೆ")];
  const idx = order.indexOf(stage);
  return (
    <QState q={q}>{(d) => {
      const action = stage === "applicant" ? { t: tr(`Application ${d.me.status}`, `ಅರ್ಜಿ: ${d.me.status}`), b: tr("Track your application and see what happens next.", "ನಿಮ್ಮ ಅರ್ಜಿ ಸ್ಥಿತಿ ಮತ್ತು ಮುಂದಿನ ಹೆಜ್ಜೆ ನೋಡಿ."), href: "/app/status", c: tr("View status", "ಸ್ಥಿತಿ ನೋಡಿ") }
        : stage === "approved" || stage === "training" ? { t: tr("Your 2-day classroom training", "ನಿಮ್ಮ 2 ದಿನದ ತರಗತಿ ತರಬೇತಿ"), b: d.cls ? tr(`${d.cls.name} · starts ${d.cls.startDate} · ${d.cls.room} · Mysuru Training Institute (fictional)`, `${d.cls.name} · ${d.cls.startDate} ರಿಂದ · ${d.cls.room} · ಮೈಸೂರು ತರಬೇತಿ ಸಂಸ್ಥೆ (ಕಾಲ್ಪನಿಕ)`) : "—", href: "/app/training", c: tr("See schedule & checklist", "ವೇಳಾಪಟ್ಟಿ ಮತ್ತು ಪಟ್ಟಿ") }
        : stage === "lms" ? (d.next ? { t: tr("Continue learning", "ಕಲಿಕೆ ಮುಂದುವರಿಸಿ"), b: `${loc(d.next.course.title)} · ${loc(d.next.lesson.title)} (${d.next.lesson.minutes} ${tr("min", "ನಿಮಿ")})`, href: `/app/learning/lesson/${d.next.lesson.id}`, c: tr("Resume", "ಮುಂದುವರಿಸಿ") } : { t: tr("All lessons done", "ಎಲ್ಲಾ ಪಾಠ ಪೂರ್ಣ"), b: "", href: "/app/certificates", c: tr("View certificates", "ಪ್ರಮಾಣಪತ್ರ ನೋಡಿ") })
        : stage === "fieldwork" ? { t: tr(`${d.due.length} follow-ups need attention`, `${d.due.length} ಅನುಸರಣೆಗಳಿಗೆ ಗಮನ ಬೇಕು`), b: tr("Keep residents informed. Only record what is needed.", "ನಿವಾಸಿಗಳಿಗೆ ತಿಳಿಸುತ್ತಿರಿ. ಅಗತ್ಯವಿದ್ದದ್ದನ್ನು ಮಾತ್ರ ದಾಖಲಿಸಿ."), href: "/app/grievances", c: tr("Open follow-ups", "ಅನುಸರಣೆ ತೆರೆಯಿರಿ") }
        : { t: tr("Milestones unlocked", "ಮೈಲುಗಲ್ಲುಗಳು ತೆರೆದಿವೆ"), b: tr("Your certificates and continued learning are ready.", "ನಿಮ್ಮ ಪ್ರಮಾಣಪತ್ರ ಮತ್ತು ಮುಂದುವರಿದ ಕಲಿಕೆ ಸಿದ್ಧ."), href: "/app/certificates", c: tr("View certificates", "ಪ್ರಮಾಣಪತ್ರ ನೋಡಿ") };
      return (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm text-muted">{tr("Namaskara", "ನಮಸ್ಕಾರ")}</p><h1 className="text-2xl font-bold">Ananya</h1></div>
            <label className="text-xs text-muted">{tr("Demo: preview lifecycle stage", "ಡೆಮೊ: ಜೀವನಚಕ್ರ ಹಂತ ನೋಡಿ")}<Select value={stage} onChange={(e) => setStage(e.target.value as Stage)} className="mt-1 py-1.5 text-sm">{stages.map((s) => <option key={s.id} value={s.id}>{lang === "kn" ? s.kn : s.en}</option>)}</Select></label></div>
          <Card className="border-primary/40 bg-accent-soft"><p className="text-xs font-semibold uppercase text-primary">{tr("Next best action", "ಮುಂದಿನ ಉತ್ತಮ ಕ್ರಮ")}</p><h2 className="mt-1 text-xl font-bold">{action.t}</h2><p className="mt-1 text-sm text-muted">{action.b}</p><Link href={action.href}><Button className="mt-3">{action.c}<ArrowRight /></Button></Link></Card>
          <Card><h2 className="mb-3 font-bold">{tr("Leadership journey", "ನಾಯಕತ್ವ ಪ್ರಯಾಣ")}</h2><ol className="grid grid-cols-3 gap-2 sm:grid-cols-6">{journey.map((j, i) => <li key={j} className="flex items-center gap-2 text-sm">{i < idx ? <CheckCircle weight="fill" className="shrink-0 text-success" size={20} /> : <Circle className={i === idx ? "shrink-0 text-saffron" : "shrink-0 text-border"} weight={i === idx ? "fill" : "regular"} size={20} />}<span className={i === idx ? "font-semibold" : ""}>{j}</span></li>)}</ol></Card>
          <div className="grid gap-4 md:grid-cols-2">
            {idx >= 3 && <Card><h2 className="font-bold">{tr("Learning progress", "ಕಲಿಕೆ ಪ್ರಗತಿ")}</h2><p className="mt-1 text-sm text-muted">{d.lms.done}/{d.lms.total} {tr("lessons", "ಪಾಠಗಳು")}</p><div className="mt-2"><Progress value={d.lms.pct} label="LMS" /></div><Link href="/app/learning" className="mt-3 inline-block text-sm font-medium text-primary underline">{tr("My learning", "ನನ್ನ ಕಲಿಕೆ")}</Link></Card>}
            {d.ev && <Card><h2 className="flex items-center gap-2 font-bold"><CalendarBlank />{tr("Upcoming event", "ಮುಂಬರುವ ಕಾರ್ಯಕ್ರಮ")}</h2><p className="mt-1 font-medium">{loc(d.ev.title)}</p><p className="text-sm text-muted">{d.ev.date} · {d.ev.time} · {d.ev.venue}</p><Link href={`/app/events/${d.ev.id}`} className="mt-2 inline-block text-sm font-medium text-primary underline">{tr("Details", "ವಿವರ")}</Link></Card>}
            {idx >= 4 && <Card><h2 className="font-bold">{tr("Follow-ups due this week", "ಈ ವಾರದ ಅನುಸರಣೆ")}</h2>{d.due.length === 0 ? <p className="mt-1 text-sm text-muted">{tr("Nothing due. Well done.", "ಏನೂ ಬಾಕಿ ಇಲ್ಲ.")}</p> : <ul className="mt-2 space-y-2">{d.due.slice(0, 3).map((g) => <li key={g.id}><Link href={`/app/grievances/${g.id}`} className="flex items-center justify-between gap-2 text-sm hover:underline"><span className="truncate">{g.title}</span><Badge tone={g.followUpDate < today ? "danger" : "warning"}>{g.followUpDate}</Badge></Link></li>)}</ul>}</Card>}
            <Card><h2 className="flex items-center gap-2 font-bold"><Trophy />{tr("Rewards", "ಪುರಸ್ಕಾರ")}</h2><p className="mt-1 text-2xl font-bold">{d.pts} <span className="text-sm font-normal text-muted">{tr("verified points (demo)", "ದೃಢೀಕೃತ ಅಂಕ (ಡೆಮೊ)")}</span></p><Link href="/app/rewards" className="mt-2 inline-block text-sm font-medium text-primary underline">{tr("See breakdown", "ವಿವರ ನೋಡಿ")}</Link></Card>
          </div>
          <Card><div className="flex items-center justify-between"><h2 className="font-bold">{tr("Notifications", "ಅಧಿಸೂಚನೆಗಳು")}</h2><Link href="/app/notifications" className="text-sm text-primary underline">{tr("All", "ಎಲ್ಲಾ")}</Link></div>{d.unread.length === 0 ? <p className="mt-2 text-sm text-muted">{tr("You are all caught up.", "ಎಲ್ಲವನ್ನೂ ನೋಡಿದ್ದೀರಿ.")}</p> : <ul className="mt-2 space-y-2">{d.unread.map((n) => <li key={n.id}><Link href={n.href} className="block text-sm hover:underline"><b>{loc(n.title)}</b> <span className="text-muted">· {loc(n.body)}</span></Link></li>)}</ul>}</Card>
        </div>
      ); }}</QState>
  );
}
void useDb; void statusTone;
