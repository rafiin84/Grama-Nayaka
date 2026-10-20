"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Flag, Microphone, Pause, Play, Record, Stop, Warning } from "@phosphor-icons/react";
import { Badge, Button, Card, Check, Confirm, DemoNote, Empty, Field, Modal, Progress, QState, Select, Textarea } from "@/components/ui";
import { api, useAct, useMock } from "@/lib/api";
import { getDb, useDb } from "@/lib/db";
import { useT } from "@/lib/useT";
import type { Lesson } from "@/lib/types";

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>(); const { tr, loc } = useT();
  const q = useMock(["lesson", lessonId], () => { const d = getDb(); const c = d.courses.find((c) => c.lessons.some((l) => l.id === lessonId)); const i = c?.lessons.findIndex((l) => l.id === lessonId) ?? -1; return c ? { c, l: c.lessons[i], next: c.lessons[i + 1], locked: i > 0 && !d.progress[c.lessons[i - 1].id]?.done, enrolled: d.enrolled.includes(c.id) } : null; });
  return (
    <QState q={q} isEmpty={(d) => !d} empty={<Empty title={tr("Lesson not found", "ಪಾಠ ಸಿಗಲಿಲ್ಲ")} />}>{(d) => { const { c, l, next } = d!; if (d!.locked || !d!.enrolled) return <Empty title={tr("This lesson is locked", "ಈ ಪಾಠ ಲಾಕ್ ಆಗಿದೆ")} hint={tr("Enrol and complete the previous lesson first.", "ಮೊದಲು ನೋಂದಾಯಿಸಿ ಮತ್ತು ಹಿಂದಿನ ಪಾಠ ಪೂರ್ಣಗೊಳಿಸಿ.")} action={<Link href={`/app/learning/${c.id}`}><Button>{tr("Back to course", "ಕೋರ್ಸ್‌ಗೆ ಹಿಂತಿರುಗಿ")}</Button></Link>} />;
      return (<div className="space-y-4"><Link href={`/app/learning/${c.id}`} className="inline-flex items-center gap-1 text-sm text-primary"><ArrowLeft />{loc(c.title)}</Link>
        <h1 className="text-2xl font-bold">{loc(l.title)}</h1>
        {l.type === "video" && <Video l={l} />}{l.type === "reading" && <Reading l={l} />}{l.type === "quiz" && <Quiz l={l} />}{l.type === "reflection" && <Reflection l={l} />}{l.type === "assignment" && <Assignment l={l} />}
        {next && <Link href={`/app/learning/lesson/${next.id}`} className="block text-right text-sm font-medium text-primary underline">{tr("Next: ", "ಮುಂದೆ: ")}{loc(next.title)}</Link>}</div>); }}</QState>
  );
}

