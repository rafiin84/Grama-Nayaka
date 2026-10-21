export type L = { kn: string; en: string };
/** Demo session roles. Each maps to an RBAC role (see rbac.ts). */
export type Role = "state" | "district" | "ac" | "local" | "coordinator" | "trainer" | "grievance" | "content" | "participant";
export type RbacRole = "superAdmin" | "districtAdmin" | "blockAdmin" | "trainingCoordinator" | "trainer" | "volunteer" | "grievanceManager" | "contentManager";
export type Module = "dashboard" | "applications" | "participants" | "users" | "villages" | "roles" | "training" | "learning" | "community" | "grievances" | "events" | "rewards" | "reports" | "templates" | "audit" | "settings" | "resources";
export type Action = "view" | "create" | "edit" | "delete" | "approve" | "export";
export interface RolePerm { modules: Partial<Record<Module, Action[]>>; manageUsers: boolean; changeSettings: boolean; scope: "all" | "district" | "block" | "gp" | "own" }
export type AccountStatus = "Active" | "Inactive" | "Suspended" | "Deleted";
export interface User {
  id: string; name: string; phone: string; email: string; role: RbacRole; status: AccountStatus;
  district: string; taluk: string; gp: string; participantId?: string;
  createdAt: string; lastLogin?: string; passwordReset?: string; statusReason?: string;
  dob?: string; address?: string;
  /** Activation invite: only a hash of the one-time code is stored, never the code or a password. */
  invite?: { tokenHash: string; expiresAt: string; usedAt?: string };
}
export interface Village {
  id: string; name: string; gp: string; taluk: string; district: string; population?: number;
  status: "Enrolled" | "Pending" | "Inactive"; enrolledOn?: string; volunteerIds: string[];
}
export interface Material { id: string; name: string; size: number; uploadedAt: string; uploadedBy: string; blobId?: string; mime?: string }

