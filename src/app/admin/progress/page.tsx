"use client";
import { Empty, PageHeader, Progress, QState, Table, Td } from "@/components/ui";
import { useMock } from "@/lib/api";
import { getDb } from "@/lib/db";
import { useT } from "@/lib/useT";

export default function LearnerProgress() {
  const { tr } = useT(); const q = useMock(["trainer-progress"], () => { const d = getDb(); const mine = d.classes.filter((c) => c.trainerId === "T-1").flatMap((c) => c.roster); return d.participants.filter((p) => mine.includes(p.id)); });
  return (<div className="space-y-4"><PageHeader title={tr("Learner Progress", "ಕಲಿಕೆಯ ಪ್ರಗತಿ")} sub={tr("Only learners in your assigned classes. No resident or voter records are available to trainers.", "ನಿಮ್ಮ ನಿಯೋಜಿತ ತರಗತಿಗಳ ಕಲಿಕೆದಾರರು ಮಾತ್ರ. ತರಬೇತುದಾರರಿಗೆ ನಿವಾಸಿ ಅಥವಾ ಮತದಾರ ದಾಖಲೆ ಲಭ್ಯವಿಲ್ಲ.")} />
    <QState q={q} isEmpty={(d) => d.length === 0} empty={<Empty title={tr("No learners yet", "ಇನ್ನೂ ಕಲಿಕೆದಾರರಿಲ್ಲ")} />}>{(d) => <Table head={[tr("Learner", "ಕಲಿಕೆದಾರ"), "LMS", ""]}>{d.map((p) => <tr key={p.id}><Td>{p.name} <span className="text-xs text-muted">{p.id}</span></Td><Td className="w-56"><Progress value={p.lmsProgress} label={p.name} /></Td><Td>{p.lmsProgress}%</Td></tr>)}</Table>}</QState></div>);
}
