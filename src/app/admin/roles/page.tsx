"use client";
import { useState } from "react";
import { LockKey } from "@phosphor-icons/react";
import { Badge, Button, Card, Confirm, DemoNote, PageHeader, Select, Tabs } from "@/components/ui";
import { toast } from "sonner";
import { api, ApiError, useAct } from "@/lib/api";
import { useDb } from "@/lib/db";
import { ACTIONS, MODULES, RBAC_ROLES, roleOfSession } from "@/lib/rbac";
import { usePrefs } from "@/lib/store";
import { useT } from "@/lib/useT";
import type { RbacRole, RolePerm } from "@/lib/types";

export default function RolesPage() {
  const { tr, lang } = useT(); const act = useAct(); const session = usePrefs((s) => s.role); const isSuper = roleOfSession[session] === "superAdmin";
  const [sel, setSel] = useState<RbacRole>("districtAdmin"); const [tab, setTab] = useState<"matrix" | "summary">("matrix"); const [reset, setReset] = useState(false);
  const rbac = useDb((st) => st.rbac); const users = useDb((st) => st.users);
  const counts = Object.fromEntries(RBAC_ROLES.map((r) => [r.id, users.filter((u) => u.role === r.id && u.status !== "Deleted").length])) as Record<RbacRole, number>;
  /** Permission edits apply instantly (no mock latency) so checkboxes feel immediate. */
  const apply = (fn: () => void, ok?: string) => { try { fn(); if (ok) toast.success(ok); } catch (e) { toast.error(e instanceof ApiError ? e.message : (e as Error).message); } };
  const scopeLabel: Record<RolePerm["scope"], string> = { all: tr("Whole programme", "ಇಡೀ ಕಾರ್ಯಕ್ರಮ"), district: tr("Assigned district", "ನಿಯೋಜಿತ ಜಿಲ್ಲೆ"), block: tr("Assigned block / taluk", "ನಿಯೋಜಿತ ಬ್ಲಾಕ್ / ತಾಲ್ಲೂಕು"), gp: tr("Assigned Gram Panchayat", "ನಿಯೋಜಿತ ಗ್ರಾಮ ಪಂಚಾಯತ್"), own: tr("Own records only", "ಸ್ವಂತ ದಾಖಲೆ ಮಾತ್ರ") };
  return (
    <div className="space-y-4">
      <PageHeader title={tr("Roles & Permissions", "ಪಾತ್ರ ಮತ್ತು ಅನುಮತಿ")} sub={tr("Decide what each role can see and do. District and Block Admins stay inside their jurisdiction. Changes take effect immediately in this demo.", "ಪ್ರತಿ ಪಾತ್ರ ಏನು ನೋಡಬಹುದು, ಮಾಡಬಹುದು ಎಂದು ನಿರ್ಧರಿಸಿ. ಜಿಲ್ಲಾ ಮತ್ತು ಬ್ಲಾಕ್ ಅಡ್ಮಿನ್ ತಮ್ಮ ವ್ಯಾಪ್ತಿಯೊಳಗೇ ಇರುತ್ತಾರೆ. ಈ ಡೆಮೊದಲ್ಲಿ ಬದಲಾವಣೆ ತಕ್ಷಣ ಜಾರಿಗೆ ಬರುತ್ತದೆ.")} actions={isSuper && <Button variant="secondary" onClick={() => setReset(true)}>{tr("Reset to defaults", "ಡೀಫಾಲ್ಟ್‌ಗೆ ಮರುಹೊಂದಿಸಿ")}</Button>} />
      {!isSuper && <Card className="flex items-center gap-2 border-warning/50 text-sm"><LockKey size={20} className="text-warning" />{tr("Read-only. Only the Super Admin can change permissions or grant Super Admin.", "ಓದಲು ಮಾತ್ರ. ಅನುಮತಿ ಬದಲಿಸಲು ಅಥವಾ ಸೂಪರ್ ಅಡ್ಮಿನ್ ನೀಡಲು ಸೂಪರ್ ಅಡ್ಮಿನ್‌ಗೆ ಮಾತ್ರ ಅವಕಾಶ.")}</Card>}
      <Tabs tabs={[{ id: "matrix", label: tr("Edit a role", "ಪಾತ್ರ ತಿದ್ದಿ") }, { id: "summary", label: tr("All roles at a glance", "ಎಲ್ಲಾ ಪಾತ್ರಗಳ ಸಾರಾಂಶ") }]} value={tab} onChange={setTab} />
      {tab === "summary" ? (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card"><table className="w-full min-w-[760px] text-sm"><thead className="bg-accent-soft/60 text-xs uppercase text-muted"><tr><th className="px-3 py-2 text-left">{tr("Module", "ಮಾಡ್ಯೂಲ್")}</th>{RBAC_ROLES.map((r) => <th key={r.id} className="px-2 py-2 text-center">{r[lang]}<br /><span className="font-normal normal-case">({counts[r.id]})</span></th>)}</tr></thead>
          <tbody className="divide-y divide-border">{MODULES.map((m) => <tr key={m.id}><td className="px-3 py-2 font-medium">{m[lang]}</td>{RBAC_ROLES.map((r) => { const a = rbac[r.id].modules[m.id] ?? []; return <td key={r.id} className="px-2 py-2 text-center">{a.length === 0 ? <span className="text-muted">—</span> : <span title={a.join(", ")} className="inline-block rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-primary">{a.length === 6 ? tr("Full", "ಪೂರ್ಣ") : a.map((x) => x[0].toUpperCase()).join("")}</span>}</td>; })}</tr>)}</tbody></table>
          <p className="p-3 text-xs text-muted">V = view, C = create, E = edit, D = delete, A = approve, E = export. {tr("Hover a cell for the exact list.", "ನಿಖರ ಪಟ್ಟಿಗೆ ಸೆಲ್ ಮೇಲೆ ಹೋಗಿ.")}</p></div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="space-y-2">{RBAC_ROLES.map((r) => <button key={r.id} onClick={() => setSel(r.id)} aria-pressed={sel === r.id} className={`w-full rounded-2xl border p-3 text-left transition ${sel === r.id ? "border-transparent bg-primary text-primary-fg" : "border-border bg-card hover:border-primary"}`}><span className="flex items-center justify-between font-semibold">{r[lang]}<span className="text-xs opacity-80">{counts[r.id]} {counts[r.id] === 1 ? tr("user", "ಬಳಕೆದಾರ") : tr("users", "ಬಳಕೆದಾರರು")}</span></span></button>)}</div>
          <Card className="min-w-0 space-y-4">
            {(() => { const meta = RBAC_ROLES.find((r) => r.id === sel)!; const perm = rbac[sel]; const locked = !isSuper || sel === "superAdmin"; return (<>
              <div><h2 className="text-lg font-bold">{meta[lang]}</h2><p className="text-sm text-muted">{meta.note[lang]}</p>{sel === "superAdmin" && <Badge tone="warning" className="mt-2">{tr("Fixed: always has full access", "ಸ್ಥಿರ: ಯಾವಾಗಲೂ ಪೂರ್ಣ ಪ್ರವೇಶ")}</Badge>}</div>
              <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium">{tr("Data scope", "ಡೇಟಾ ವ್ಯಾಪ್ತಿ")}<Select disabled={locked} value={perm.scope} onChange={(e) => apply(() => api.rbac.setScope(sel, e.target.value as RolePerm["scope"]), tr("Scope updated", "ವ್ಯಾಪ್ತಿ ನವೀಕರಿಸಲಾಗಿದೆ"))} className="mt-1">{(Object.keys(scopeLabel) as RolePerm["scope"][]).map((k) => <option key={k} value={k}>{scopeLabel[k]}</option>)}</Select></label>
                <div className="space-y-2 text-sm">{([["manageUsers", tr("Can manage users (status, password reset)", "ಬಳಕೆದಾರರನ್ನು ನಿರ್ವಹಿಸಬಹುದು (ಸ್ಥಿತಿ, ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಕೆ)")], ["changeSettings", tr("Can change application settings", "ಅಪ್ಲಿಕೇಶನ್ ಸೆಟ್ಟಿಂಗ್ ಬದಲಿಸಬಹುದು")]] as const).map(([k, l]) => <label key={k} className="flex items-start gap-2"><input type="checkbox" disabled={locked} checked={sel === "superAdmin" ? true : perm[k]} onChange={(e) => apply(() => api.rbac.setFlag(sel, k, e.target.checked))} className="mt-1 h-4 w-4 accent-[var(--primary)]" />{l}</label>)}</div></div>
              <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full min-w-[560px] text-sm"><thead className="bg-accent-soft/60 text-xs uppercase text-muted"><tr><th className="px-3 py-2 text-left">{tr("Module", "ಮಾಡ್ಯೂಲ್")}</th>{ACTIONS.map((a) => <th key={a.id} className="px-2 py-2 text-center">{a[lang]}</th>)}</tr></thead>
                <tbody className="divide-y divide-border">{MODULES.map((m) => <tr key={m.id}><td className="px-3 py-2 font-medium">{m[lang]}</td>{ACTIONS.map((a) => { const on = sel === "superAdmin" || (perm.modules[m.id] ?? []).includes(a.id); return <td key={a.id} className="px-2 py-2 text-center"><input type="checkbox" aria-label={`${m.en} ${a.en}`} disabled={locked} checked={on} onChange={(e) => apply(() => api.rbac.setAction(sel, m.id, a.id, e.target.checked))} className="h-4 w-4 accent-[var(--primary)]" /></td>; })}</tr>)}</tbody></table></div>
              <p className="text-xs text-muted">{tr("Turning on any action also turns on View. Turning off View removes every action for that module.", "ಯಾವುದೇ ಕ್ರಿಯೆ ಆನ್ ಮಾಡಿದರೆ 'ನೋಡಿ' ಸಹ ಆನ್ ಆಗುತ್ತದೆ. 'ನೋಡಿ' ಆಫ್ ಮಾಡಿದರೆ ಆ ಮಾಡ್ಯೂಲ್‌ನ ಎಲ್ಲಾ ಕ್ರಿಯೆ ತೆಗೆಯಲಾಗುತ್ತದೆ.")}</p></>); })()}
          </Card>
        </div>)}
      <DemoNote>{tr("Frontend permissions are a UI simulation, not a security boundary. A real deployment must enforce roles, jurisdiction and permissions on the server.", "ಫ್ರಂಟೆಂಡ್ ಅನುಮತಿಗಳು UI ಸಿಮ್ಯುಲೇಶನ್ ಮಾತ್ರ; ಭದ್ರತಾ ಗಡಿಯಲ್ಲ. ನಿಜವಾದ ಬಳಕೆಯಲ್ಲಿ ಪಾತ್ರ, ವ್ಯಾಪ್ತಿ ಮತ್ತು ಅನುಮತಿಗಳನ್ನು ಸರ್ವರ್‌ನಲ್ಲಿ ಜಾರಿಗೊಳಿಸಬೇಕು.")}</DemoNote>
      <Confirm open={reset} onClose={() => setReset(false)} danger onConfirm={async () => { await act(() => api.rbac.reset(), tr("Permissions reset", "ಅನುಮತಿ ಮರುಹೊಂದಿಸಲಾಗಿದೆ")); setReset(false); }} title={tr("Reset all permissions?", "ಎಲ್ಲಾ ಅನುಮತಿ ಮರುಹೊಂದಿಸುವಿರಾ?")} confirmLabel={tr("Reset", "ಮರುಹೊಂದಿಸಿ")} body={tr("Every role returns to its default permissions.", "ಪ್ರತಿ ಪಾತ್ರ ತನ್ನ ಡೀಫಾಲ್ಟ್ ಅನುಮತಿಗೆ ಮರಳುತ್ತದೆ.")} />
    </div>
  );
}