function Video({ l }: { l: Lesson }) {
  const { tr, loc, lang } = useT(); const act = useAct(); const total = l.minutes * 60; const threshold = useDb((s) => s.settings.videoThreshold);
  const saved = useDb((s) => s.progress[l.id]); const [pos, setPos] = useState(saved?.positionSec ?? 0); const [playing, setPlaying] = useState(false); const [speed, setSpeed] = useState(1); const [cc, setCc] = useState(true); const [tl, setTl] = useState<"kn" | "en">(lang);
  const maxRef = useRef(saved?.watchedPct ?? 0);
  useEffect(() => { if (!playing) return; const id = setInterval(() => setPos((p) => { const n = Math.min(total, p + 20 * speed); if (n >= total) setPlaying(false); return n; }), 1000); return () => clearInterval(id); }, [playing, speed, total]);
  useEffect(() => { const pct = Math.round((pos / total) * 100); if (pct > maxRef.current || pos % 60 === 0) { maxRef.current = Math.max(maxRef.current, pct); api.lms.watch(l.id, pct, pos); } }, [pos, total, l.id]);
  const pct = Math.round((Math.max(maxRef.current, saved?.watchedPct ?? 0)));
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  return (<div className="space-y-3">
    <DemoNote>{tr("Demo media unavailable — this is a simulated player (playback runs faster than real time). Use the transcript below.", "ಡೆಮೊ ಮೀಡಿಯಾ ಲಭ್ಯವಿಲ್ಲ — ಇದು ಸಿಮ್ಯುಲೇಟೆಡ್ ಪ್ಲೇಯರ್ (ನಿಜಕ್ಕಿಂತ ವೇಗ). ಕೆಳಗಿನ ಪ್ರತಿಲಿಪಿ ಬಳಸಿ.")}</DemoNote>
    <div className="relative grid aspect-video place-items-center overflow-hidden rounded-2xl bg-deep text-white">
      <button aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying(!playing)} className="grid h-16 w-16 place-items-center rounded-full bg-white/20 backdrop-blur">{playing ? <Pause size={32} weight="fill" /> : <Play size={32} weight="fill" />}</button>
      {cc && <p className="absolute inset-x-4 bottom-12 rounded bg-black/60 px-2 py-1 text-center text-sm">{(l.transcript?.[tl] ?? "").slice(0, 90)}…</p>}
      <div className="absolute inset-x-3 bottom-2 flex items-center gap-2 text-xs"><span>{fmt(pos)}</span><input type="range" aria-label="Timeline" min={0} max={total} value={pos} onChange={(e) => setPos(+e.target.value)} className="flex-1 accent-[var(--brand-saffron)]" /><span>{fmt(total)}</span></div>
    </div>
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Select aria-label="Speed" value={speed} onChange={(e) => setSpeed(+e.target.value)} className="w-24 py-1.5">{[0.75, 1, 1.25, 1.5].map((s) => <option key={s} value={s}>{s}x</option>)}</Select>
      <Select aria-label="Language" value={tl} onChange={(e) => setTl(e.target.value as "kn" | "en")} className="w-32 py-1.5"><option value="kn">ಕನ್ನಡ</option><option value="en">English</option></Select>
      <label className="flex items-center gap-1"><input type="checkbox" checked={cc} onChange={(e) => setCc(e.target.checked)} />{tr("Captions", "ಶೀರ್ಷಿಕೆ")}</label></div>
    <Card><div className="flex items-center justify-between text-sm"><span>{tr("Watched", "ವೀಕ್ಷಿಸಿದ್ದು")} {pct}%</span><Badge tone={saved?.done ? "success" : "neutral"}>{saved?.done ? tr("Completed", "ಪೂರ್ಣ") : tr(`Completes at ${threshold}%`, `${threshold}% ನಲ್ಲಿ ಪೂರ್ಣ`)}</Badge></div><div className="mt-2"><Progress value={pct} label="Watched" /></div>
      <Button className="mt-3" disabled={saved?.done || pct < threshold} onClick={() => act(() => api.lms.complete(l.id), tr("Lesson completed", "ಪಾಠ ಪೂರ್ಣ"))}>{tr("Mark complete", "ಪೂರ್ಣ ಎಂದು ಗುರುತಿಸಿ")}</Button>{!saved?.done && pct < threshold && <p className="mt-1 text-xs text-muted">{tr("Available after you watch enough of the lesson.", "ಸಾಕಷ್ಟು ವೀಕ್ಷಿಸಿದ ನಂತರ ಲಭ್ಯ.")}</p>}</Card>
    <Card><h2 className="font-bold">{tr("Transcript", "ಪ್ರತಿಲಿಪಿ")}</h2><p className="mt-1 text-sm">{l.transcript ? (l.transcript[tl] || `${l.transcript.en} ${tr("(English only)", "(ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಮಾತ್ರ)")}`) : loc(l.summary)}</p></Card>
  </div>);
}

function Reading({ l }: { l: Lesson }) {
  const { tr, loc } = useT(); const act = useAct(); const done = useDb((s) => s.progress[l.id]?.done); const [rep, setRep] = useState(false); const [txt, setTxt] = useState("");
  return (<div className="space-y-3"><Card className="space-y-3"><p className="leading-relaxed">{l.body ? loc(l.body) : loc(l.summary)}</p>
    {l.takeaways && <div className="rounded-xl bg-accent-soft p-3"><p className="font-semibold">{tr("Key takeaways", "ಮುಖ್ಯ ಅಂಶಗಳು")}</p><ul className="list-disc pl-5 text-sm">{l.takeaways.map((t, i) => <li key={i}>{loc(t)}</li>)}</ul></div>}
    {l.glossary && <dl className="text-sm">{l.glossary.map((g, i) => <div key={i}><dt className="font-semibold">{loc(g.term)}</dt><dd className="text-muted">{loc(g.def)}</dd></div>)}</dl>}</Card>
    <div className="flex flex-wrap gap-2"><Button disabled={done} onClick={() => act(() => api.lms.complete(l.id), tr("Lesson completed", "ಪಾಠ ಪೂರ್ಣ"))}>{done ? tr("Completed", "ಪೂರ್ಣ") : tr("Mark complete", "ಪೂರ್ಣ ಎಂದು ಗುರುತಿಸಿ")}</Button><Button variant="ghost" onClick={() => setRep(true)}><Warning />{tr("Report a content issue", "ವಿಷಯ ಸಮಸ್ಯೆ ವರದಿ")}</Button></div>
    <Modal open={rep} onClose={() => setRep(false)} title={tr("Report a content issue", "ವಿಷಯ ಸಮಸ್ಯೆ ವರದಿ")} footer={<Button disabled={txt.length < 5} onClick={async () => { await act(() => api.requests.submit("Content issue: " + l.id), tr("Report received (demo)", "ವರದಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ (ಡೆಮೊ)")); setRep(false); setTxt(""); }}>{tr("Send", "ಕಳುಹಿಸಿ")}</Button>}><Field label={tr("What is wrong?", "ಏನು ತಪ್ಪು?")}>{(id) => <Textarea id={id} value={txt} onChange={(e) => setTxt(e.target.value)} />}</Field></Modal></div>);
}

