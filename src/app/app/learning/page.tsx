"use client";
import Link from "next/link";
import { useState } from "react";
import { Badge, Button, Card, Empty, Input, PageHeader, Progress, QState, Select, Tabs } from "@/components/ui";
import { useMock } from "@/lib/api";
import { getDb } from "@/lib/db";
import { lmsStats, nextLesson } from "@/lib/derive";
import { useT } from "@/lib/useT";

export default function Learning() {
  const { tr, loc, lang } = useT();
  const [tab, setTab] = useState<"mine" | "catalog">("mine"); const [q, setQ] = useState(""); const [topic, setTopic] = useState(""); const [langF, setLangF] = useState("");
  const data = useMock(["learning"], () => { const d = getDb(); return { courses: d.courses.filter((c) => c.status === "Published"), enrolled: d.enrolled, progress: d.progress, stats: lmsStats(d), next: nextLesson(d), done: d.participants.find((p) => p.id === "P-1042")?.trainingDone }; });
  return (
    <QState q={data}>{(d) => {
      const pct = (c: (typeof d.courses)[number]) => Math.round((c.lessons.filter((l) => d.progress[l.id]?.done).length / c.lessons.length) * 100);
      const list = d.courses.filter((c) => (tab === "mine" ? d.enrolled.includes(c.id) : true) && (!q || (c.title.en + c.title.kn).toLowerCase().includes(q.toLowerCase())) && (!topic || c.topic === topic) && (!langF || c.languages.includes(langF as "kn")));
      return (<div className="space-y-4">
        <PageHeader title={tr("My Learning", "ನನ್ನ ಕಲಿಕೆ")} sub={tr("A one-month path after your classroom training. Legal and official content is reviewed learning material, not legal advice.", "ತರಗತಿ ತರಬೇತಿಯ ನಂತರ ಒಂದು ತಿಂಗಳ ಕಲಿಕಾ ಮಾರ್ಗ. ಕಾನೂನು ಮತ್ತು ಅಧಿಕೃತ ವಿಷಯ ಪರಿಶೀಲಿತ ಕಲಿಕಾ ಸಾಮಗ್ರಿ; ಕಾನೂನು ಸಲಹೆಯಲ್ಲ.")} />
        {!d.done && <Card className="border-warning/50"><p className="text-sm">{tr("Courses open after you complete both classroom days.", "ಎರಡೂ ತರಗತಿ ದಿನ ಪೂರ್ಣಗೊಂಡ ನಂತರ ಕೋರ್ಸ್‌ಗಳು ತೆರೆಯುತ್ತವೆ.")}</p></Card>}
        {d.next && <Card className="bg-accent-soft"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase text-primary">{tr("Resume where you left off", "ಬಿಟ್ಟ ಜಾಗದಿಂದ ಮುಂದುವರಿಸಿ")}</p><p className="font-bold">{loc(d.next.lesson.title)}</p><p className="text-sm text-muted">{loc(d.next.course.title)} · {d.stats.pct}% {tr("overall", "ಒಟ್ಟು")}</p></div><Link href={`/app/learning/lesson/${d.next.lesson.id}`}><Button>{tr("Resume", "ಮುಂದುವರಿಸಿ")}</Button></Link></div></Card>}
        <Tabs tabs={[{ id: "mine", label: tr("My path", "ನನ್ನ ಮಾರ್ಗ") }, { id: "catalog", label: tr("Course catalog", "ಕೋರ್ಸ್ ಪಟ್ಟಿ") }]} value={tab} onChange={setTab} />
        {tab === "catalog" && <div className="grid gap-2 sm:grid-cols-3"><Input aria-label="Search" placeholder={tr("Search courses", "ಕೋರ್ಸ್ ಹುಡುಕಿ")} value={q} onChange={(e) => setQ(e.target.value)} /><Select aria-label="Topic" value={topic} onChange={(e) => setTopic(e.target.value)}><option value="">{tr("All topics", "ಎಲ್ಲಾ ವಿಷಯ")}</option>{[...new Set(d.courses.map((c) => c.topic))].map((t) => <option key={t}>{t}</option>)}</Select><Select aria-label="Language" value={langF} onChange={(e) => setLangF(e.target.value)}><option value="">{tr("Any language", "ಯಾವುದೇ ಭಾಷೆ")}</option><option value="kn">ಕನ್ನಡ</option><option value="en">English</option></Select></div>}
        {list.length === 0 ? <Empty title={tr("No courses match", "ಯಾವುದೇ ಕೋರ್ಸ್ ಹೊಂದಿಕೆಯಾಗಿಲ್ಲ")} hint={tr("Try clearing filters or browse the catalog.", "ಫಿಲ್ಟರ್ ತೆಗೆದು ಅಥವಾ ಪಟ್ಟಿ ನೋಡಿ.")} action={<Button onClick={() => { setQ(""); setTopic(""); setLangF(""); setTab("catalog"); }}>{tr("Browse catalog", "ಪಟ್ಟಿ ನೋಡಿ")}</Button>} /> :
          <div className="grid gap-4 md:grid-cols-2">{list.map((c) => { const en = d.enrolled.includes(c.id); const locked = c.prerequisites.some((p) => { const pc = d.courses.find((x) => x.id === p)!; return !pc.lessons.every((l) => d.progress[l.id]?.done) && false; }); return (
            <Card key={c.id} className="flex flex-col gap-2"><div className="grid h-24 place-items-center rounded-xl bg-gradient-to-br from-forest to-deep text-3xl font-bold text-white">{loc(c.title)[0]}</div>
              <div className="flex flex-wrap gap-1"><Badge tone="info">{c.topic}</Badge>{c.languages.map((l) => <Badge key={l}>{l === "kn" ? "ಕನ್ನಡ" : "English"}</Badge>)}</div>
              <h2 className="font-bold">{loc(c.title)}</h2><p className="text-sm text-muted">{loc(c.summary)}</p><p className="text-xs text-muted">{c.instructor} · {c.minutes} {tr("min", "ನಿಮಿ")} · {c.lessons.length} {tr("modules", "ಮಾಡ್ಯೂಲ್")}</p>
              {en && <Progress value={pct(c)} label={loc(c.title)} />}
              <Link href={`/app/learning/${c.id}`} className="mt-auto"><Button variant={en ? "primary" : "secondary"} className="w-full" disabled={locked}>{en ? (pct(c) === 100 ? tr("Review", "ಮರುಪರಿಶೀಲಿಸಿ") : tr("Continue", "ಮುಂದುವರಿಸಿ")) : tr("View details", "ವಿವರ ನೋಡಿ")}</Button></Link></Card>); })}</div>}
        <p className="text-xs text-muted">{lang === "kn" ? "ಡೆಮೊ ವಿಷಯ. ನಿಜವಾದ ಕೋರ್ಸ್ ವಿಷಯವನ್ನು ಪರಿಶೀಲಿಸಿ ಅನುಮೋದಿಸಬೇಕು." : "Demo content. Real course content must be reviewed and approved."}</p>
      </div>); }}</QState>
  );
}
