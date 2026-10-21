"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck, UserCircle } from "@phosphor-icons/react";
import { Card, DemoNote } from "@/components/ui";
import { LangSwitch } from "@/components/shell/Controls";
import { homeFor } from "@/lib/nav";
import { INSTANT_ACCESS } from "@/lib/config";
import { usePrefs } from "@/lib/store";
import { useT } from "@/lib/useT";

/** Demo only: lets a freshly registered person pick which interface to explore. Not an authorization step. */
export default function Choose() {
  const { tr } = useT(); const router = useRouter();
  const session = usePrefs((s) => s.session); const setRole = usePrefs((s) => s.setRole); const [ready, setReady] = useState(false); useEffect(() => setReady(true), []);
  const allowed = INSTANT_ACCESS && !!session?.demo;
  useEffect(() => { if (!ready) return; if (!session) router.replace("/signin"); else if (!allowed) router.replace(homeFor(session.role)); }, [ready, session, allowed, router]);
  if (!allowed) return null;
  const pick = (admin: boolean) => { setRole(admin ? "state" : "participant"); router.push(admin ? "/admin" : "/app"); };
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between"><Link href="/" className="font-bold text-primary">{tr("Grama Nayaka", "ಗ್ರಾಮ ನಾಯಕ")}</Link><LangSwitch /></div>
      <DemoNote>{tr("Demo only. Admin approval is switched off for now. The admin view shows sample data and gives you no real admin rights.", "ಡೆಮೊ ಮಾತ್ರ. ಅಡ್ಮಿನ್ ಅನುಮೋದನೆ ಸದ್ಯಕ್ಕೆ ಆಫ್ ಆಗಿದೆ. ಅಡ್ಮಿನ್ ನೋಟವು ಮಾದರಿ ಡೇಟಾ ತೋರಿಸುತ್ತದೆ; ನಿಜವಾದ ಅಡ್ಮಿನ್ ಹಕ್ಕುಗಳಿಲ್ಲ.")}</DemoNote>
      <h1 className="mt-5 text-2xl font-bold">{tr(`Welcome, ${session!.name}`, `ಸ್ವಾಗತ, ${session!.name}`)}</h1>
      <p className="mt-1 text-sm text-muted">{tr("Choose how you want to explore the app.", "ನೀವು ಆ್ಯಪ್ ಅನ್ನು ಹೇಗೆ ನೋಡಲು ಬಯಸುತ್ತೀರಿ ಎಂದು ಆಯ್ಕೆ ಮಾಡಿ.")}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <button onClick={() => pick(false)} className="text-left"><Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md"><UserCircle size={36} weight="duotone" className="text-primary" /><h2 className="mt-3 text-lg font-bold">{tr("Normal user", "ಸಾಮಾನ್ಯ ಬಳಕೆದಾರ")}</h2><p className="mt-1 text-sm text-muted">{tr("Volunteer app: courses, training, grievances and rewards.", "ಸ್ವಯಂಸೇವಕ ಆ್ಯಪ್: ಕೋರ್ಸ್‌ಗಳು, ತರಬೇತಿ, ದೂರುಗಳು ಮತ್ತು ಪುರಸ್ಕಾರ.")}</p></Card></button>
        <button onClick={() => pick(true)} className="text-left"><Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md"><ShieldCheck size={36} weight="duotone" className="text-primary" /><h2 className="mt-3 text-lg font-bold">{tr("Admin (demo preview)", "ಅಡ್ಮಿನ್ (ಡೆಮೊ ಪೂರ್ವವೀಕ್ಷಣೆ)")}</h2><p className="mt-1 text-sm text-muted">{tr("Admin panel on sample data, for demonstration only.", "ಮಾದರಿ ಡೇಟಾದ ಮೇಲೆ ಅಡ್ಮಿನ್ ಪ್ಯಾನೆಲ್, ಪ್ರದರ್ಶನಕ್ಕಾಗಿ ಮಾತ್ರ.")}</p></Card></button>
      </div>
    </div>
  );
}
