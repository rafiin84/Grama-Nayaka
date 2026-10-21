import * as S from "./seed";
import type * as T from "./types";
import { defaultRbac } from "./rbac";

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
  users: T.User[]; villages: T.Village[]; resources: T.LearningResource[]; resourceCategories: T.ResourceCategory[]; rbac: Record<T.RbacRole, T.RolePerm>;
  settings: { passThreshold: number; videoThreshold: number; attendanceRule: string; noticeVersion: string; leaderboardPublic: boolean };
}
export const initial = (): DbData => structuredClone({
  applications: S.applications, participants: S.participants, classes: S.classes, cycle: S.cycle, courses: S.courses, questions: S.questions,
  progress: S.progress, enrolled: ["C-PR", "C-GR"], residents: S.residents, voters: S.voterRecords, grievances: S.grievances, events: S.events,
  ledger: S.ledger, rules: S.rules, redemptions: [], certificates: S.certificates, notifications: S.notifications, templates: S.templates,
  audit: S.audit, consents: S.consents, users: S.users, villages: S.villages, resources: S.resources, resourceCategories: S.resourceCategories, rbac: defaultRbac(), requests: [], savedDrafts: [], myApplicationId: null, appDraft: {},
  settings: { passThreshold: 70, videoThreshold: 90, attendanceRule: "Both days present (or approved exception)", noticeVersion: "1.2-demo", leaderboardPublic: true },
});
