import type { Action, Module, RbacRole, RolePerm, Role } from "./types";

export const MODULES: { id: Module; en: string; kn: string; href: string }[] = [
  { id: "dashboard", en: "Dashboard", kn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", href: "/admin" },
  { id: "applications", en: "Applications", kn: "ಅರ್ಜಿಗಳು", href: "/admin/applications" },
  { id: "participants", en: "Participants", kn: "ಭಾಗವಹಿಸುವವರು", href: "/admin/participants" },
  { id: "users", en: "Users & Volunteers", kn: "ಬಳಕೆದಾರರು ಮತ್ತು ಸ್ವಯಂಸೇವಕರು", href: "/admin/users" },
  { id: "villages", en: "Village Enrollment", kn: "ಗ್ರಾಮ ನೋಂದಣಿ", href: "/admin/villages" },
  { id: "roles", en: "Roles & Permissions", kn: "ಪಾತ್ರ ಮತ್ತು ಅನುಮತಿ", href: "/admin/roles" },
  { id: "training", en: "Training", kn: "ತರಬೇತಿ", href: "/admin/training" },
  { id: "resources", en: "Learning Resources", kn: "ಕಲಿಕಾ ಸಂಪನ್ಮೂಲಗಳು", href: "/admin/resources" },
  { id: "learning", en: "Learning (LMS)", kn: "ಕಲಿಕೆ (LMS)", href: "/admin/lms" },
  { id: "community", en: "Community Records", kn: "ಸಮುದಾಯ ದಾಖಲೆಗಳು", href: "/admin/records" },
  { id: "grievances", en: "Grievances", kn: "ದೂರುಗಳು", href: "/admin/grievances" },
  { id: "events", en: "Events", kn: "ಕಾರ್ಯಕ್ರಮಗಳು", href: "/admin/events" },
  { id: "rewards", en: "Rewards", kn: "ಪುರಸ್ಕಾರ", href: "/admin/rewards" },
  { id: "reports", en: "Reports", kn: "ವರದಿಗಳು", href: "/admin/reports" },
  { id: "templates", en: "Templates", kn: "ಟೆಂಪ್ಲೇಟ್‌ಗಳು", href: "/admin/templates" },
  { id: "audit", en: "Audit Log", kn: "ಆಡಿಟ್ ಲಾಗ್", href: "/admin/audit" },
  { id: "settings", en: "Settings", kn: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು", href: "/admin/settings" },
];
export const ACTIONS: { id: Action; en: string; kn: string }[] = [
  { id: "view", en: "View", kn: "ನೋಡಿ" }, { id: "create", en: "Create", kn: "ರಚಿಸಿ" }, { id: "edit", en: "Edit", kn: "ತಿದ್ದಿ" },
  { id: "delete", en: "Delete", kn: "ಅಳಿಸಿ" }, { id: "approve", en: "Approve / reject", kn: "ಅನುಮೋದನೆ / ತಿರಸ್ಕಾರ" }, { id: "export", en: "Export", kn: "ರಫ್ತು" },
];
export const RBAC_ROLES: { id: RbacRole; en: string; kn: string; note: { en: string; kn: string } }[] = [
  { id: "superAdmin", en: "Super Admin", kn: "ಸೂಪರ್ ಅಡ್ಮಿನ್", note: { en: "Full control. Only role that can change critical settings and grant Super Admin.", kn: "ಪೂರ್ಣ ನಿಯಂತ್ರಣ. ಪ್ರಮುಖ ಸೆಟ್ಟಿಂಗ್ ಬದಲಿಸಲು ಮತ್ತು ಸೂಪರ್ ಅಡ್ಮಿನ್ ನೀಡಲು ಈ ಪಾತ್ರಕ್ಕೆ ಮಾತ್ರ ಅವಕಾಶ." } },
  { id: "districtAdmin", en: "District Admin", kn: "ಜಿಲ್ಲಾ ಅಡ್ಮಿನ್", note: { en: "Manages data inside the assigned district.", kn: "ನಿಯೋಜಿತ ಜಿಲ್ಲೆಯ ಡೇಟಾ ನಿರ್ವಹಣೆ." } },
  { id: "blockAdmin", en: "Block Admin", kn: "ಬ್ಲಾಕ್ ಅಡ್ಮಿನ್", note: { en: "Manages data inside the assigned block / taluk (or Gram Panchayat).", kn: "ನಿಯೋಜಿತ ಬ್ಲಾಕ್ / ತಾಲ್ಲೂಕು (ಅಥವಾ ಗ್ರಾಮ ಪಂಚಾಯತ್) ಡೇಟಾ ನಿರ್ವಹಣೆ." } },
  { id: "trainingCoordinator", en: "Training Coordinator", kn: "ತರಬೇತಿ ಸಂಯೋಜಕ", note: { en: "Plans sessions, rosters and attendance across the programme.", kn: "ಕಾರ್ಯಕ್ರಮದಾದ್ಯಂತ ಅವಧಿ, ರೋಸ್ಟರ್ ಮತ್ತು ಹಾಜರಾತಿ ಯೋಜನೆ." } },
  { id: "trainer", en: "Trainer", kn: "ತರಬೇತುದಾರ", note: { en: "Takes attendance for assigned classes only.", kn: "ನಿಯೋಜಿತ ತರಗತಿಗಳ ಹಾಜರಾತಿ ಮಾತ್ರ." } },
  { id: "grievanceManager", en: "Grievance Manager", kn: "ದೂರು ವ್ಯವಸ್ಥಾಪಕ", note: { en: "Oversees grievance cases and follow-up.", kn: "ದೂರು ಪ್ರಕರಣ ಮತ್ತು ಅನುಸರಣೆ ಮೇಲ್ವಿಚಾರಣೆ." } },
  { id: "contentManager", en: "Content Manager", kn: "ವಿಷಯ ವ್ಯವಸ್ಥಾಪಕ", note: { en: "Manages learning content and templates.", kn: "ಕಲಿಕಾ ವಿಷಯ ಮತ್ತು ಟೆಂಪ್ಲೇಟ್ ನಿರ್ವಹಣೆ." } },
  { id: "volunteer", en: "Volunteer", kn: "ಸ್ವಯಂಸೇವಕ", note: { en: "Uses the participant app only; no admin access by default.", kn: "ಭಾಗವಹಿಸುವವರ ಆ್ಯಪ್ ಮಾತ್ರ; ಡೀಫಾಲ್ಟ್ ಆಗಿ ಅಡ್ಮಿನ್ ಪ್ರವೇಶವಿಲ್ಲ." } },
];
/** Which RBAC role each demo session role acts as. */
export const roleOfSession: Record<Role, RbacRole> = {
  state: "superAdmin", district: "districtAdmin", ac: "blockAdmin", local: "blockAdmin", coordinator: "trainingCoordinator",
  trainer: "trainer", grievance: "grievanceManager", content: "contentManager", participant: "volunteer",
};
const A = (...a: Action[]) => a;
const all: Action[] = ["view", "create", "edit", "delete", "approve", "export"];

export function defaultRbac(): Record<RbacRole, RolePerm> {
  const everything = Object.fromEntries(MODULES.map((m) => [m.id, [...all]])) as RolePerm["modules"];
  return {
    superAdmin: { modules: everything, manageUsers: true, changeSettings: true, scope: "all" },
    districtAdmin: { modules: { dashboard: A("view", "export"), applications: A("view", "approve", "export"), participants: A("view", "edit", "export"), users: A("view", "create", "edit", "export"), villages: A("view", "create", "edit", "export"), training: A("view", "create", "edit", "delete", "export"), learning: A("view"), resources: A("view"), community: A("view", "create", "edit", "export"), grievances: A("view", "create", "edit", "approve", "export"), events: A("view", "create", "edit", "delete", "export"), rewards: A("view", "export"), reports: A("view", "export"), audit: A("view") }, manageUsers: true, changeSettings: false, scope: "district" },
    blockAdmin: { modules: { dashboard: A("view"), applications: A("view"), participants: A("view", "edit"), users: A("view", "create", "edit"), villages: A("view", "create", "edit"), training: A("view"), community: A("view", "create", "edit"), grievances: A("view", "create", "edit"), events: A("view", "create", "edit"), reports: A("view", "export") }, manageUsers: true, changeSettings: false, scope: "block" },
    trainingCoordinator: { modules: { dashboard: A("view"), participants: A("view", "export"), villages: A("view"), training: A("view", "create", "edit", "delete", "export"), resources: A("view"), events: A("view", "create", "edit"), reports: A("view", "export") }, manageUsers: false, changeSettings: false, scope: "all" },
    trainer: { modules: { training: A("view", "edit") }, manageUsers: false, changeSettings: false, scope: "own" },
    grievanceManager: { modules: { dashboard: A("view"), participants: A("view"), villages: A("view"), community: A("view"), grievances: A("view", "create", "edit", "approve", "export"), reports: A("view", "export") }, manageUsers: false, changeSettings: false, scope: "all" },
    contentManager: { modules: { dashboard: A("view"), learning: A("view", "create", "edit", "delete", "approve"), resources: A("view", "create", "edit", "delete", "approve", "export"), templates: A("view", "create", "edit", "delete"), events: A("view", "create", "edit"), reports: A("view") }, manageUsers: false, changeSettings: false, scope: "all" },
    volunteer: { modules: {}, manageUsers: false, changeSettings: false, scope: "own" },
  };
}
type Matrix = Record<RbacRole, RolePerm>;
export const can = (rbac: Matrix, role: Role, module: Module, action: Action) => !!rbac[roleOfSession[role]]?.modules[module]?.includes(action);
export const canManageUsers = (rbac: Matrix, role: Role) => !!rbac[roleOfSession[role]]?.manageUsers;
export const canChangeSettings = (rbac: Matrix, role: Role) => !!rbac[roleOfSession[role]]?.changeSettings;

const pathModules: [string, Module][] = [["/admin/applications", "applications"], ["/admin/participants", "participants"], ["/admin/users", "users"], ["/admin/villages", "villages"], ["/admin/roles", "roles"], ["/admin/training", "training"], ["/admin/attendance", "training"], ["/admin/session-plan", "training"], ["/admin/progress", "training"], ["/admin/lms", "learning"], ["/admin/resources", "resources"], ["/admin/records", "community"], ["/admin/grievances", "grievances"], ["/admin/events", "events"], ["/admin/rewards", "rewards"], ["/admin/reports", "reports"], ["/admin/templates", "templates"], ["/admin/audit", "audit"], ["/admin/settings", "settings"]];
export function moduleForPath(path: string): Module | "open" | null {
  if (path === "/admin") return "dashboard";
  if (path.startsWith("/admin/notifications")) return "open";
  const hit = pathModules.find(([p]) => path === p || path.startsWith(p + "/"));
  return hit ? hit[1] : null;
}

/** Roles an acting session role may assign: only Super Admin can mint admins; each tier can only assign roles below it. */
export function assignableRoles(role: Role): RbacRole[] {
  switch (roleOfSession[role]) {
    case "superAdmin": return ["superAdmin", "districtAdmin", "blockAdmin", "trainingCoordinator", "trainer", "grievanceManager", "contentManager", "volunteer"];
    case "districtAdmin": return ["blockAdmin", "trainingCoordinator", "trainer", "grievanceManager", "contentManager", "volunteer"];
    case "blockAdmin": return ["volunteer"];
    default: return [];
  }
}
