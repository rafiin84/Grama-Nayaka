"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle, ClipboardText, FileText, Lock, Microphone, PlayCircle, Question } from "@phosphor-icons/react";
import { Badge, Button, Card, Empty, PageHeader, Progress, QState, statusTone } from "@/components/ui";
import { api, useAct, useMock } from "@/lib/api";
import { getDb } from "@/lib/db";
import { useT } from "@/lib/useT";
import type { LessonType } from "@/lib/types";

const icons: Record<LessonType, typeof PlayCircle> = { video: PlayCircle, reading: FileText, quiz: Question, assignment: ClipboardText, reflection: Microphone };
export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>(); const { tr, loc } = useT(); const act = useAct();
  const q = useMock(["course", courseId], () => { const d = getDb(); return { c: d.courses.find((c) => c.id === courseId), enrolled: d.enrolled.includes(courseId), progress: d.progress, all: d.courses, enrolledIds: d.enrolled }; });
  return (
    <QState q={q} isEmpty={(d) => !d.c} empty={<Empty title={tr("Course not found", "ಕೋರ್ಸ್ ಸಿಗಲಿಲ್ಲ")} />}>{(d) => { const c = d.c!;
      const done = c.lessons.filter((l) => d.progress[l.id]?.done).length; const pct = Math.round((done / c.lessons.length) * 100);
      const prereqMissing = c.prerequisites.filter((p) => !d.enrolledIds.includes(p));
      const status = (i: number) => { const l = c.lessons[i]; if (d.progress[l.id]?.done) return "Completed"; if (!d.enrolled || (i > 0 && !d.progress[c.lessons[i - 1].id]?.done)) return "Locked"; if (l.type === "reflection" && d.progress[l.id]?.reflection === "In Review") return "Needs Review"; return d.progress[l.id] ? "In Progress" : "Available"; };
      return (<div className="space-y-4">
        <PageHeader title={loc(c.title)} sub={loc(c.summary)} actions={!d.enrolled && <Button disabled={prereqMissing.length > 0} onClick={() => act(() => api.lms.enroll(c.id), tr("Enrolled (demo)", "ನೋಂದಾಯಿಸಲಾಗಿದೆ (ಡೆಮೊ)"))}>{tr("Enrol", "ನೋಂದಾಯಿಸಿ")}</Button>} />
        {prereqMissing.length > 0 && <Card className="border-warning/50 text-sm">{tr("Prerequisite needed first: ", "ಮೊದಲು ಅಗತ್ಯ: ")}{prereqMissing.map((p) => loc(d.all.find((x) => x.id === p)!.title)).join(", ")}</Card>}
        <Card><div className="flex flex-wrap gap-2 text-sm text-muted"><span>{c.instructor}</span><span>· {c.minutes} {tr("min", "ನಿಮಿ")}</span><span>· {tr("Pass mark", "ಉತ್ತೀರ್ಣ")} {c.passMark}%</span><span>· v{c.version}</span></div>
          <h2 className="mt-3 font-bold">{tr("Objectives", "ಉದ್ದೇಶಗಳು")}</h2><ul className="list-disc pl-5 text-sm">{c.objectives.map((o, i) => <li key={i}>{loc(o)}</li>)}</ul>
          {d.enrolled && <div className="mt-3"><Progress value={pct} label="Course progress" /><p className="mt-1 text-xs text-muted">{pct}%</p></div>}</Card>
        <div className="space-y-2">{c.lessons.map((l, i) => { const s = status(i); const I = icons[l.type]; const locked = s === "Locked"; const inner = (<Card className={`flex items-center gap-3 ${locked ? "opacity-60" : "hover:border-primary"}`}>{s === "Completed" ? <CheckCircle size={26} weight="fill" className="shrink-0 text-success" /> : locked ? <Lock size={26} className="shrink-0 text-muted" /> : <I size={26} className="shrink-0 text-primary" />}<div className="min-w-0 flex-1"><p className="font-medium">{loc(l.title)}</p><p className="text-xs text-muted">{l.type} · {l.minutes} {tr("min", "ನಿಮಿ")}</p></div><Badge tone={statusTone(s)}>{s}</Badge></Card>);
          return locked ? <div key={l.id} aria-disabled>{inner}</div> : <Link key={l.id} href={`/app/learning/lesson/${l.id}`}>{inner}</Link>; })}</div>
        <Card><h2 className="font-bold">{tr("Resources", "ಸಂಪನ್ಮೂಲಗಳು")}</h2><button className="mt-1 text-sm text-primary underline" onClick={() => act(() => 0, tr("Demo download — no real file", "ಡೆಮೊ ಡೌನ್‌ಲೋಡ್ — ನಿಜವಾದ ಫೈಲ್ ಇಲ್ಲ"))}>{tr("Download course notes (demo link)", "ಕೋರ್ಸ್ ಟಿಪ್ಪಣಿ ಡೌನ್‌ಲೋಡ್ (ಡೆಮೊ)")}</button></Card>
      </div>); }}</QState>
  );
}
