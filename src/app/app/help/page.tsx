"use client";
import { useState } from "react";
import { Button, Card, Field, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { api, useAct } from "@/lib/api";
import { useT } from "@/lib/useT";

export default function Help() {
  const { tr } = useT(); const act = useAct(); const [t, setT] = useState(""); const [m, setM] = useState(""); const [k, setK] = useState("Question");
  const faq = [[tr("How do I change language?", "ಭಾಷೆ ಬದಲಿಸುವುದು ಹೇಗೆ?"), tr("Use the ಕನ್ನಡ / English switch at the top of any screen.", "ಯಾವುದೇ ಪುಟದ ಮೇಲಿನ ಕನ್ನಡ / English ಸ್ವಿಚ್ ಬಳಸಿ.")], [tr("Why is a lesson locked?", "ಪಾಠ ಏಕೆ ಲಾಕ್ ಆಗಿದೆ?"), tr("Lessons unlock in order. Complete the previous lesson first.", "ಪಾಠಗಳು ಕ್ರಮವಾಗಿ ತೆರೆಯುತ್ತವೆ. ಮೊದಲು ಹಿಂದಿನದನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.")], [tr("Is the AI assistant official?", "AI ಸಹಾಯಕ ಅಧಿಕೃತವೇ?"), tr("No. It gives suggestions only. Always verify with the relevant authority.", "ಇಲ್ಲ. ಇದು ಸಲಹೆ ಮಾತ್ರ. ಸಂಬಂಧಿತ ಪ್ರಾಧಿಕಾರದೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ.")], [tr("Do points guarantee rewards?", "ಅಂಕಗಳು ಪುರಸ್ಕಾರ ಖಾತರಿಯೇ?"), tr("No. Rewards in this prototype are fictional and need approval.", "ಇಲ್ಲ. ಈ ಮಾದರಿಯ ಪುರಸ್ಕಾರಗಳು ಕಾಲ್ಪನಿಕ ಮತ್ತು ಅನುಮೋದನೆ ಬೇಕು.")]];
  return (<div className="space-y-4"><PageHeader title={tr("Help", "ಸಹಾಯ")} />
    <div className="space-y-2">{faq.map(([q, a]) => <details key={q} className="rounded-2xl border border-border bg-card p-4"><summary className="cursor-pointer font-medium">{q}</summary><p className="mt-2 text-sm text-muted">{a}</p></details>)}</div>
    <Card className="space-y-3"><h2 className="font-bold">{tr("Contact programme support (mock)", "ಕಾರ್ಯಕ್ರಮ ಬೆಂಬಲ ಸಂಪರ್ಕ (ಮಾಕ್)")}</h2><Field label={tr("Type", "ವಿಧ")}>{(id) => <Select id={id} value={k} onChange={(e) => setK(e.target.value)}><option>Question</option><option>Report content issue</option><option>Technical problem</option></Select>}</Field><Field label={tr("Subject", "ವಿಷಯ")}>{(id) => <Input id={id} value={t} onChange={(e) => setT(e.target.value)} />}</Field><Field label={tr("Message", "ಸಂದೇಶ")}>{(id) => <Textarea id={id} value={m} onChange={(e) => setM(e.target.value)} />}</Field>
      <Button disabled={!t.trim() || m.trim().length < 5} onClick={async () => { await act(() => api.requests.submit(`${k}: ${t}`), tr("Message recorded (demo) — nobody will reply", "ಸಂದೇಶ ದಾಖಲಾಗಿದೆ (ಡೆಮೊ) — ಯಾರೂ ಉತ್ತರಿಸುವುದಿಲ್ಲ")); setT(""); setM(""); }}>{tr("Send", "ಕಳುಹಿಸಿ")}</Button></Card></div>);
}
