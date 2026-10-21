import type * as T from "./types";
import { acs, districtOf, districts, gps } from "./seed-geo";
import { trainers } from "./seed";

export interface RoleUser { name: string; label: string; scope: { district?: string; ac?: string; gp?: string } }
export const roleUsers: Record<T.Role, RoleUser> = {
  state: { name: "Meena Reviewer", label: "State", scope: {} },
  district: { name: "Dinesh (District)", label: "Mysuru district", scope: { district: "Mysuru" } },
  ac: { name: "Chitra (AC)", label: "Demo AC – Nanjangud North", scope: { ac: "Demo AC – Nanjangud North" } },
  local: { name: "Mohan (Local)", label: "Hosahalli GP", scope: { gp: "Hosahalli GP" } },
  trainer: { name: "Savitha Rao", label: "Trainer T-1", scope: {} },
  coordinator: { name: "Neha Coordinator", label: "Training", scope: {} },
  grievance: { name: "Girish Grievance", label: "Grievances", scope: {} },
  content: { name: "Charu Content", label: "Content", scope: {} },
  participant: { name: "Ananya Gowda", label: "P-1042", scope: { gp: "Hosahalli GP" } },
};
// ---- Selectable scope -------------------------------------------------------------------------
// A role's assigned scope is fixed (roleUsers). Inside it, the user can narrow the view with the scope switcher.
export type ScopeSel = Partial<Record<T.Role, string>>;
let active: ScopeSel = {};
/** Called by the preferences store whenever the selection changes or is restored. */
export const setActiveScope = (sel: ScopeSel | undefined) => { active = sel ?? {}; };
export const activeScope = (role: T.Role) => active[role] ?? "all";
/** The trainer a Trainer session is acting as (default T-1). */
export const activeTrainerId = () => { const v = active.trainer; return v && v.startsWith("t:") ? v.slice(2) : "T-1"; };
export const actorName = (role: T.Role) => (role === "trainer" ? trainers.find((t) => t.id === activeTrainerId())?.name ?? roleUsers.trainer.name : roleUsers[role].name);

export function inScope(role: T.Role, r: { district?: string; gp?: string; taluk?: string }) {
  const sc = roleUsers[role].scope;
  const taluk = r.taluk ?? gps.find((g) => g.name === r.gp)?.taluk;
  const district = r.district ?? (taluk ? districtOf(taluk) : undefined);
  let base = true;
  if (sc.district) base = district === sc.district;
  else if (sc.gp) base = r.gp === sc.gp;
  else if (sc.ac) base = !!taluk && !!acs.find((a) => a.name === sc.ac)?.taluks.includes(taluk);
  if (!base) return false;
  const v = active[role];
  if (!v || v === "all") return true;
  if (v.startsWith("d:")) return district === v.slice(2);
  if (v.startsWith("g:")) return r.gp === v.slice(2);
  return true; // "t:" (trainer persona) does not narrow geography
}

export interface ScopeOption { value: string; label: string; hint?: string }
export interface ScopeGroup { label: string; options: ScopeOption[] }
type Tr = (en: string, kn: string) => string;
/** The scope choices a role may switch between. `locked` means the role has a single, fixed area. */
export function scopeGroups(role: T.Role, tr: Tr): { groups: ScopeGroup[]; locked: boolean } {
  const gpOpt = (g: { name: string; taluk: string }): ScopeOption => ({ value: `g:${g.name}`, label: g.name, hint: `${g.taluk}, ${districtOf(g.taluk)}` });
  const sc = roleUsers[role].scope;
  if (role === "trainer") return { locked: false, groups: [{ label: tr("Act as trainer", "ತರಬೇತುದಾರರಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸಿ"), options: trainers.map((t) => ({ value: `t:${t.id}`, label: t.name, hint: t.id })) }] };
  if (sc.gp) return { locked: true, groups: [{ label: tr("Assigned area", "ನಿಯೋಜಿತ ಪ್ರದೇಶ"), options: [{ value: "all", label: sc.gp, hint: tr("Fixed by your role", "ನಿಮ್ಮ ಪಾತ್ರದಿಂದ ನಿಗದಿ") }] }] };
  if (sc.district) return { locked: false, groups: [{ label: tr("Your district", "ನಿಮ್ಮ ಜಿಲ್ಲೆ"), options: [{ value: "all", label: tr(`${sc.district} district (all)`, `${sc.district} ಜಿಲ್ಲೆ (ಎಲ್ಲಾ)`) }] }, { label: tr("Gram Panchayats in this district", "ಈ ಜಿಲ್ಲೆಯ ಗ್ರಾಮ ಪಂಚಾಯತ್‌ಗಳು"), options: gps.filter((g) => districtOf(g.taluk) === sc.district).map(gpOpt) }] };
  if (sc.ac) { const ac = acs.find((a) => a.name === sc.ac); return { locked: false, groups: [{ label: tr("Your constituency", "ನಿಮ್ಮ ಕ್ಷೇತ್ರ"), options: [{ value: "all", label: tr(`${sc.ac} (all)`, `${sc.ac} (ಎಲ್ಲಾ)`) }] }, { label: tr("Gram Panchayats in this constituency", "ಈ ಕ್ಷೇತ್ರದ ಗ್ರಾಮ ಪಂಚಾಯತ್‌ಗಳು"), options: gps.filter((g) => ac?.taluks.includes(g.taluk)).map(gpOpt) }] }; }
  return { locked: false, groups: [
    { label: tr("Whole programme", "ಇಡೀ ಕಾರ್ಯಕ್ರಮ"), options: [{ value: "all", label: tr("All Karnataka", "ಇಡೀ ಕರ್ನಾಟಕ") }] },
    { label: tr("Districts", "ಜಿಲ್ಲೆಗಳು"), options: districts.map((d) => ({ value: `d:${d}`, label: tr(`${d} district`, `${d} ಜಿಲ್ಲೆ`) })) },
    { label: tr("Gram Panchayats", "ಗ್ರಾಮ ಪಂಚಾಯತ್‌ಗಳು"), options: gps.map(gpOpt) },
  ] };
}
export function scopeLabel(role: T.Role, tr: Tr): string {
  const { groups } = scopeGroups(role, tr); const v = activeScope(role);
  const all = groups.flatMap((g) => g.options);
  return (all.find((o) => o.value === v) ?? all[0])?.label ?? "";
}
