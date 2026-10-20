"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as S from "./seed";
import type * as T from "./types";
import { acs, gps, districtOf } from "./seed-geo";

// In-memory mock database. Contains synthetic data only. Components never mutate
// these arrays directly: all writes go through the actions below (via lib/api.ts).
export interface DbData {
  applications: T.Application[]; participants: T.Participant[]; classes: T.TrainingClass[]; cycle: T.TrainingCycle;
  courses: T.Course[]; questions: T.Question[]; progress: Record<string, T.LessonProgress>; enrolled: string[];
  residents: T.Resident[]; voters: T.VoterRecord[]; grievances: T.Grievance[]; events: T.EventItem[];
  ledger: T.LedgerEntry[]; rules: T.RewardRule[]; redemptions: T.Redemption[]; certificates: T.Certificate[];
  notifications: T.Notification[]; templates: T.Template[]; audit: T.AuditEntry[]; consents: T.ConsentRecord[];
  requests: { id: string; kind: string; at: string; status: string }[]; savedDrafts: T.Template[];
  myApplicationId: string | null; appDraft: Record<string, unknown>;
  settings: { passThreshold: number; videoThreshold: number; attendanceRule: string; noticeVersion: string; leaderboardPublic: boolean };
}
const initial = (): DbData => structuredClone({
  applications: S.applications, participants: S.participants, classes: S.classes, cycle: S.cycle, courses: S.courses, questions: S.questions,
  progress: S.progress, enrolled: ["C-PR", "C-GR"], residents: S.residents, voters: S.voterRecords, grievances: S.grievances, events: S.events,
  ledger: S.ledger, rules: S.rules, redemptions: [], certificates: S.certificates, notifications: S.notifications, templates: S.templates,
  audit: S.audit, consents: S.consents, requests: [], savedDrafts: [], myApplicationId: null, appDraft: {},
  settings: { passThreshold: 70, videoThreshold: 90, attendanceRule: "Both days present (or approved exception)", noticeVersion: "1.2-demo", leaderboardPublic: true },
});
const now = () => new Date().toISOString().slice(0, 16).replace("T", " ");
let seq = 5000;
const nid = (p: string) => `${p}-${++seq}`;

export interface RoleUser { name: string; label: string; scope: { district?: string; ac?: string; gp?: string } }
export const roleUsers: Record<T.Role, RoleUser> = {
  state: { name: "Meena Reviewer", label: "State", scope: {} },
  district: { name: "Dinesh (District)", label: "Mysuru district", scope: { district: "Mysuru" } },
  ac: { name: "Chitra (AC)", label: "Demo AC – Nanjangud North", scope: { ac: "Demo AC – Nanjangud North" } },
  local: { name: "Mohan (Local)", label: "Hosahalli GP", scope: { gp: "Hosahalli GP" } },
  trainer: { name: "Savitha Rao", label: "Trainer T-1", scope: {} },
  participant: { name: "Ananya Gowda", label: "P-1042", scope: { gp: "Hosahalli GP" } },
};
export function inScope(role: T.Role, r: { district?: string; gp?: string; taluk?: string }) {
  const sc = roleUsers[role].scope;
  const taluk = r.taluk ?? gps.find((g) => g.name === r.gp)?.taluk;
  const district = r.district ?? (taluk ? districtOf(taluk) : undefined);
  if (sc.district) return district === sc.district;
  if (sc.gp) return r.gp === sc.gp;
  if (sc.ac) return !!taluk && !!acs.find((a) => a.name === sc.ac)?.taluks.includes(taluk);
  return true;
}

interface Actions {
  reset: () => void;
  log: (e: Omit<T.AuditEntry, "id" | "at">) => void;
  patch: (fn: (d: DbData) => void) => void;
}
export const useDb = create<DbData & Actions>()(
  persist(
    (set) => ({
      ...initial(),
      reset: () => set({ ...initial() }),
      patch: (fn) => set((s) => { const d = structuredClone(strip(s)); fn(d); return d; }),
      log: (e) => set((s) => ({ audit: [{ id: nid("AU"), at: now(), ...e }, ...s.audit] })),
    }),
    { name: "gn-demo-db-v1", storage: createJSONStorage(() => localStorage), partialize: (s) => strip(s) as never },
  ),
);
function strip(s: DbData & Partial<Actions>): DbData {
  const { reset, log, patch, ...data } = s as DbData & Actions; void reset; void log; void patch; return data;
}
export const getDb = () => useDb.getState();
export { nid, now };
