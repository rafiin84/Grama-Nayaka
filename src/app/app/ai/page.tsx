"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Copy, PaperPlaneRight } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button, Card, Check, DemoNote, Field, Input, PageHeader, Select, Tabs, Textarea } from "@/components/ui";
import { chat, compose, pathway, VERIFY } from "@/lib/ai";
import { api, useAct } from "@/lib/api";
import { getDb } from "@/lib/db";
import { GRIEVANCE_CATEGORIES } from "@/lib/seed-geo";
import { useT } from "@/lib/useT";
import type { Lang } from "@/lib/i18n";

export default function AIPage() { return <Suspense><AI /></Suspense>; }
function AI() {
  const { tr, lang } = useT(); const sp = useSearchParams();
  const [tab, setTab] = useState<"chat" | "pathway" | "draft">((sp.get("tab") as "chat") || "chat");
  return (<div className="space-y-4"><PageHeader title={tr("AI Assistant", "AI ಸಹಾಯಕ")} sub={tr("AI advises; you decide. Responses here are simulated locally and no resident or voter data is sent anywhere.", "AI ಸಲಹೆ ನೀಡುತ್ತದೆ; ನೀವು ನಿರ್ಧರಿಸುತ್ತೀರಿ. ಇಲ್ಲಿನ ಉತ್ತರಗಳು ಸ್ಥಳೀಯವಾಗಿ ಸಿಮ್ಯುಲೇಟ್ ಆಗಿವೆ; ನಿವಾಸಿ ಅಥವಾ ಮತದಾರ ಡೇಟಾ ಎಲ್ಲಿಗೂ ಹೋಗುವುದಿಲ್ಲ.")} />
    <Tabs tabs={[{ id: "chat", label: tr("Ask", "ಕೇಳಿ") }, { id: "pathway", label: tr("Pathway assistant", "ಮಾರ್ಗ ಸಹಾಯಕ") }, { id: "draft", label: tr("Draft studio", "ಕರಡು ಸ್ಟುಡಿಯೋ") }]} value={tab} onChange={setTab} />
    {tab === "chat" && <Chat lang={lang} />}{tab === "pathway" && <Pathway />}{tab === "draft" && <Draft gid={sp.get("g")} />}</div>);
}

