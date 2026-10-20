"use client";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Button, Card, Confirm, Field, Input, PageHeader, QState, Select } from "@/components/ui";
import { api, useAct, useMock } from "@/lib/api";
import { getDb } from "@/lib/db";
import { usePrefs } from "@/lib/store";
import { acs, districts, gps, taluks } from "@/lib/seed-geo";
import { useT } from "@/lib/useT";

export default function Settings() {
  const { tr } = useT(); const act = useAct(); const role = usePrefs((s) => s.role); const mgr = role === "state"; const { theme, setTheme } = useTheme(); const [reset, setReset] = useState(false); const q = useMock(["settings"], () => getDb().settings); const [err, setErr] = useState("");
  const num = (k: "passThreshold" | "videoThreshold", v: number) => { if (v < 40 || v > 100) return setErr(tr("Enter 40–100", "40–100 ನೀಡಿ")); setErr(""); act(() => api.settings.set({ [k]: v }), tr("Saved and audited", "ಉಳಿಸಿ ಆಡಿಟ್ ಮಾಡಲಾಗಿದೆ")); };
  return (<div className="space-y-4"><PageHeader title={tr("Settings", "ಸೆಟ್ಟಿಂಗ್‌ಗಳು")} />
    <QState q={q}>{(s) => (<>
      <Card className="space-y-3"><h2 className="font-bold">{tr("Learning rules", "ಕಲಿಕಾ ನಿಯಮ")}</h2>{!mgr && <p className="text-xs text-muted">{tr("Read-only for your role.", "ನಿಮ್ಮ ಪಾತ್ರಕ್ಕೆ ಓದಲು ಮಾತ್ರ.")}</p>}<div className="grid gap-3 sm:grid-cols-2"><Field label={tr("MCQ pass threshold %", "MCQ ಉತ್ತೀರ್ಣ ಮಿತಿ %")} error={err}>{(i, a) => <Input id={i} {...a} type="number" disabled={!mgr} defaultValue={s.passThreshold} onBlur={(e) => num("passThreshold", +e.target.value)} />}</Field><Field label={tr("Video completion threshold %", "ವೀಡಿಯೋ ಪೂರ್ಣಗೊಳಿಕೆ ಮಿತಿ %")}>{(i) => <Input id={i} type="number" disabled={!mgr} defaultValue={s.videoThreshold} onBlur={(e) => num("videoThreshold", +e.target.value)} />}</Field></div><p className="text-sm">{tr("Training completion rule", "ತರಬೇತಿ ಪೂರ್ಣಗೊಳಿಕೆ ನಿಯಮ")}: <b>{s.attendanceRule}</b></p></Card>
      <Card className="space-y-1 text-sm"><h2 className="font-bold">{tr("Programme & privacy", "ಕಾರ್ಯಕ್ರಮ ಮತ್ತು ಗೌಪ್ಯತೆ")}</h2><p>{tr("Name", "ಹೆಸರು")}: Grama Nayaka / ಗ್ರಾಮ ನಾಯಕ · {tr("Languages", "ಭಾಷೆಗಳು")}: ಕನ್ನಡ, English</p><p>{tr("Privacy notice version", "ಗೌಪ್ಯತಾ ಸೂಚನೆ ಆವೃತ್ತಿ")}: {s.noticeVersion}</p><p>{tr("Retention summary: demo placeholder — to be set after legal review.", "ಉಳಿಸಿಕೊಳ್ಳುವ ಅವಧಿ: ಡೆಮೊ ಪ್ಲೇಸ್‌ಹೋಲ್ಡರ್ — ಕಾನೂನು ಪರಿಶೀಲನೆಯ ನಂತರ ನಿಗದಿ.")}</p></Card>
      <Card className="text-sm"><h2 className="font-bold">{tr("Geographic master data (read-only demo)", "ಭೌಗೋಳಿಕ ಮಾಸ್ಟರ್ ಡೇಟಾ (ಓದಲು ಮಾತ್ರ)")}</h2><p>{districts.length} {tr("districts", "ಜಿಲ್ಲೆಗಳು")} · {taluks.length} {tr("taluks", "ತಾಲ್ಲೂಕುಗಳು")} · {gps.length} GPs · {acs.length} {tr("assembly constituencies (separate relation, may span taluks)", "ವಿಧಾನಸಭಾ ಕ್ಷೇತ್ರಗಳು (ಪ್ರತ್ಯೇಕ ಸಂಬಂಧ, ತಾಲ್ಲೂಕು ದಾಟಬಹುದು)")}</p></Card>
      <Card className="space-y-3"><h2 className="font-bold">{tr("Appearance", "ಗೋಚರತೆ")}</h2><Select aria-label="Theme" className="w-48" value={theme} onChange={(e) => setTheme(e.target.value)}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></Select><p className="text-xs text-muted">{tr("Motion respects your device's reduced-motion setting.", "ಚಲನೆ ನಿಮ್ಮ ಸಾಧನದ ಕಡಿಮೆ-ಚಲನೆ ಸೆಟ್ಟಿಂಗ್ ಗೌರವಿಸುತ್ತದೆ.")}</p></Card>
      <Card className="space-y-2"><h2 className="font-bold">{tr("Demo tools", "ಡೆಮೊ ಸಾಧನಗಳು")}</h2><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => { import("@/lib/api").then((m) => m.injectError()); act(() => 0); }}>{tr("Inject error on next call", "ಮುಂದಿನ ಕರೆಯಲ್ಲಿ ದೋಷ ಹಾಕಿ")}</Button><Button variant="danger" onClick={() => setReset(true)}>{tr("Reset demo data", "ಡೆಮೊ ಡೇಟಾ ಮರುಹೊಂದಿಸಿ")}</Button></div></Card>
      <Confirm open={reset} onClose={() => setReset(false)} danger onConfirm={async () => { await act(() => api.settings.reset(), tr("Demo data reset", "ಡೆಮೊ ಡೇಟಾ ಮರುಹೊಂದಿಸಲಾಗಿದೆ")); setReset(false); }} title={tr("Reset all demo data?", "ಎಲ್ಲಾ ಡೆಮೊ ಡೇಟಾ ಮರುಹೊಂದಿಸುವಿರಾ?")} confirmLabel={tr("Reset", "ಮರುಹೊಂದಿಸಿ")} body={tr("Your changes in this browser will be discarded.", "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿನ ನಿಮ್ಮ ಬದಲಾವಣೆಗಳು ಅಳಿಯುತ್ತವೆ.")} /></>)}</QState></div>);
}
