"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Badge, Button, Card, Confirm, Empty, Field, Input, Modal, PageHeader, QState, Select, Stat, Table, Td, statusTone } from "@/components/ui";
import { CertBadge, CountsRow, Materials, MarkCompleteModal, RegisterVolunteersModal, RescheduleModal, CancelModal } from "@/components/sessions";
import { api, useAct, useMock } from "@/lib/api";
import { getDb } from "@/lib/db";
import { activeTrainerId } from "@/lib/scope";
import { trainers } from "@/lib/seed";
import { endDateOf, isComplete } from "@/lib/trainingRules";
import { usePrefs } from "@/lib/store";
import { useCan } from "@/lib/useCan";
import { useT } from "@/lib/useT";
import type { TrainingClass } from "@/lib/types";

const tName = (id: string) => trainers.find((t) => t.id === id)?.name ?? id;

export function SessionDetail() {
  const { classId } = useParams<{ classId: string }>(); const { tr } = useT(); const act = useAct(); const role = usePrefs((s) => s.role); const { can } = useCan();
  const mgr = role !== "trainer" && can("training", "edit");
  const [qs, setQs] = useState(""); const [reg, setReg] = useState(false); const [mc, setMc] = useState<string | null>(null); const [move, setMove] = useState<string | null>(null); const [to, setTo] = useState(""); const [trn, setTrn] = useState<string | null>(null); const [resc, setResc] = useState<TrainingClass | null>(null); const [canc, setCanc] = useState<TrainingClass | null>(null); const [pub, setPub] = useState<"publish" | "unpublish" | null>(null);
  const q = useMock(["class", classId], () => { const d = getDb(); const c = d.classes.find((x) => x.id === classId); return c ? { c, all: d.classes, ps: d.participants, coordinator: d.users.find((u) => u.id === c.coordinatorId)?.name } : null; });
  const pName = (ps: { id: string; name: string }[], id: string) => ps.find((p) => p.id === id)?.name ?? id;
  return (
    <QState q={q} isEmpty={(d) => !d || (role === "trainer" && d.c.trainerId !== activeTrainerId())} empty={<Empty title={tr("Session not found or not assigned to you", "ಅವಧಿ ಸಿಗಲಿಲ್ಲ ಅಥವಾ ನಿಮಗೆ ನಿಯೋಜಿಸಿಲ್ಲ")} />}>{(d) => { const { c, all, ps, coordinator } = d!; const shown = c.roster.filter((p) => !qs || (pName(ps, p) + p).toLowerCase().includes(qs.toLowerCase())); const cancelled = c.status === "Cancelled"; const draft = c.publish === "Draft";
      return (
        <div className="space-y-4">
          <PageHeader title={c.name} sub={`${tr("Days", "ದಿನ")} ${c.days.join("–")} · ${c.startDate} → ${endDateOf(c.startDate)} · ${c.room} · ${tName(c.trainerId)}`}
            actions={<><Badge tone={cancelled ? "danger" : draft ? "warning" : "success"}>{cancelled ? tr("Cancelled", "ರದ್ದು") : draft ? tr("Draft", "ಕರಡು") : tr("Published", "ಪ್ರಕಟಿತ")}</Badge>
              <Link href={`/admin/attendance?class=${c.id}`}><Button>{tr("Record attendance", "ಹಾಜರಾತಿ ದಾಖಲಿಸಿ")}</Button></Link>
              {mgr && !cancelled && <><Button variant="secondary" onClick={() => setReg(true)}>{tr("Register volunteers", "ಸ್ವಯಂಸೇವಕರನ್ನು ನೋಂದಾಯಿಸಿ")}</Button><Link href={`/admin/training/${c.id}/edit`}><Button variant="secondary">{tr("Edit", "ತಿದ್ದಿ")}</Button></Link></>}</>} />
          {draft && !cancelled && <Card className="flex flex-wrap items-center justify-between gap-3 border-warning/50 text-sm"><span>{tr("This session is a draft: it is not open for registration yet.", "ಈ ಅವಧಿ ಕರಡು: ಇನ್ನೂ ನೋಂದಣಿಗೆ ತೆರೆದಿಲ್ಲ.")}</span>{mgr && <Button size="sm" onClick={() => setPub("publish")}>{tr("Publish", "ಪ್ರಕಟಿಸಿ")}</Button>}</Card>}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Stat label={tr("Capacity", "ಸಾಮರ್ಥ್ಯ")} value={`${c.roster.length}/${c.capacity}`} /><Stat label={tr("Waitlist", "ಕಾಯುವ ಪಟ್ಟಿ")} value={c.waitlist.length} /><Stat label={tr("Completed", "ಪೂರ್ಣ")} value={c.roster.filter((p) => isComplete(c, p)).length} /><Stat label={tr("Day 1 recorded", "ದಿನ 1 ದಾಖಲು")} value={c.roster.filter((p) => c.attendance[p]?.[0] !== "Not Recorded").length} /></div>
          <Card className="space-y-3 text-sm">
            {c.description && <p>{c.description}</p>}
            <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{[[tr("Location", "ಸ್ಥಳ"), c.location ?? "—"], [tr("District / region", "ಜಿಲ್ಲೆ / ಪ್ರದೇಶ"), c.region ?? "—"], [tr("Dates", "ದಿನಾಂಕ"), `${c.startDate} → ${endDateOf(c.startDate)} (${c.duration ?? 2} ${tr("days", "ದಿನ")})`], [tr("Registration deadline", "ನೋಂದಣಿ ಕೊನೆಯ ದಿನ"), c.registrationDeadline ?? "—"], [tr("Trainer", "ತರಬೇತುದಾರ"), tName(c.trainerId)], [tr("Coordinator", "ಸಂಯೋಜಕ"), coordinator ?? "—"]].map(([k, v]) => <div key={k}><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
            {cancelled && <p className="text-danger">{tr("Cancelled", "ರದ್ದು")}: {c.cancelReason}</p>}
            <CountsRow c={c} />
            {mgr && !cancelled && <div className="flex flex-wrap gap-2 border-t border-border pt-3"><Button size="sm" variant="secondary" onClick={() => setTrn(c.trainerId)}>{tr("Assign trainer", "ತರಬೇತುದಾರ ನಿಯೋಜಿಸಿ")}</Button><Button size="sm" variant="secondary" onClick={() => setResc(c)}>{tr("Reschedule", "ಮರುನಿಗದಿ")}</Button>{!draft && c.roster.length === 0 && <Button size="sm" variant="secondary" onClick={() => setPub("unpublish")}>{tr("Move back to draft", "ಕರಡಿಗೆ ಹಿಂತಿರುಗಿಸಿ")}</Button>}<Button size="sm" variant="ghost" onClick={() => setCanc(c)}>{tr("Cancel session", "ಅವಧಿ ರದ್ದು")}</Button></div>}
          </Card>
          <Input aria-label="Search roster" placeholder={tr("Search roster", "ರೋಸ್ಟರ್ ಹುಡುಕಿ")} value={qs} onChange={(e) => setQs(e.target.value)} />
          {shown.length === 0 ? <Empty title={tr("No volunteers registered", "ನೋಂದಾಯಿತ ಸ್ವಯಂಸೇವಕರಿಲ್ಲ")} hint={draft ? tr("Publish the session first, then register volunteers.", "ಮೊದಲು ಅವಧಿ ಪ್ರಕಟಿಸಿ, ನಂತರ ಸ್ವಯಂಸೇವಕರನ್ನು ನೋಂದಾಯಿಸಿ.") : undefined} action={mgr && !draft && !cancelled ? <Button onClick={() => setReg(true)}>{tr("Register volunteers", "ಸ್ವಯಂಸೇವಕರನ್ನು ನೋಂದಾಯಿಸಿ")}</Button> : undefined} /> :
            <Table head={[tr("Volunteer", "ಸ್ವಯಂಸೇವಕ"), tr("Day 1", "ದಿನ 1"), tr("Day 2", "ದಿನ 2"), tr("Completion", "ಪೂರ್ಣಗೊಳಿಕೆ"), tr("Certificate", "ಪ್ರಮಾಣಪತ್ರ"), tr("Actions", "ಕ್ರಮಗಳು")]}>{shown.map((p) => <tr key={p}><Td><b>{pName(ps, p)}</b><p className="text-xs text-muted">{p}</p></Td>{[0, 1].map((i) => <Td key={i}><Badge tone={statusTone(c.attendance[p]?.[i] ?? "")}>{c.attendance[p]?.[i]}</Badge></Td>)}
              <Td>{isComplete(c, p) ? <Badge tone="success">{c.exceptions?.[p] ? tr("Complete (exception)", "ಪೂರ್ಣ (ವಿನಾಯಿತಿ)") : tr("Complete", "ಪೂರ್ಣ")}</Badge> : <Badge>{tr("Not yet", "ಇನ್ನೂ ಇಲ್ಲ")}</Badge>}{c.exceptions?.[p] && <p className="mt-1 max-w-[16rem] text-xs text-muted">{c.exceptions[p].reason}</p>}</Td>
              <Td><CertBadge c={c} pid={p} canIssue={mgr} /></Td>
              <Td><div className="flex flex-wrap gap-1">{mgr && !isComplete(c, p) && <Button size="sm" variant="secondary" onClick={() => setMc(p)}>{tr("Mark complete…", "ಪೂರ್ಣ ಗುರುತಿಸಿ…")}</Button>}{mgr && <Button size="sm" variant="ghost" onClick={() => { setMove(p); setTo(""); }}>{tr("Move", "ಸ್ಥಳಾಂತರ")}</Button>}</div></Td></tr>)}</Table>}
          <Materials c={c} canEdit={mgr} />
          {c.attendanceLog.length > 0 && <Card><h2 className="font-bold">{tr("Attendance corrections", "ಹಾಜರಾತಿ ತಿದ್ದುಪಡಿ")}</h2><ul className="mt-1 text-sm">{c.attendanceLog.map((l, i) => <li key={i}>{l.at} · {pName(ps, l.pid)} · Day {l.day}: {l.from} → {l.to} {l.reason && `(${l.reason})`} · {l.by}</li>)}</ul></Card>}

          <RegisterVolunteersModal session={c} open={reg} onClose={() => setReg(false)} />
          <MarkCompleteModal session={c} pid={mc} onClose={() => setMc(null)} />
          <RescheduleModal session={resc} onClose={() => setResc(null)} /><CancelModal session={canc} onClose={() => setCanc(null)} />
          <Modal open={!!move} onClose={() => setMove(null)} title={tr("Move volunteer", "ಸ್ಥಳಾಂತರಿಸಿ")} footer={<Button disabled={!to} onClick={async () => { const r = await act(() => api.training.move(move!, c.id, to), tr("Moved", "ಸ್ಥಳಾಂತರಿಸಲಾಗಿದೆ")); if (r !== undefined) setMove(null); }}>{tr("Move", "ಸ್ಥಳಾಂತರಿಸಿ")}</Button>}><Select aria-label="Destination session" value={to} onChange={(e) => setTo(e.target.value)}><option value="">—</option>{all.filter((k) => k.cohort === c.cohort && k.id !== c.id && k.status !== "Cancelled").map((k) => <option key={k.id} value={k.id}>{k.name} ({k.roster.length}/{k.capacity})</option>)}</Select></Modal>
          <Modal open={trn !== null} onClose={() => setTrn(null)} title={tr("Assign trainer", "ತರಬೇತುದಾರ ನಿಯೋಜಿಸಿ")} footer={<Button onClick={async () => { const r = await act(() => api.training.reassignTrainer(c.id, trn!), tr("Trainer assigned", "ತರಬೇತುದಾರ ನಿಯೋಜಿಸಲಾಗಿದೆ")); if (r !== undefined) setTrn(null); }}>{tr("Save", "ಉಳಿಸಿ")}</Button>}><Field label={tr("Trainer", "ತರಬೇತುದಾರ")} hint={tr("A trainer cannot teach two parallel classes on the same days.", "ಒಬ್ಬ ತರಬೇತುದಾರ ಒಂದೇ ದಿನ ಎರಡು ತರಗತಿ ಕಲಿಸುವಂತಿಲ್ಲ.")}>{(i) => <Select id={i} value={trn ?? ""} onChange={(e) => setTrn(e.target.value)}>{trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select>}</Field></Modal>
          <Confirm open={!!pub} onClose={() => setPub(null)} onConfirm={async () => { const r = await act(() => (pub === "publish" ? api.sessions.publish(c.id) : api.sessions.unpublish(c.id)), pub === "publish" ? tr("Session published", "ಅವಧಿ ಪ್ರಕಟಿಸಲಾಗಿದೆ") : tr("Moved back to draft", "ಕರಡಿಗೆ ಹಿಂತಿರುಗಿಸಲಾಗಿದೆ")); if (r !== undefined) setPub(null); }} title={pub === "publish" ? tr("Publish this session?", "ಈ ಅವಧಿ ಪ್ರಕಟಿಸುವಿರಾ?") : tr("Move back to draft?", "ಕರಡಿಗೆ ಹಿಂತಿರುಗಿಸುವಿರಾ?")} confirmLabel={pub === "publish" ? tr("Publish", "ಪ್ರಕಟಿಸಿ") : tr("Move to draft", "ಕರಡಿಗೆ")} body={pub === "publish" ? tr("It will open for registration. The location, room, trainer and registration deadline must be filled in.", "ಇದು ನೋಂದಣಿಗೆ ತೆರೆಯುತ್ತದೆ. ಸ್ಥಳ, ಕೊಠಡಿ, ತರಬೇತುದಾರ ಮತ್ತು ನೋಂದಣಿ ಕೊನೆಯ ದಿನಾಂಕ ಭರ್ತಿಯಾಗಿರಬೇಕು.") : tr("It will close for registration. Only sessions with no registered volunteers can go back to draft.", "ಇದು ನೋಂದಣಿಗೆ ಮುಚ್ಚುತ್ತದೆ. ನೋಂದಾಯಿತರಿಲ್ಲದ ಅವಧಿಗಳು ಮಾತ್ರ ಕರಡಿಗೆ ಹಿಂತಿರುಗಬಹುದು.")} />
        </div>
      ); }}</QState>
  );
}
