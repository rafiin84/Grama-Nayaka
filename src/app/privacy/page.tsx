"use client";
import Link from "next/link";
import { Card, DemoNote } from "@/components/ui";
import { LangSwitch } from "@/components/shell/Controls";
import { useT } from "@/lib/useT";
import { NOTICE_VERSION, purposes } from "@/lib/consent";

export default function Privacy() {
  const { tr } = useT();
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between"><Link href="/" className="font-bold text-primary">← {tr("Home", "ಮುಖಪುಟ")}</Link><LangSwitch /></div>
      <h1 className="text-3xl font-bold">{tr("Privacy notice", "ಗೌಪ್ಯತಾ ಸೂಚನೆ")} <span className="text-base font-normal text-muted">v{NOTICE_VERSION}</span></h1>
      <DemoNote>{tr("Prototype notice. Not legal advice. Legal counsel must approve the final notice, purposes, retention and legal basis before any real use.", "ಮಾದರಿ ಸೂಚನೆ. ಕಾನೂನು ಸಲಹೆಯಲ್ಲ. ನಿಜವಾದ ಬಳಕೆಗೆ ಮೊದಲು ಅಂತಿಮ ಸೂಚನೆ, ಉದ್ದೇಶ, ಉಳಿಸಿಕೊಳ್ಳುವ ಅವಧಿ ಮತ್ತು ಕಾನೂನು ಆಧಾರವನ್ನು ಕಾನೂನು ಸಲಹೆಗಾರರು ಅನುಮೋದಿಸಬೇಕು.")}</DemoNote>
      <Card><h2 className="font-bold">{tr("Purposes", "ಉದ್ದೇಶಗಳು")}</h2><ul className="mt-2 space-y-3">{purposes.map((p) => <li key={p.id}><b>{tr(p.en, p.kn)}</b> <span className="text-xs text-muted">({p.required ? tr("required", "ಅಗತ್ಯ") : tr("optional", "ಐಚ್ಛಿಕ")})</span><p className="text-sm text-muted">{tr(p.descEn, p.descKn)}</p></li>)}
        <li><b>{tr("Resident and voter-related records", "ನಿವಾಸಿ ಮತ್ತು ಮತದಾರ ಸಂಬಂಧಿತ ದಾಖಲೆಗಳು")}</b><p className="text-sm text-muted">{tr("Collected separately, with its own notice at the point of collection, only for community-service follow-up. Never used for political persuasion, profiling or targeting. Voter-related records are not verified with any official system.", "ಸಂಗ್ರಹಿಸುವ ಸಮಯದಲ್ಲಿ ಪ್ರತ್ಯೇಕ ಸೂಚನೆಯೊಂದಿಗೆ, ಸಮುದಾಯ ಸೇವಾ ಅನುಸರಣೆಗೆ ಮಾತ್ರ. ರಾಜಕೀಯ ಮನವೊಲಿಕೆ, ಪ್ರೊಫೈಲಿಂಗ್ ಅಥವಾ ಗುರಿಯಿಡುವಿಕೆಗೆ ಎಂದಿಗೂ ಬಳಸುವುದಿಲ್ಲ. ಯಾವ ಅಧಿಕೃತ ವ್ಯವಸ್ಥೆಯಲ್ಲೂ ಪರಿಶೀಲಿಸುವುದಿಲ್ಲ.")}</p></li></ul></Card>
      <Card><h2 className="font-bold">{tr("Retention summary (demo)", "ಉಳಿಸಿಕೊಳ್ಳುವ ಅವಧಿ ಸಾರಾಂಶ (ಡೆಮೊ)")}</h2><p className="mt-1 text-sm text-muted">{tr("Application data: until the programme cycle closes plus a review period. Recordings: until review completes. Exact periods are to be set after legal review.", "ಅರ್ಜಿ ಡೇಟಾ: ಕಾರ್ಯಕ್ರಮ ಚಕ್ರ ಮುಗಿಯುವವರೆಗೆ ಮತ್ತು ಪರಿಶೀಲನೆ ಅವಧಿ. ರೆಕಾರ್ಡಿಂಗ್: ಪರಿಶೀಲನೆ ಮುಗಿಯುವವರೆಗೆ. ನಿಖರ ಅವಧಿ ಕಾನೂನು ಪರಿಶೀಲನೆಯ ನಂತರ.")}</p></Card>
      <Card><h2 className="font-bold">{tr("Your rights", "ನಿಮ್ಮ ಹಕ್ಕುಗಳು")}</h2><p className="mt-1 text-sm text-muted">{tr("Request access, correction, withdrawal of consent, or exit from your profile. These are demo requests only.", "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ನಿಂದ ಪ್ರವೇಶ, ತಿದ್ದುಪಡಿ, ಸಮ್ಮತಿ ಹಿಂಪಡೆಯುವಿಕೆ ಅಥವಾ ನಿರ್ಗಮನಕ್ಕೆ ವಿನಂತಿಸಿ. ಇವು ಡೆಮೊ ವಿನಂತಿಗಳು ಮಾತ್ರ.")}</p><Link href="/app/profile" className="mt-2 inline-block text-sm font-medium text-primary underline">{tr("Open my consent record & rights", "ನನ್ನ ಸಮ್ಮತಿ ದಾಖಲೆ ಮತ್ತು ಹಕ್ಕುಗಳು")}</Link></Card>
    </div>
  );
}
