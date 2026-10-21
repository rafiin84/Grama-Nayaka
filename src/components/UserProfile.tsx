"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, PencilSimple } from "@phosphor-icons/react";
import { Badge, Button, Card, Check, Confirm, Empty, Field, Modal, QState, Select, Textarea, statusTone } from "@/components/ui";
import { ActivationCodeDialog } from "@/components/ActivationCode";
import { api, useAct, useMock } from "@/lib/api";
import { getDb } from "@/lib/db";
import { assignableRoles, RBAC_ROLES } from "@/lib/rbac";
import { trainingStatusOf } from "@/lib/trainingRules";
import { usePrefs } from "@/lib/store";
import { useCan } from "@/lib/useCan";
import { useT } from "@/lib/useT";
import type { RbacRole } from "@/lib/types";

export function UserProfile({ id }: { id: string }) {
  const { tr, lang } = useT(); const act = useAct(); const router = useRouter(); const { can, manageUsers } = useCan(); const role = usePrefs((s) => s.role);
  const [dlg, setDlg] = useState<null | "role" | "status" | "villages" | "delete">(null); const [toStatus, setToStatus] = useState<"Inactive" | "Suspended">("Inactive"); const [reason, setReason] = useState(""); const [newRole, setNewRole] = useState<RbacRole>("volunteer"); const [pick, setPick] = useState<string[]>([]); const [code, setCode] = useState<string | null>(null);
  const q = useMock(["profile-user", id], () => { const d = getDb(); const u = d.users.find((x) => x.id === id); const p = d.participants.find((x) => x.id === u?.participantId); return u ? { u, p: p ?? null, classes: d.classes, villages: d.villages, gs: d.grievances.filter((g) => p && g.ownerId === p.id) } : null; });
  const assignable = assignableRoles(role);
  return (
    <div className="space-y-4">
      <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm font-medium text-primary"><ArrowLeft />{tr("All users", "ಎಲ್ಲಾ ಬಳಕೆದಾರರು")}</Link>
      <QState q={q} isEmpty={(d) => !d} empty={<Empty title={tr("Account not found", "ಖಾತೆ ಸಿಗಲಿಲ್ಲ")} />}>{(d) => { const { u, p, classes, villages, gs } = d!; const mine = classes.filter((c) => p && c.roster.includes(p.id)); const myV = villages.filter((v) => p && v.volunteerIds.includes(p.id)); const ts = trainingStatusOf(classes, p?.id); const inv = u.invite; const invText = !inv ? null : inv.usedAt ? tr("Activated", "ಸಕ್ರಿಯಗೊಂಡಿದೆ") : "2026-10-20" > inv.expiresAt ? tr("Invite expired", "ಆಹ್ವಾನ ಅವಧಿ ಮುಗಿದಿದೆ") : tr(`Invite pending (until ${inv.expiresAt})`, `ಆಹ್ವಾನ ಬಾಕಿ (${inv.expiresAt} ವರೆಗೆ)`);
        return (<>
          <Card className="flex flex-wrap items-start justify-between gap-3">
            <div><h1 className="text-2xl font-bold">{u.name}</h1><p className="text-sm text-muted">{u.id}{p ? ` · ${p.id}` : ""}</p>
              <div className="mt-2 flex flex-wrap gap-2"><Badge tone="info">{RBAC_ROLES.find((r) => r.id === u.role)?.[lang]}</Badge><Badge tone={statusTone(u.status === "Active" ? "Approved" : u.status === "Inactive" ? "Pending" : "Rejected")}>{u.status}</Badge>{invText && <Badge tone={inv?.usedAt ? "success" : "warning"}>{invText}</Badge>}</div>
              {u.statusReason && <p className="mt-1 text-xs text-muted">{u.statusReason}</p>}</div>
            <div className="flex flex-wrap gap-2">{can("users", "edit") && u.status !== "Deleted" && <Link href={`/admin/users/${u.id}/edit`}><Button><PencilSimple />{tr("Edit", "ತಿದ್ದಿ")}</Button></Link>}</div>
          </Card>
          <Card><dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">{[[tr("Mobile", "ಮೊಬೈಲ್"), u.phone], ["Email", u.email || "—"], [tr("Date of birth", "ಹುಟ್ಟಿದ ದಿನಾಂಕ"), u.dob ?? "—"], [tr("Address", "ವಿಳಾಸ"), u.address ?? "—"], [tr("Location", "ಸ್ಥಳ"), [u.gp, u.taluk, u.district].filter(Boolean).join(", ") || "—"], [tr("Created / last login", "ರಚನೆ / ಕೊನೆಯ ಲಾಗಿನ್"), `${u.createdAt} / ${u.lastLogin ?? "—"}`]].map(([k, v]) => <div key={k}><dt className="text-muted">{k}</dt><dd className="break-words">{v}</dd></div>)}</dl></Card>
          {p && <div className="grid gap-4 lg:grid-cols-2">
            <Card><div className="flex items-center justify-between"><h2 className="font-bold">{tr("Training", "ತರಬೇತಿ")}</h2><Badge tone={ts === "Completed" ? "success" : ts === "Not registered" ? "neutral" : "info"}>{ts}</Badge></div>{mine.length === 0 ? <p className="mt-2 text-sm text-muted">{tr("Not registered for a session.", "ಅವಧಿಗೆ ನೋಂದಾಯಿಸಿಲ್ಲ.")}</p> : <ul className="mt-2 space-y-1 text-sm">{mine.map((c) => <li key={c.id}><Link className="text-primary underline" href={`/admin/training/${c.id}`}>{c.name}</Link> · {c.startDate} · {c.attendance[p.id]?.join(" / ")}{c.exceptions?.[p.id] && <Badge tone="warning" className="ml-1">{tr("Exception", "ವಿನಾಯಿತಿ")}</Badge>}{(c.certified ?? []).includes(p.id) && <Badge tone="success" className="ml-1">{tr("Certified", "ಪ್ರಮಾಣಿತ")}</Badge>}</li>)}</ul>}</Card>
            <Card><div className="flex items-center justify-between"><h2 className="font-bold">{tr("Assigned villages", "ನಿಯೋಜಿತ ಗ್ರಾಮಗಳು")}</h2>{can("villages", "edit") && u.status !== "Deleted" && <Button size="sm" variant="secondary" onClick={() => { setPick(myV.map((v) => v.id)); setDlg("villages"); }}>{tr("Assign villages", "ಗ್ರಾಮ ನಿಯೋಜಿಸಿ")}</Button>}</div>{myV.length === 0 ? <p className="mt-2 text-sm text-muted">—</p> : <ul className="mt-2 space-y-1 text-sm">{myV.map((v) => <li key={v.id}>{v.name} · {v.gp} <Badge>{v.status}</Badge></li>)}</ul>}</Card>
            <Card className="lg:col-span-2"><h2 className="font-bold">{tr("Grievance activity", "ದೂರು ಚಟುವಟಿಕೆ")}</h2>{gs.length === 0 ? <p className="mt-2 text-sm text-muted">—</p> : <ul className="mt-2 space-y-1 text-sm">{gs.map((g) => <li key={g.id}><Link className="text-primary underline" href={`/admin/grievances/${g.id}`}>{g.id}</Link> · {g.title} <Badge tone={statusTone(g.status)}>{g.status}</Badge></li>)}</ul>}</Card></div>}
          <Card className="space-y-3"><h2 className="font-bold">{tr("Account actions", "ಖಾತೆ ಕ್ರಮಗಳು")}</h2>
            <div className="flex flex-wrap gap-2">
              {can("users", "edit") && u.status !== "Deleted" && assignable.length > 0 && <Button variant="secondary" onClick={() => { setNewRole(assignable.includes(u.role) ? u.role : assignable[0]); setDlg("role"); }}>{tr("Change role", "ಪಾತ್ರ ಬದಲಿಸಿ")}</Button>}
              {manageUsers && u.status !== "Deleted" && (u.status === "Active" ? <><Button variant="secondary" onClick={() => { setToStatus("Inactive"); setReason(""); setDlg("status"); }}>{tr("Deactivate", "ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಿ")}</Button><Button variant="secondary" onClick={() => { setToStatus("Suspended"); setReason(""); setDlg("status"); }}>{tr("Suspend", "ತಡೆಹಿಡಿಯಿರಿ")}</Button></> : <Button onClick={() => act(() => api.users.setStatus(u.id, "Active", ""), tr("Account reactivated", "ಖಾತೆ ಮರುಸಕ್ರಿಯ"))}>{tr("Activate", "ಸಕ್ರಿಯಗೊಳಿಸಿ")}</Button>)}
              {manageUsers && u.status !== "Deleted" && <Button variant="secondary" onClick={async () => { const c = await act(() => api.users.reissueInvite(u.id)); if (typeof c === "string") setCode(c); }}>{tr("Issue new activation code", "ಹೊಸ ಸಕ್ರಿಯಗೊಳಿಸುವ ಕೋಡ್")}</Button>}
              {can("users", "delete") && (u.status === "Deleted" ? <Button variant="secondary" onClick={() => act(() => api.users.restore(u.id), tr("Restored as Inactive", "ನಿಷ್ಕ್ರಿಯವಾಗಿ ಮರುಸ್ಥಾಪಿಸಲಾಗಿದೆ"))}>{tr("Restore", "ಮರುಸ್ಥಾಪಿಸಿ")}</Button> : <Button variant="danger" onClick={() => setDlg("delete")}>{tr("Delete", "ಅಳಿಸಿ")}</Button>)}
            </div>
            {!manageUsers && <p className="text-xs text-muted">{tr("Your role cannot change account status or issue codes.", "ನಿಮ್ಮ ಪಾತ್ರ ಖಾತೆ ಸ್ಥಿತಿ ಬದಲಿಸಲು ಅಥವಾ ಕೋಡ್ ನೀಡಲು ಸಾಧ್ಯವಿಲ್ಲ.")}</p>}</Card>

          <Modal open={dlg === "role"} onClose={() => setDlg(null)} title={tr("Change role", "ಪಾತ್ರ ಬದಲಿಸಿ")} footer={<Button disabled={newRole === u.role} onClick={async () => { const r = await act(() => api.users.changeRole(u.id, newRole), tr("Role changed", "ಪಾತ್ರ ಬದಲಾಗಿದೆ")); if (r !== undefined) setDlg(null); }}>{tr("Change role", "ಪಾತ್ರ ಬದಲಿಸಿ")}</Button>}>
            <Field label={tr("New role", "ಹೊಸ ಪಾತ್ರ")} hint={tr("This changes what the person can see and do immediately. You can only assign roles below your own.", "ಇದು ವ್ಯಕ್ತಿ ಏನು ನೋಡಬಹುದು, ಮಾಡಬಹುದು ಎಂಬುದನ್ನು ತಕ್ಷಣ ಬದಲಿಸುತ್ತದೆ.")}>{(i) => <Select id={i} value={newRole} onChange={(e) => setNewRole(e.target.value as RbacRole)}>{[...new Set([u.role, ...assignable])].map((r) => <option key={r} value={r} disabled={!assignable.includes(r) && r !== u.role}>{RBAC_ROLES.find((x) => x.id === r)?.[lang]}</option>)}</Select>}</Field></Modal>
          <Modal open={dlg === "status"} onClose={() => setDlg(null)} title={`${u.name}: ${toStatus}`} footer={<Button variant="danger" onClick={async () => { if (reason.trim().length < 3) return void act(() => api.users.setStatus(u.id, toStatus, "")); const r = await act(() => api.users.setStatus(u.id, toStatus, reason), tr("Account updated", "ಖಾತೆ ನವೀಕರಿಸಲಾಗಿದೆ")); if (r !== undefined) setDlg(null); }}>{tr("Confirm", "ದೃಢೀಕರಿಸಿ")}</Button>}><Field label={tr("Reason (required)", "ಕಾರಣ (ಅಗತ್ಯ)")}>{(i) => <Textarea id={i} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />}</Field></Modal>
          <Modal open={dlg === "villages"} onClose={() => setDlg(null)} title={tr("Assign villages", "ಗ್ರಾಮ ನಿಯೋಜಿಸಿ")} footer={<Button onClick={async () => { const r = await act(() => api.users.assignVillages(u.id, pick), tr("Villages updated", "ಗ್ರಾಮಗಳು ನವೀಕರಿಸಲಾಗಿದೆ")); if (r !== undefined) setDlg(null); }}>{tr("Save", "ಉಳಿಸಿ")}</Button>}>
            <p className="text-sm text-muted">{tr("Villages in the same block / taluk", "ಅದೇ ಬ್ಲಾಕ್ / ತಾಲ್ಲೂಕಿನ ಗ್ರಾಮಗಳು")}: {u.taluk || "—"}</p>
            {villages.filter((v) => v.taluk === u.taluk || pick.includes(v.id)).length === 0 ? <p className="text-sm text-muted">{tr("No villages registered in this block yet.", "ಈ ಬ್ಲಾಕ್‌ನಲ್ಲಿ ಇನ್ನೂ ಗ್ರಾಮಗಳಿಲ್ಲ.")}</p> : villages.filter((v) => v.taluk === u.taluk || pick.includes(v.id)).map((v) => <Check key={v.id} label={`${v.name} · ${v.gp} (${v.status})`} checked={pick.includes(v.id)} onChange={(e) => setPick(e.target.checked ? [...pick, v.id] : pick.filter((x) => x !== v.id))} />)}</Modal>
          <Confirm open={dlg === "delete"} onClose={() => setDlg(null)} danger onConfirm={async () => { const r = await act(() => api.users.remove(u.id), tr("Account deleted — records preserved", "ಖಾತೆ ಅಳಿಸಲಾಗಿದೆ — ದಾಖಲೆಗಳು ಉಳಿದಿವೆ")); if (r !== undefined) { setDlg(null); router.push("/admin/users"); } }} title={tr("Delete this account?", "ಈ ಖಾತೆ ಅಳಿಸುವಿರಾ?")} confirmLabel={tr("Delete account", "ಖಾತೆ ಅಳಿಸಿ")} body={tr("The person can no longer sign in. Their training, attendance and grievance records are preserved, and the account can be restored.", "ಈ ವ್ಯಕ್ತಿ ಇನ್ನು ಸೈನ್ ಇನ್ ಮಾಡಲಾರರು. ಅವರ ದಾಖಲೆಗಳು ಉಳಿಯುತ್ತವೆ; ಖಾತೆಯನ್ನು ಮರುಸ್ಥಾಪಿಸಬಹುದು.")} />
          {code && <ActivationCodeDialog open code={code} name={u.name} userId={u.id} onClose={() => setCode(null)} />}
        </>); }}</QState>
    </div>
  );
}
