"use client";
import Link from "next/link";
import { Badge, Button, Card, PageHeader, QState, statusTone } from "@/components/ui";
import { useMock } from "@/lib/api";
import { getDb } from "@/lib/db";
import { useT } from "@/lib/useT";
import type { AppStatus } from "@/lib/types";

const flow: AppStatus[] = ["Submitted", "Under Review", "Shortlisted", "Approved"];
export default function Status() {
  const { tr } = useT();
  const q = useMock(["my-app"], () => { const d = getDb(); return { a: d.applications.find((x) => x.id === d.myApplicationId) ?? d.applications[0] }; });
  return (
    <QState q={q}>{({ a }) => {
      const reached = a.history.map((h) => h.status); const rejected = a.status === "Not Selected"; const steps: AppStatus[] = rejected ? ["Submitted", "Under Review", "Not Selected"] : flow;
      const next = a.status === "Approved" ? tr("Continue to onboarding and your training schedule.", "ಆನ್‌ಬೋರ್ಡಿಂಗ್ ಮತ್ತು ತರಬೇತಿ ವೇಳಾಪಟ್ಟಿಗೆ ಮುಂದುವರಿಯಿರಿ.") : rejected ? "" : tr("A reviewer will look at your application. We will notify you of any change.", "ಪರಿಶೀಲಕರು ನಿಮ್ಮ ಅರ್ಜಿ ನೋಡುತ್ತಾರೆ. ಬದಲಾವಣೆ ಆದರೆ ತಿಳಿಸುತ್ತೇವೆ.");
      return (<div className="space-y-4"><PageHeader title={tr("Application status", "ಅರ್ಜಿ ಸ್ಥಿತಿ")} sub={`${a.id} · ${a.name}`} />
        <Card><div className="mb-3 flex flex-wrap items-center gap-2"><Badge tone={statusTone(a.status)}>{a.status}</Badge><span className="text-xs text-muted">{tr("Reviewed manually by people. Registration does not guarantee selection.", "ಕೈಯಾರೆ ಪರಿಶೀಲನೆ. ನೋಂದಣಿ ಆಯ್ಕೆಯ ಖಾತರಿಯಲ್ಲ.")}</span></div>
          <ol className="space-y-3 border-l-2 border-border pl-4">{steps.map((s) => { const h = a.history.find((x) => x.status === s); return (<li key={s} className="relative"><span className={`absolute -left-[22px] top-1 h-3 w-3 rounded-full ${reached.includes(s) ? "bg-primary" : "bg-border"}`} /><p className={reached.includes(s) ? "font-semibold" : "text-muted"}>{s}</p>{h && <p className="text-xs text-muted">{h.at}</p>}</li>); })}</ol></Card>
        {a.candidateNote && <Card><p className="text-sm">{a.candidateNote}</p></Card>}
        {next && <Card><h2 className="font-bold">{tr("What happens next", "ಮುಂದೇನು")}</h2><p className="mt-1 text-sm text-muted">{next}</p>{a.status === "Approved" && <Link href="/app/training"><Button className="mt-3">{tr("Open training schedule", "ತರಬೇತಿ ವೇಳಾಪಟ್ಟಿ")}</Button></Link>}</Card>}
      </div>); }}</QState>
  );
}
