"use client";
import { Card, PageHeader } from "@/components/ui";
import { useT } from "@/lib/useT";

export default function SessionPlan() {
  const { tr } = useT();
  const day = (n: number, items: [string, string, string][]) => (<Card key={n}><h2 className="font-bold">{tr(`Day ${n}`, `ದಿನ ${n}`)}</h2><ol className="mt-2 space-y-2 text-sm">{items.map(([t, en, kn]) => <li key={t} className="flex gap-3"><span className="w-28 shrink-0 font-mono text-muted">{t}</span><span>{tr(en, kn)}</span></li>)}</ol></Card>);
  return (<div className="space-y-4"><PageHeader title={tr("Session Plan", "ಅವಧಿ ಯೋಜನೆ")} sub={tr("Same plan for each cohort's two days. Training materials are demo placeholders.", "ಪ್ರತಿ ಕೋಹಾರ್ಟ್‌ನ ಎರಡು ದಿನಕ್ಕೂ ಒಂದೇ ಯೋಜನೆ. ತರಬೇತಿ ಸಾಮಗ್ರಿ ಡೆಮೊ ಪ್ಲೇಸ್‌ಹೋಲ್ಡರ್.")} />
    <div className="grid gap-4 md:grid-cols-2">{[day(1, [["09:30–10:00", "Welcome & ground rules", "ಸ್ವಾಗತ ಮತ್ತು ನಿಯಮಗಳು"], ["10:00–12:00", "Panchayat Raj framework", "ಪಂಚಾಯತ್ ರಾಜ್ ಚೌಕಟ್ಟು"], ["13:00–15:00", "Roles of Gram Panchayat institutions", "ಗ್ರಾಮ ಪಂಚಾಯತ್ ಸಂಸ್ಥೆಗಳ ಪಾತ್ರ"], ["15:15–16:30", "Ethical fieldwork", "ನೈತಿಕ ಕ್ಷೇತ್ರಕಾರ್ಯ"]]),day(2, [["09:30–11:30", "Grievance handling & follow-up", "ದೂರು ನಿರ್ವಹಣೆ ಮತ್ತು ಅನುಸರಣೆ"], ["11:45–13:00", "Data privacy & responsible AI", "ಡೇಟಾ ಗೌಪ್ಯತೆ ಮತ್ತು ಜವಾಬ್ದಾರಿಯುತ AI"], ["14:00–15:30", "Practice: role-play follow-ups", "ಅಭ್ಯಾಸ: ಅನುಸರಣಾ ಪಾತ್ರಾಭಿನಯ"], ["15:30–16:30", "LMS orientation & wrap-up", "LMS ಪರಿಚಯ ಮತ್ತು ಮುಕ್ತಾಯ"]])]}</div></div>);
}