function Quiz({ l }: { l: Lesson }) {
  const { tr, loc } = useT(); const act = useAct(); const router = useRouter();
  const bank = useDb((s) => s.questions); const qs = l.questionIds!.map((id) => bank.find((q) => q.id === id)!); const prog = useDb((s) => s.progress[l.id]); const pass = useDb((s) => s.settings.passThreshold);
  const [i, setI] = useState(0); const [ans, setAns] = useState<number[]>(() => qs.map(() => -1)); const [flag, setFlag] = useState<Record<number, boolean>>({}); const [confirm, setConfirm] = useState(false); const [busy, setBusy] = useState(false); const [res, setRes] = useState<{ score: number; total: number; passed: boolean } | null>(null);
  const attempts = prog?.attempts ?? []; const MAX = 3; const canTry = attempts.length < MAX || prog?.done;
  const submit = async () => { if (busy) return; setBusy(true); const r = await act(() => api.lms.submitQuiz(l.id, ans)); setBusy(false); setConfirm(false); if (r) setRes(r); };
  if (res) return (<div className="space-y-3"><Card className="text-center"><p className="text-4xl font-bold">{res.score}/{res.total}</p><Badge tone={res.passed ? "success" : "warning"}>{res.passed ? tr("Passed", "ಉತ್ತೀರ್ಣ") : tr(`Below pass mark (${pass}%)`, `ಉತ್ತೀರ್ಣ ಅಂಕಕ್ಕಿಂತ ಕಡಿಮೆ (${pass}%)`)}</Badge></Card>
    <h2 className="font-bold">{tr("Review", "ಪರಿಶೀಲನೆ")}</h2>{qs.map((q, k) => <Card key={q.id}><p className="font-medium">{k + 1}. {loc(q.q)}</p><p className={`mt-1 text-sm ${ans[k] === q.answer ? "text-success" : "text-danger"}`}>{ans[k] >= 0 ? loc(q.options[ans[k]]) : tr("Not answered", "ಉತ್ತರಿಸಿಲ್ಲ")}</p>{ans[k] !== q.answer && <p className="text-sm">{tr("Correct: ", "ಸರಿ: ")}{loc(q.options[q.answer])}</p>}<p className="mt-1 text-xs text-muted">{loc(q.explain)}</p></Card>)}
    <div className="flex gap-2">{!res.passed && attempts.length < MAX && <Button onClick={() => { setRes(null); setAns(qs.map(() => -1)); setI(0); }}>{tr("Try again", "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ")}</Button>}<Button variant="secondary" onClick={() => router.back()}>{tr("Back to course", "ಕೋರ್ಸ್‌ಗೆ")}</Button></div></div>);
  const q = qs[i]; const answered = ans.filter((a) => a >= 0).length;
  return (<div className="space-y-3">
    <Card className="text-sm"><p>{tr(`Pass mark ${pass}%. Up to ${MAX} attempts. No timer.`, `ಉತ್ತೀರ್ಣ ಅಂಕ ${pass}%. ಗರಿಷ್ಠ ${MAX} ಪ್ರಯತ್ನ. ಟೈಮರ್ ಇಲ್ಲ.`)}</p>{attempts.length > 0 && <ul className="mt-1 text-xs text-muted">{attempts.map((a, k) => <li key={k}>{tr("Attempt", "ಪ್ರಯತ್ನ")} {k + 1}: {a.score}/{a.total} · {a.at}</li>)}</ul>}</Card>
    {!canTry ? <Empty title={tr("No attempts left", "ಪ್ರಯತ್ನಗಳು ಉಳಿದಿಲ್ಲ")} hint={tr("Ask your trainer to reset your attempts.", "ಪ್ರಯತ್ನ ಮರುಹೊಂದಿಸಲು ತರಬೇತುದಾರರನ್ನು ಕೇಳಿ.")} /> : <>
      <Progress value={(answered / qs.length) * 100} label="Answered" /><p className="text-xs text-muted">{tr(`Question ${i + 1} of ${qs.length} · ${answered} answered`, `ಪ್ರಶ್ನೆ ${i + 1} / ${qs.length} · ${answered} ಉತ್ತರಿಸಿದೆ`)}</p>
      <Card><fieldset><legend className="font-semibold">{loc(q.q)}</legend><div className="mt-3 space-y-2">{q.options.map((o, k) => <label key={k} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${ans[i] === k ? "border-primary bg-accent-soft" : "border-border"}`}><input type="radio" name={q.id} checked={ans[i] === k} onChange={() => setAns(ans.map((a, x) => (x === i ? k : a)))} className="mt-1 accent-[var(--primary)]" /><span>{loc(o)}</span></label>)}</div></fieldset>
        <button className={`mt-3 inline-flex items-center gap-1 text-sm ${flag[i] ? "text-warning" : "text-muted"}`} onClick={() => setFlag({ ...flag, [i]: !flag[i] })}><Flag weight={flag[i] ? "fill" : "regular"} />{flag[i] ? tr("Flagged for review", "ಪರಿಶೀಲನೆಗೆ ಗುರುತಿಸಲಾಗಿದೆ") : tr("Flag question", "ಪ್ರಶ್ನೆ ಗುರುತಿಸಿ")}</button></Card>
      <div className="flex justify-between gap-2"><Button variant="secondary" disabled={i === 0} onClick={() => setI(i - 1)}>{tr("Back", "ಹಿಂದೆ")}</Button>{i < qs.length - 1 ? <Button onClick={() => setI(i + 1)}>{tr("Next", "ಮುಂದೆ")}</Button> : <Button disabled={busy} onClick={() => setConfirm(true)}>{tr("Submit", "ಸಲ್ಲಿಸಿ")}</Button>}</div>
      <Confirm open={confirm} onClose={() => setConfirm(false)} onConfirm={submit} busy={busy} title={tr("Submit answers?", "ಉತ್ತರಗಳನ್ನು ಸಲ್ಲಿಸುವಿರಾ?")} confirmLabel={tr("Submit", "ಸಲ್ಲಿಸಿ")} body={<>{tr(`${answered} of ${qs.length} answered.`, `${qs.length} ರಲ್ಲಿ ${answered} ಉತ್ತರಿಸಲಾಗಿದೆ.`)}{Object.values(flag).some(Boolean) && ` ${tr("Some questions are flagged.", "ಕೆಲವು ಪ್ರಶ್ನೆಗಳನ್ನು ಗುರುತಿಸಲಾಗಿದೆ.")}`}</>} /></>}
  </div>);
}

function Reflection({ l }: { l: Lesson }) {
  const { tr } = useT(); const act = useAct(); const prog = useDb((s) => s.progress[l.id]); const consented = useDb((s) => s.consents.some((c) => c.purposeId === "recorded-answers" && c.status === "granted"));
  const [phase, setPhase] = useState<"idle" | "rec" | "preview" | "upload" | "done">(prog?.reflection ? "done" : "idle"); const [sec, setSec] = useState(0); const [up, setUp] = useState(0); const [ok, setOk] = useState(consented);
  useEffect(() => { if (phase !== "rec") return; const id = setInterval(() => setSec((s) => s + 1), 1000); return () => clearInterval(id); }, [phase]);
  useEffect(() => { if (phase !== "upload") return; const id = setInterval(() => setUp((u) => { if (u >= 100) { clearInterval(id); return 100; } return u + 20; }), 300); return () => clearInterval(id); }, [phase]);
  useEffect(() => { if (phase === "upload" && up >= 100) { act(() => api.lms.submitReflection(l.id), tr("Submitted for review", "ಪರಿಶೀಲನೆಗೆ ಸಲ್ಲಿಸಲಾಗಿದೆ")).then(() => setPhase("done")); } }, [up, phase]); // eslint-disable-line react-hooks/exhaustive-deps
  return (<div className="space-y-3"><DemoNote>{tr("Optional. Simulated recording — no microphone or camera is used and nothing is uploaded.", "ಐಚ್ಛಿಕ. ಸಿಮ್ಯುಲೇಟೆಡ್ ರೆಕಾರ್ಡಿಂಗ್ — ಮೈಕ್/ಕ್ಯಾಮೆರಾ ಬಳಸುವುದಿಲ್ಲ, ಏನೂ ಅಪ್‌ಲೋಡ್ ಆಗುವುದಿಲ್ಲ.")}</DemoNote>
    <Card className="space-y-3"><p>{tr("Describe one problem in your village and what first step you would take.", "ನಿಮ್ಮ ಹಳ್ಳಿಯ ಒಂದು ಸಮಸ್ಯೆ ಮತ್ತು ನೀವು ತೆಗೆದುಕೊಳ್ಳುವ ಮೊದಲ ಹೆಜ್ಜೆಯನ್ನು ವಿವರಿಸಿ.")}</p>
      {!ok && phase === "idle" && <><Check checked={ok} onChange={(e) => { setOk(e.target.checked); if (e.target.checked) api.consent.grant("recorded-answers", "lesson", "kn"); }} label={tr("I agree to submit a recorded answer. It stays private and is reviewed only by authorised trainers; retention is shown in my profile.", "ನಾನು ರೆಕಾರ್ಡ್ ಉತ್ತರ ಸಲ್ಲಿಸಲು ಒಪ್ಪುತ್ತೇನೆ. ಇದು ಖಾಸಗಿ; ಅಧಿಕೃತ ತರಬೇತುದಾರರು ಮಾತ್ರ ನೋಡುತ್ತಾರೆ.")} /></>}
      {phase === "idle" && <div className="flex gap-2"><Button disabled={!ok} onClick={() => { setSec(0); setPhase("rec"); }}><Record />{tr("Start recording", "ರೆಕಾರ್ಡಿಂಗ್ ಆರಂಭಿಸಿ")}</Button><Button variant="secondary" onClick={() => act(() => api.lms.complete(l.id), tr("Skipped (optional)", "ಬಿಟ್ಟುಬಿಡಲಾಗಿದೆ (ಐಚ್ಛಿಕ)"))}>{tr("Skip — optional", "ಬಿಟ್ಟುಬಿಡಿ — ಐಚ್ಛಿಕ")}</Button></div>}
      {phase === "rec" && <div className="space-y-2 text-center"><Microphone size={40} className="mx-auto animate-pulse text-danger" /><p className="font-mono text-xl">00:{String(sec).padStart(2, "0")}</p><Button variant="danger" onClick={() => setPhase("preview")}><Stop />{tr("Stop", "ನಿಲ್ಲಿಸಿ")}</Button></div>}
      {phase === "preview" && <div className="space-y-2"><p className="rounded-xl bg-accent-soft p-3 text-sm">{tr(`Preview: sample recording (${sec}s).`, `ಪೂರ್ವವೀಕ್ಷಣೆ: ಮಾದರಿ ರೆಕಾರ್ಡಿಂಗ್ (${sec}ಸೆ).`)}</p><div className="flex gap-2"><Button variant="secondary" onClick={() => { setSec(0); setPhase("rec"); }}>{tr("Re-record", "ಮರು-ರೆಕಾರ್ಡ್")}</Button><Button onClick={() => { setUp(0); setPhase("upload"); }}>{tr("Submit", "ಸಲ್ಲಿಸಿ")}</Button></div></div>}
      {phase === "upload" && <div><p className="text-sm">{tr("Uploading (simulated)…", "ಅಪ್‌ಲೋಡ್ (ಸಿಮ್ಯುಲೇಟೆಡ್)…")}</p><Progress value={up} label="Upload" /></div>}
      {phase === "done" && <div className="space-y-1"><Badge tone="warning">{prog?.reflection ?? "In Review"}</Badge><p className="text-sm text-muted">{tr("Private. Visible to authorised reviewers only. Retained until review completes (demo).", "ಖಾಸಗಿ. ಅಧಿಕೃತ ಪರಿಶೀಲಕರಿಗೆ ಮಾತ್ರ. ಪರಿಶೀಲನೆ ಮುಗಿಯುವವರೆಗೆ ಉಳಿಯುತ್ತದೆ (ಡೆಮೊ).")}</p></div>}</Card></div>);
}

function Assignment({ l }: { l: Lesson }) {
  const { tr, loc } = useT(); const act = useAct(); const done = useDb((s) => s.progress[l.id]?.done);
  return (<Card className="space-y-3"><p>{loc(l.summary)}</p><div className="flex flex-wrap gap-2"><Link href="/app/grievances/new"><Button variant="secondary">{tr("Log an issue", "ಸಮಸ್ಯೆ ದಾಖಲಿಸಿ")}</Button></Link><Button disabled={done} onClick={() => act(() => api.lms.complete(l.id), tr("Assignment marked complete", "ನಿಯೋಜನೆ ಪೂರ್ಣ"))}>{done ? tr("Completed", "ಪೂರ್ಣ") : tr("Mark complete", "ಪೂರ್ಣ ಎಂದು ಗುರುತಿಸಿ")}</Button></div></Card>);
}
