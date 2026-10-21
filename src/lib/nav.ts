import type { Role } from "./types";
export interface NavItem { href: string; en: string; kn: string; icon: string; primary?: boolean; group?: 1 | 2 | 3 }
export const participantNav: NavItem[] = [
  { href: "/app", en: "Home", kn: "ಮುಖಪುಟ", icon: "House", primary: true },
  { href: "/app/training", en: "Classroom Training", kn: "ತರಗತಿ ತರಬೇತಿ", icon: "ChalkboardTeacher", primary: true },
  { href: "/app/learning", en: "Courses", kn: "ಕೋರ್ಸ್‌ಗಳು", icon: "GraduationCap", primary: true },
  { href: "/app/community", en: "Voters", kn: "ಮತದಾರರು", icon: "UsersThree", primary: true },
  { href: "/app/grievances", en: "Grievances", kn: "ದೂರುಗಳು", icon: "ChatsCircle", primary: true },
  { href: "/app/rewards", en: "Rewards", kn: "ಪುರಸ್ಕಾರ", icon: "Trophy" },
  { href: "/app/events", en: "Events", kn: "ಕಾರ್ಯಕ್ರಮಗಳು", icon: "CalendarBlank" },
  { href: "/app/ai", en: "AI Assistant", kn: "AI ಸಹಾಯಕ", icon: "Sparkle" },
  { href: "/app/certificates", en: "Certificates", kn: "ಪ್ರಮಾಣಪತ್ರಗಳು", icon: "Certificate" },
  { href: "/app/notifications", en: "Notifications", kn: "ಅಧಿಸೂಚನೆಗಳು", icon: "Bell" },
  { href: "/app/profile", en: "Profile", kn: "ಪ್ರೊಫೈಲ್", icon: "UserCircle" },
  { href: "/app/help", en: "Help", kn: "ಸಹಾಯ", icon: "Question" },
];
export const adminNav: NavItem[] = [
  { href: "/admin", en: "Home", kn: "ಮುಖಪುಟ", icon: "SquaresFour", group: 1 },
  { href: "/admin/applications", en: "Applicants", kn: "ಅರ್ಜಿದಾರರು", icon: "ClipboardText", group: 1 },
  { href: "/admin/participants", en: "Nayakas", kn: "ನಾಯಕರು", icon: "Users", group: 1 },
  { href: "/admin/villages", en: "Villages", kn: "ಗ್ರಾಮಗಳು", icon: "MapPinLine", group: 1 },
  { href: "/admin/records", en: "Voters", kn: "ಮತದಾರರು", icon: "AddressBook", group: 1 },
  { href: "/admin/grievances", en: "Grievances", kn: "ದೂರುಗಳು", icon: "ChatsCircle", group: 1 },
  { href: "/admin/events", en: "Events", kn: "ಕಾರ್ಯಕ್ರಮಗಳು", icon: "CalendarBlank", group: 1 },
  { href: "/admin/training", en: "Classroom Training", kn: "ತರಗತಿ ತರಬೇತಿ", icon: "ChalkboardTeacher", group: 2 },
  { href: "/admin/resources", en: "Courses & Resources", kn: "ಕೋರ್ಸ್‌ಗಳು ಮತ್ತು ಸಂಪನ್ಮೂಲಗಳು", icon: "BookBookmark", group: 2 },
  { href: "/admin/lms", en: "LMS & Assessments", kn: "LMS ಮತ್ತು ಮೌಲ್ಯಮಾಪನ", icon: "GraduationCap", group: 2 },
  { href: "/admin/rewards", en: "Rewards & Recognition", kn: "ಪುರಸ್ಕಾರ ಮತ್ತು ಮನ್ನಣೆ", icon: "Trophy", group: 3 },
  { href: "/admin/reports", en: "Reports & Analytics", kn: "ವರದಿಗಳು ಮತ್ತು ವಿಶ್ಲೇಷಣೆ", icon: "ChartBar", group: 3 },
  { href: "/admin/templates", en: "Content & WhatsApp Templates", kn: "ವಿಷಯ ಮತ್ತು WhatsApp ಟೆಂಪ್ಲೇಟ್", icon: "ChatText", group: 3 },
  { href: "/admin/users", en: "Users & Volunteers", kn: "ಬಳಕೆದಾರರು ಮತ್ತು ಸ್ವಯಂಸೇವಕರು", icon: "UserGear", group: 3 },
  { href: "/admin/roles", en: "Roles & Permissions", kn: "ಪಾತ್ರ ಮತ್ತು ಅನುಮತಿ", icon: "ShieldCheck", group: 3 },
  { href: "/admin/audit", en: "Audit Log", kn: "ಆಡಿಟ್ ಲಾಗ್", icon: "ListMagnifyingGlass", group: 3 },
  { href: "/admin/settings", en: "Settings", kn: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು", icon: "Gear", group: 3 },
];
export const trainerNav: NavItem[] = [
  { href: "/admin/training", en: "My Classes", kn: "ನನ್ನ ತರಗತಿಗಳು", icon: "ChalkboardTeacher" },
  { href: "/admin/attendance", en: "Attendance", kn: "ಹಾಜರಾತಿ", icon: "CheckSquare" },
  { href: "/admin/session-plan", en: "Session Plan", kn: "ಅವಧಿ ಯೋಜನೆ", icon: "ListChecks" },
  { href: "/admin/progress", en: "Learner Progress", kn: "ಕಲಿಕೆಯ ಪ್ರಗತಿ", icon: "ChartLineUp" },
  { href: "/admin/notifications", en: "Notifications", kn: "ಅಧಿಸೂಚನೆಗಳು", icon: "Bell" },
];
// Admin navigation is derived from the permission matrix (rbac). Frontend checks are a UI simulation only.
import type { RbacRole, RolePerm } from "./types";
import { moduleForPath, roleOfSession } from "./rbac";
type Matrix = Record<RbacRole, RolePerm>;
const moduleOfHref: Record<string, ReturnType<typeof moduleForPath>> = Object.fromEntries(adminNav.map((n) => [n.href, moduleForPath(n.href)]));
export const navFor = (r: Role, rbac: Matrix): NavItem[] => (r === "participant" ? participantNav : r === "trainer" ? trainerNav : adminNav.filter((n) => { const m = moduleOfHref[n.href]; return m && m !== "open" && rbac[roleOfSession[r]]?.modules[m]?.includes("view"); }));
export const homeFor = (r: Role) => (r === "participant" ? "/app" : r === "trainer" ? "/admin/training" : "/admin");
export const canOpen = (r: Role, path: string, rbac: Matrix) => {
  if (r === "participant") return path.startsWith("/app");
  if (!path.startsWith("/admin")) return false;
  const m = moduleForPath(path);
  if (m === "open") return true;
  if (!m) return false;
  return !!rbac[roleOfSession[r]]?.modules[m]?.includes("view");
};