function Chat({ lang }: { lang: Lang }) {
  const { tr } = useT(); const [ctx, setCtx] = useState("learning"); const [out, setOut] = useState<Lang>(lang); const [p, setP] = useState(""); const [log, setLog] = useState<{ q: string; a: string; s: string[] }[]>([]); const [busy, setBusy] = useState(false);
  const ex = [tr("Explain this Panchayat Raj concept in simple Kannada.", "ಈ ಪಂಚಾಯತ್ ರಾಜ್ ಪರಿಕಲ್ಪನೆಯನ್ನು ಸರಳ ಕನ್ನಡದಲ್ಲಿ ವಿವರಿಸಿ."), tr("What information should I collect before following up on a water issue?", "ನೀರಿನ ಸಮಸ್ಯೆ ಅನುಸರಣೆಗೆ ಮೊದಲು ಯಾವ ಮಾಹಿತಿ ಸಂಗ್ರಹಿಸಬೇಕು?"), tr("Draft a respectful Kannada follow-up message.", "ಗೌರವಯುತ ಕನ್ನಡ ಅನುಸರಣಾ ಸಂದೇಶ ಕರಡು ಮಾಡಿ."), tr("Summarize the open issues that need attention.", "ಗಮನ ಬೇಕಾದ ಬಾಕಿ ಸಮಸ್ಯೆಗಳ ಸಾರಾಂಶ ನೀಡಿ.")];
  const ask = async (text: string) => { if (!text.trim() || busy) return; setBusy(true); await new Promise((r) => setTimeout(r, 500)); const r = chat(text, ctx === "grievance" ? tr("selected case (titles only)", "ಆಯ್ದ ಪ್ರಕರಣ (ಶೀರ್ಷಿಕೆ ಮಾತ್ರ)") : "", out); setLog([{ q: text, a: r.text, s: r.sources }, ...log]); setP(""); setBusy(false); };
  return (<div className="space-y-3">
    <div className="flex flex-wrap gap-2"><Select aria-label="Context" className="w-52" value={ctx} onChange={(e) => setCtx(e.target.value)}><option value="learning">{tr("Learning content", "ಕಲಿಕೆ ವಿಷಯ")}</option><option value="grievance">{tr("Selected grievance", "ಆಯ್ದ ದೂರು")}</option><option value="comm">{tr("Communication draft", "ಸಂವಹನ ಕರಡು")}</option><option value="general">{tr("General question", "ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆ")}</option></Select>
      <Select aria-label="Output language" className="w-40" value={out} onChange={(e) => setOut(e.target.value as Lang)}><option value="kn">{tr("Answer in ಕನ್ನಡ", "ಉತ್ತರ ಕನ್ನಡದಲ್ಲಿ")}</option><option value="en">{tr("Answer in English", "ಉತ್ತರ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ")}</option></Select></div>
    <div className="flex flex-wrap gap-2">{ex.map((e) => <button key={e} onClick={() => ask(e)} className="rounded-full border border-border bg-card px-3 py-1.5 text-left text-sm hover:bg-accent-soft">{e}</button>)}</div>
    <div className="flex gap-2"><Input aria-label="Prompt" value={p} onChange={(e) => setP(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask(p)} placeholder={tr("Ask something…", "ಏನಾದರೂ ಕೇಳಿ…")} /><Button disabled={busy || !p.trim()} onClick={() => ask(p)} aria-label="Send"><PaperPlaneRight /></Button></div>
    <p className="text-xs text-muted">{tr("Do not type resident names, IDs or voter details here.", "ನಿವಾಸಿ ಹೆಸರು, ಗುರುತು ಅಥವಾ ಮತದಾರ ವಿವರ ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಬೇಡಿ.")}</p>
    {busy && <p role="status" className="text-sm text-muted">{tr("Thinking…", "ಯೋಚಿಸುತ್ತಿದೆ…")}</p>}
    {log.map((m, i) => <Card key={i}><p className="text-sm font-semibold">{m.q}</p><p className="mt-2 whitespace-pre-line text-sm">{m.a}</p>{m.s.length > 0 && <p className="mt-2 text-xs text-muted">{tr("Sources", "ಮೂಲಗಳು")}: {m.s.join("; ")}</p>}<p className="mt-1 text-[11px] text-muted">{tr("Simulated response · output language", "ಸಿಮ್ಯುಲೇಟೆಡ್ ಉತ್ತರ · ಭಾಷೆ")}: {out === "kn" ? "ಕನ್ನಡ" : "English"}</p></Card>)}
  </div>);
}

function Pathway() {
  const { tr, lang } = useT(); const act = useAct(); const [s, setS] = useState({ category: "water", where: "", duration: "", tried: "", evidence: false }); const [r, setR] = useState<ReturnType<typeof pathway> | null>(null); const [state, setState] = useState<"" | "accepted" | "dismissed">(""); const [edit, setEdit] = useState("");
  return (<div className="grid gap-4 lg:grid-cols-2"><Card className="space-y-3"><h2 className="font-bold">{tr("A few questions", "ಕೆಲವು ಪ್ರಶ್ನೆಗಳು")}</h2>
    <Field label={tr("Issue category", "ಸಮಸ್ಯೆ ವರ್ಗ")}>{(id) => <Select id={id} value={s.category} onChange={(e) => setS({ ...s, category: e.target.value })}>{GRIEVANCE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c[lang]}</option>)}</Select>}</Field>
    <Field label={tr("Location", "ಸ್ಥಳ")}>{(id) => <Input id={id} value={s.where} onChange={(e) => setS({ ...s, where: e.target.value })} />}</Field>
    <Field label={tr("How long has this been a problem?", "ಎಷ್ಟು ಸಮಯದಿಂದ ಸಮಸ್ಯೆ?")}>{(id) => <Input id={id} value={s.duration} onChange={(e) => setS({ ...s, duration: e.target.value })} />}</Field>
    <Field label={tr("Steps already taken", "ಈಗಾಗಲೇ ತೆಗೆದುಕೊಂಡ ಕ್ರಮ")}>{(id) => <Textarea id={id} rows={2} value={s.tried} onChange={(e) => setS({ ...s, tried: e.target.value })} />}</Field>
    <Check checked={s.evidence} onChange={(e) => setS({ ...s, evidence: e.target.checked })} label={tr("I have photos/evidence", "ನನ್ನ ಬಳಿ ಫೋಟೋ/ಸಾಕ್ಷ್ಯ ಇದೆ")} />
    <Button onClick={() => { setR(pathway(s, lang)); setState(""); setEdit(""); }}>{tr("Suggest a pathway", "ಮಾರ್ಗ ಸೂಚಿಸಿ")}</Button></Card>
    {r && <Card className="space-y-2 text-sm"><h2 className="font-bold">{tr("Suggested pathway", "ಸೂಚಿತ ಮಾರ್ಗ")}</h2>
      {([[tr("Summary", "ಸಾರಾಂಶ"), r.summary], [tr("Possible office / authority category", "ಸಂಭಾವ್ಯ ಕಚೇರಿ / ಪ್ರಾಧಿಕಾರ"), r.authority], [tr("Useful information", "ಉಪಯುಕ್ತ ಮಾಹಿತಿ"), r.docs], [tr("Suggested next step", "ಸೂಚಿತ ಮುಂದಿನ ಹೆಜ್ಜೆ"), edit || r.next], [tr("Suggested follow-up", "ಸೂಚಿತ ಅನುಸರಣೆ"), tr(`in ${r.days} days`, `${r.days} ದಿನಗಳಲ್ಲಿ`)], [tr("Confidence", "ವಿಶ್ವಾಸ"), r.confidence]] as [string, string][]).map(([k, v]) => <div key={k}><p className="text-xs font-semibold uppercase text-muted">{k}</p><p>{v}</p></div>)}
      <p className="rounded-lg bg-saffron/15 p-2 text-xs">{VERIFY[lang]} {tr("No complaint has been filed and no reference number exists.", "ಯಾವ ದೂರೂ ಸಲ್ಲಿಸಿಲ್ಲ; ಯಾವುದೇ ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ ಇಲ್ಲ.")}</p>
      {state === "" ? <><Field label={tr("Edit next step", "ಮುಂದಿನ ಹೆಜ್ಜೆ ತಿದ್ದಿ")}>{(id) => <Textarea id={id} rows={2} value={edit} onChange={(e) => setEdit(e.target.value)} />}</Field><div className="flex gap-2"><Button onClick={async () => { await act(() => api.grievances.note(getDb().grievances[0].id, `Pathway accepted: ${r.authority}`), tr("Saved as a note on your latest case", "ನಿಮ್ಮ ಇತ್ತೀಚಿನ ಪ್ರಕರಣದಲ್ಲಿ ಟಿಪ್ಪಣಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ")); setState("accepted"); }}>{tr("Accept", "ಒಪ್ಪಿ")}</Button><Button variant="secondary" onClick={() => setState("dismissed")}>{tr("Dismiss", "ತಿರಸ್ಕರಿಸಿ")}</Button></div></> : <p className="text-sm font-semibold">{state === "accepted" ? tr("Accepted by you.", "ನೀವು ಒಪ್ಪಿದ್ದೀರಿ.") : tr("Dismissed.", "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ.")}</p>}</Card>}</div>);
}