export type AppStatus = "Draft" | "Submitted" | "Under Review" | "Shortlisted" | "Approved" | "Not Selected" | "Withdrawn";
export interface Application {
  id: string; name: string; phone: string; dob: string; age: number; gender: string;
  district: string; ac: string; taluk: string; gp: string;
  education: string; institution: string; field: string; motivation: string;
  verification: "Simulated – not verified" | "Simulated – matched";
  consentReceipt: string; status: AppStatus; submittedAt: string;
  history: { status: AppStatus; at: string; by: string }[];
  internalNotes: string[]; candidateNote?: string;
}
export interface Participant {
  id: string; appId: string; name: string; district: string; ac: string; taluk: string; gp: string;
  cohort?: "A" | "B" | "C"; classId?: string; trainingDone: boolean; lmsProgress: number;
  points: number; publicLeaderboard: boolean; phoneMasked: string;
}
export type AttStatus = "Present" | "Late" | "Absent" | "Excused" | "Not Recorded";
export interface TrainingClass {
  id: string; name: string; cohort: "A" | "B" | "C"; days: [number, number]; startDate: string;
  trainerId: string; room: string; capacity: number; roster: string[]; waitlist: string[];
  attendance: Record<string, [AttStatus, AttStatus]>;
  attendanceLog: { at: string; by: string; pid: string; day: 1 | 2; from: AttStatus; to: AttStatus; reason: string }[];
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  location?: string; duration?: number; coordinatorId?: string; materials?: Material[]; certified?: string[]; cancelReason?: string;
  description?: string; region?: string; registrationDeadline?: string; publish?: "Draft" | "Published";
  /** Approved completion exceptions (attendance did not meet the rule). */
  exceptions?: Record<string, { reason: string; by: string; at: string }>;
}
export interface Trainer { id: string; name: string }
export interface TrainingCycle {
  id: string; name: string; venue: string; startDate: string; status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  classIds: string[];
}
export type LessonType = "video" | "reading" | "quiz" | "assignment" | "reflection";
export interface Lesson {
  id: string; title: L; type: LessonType; minutes: number; summary: L;
  body?: L; takeaways?: L[]; transcript?: L; glossary?: { term: L; def: L }[]; questionIds?: string[];
}
export interface Course {
  id: string; title: L; summary: L; topic: string; instructor: string; languages: ("kn" | "en")[];
  minutes: number; lessons: Lesson[]; objectives: L[]; prerequisites: string[];
  status: "Published" | "Draft" | "Archived"; version: number; passMark: number;
}
export interface Question { id: string; q: L; options: L[]; answer: number; explain: L }
export interface LessonProgress { done: boolean; watchedPct?: number; positionSec?: number; attempts?: { score: number; total: number; at: string; answers: number[] }[]; reflection?: "Submitted" | "In Review" }
export type GStatus = "Open" | "In Progress" | "Follow-up Due" | "Escalated" | "Closure Pending" | "Closed" | "Reopened";
export interface Grievance {
  id: string; title: string; category: string; description: string; locality: string; gp: string; district: string;
  urgency: "Low" | "Medium" | "High"; status: GStatus; ownerId: string; residentRef?: string; createdAt: string;
  observed: string; nextAction: string; followUpDate: string; pathway?: string; outcome?: string; groupId?: string;
  timeline: { at: string; actor: string; action: string; from?: GStatus; to?: GStatus; note?: string }[];
}
export interface Resident {
  id: string; name: string; locality: string; gp: string; district: string; language: "kn" | "en"; contactPref: string;
  notice: "Given" | "Pending"; collectedOn: string; source: string; notes: string; correction?: "Requested" | "Completed";
}
export interface VoterRecord {
  id: string; residentId: string; epicMasked: string; consent: "Granted" | "Pending" | "Withdrawn";
  verification: "Not verified externally"; source: string; collectedOn: string; accessLog: { at: string; by: string }[];
}
export interface EventItem {
  id: string; title: L; category: string; date: string; time: string; venue: string; district: string; language: "kn" | "en" | "both";
  audience: string; capacity: number; registered: string[]; waitlist: string[]; status: "Upcoming" | "Past" | "Draft" | "Cancelled";
  agenda: L[]; description: L; attended: string[];
}
export interface LedgerEntry { id: string; pid: string; at: string; category: string; points: number; reason: string; verified: boolean }
export interface RewardRule { id: string; category: string; points: number; cap: number; verification: string; approval: boolean; effective: string }
export interface Reward { id: string; title: L; cost: number }
export interface Redemption { id: string; rewardId: string; at: string; status: "Pending" | "Approved" | "Rejected" }
export interface Certificate { id: string; kind: "Classroom" | "Course" | "Assessment" | "Milestone"; title: L; issued: string; courseId?: string }
export interface Notification { id: string; tab: "Learning" | "Training" | "Community" | "Rewards" | "System"; title: L; body: L; at: string; read: boolean; href: string }
export interface Template { id: string; name: string; purpose: string; kn: string; en: string; status: "Draft" | "Published" | "Archived"; uses: number }
export interface AuditEntry { id: string; at: string; actor: string; role: string; action: string; resourceType: string; resourceId: string; before?: string; after?: string }
export interface ConsentRecord {
  receiptId: string; noticeVersion: string; purposeId: string; status: "granted" | "declined" | "withdrawn" | "not-applicable";
  actionTimestamp: string; language: "kn" | "en"; sourceScreen: string; subject: string; withdrawalTimestamp?: string; withdrawalReason?: string;
}
export interface Draft { name?: string; phone?: string; [k: string]: unknown }

export type ResourceType = "videoFile" | "videoLink" | "pdf" | "document" | "link";
export type ResourceStatus = "Draft" | "Published" | "Scheduled" | "Archived";
export type Audience = "volunteers" | "trainers" | "coordinators" | "admins";
export interface ResourceCategory { id: string; name: L; order: number }
export interface MediaRef { name: string; size: number; mime: string; blobId?: string; path?: string }
export interface LearningResource {
  id: string; title: string; short: string; full: string; categoryId: string; topic: string; type: ResourceType;
  url?: string; file?: MediaRef; thumb?: MediaRef; language: "kn" | "en" | "both"; audience: Audience[];
  order: number; status: ResourceStatus; publishDate?: string; createdAt: string; updatedAt: string; credit?: string;
}