const kinds = ["Resident update", "Follow-up to an authority", "Event invitation", "LMS reminder", "Training reminder", "Course completion congratulations", "Missing-information request"];
function Draft({ gid }: { gid: string | null }) {
  const { tr, lang } = useT(); const act = useAct(); const g = gid ? getDb().grievances.find((x) => x.id === gid) : null;
  const [k, setK] = useState(g ? "Follow-up to an authority" : kinds[0]); const [out, setOut] = useState<Lang>(lang); const [tone, setTone] = useState("Respectful");
  const [v, setV] = useState({ issue: g?.title ?? "", location: g?.locality ?? "", date: g?.observed ?? "", step: "", sender: "Ananya, Grama Nayaka participant" }); const [text, setText] = useState("");
  const gen = () => setText(compose(k, tone, out, v));
  return (<div className="grid gap-4 lg:grid-cols-2"><Card className="space-y-3">
    <Field label={tr("Template type", "ಟೆಂಪ್ಲೇಟ್ ಪ್ರಕಾರ")}>{(id) => <Select id={id} value={k} onChange={(e) => setK(e.target.value)}>{kinds.map((x) => <option key={x}>{x}</option>)}</Select>}</Field>
    <div className="grid grid-cols-2 gap-2"><Field label={tr("Language", "ಭಾಷೆ")}>{(id) => <Select id={id} value={out} onChange={(e) => setOut(e.target.value as Lang)}><option value="kn">ಕನ್ನಡ</option><option value="en">English</option></Select>}</Field><Field label={tr("Tone", "ಧ್ವನಿ")}>{(id) => <Select id={id} value={tone} onChange={(e) => setTone(e.target.value)}><option>Respectful</option><option>Warm</option></Select>}</Field></div>
    {(["issue", "location", "date", "step"] as const).map((f) => <Field key={f} label={{ issue: tr("Issue / topic", "ಸಮಸ್ಯೆ / ವಿಷಯ"), location: tr("Location / venue", "ಸ್ಥಳ"), date: tr("Date", "ದಿನಾಂಕ"), step: tr("Next step / info needed", "ಮುಂದಿನ ಹೆಜ್ಜೆ / ಬೇಕಾದ ಮಾಹಿತಿ") }[f]}>{(id) => <Input id={id} value={v[f]} onChange={(e) => setV({ ...v, [f]: e.target.value })} />}</Field>)}
    <p className="text-xs text-muted">{tr("No resident names or personal details are included by default.", "ನಿವಾಸಿ ಹೆಸರು ಅಥವಾ ವೈಯಕ್ತಿಕ ವಿವರ ಡೀಫಾಲ್ಟ್ ಆಗಿ ಸೇರಿಸುವುದಿಲ್ಲ.")}</p><Button onClick={gen}>{tr("Generate draft", "ಕರಡು ರಚಿಸಿ")}</Button></Card>
    <Card className="space-y-2"><h2 className="font-bold">{tr("Preview & edit", "ಪೂರ್ವವೀಕ್ಷಣೆ ಮತ್ತು ತಿದ್ದುವಿಕೆ")} <span className="text-xs font-normal text-muted">({out === "kn" ? "ಕನ್ನಡ" : "English"})</span></h2><Textarea aria-label="Draft" rows={10} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="flex flex-wrap gap-2"><Button variant="secondary" disabled={!text} onClick={async () => { await navigator.clipboard?.writeText(text).catch(() => {}); toast.success(tr("Copied", "ನಕಲಿಸಲಾಗಿದೆ")); }}><Copy />{tr("Copy", "ನಕಲಿಸಿ")}</Button><Button variant="secondary" disabled={!text} onClick={() => act(() => api.templates.save({ name: `${k} (mine)`, purpose: k, [out]: text, status: "Draft" } as never), tr("Saved as template draft", "ಟೆಂಪ್ಲೇಟ್ ಕರಡಾಗಿ ಉಳಿಸಲಾಗಿದೆ"))}>{tr("Save template", "ಟೆಂಪ್ಲೇಟ್ ಉಳಿಸಿ")}</Button></div><DemoNote>{tr("Not sent. Copy and send yourself; WhatsApp is not connected in this demo.", "ಕಳುಹಿಸಲಾಗಿಲ್ಲ. ನಕಲಿಸಿ ನೀವೇ ಕಳುಹಿಸಿ; ಈ ಡೆಮೊದಲ್ಲಿ WhatsApp ಸಂಪರ್ಕವಿಲ್ಲ.")}</DemoNote></Card></div>);
}
