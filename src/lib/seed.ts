import type * as T from "./types";

const d = (s: string) => `2026-${s}`;
export const ME = "P-1042"; // demo participant
export const trainers: T.Trainer[] = [
  { id: "T-1", name: "Savitha Rao" }, { id: "T-2", name: "Manjunath Hegde" }, { id: "T-3", name: "Farah Sultana" }, { id: "T-4", name: "Lakshmi Nair" }, { id: "T-5", name: "Ravi Shankar" },
];

const names = ["Ananya Gowda", "Rahul Naik", "Meghana Shetty", "Kiran Kumar", "Divya Patil", "Suresh Babu", "Pooja Hiremath", "Arjun Reddy", "Lakshmi Devi", "Imran Pasha", "Nandini S", "Vinay Kulkarni"];
const loc = [
  ["Mysuru", "Demo AC – Nanjangud North", "Nanjangud", "Hosahalli GP"], ["Mandya", "Demo AC – Maddur", "Maddur", "Kebbehundi GP"],
  ["Tumakuru", "Demo AC – Sira–Gubbi", "Sira", "Dugganahalli GP"], ["Belagavi", "Demo AC – Gokak", "Gokak", "Konnur GP"],
  ["Kalaburagi", "Demo AC – Sedam", "Sedam", "Mulkhed GP"], ["Mysuru", "Demo AC – Nanjangud North", "Hunsur", "Bilikere GP"],
];
const statuses: T.AppStatus[] = ["Approved", "Approved", "Approved", "Approved", "Approved", "Approved", "Approved", "Approved", "Shortlisted", "Under Review", "Submitted", "Not Selected"];

export const applications: T.Application[] = names.map((name, i) => {
  const l = loc[i % loc.length]; const status = statuses[i];
  return {
    id: `APP-26-${String(1001 + i)}`, name, phone: `+91 98XXX-XX${String(10 + i).padStart(3, "0")}`, dob: `${1995 + (i % 8)}-0${(i % 9) + 1}-1${i % 9}`,
    age: 22 + (i % 10), gender: i % 3 === 0 ? "Female" : i % 3 === 1 ? "Male" : "Prefer not to say",
    district: l[0], ac: l[1], taluk: l[2], gp: l[3],
    education: ["Bachelor's", "Master's", "Diploma", "PUC"][i % 4], institution: "Demo College of Arts & Science", field: ["Commerce", "Agriculture", "Social Work", "Computer Science"][i % 4],
    motivation: "I want to help my village follow up on drinking water and road issues in an organised, respectful way.",
    verification: i % 2 ? "Simulated – matched" : "Simulated – not verified", consentReceipt: `CR-${7000 + i}`,
    status, submittedAt: d(`07-${String(1 + i).padStart(2, "0")}`),
    history: [{ status: "Submitted", at: d(`07-${String(1 + i).padStart(2, "0")}`), by: "System" }, ...(status !== "Submitted" ? [{ status, at: d(`08-${String(1 + i).padStart(2, "0")}`), by: "Reviewer Meena" } as const] : [])],
    internalNotes: i === 0 ? ["Strong community involvement; confirm availability."] : [],
    candidateNote: status === "Not Selected" ? "Thank you for applying. We could not offer a place in this cycle. You are welcome to apply again in the next cycle." : undefined,
  };
});

export const participants: T.Participant[] = applications.filter((a) => a.status === "Approved").map((a, i) => ({
  id: `P-${1040 + i}`, appId: a.id, name: a.name, district: a.district, ac: a.ac, taluk: a.taluk, gp: a.gp,
  cohort: (["A", "B", "C"] as const)[i % 3], classId: `CL-${(["A", "B", "C"] as const)[i % 3]}${(i % 3) + 1}`.replace(/CL-([ABC])\d/, (_, c) => `CL-${c}${(i % 3) + 1}`),
  trainingDone: i < 5, lmsProgress: [64, 100, 38, 82, 12, 0, 0, 0][i] ?? 0, points: [320, 540, 150, 410, 80, 0, 0, 0][i] ?? 0,
  publicLeaderboard: i !== 2, phoneMasked: `+91 ••••• ••${40 + i}`,
}));

const mkClass = (id: string, name: string, cohort: "A" | "B" | "C", days: [number, number], date: string, trainerId: string, room: string, capacity: number, roster: string[]): T.TrainingClass => ({
  id, name, cohort, days, startDate: date, trainerId, room, capacity, roster, waitlist: [],
  attendance: Object.fromEntries(roster.map((p) => [p, ["Not Recorded", "Not Recorded"] as [T.AttStatus, T.AttStatus]])),
  attendanceLog: [], status: cohort === "A" ? "Completed" : "Scheduled",
});
const ids = participants.map((p) => p.id);
export const classes: T.TrainingClass[] = [
  mkClass("CL-A1", "Class 1 · Cohort A", "A", [1, 2], d("09-14"), "T-1", "Hall 1", 60, ids.slice(0, 3)),
  mkClass("CL-A2", "Class 2 · Cohort A", "A", [1, 2], d("09-14"), "T-2", "Hall 2", 80, ids.slice(3, 5)),
  mkClass("CL-A3", "Class 3 · Cohort A", "A", [1, 2], d("09-14"), "T-3", "Hall 3", 45, []),
  mkClass("CL-B1", "Class 1 · Cohort B", "B", [3, 4], d("09-16"), "T-1", "Hall 1", 60, ids.slice(5, 7)),
  mkClass("CL-B2", "Class 2 · Cohort B", "B", [3, 4], d("09-16"), "T-2", "Hall 2", 100, ids.slice(7, 8)),
  mkClass("CL-B3", "Class 3 · Cohort B", "B", [3, 4], d("09-16"), "T-3", "Hall 3", 30, []),
  mkClass("CL-C1", "Class 1 · Cohort C", "C", [5, 6], d("09-18"), "T-1", "Hall 1", 60, []),
  mkClass("CL-C2", "Class 2 · Cohort C", "C", [5, 6], d("09-18"), "T-2", "Hall 2", 80, []),
  mkClass("CL-C3", "Class 3 · Cohort C", "C", [5, 6], d("09-18"), "T-3", "Hall 3", 50, []),
];
// make attendance sample for completed cohort A
classes.slice(0, 2).forEach((c) => c.roster.forEach((p, i) => { c.attendance[p] = [i === 1 ? "Late" : "Present", "Present"]; }));
classes.forEach((c) => { c.location = "Mysuru Training Institute (fictional)"; c.duration = 2; c.materials = []; c.certified = []; c.region = "Mysuru"; c.publish = "Published"; c.exceptions = {}; c.description = `Two-day classroom training for Cohort ${c.cohort}: Panchayat Raj basics, ethical fieldwork and grievance follow-up.`; const dl = new Date(c.startDate + "T00:00:00Z"); dl.setUTCDate(dl.getUTCDate() - 3); c.registrationDeadline = dl.toISOString().slice(0, 10); });
participants.forEach((p) => { const c = classes.find((c) => c.roster.includes(p.id)); if (c) { p.classId = c.id; p.cohort = c.cohort; } });
classes.slice(0, 2).forEach((c) => { c.certified = [...c.roster]; });
export const cycle: T.TrainingCycle = { id: "CY-26-01", name: "Cycle 1 · Mysuru", venue: "Mysuru Training Institute (fictional placeholder)", startDate: d("09-14"), status: "In Progress", classIds: classes.map((c) => c.id) };

const lesson = (id: string, type: T.LessonType, min: number, en: string, kn: string, sen: string, skn: string, extra: Partial<T.Lesson> = {}): T.Lesson => ({ id, type, minutes: min, title: { en, kn }, summary: { en: sen, kn: skn }, ...extra });
export const questions: T.Question[] = [
  { id: "Q1", q: { en: "Which best describes the purpose of a Gram Sabha meeting?", kn: "ಗ್ರಾಮ ಸಭೆಯ ಉದ್ದೇಶವನ್ನು ಉತ್ತಮವಾಗಿ ವಿವರಿಸುವುದು ಯಾವುದು?" }, options: [{ en: "A forum where residents discuss local matters with the Panchayat", kn: "ನಿವಾಸಿಗಳು ಪಂಚಾಯತ್‌ನೊಂದಿಗೆ ಸ್ಥಳೀಯ ವಿಷಯಗಳನ್ನು ಚರ್ಚಿಸುವ ವೇದಿಕೆ" }, { en: "A private meeting of elected members only", kn: "ಚುನಾಯಿತ ಸದಸ್ಯರ ಖಾಸಗಿ ಸಭೆ ಮಾತ್ರ" }, { en: "A training class for officials", kn: "ಅಧಿಕಾರಿಗಳ ತರಬೇತಿ ತರಗತಿ" }], answer: 0, explain: { en: "Gram Sabha is a space for residents to take part in local decisions. Confirm details in the approved course material.", kn: "ಗ್ರಾಮ ಸಭೆ ನಿವಾಸಿಗಳು ಸ್ಥಳೀಯ ನಿರ್ಧಾರಗಳಲ್ಲಿ ಭಾಗವಹಿಸುವ ಸ್ಥಳ. ವಿವರಗಳನ್ನು ಅನುಮೋದಿತ ಕೋರ್ಸ್ ಸಾಮಗ್ರಿಯಲ್ಲಿ ಪರಿಶೀಲಿಸಿ." } },
  { id: "Q2", q: { en: "Before following up on a water issue, what is most useful to note?", kn: "ನೀರಿನ ಸಮಸ್ಯೆಯ ಅನುಸರಣೆಗೆ ಮೊದಲು ಏನನ್ನು ಗುರುತಿಸಿಕೊಳ್ಳುವುದು ಹೆಚ್ಚು ಉಪಯುಕ್ತ?" }, options: [{ en: "Exact location, since when, and who is affected", kn: "ನಿಖರ ಸ್ಥಳ, ಎಷ್ಟು ದಿನದಿಂದ, ಯಾರು ಬಾಧಿತರು" }, { en: "Which party the residents support", kn: "ನಿವಾಸಿಗಳು ಯಾವ ಪಕ್ಷವನ್ನು ಬೆಂಬಲಿಸುತ್ತಾರೆ" }, { en: "Residents' full ID numbers", kn: "ನಿವಾಸಿಗಳ ಪೂರ್ಣ ಗುರುತಿನ ಸಂಖ್ಯೆಗಳು" }], answer: 0, explain: { en: "Collect only what is needed. Political views and ID numbers are never needed for issue follow-up.", kn: "ಅಗತ್ಯವಿರುವುದನ್ನು ಮಾತ್ರ ಸಂಗ್ರಹಿಸಿ. ರಾಜಕೀಯ ಅಭಿಪ್ರಾಯ ಮತ್ತು ಗುರುತಿನ ಸಂಖ್ಯೆ ಅಗತ್ಯವಿಲ್ಲ." } },
  { id: "Q3", q: { en: "A resident asks you to delete the details you hold about them. What is a good first step?", kn: "ನಿವಾಸಿ ನಿಮ್ಮ ಬಳಿಯ ವಿವರ ಅಳಿಸಲು ಕೇಳಿದರೆ ಮೊದಲ ಹೆಜ್ಜೆ ಏನು?" }, options: [{ en: "Ignore it", kn: "ನಿರ್ಲಕ್ಷಿಸಿ" }, { en: "Log the request and pass it to the programme privacy contact", kn: "ವಿನಂತಿ ದಾಖಲಿಸಿ ಕಾರ್ಯಕ್ರಮದ ಗೌಪ್ಯತಾ ಸಂಪರ್ಕಕ್ಕೆ ಕಳುಹಿಸಿ" }, { en: "Share it on a WhatsApp group", kn: "WhatsApp ಗುಂಪಿನಲ್ಲಿ ಹಂಚಿ" }], answer: 1, explain: { en: "Requests should be recorded and routed to the privacy contact; do not decide alone.", kn: "ವಿನಂತಿ ದಾಖಲಿಸಿ ಗೌಪ್ಯತಾ ಸಂಪರ್ಕಕ್ಕೆ ತಲುಪಿಸಿ; ಒಬ್ಬರೇ ನಿರ್ಧರಿಸಬೇಡಿ." } },
  { id: "Q4", q: { en: "An AI assistant suggests an office to approach. You should…", kn: "AI ಸಹಾಯಕ ಒಂದು ಕಚೇರಿ ಸೂಚಿಸಿದರೆ ನೀವು…" }, options: [{ en: "Treat it as a suggestion and verify with the relevant authority", kn: "ಸಲಹೆಯಾಗಿ ಪರಿಗಣಿಸಿ ಸಂಬಂಧಿತ ಪ್ರಾಧಿಕಾರದೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ" }, { en: "Promise residents it will be fixed", kn: "ಸರಿಪಡಿಸುತ್ತೇವೆಂದು ಭರವಸೆ ನೀಡಿ" }], answer: 0, explain: { en: "AI advises; people decide and verify.", kn: "AI ಸಲಹೆ ನೀಡುತ್ತದೆ; ನಿರ್ಧಾರ ಮತ್ತು ಪರಿಶೀಲನೆ ಜನರದ್ದು." } },
];
export const courses: T.Course[] = [
  { id: "C-PR", title: { en: "Panchayat Raj Foundations", kn: "ಪಂಚಾಯತ್ ರಾಜ್ ಮೂಲಭೂತ ಅಂಶಗಳು" }, summary: { en: "How local self-government is organised and how residents take part.", kn: "ಸ್ಥಳೀಯ ಸ್ವಯಂ ಸರ್ಕಾರ ಹೇಗೆ ಸಂಘಟಿತ ಮತ್ತು ನಿವಾಸಿಗಳು ಹೇಗೆ ಭಾಗವಹಿಸಬಹುದು." }, topic: "Governance", instructor: "Savitha Rao", languages: ["kn", "en"], minutes: 150, status: "Published", version: 3, passMark: 70, prerequisites: [], objectives: [{ en: "Describe the three tiers of Panchayat Raj", kn: "ಪಂಚಾಯತ್ ರಾಜ್‌ನ ಮೂರು ಹಂತಗಳನ್ನು ವಿವರಿಸಿ" }, { en: "Explain the role of Gram Sabha", kn: "ಗ್ರಾಮ ಸಭೆಯ ಪಾತ್ರ ವಿವರಿಸಿ" }],
    lessons: [
      lesson("L-PR1", "video", 12, "Welcome: Why local leadership matters", "ಸ್ವಾಗತ: ಸ್ಥಳೀಯ ನಾಯಕತ್ವ ಏಕೆ ಮುಖ್ಯ", "A short introduction to the programme and ethical fieldwork.", "ಕಾರ್ಯಕ್ರಮ ಮತ್ತು ನೈತಿಕ ಕ್ಷೇತ್ರಕಾರ್ಯದ ಸಂಕ್ಷಿಪ್ತ ಪರಿಚಯ.", { transcript: { en: "Welcome to Grama Nayaka. In this lesson we look at why informed, ethical local leaders matter…", kn: "ಗ್ರಾಮ ನಾಯಕಕ್ಕೆ ಸ್ವಾಗತ. ಈ ಪಾಠದಲ್ಲಿ ಮಾಹಿತಿಯುಳ್ಳ, ನೈತಿಕ ಸ್ಥಳೀಯ ನಾಯಕರು ಏಕೆ ಮುಖ್ಯ ಎಂದು ನೋಡುತ್ತೇವೆ…" } }),
      lesson("L-PR2", "reading", 15, "The three tiers of Panchayat Raj", "ಪಂಚಾಯತ್ ರಾಜ್‌ನ ಮೂರು ಹಂತಗಳು", "Gram, Taluk and Zilla level institutions at a glance.", "ಗ್ರಾಮ, ತಾಲ್ಲೂಕು ಮತ್ತು ಜಿಲ್ಲಾ ಸಂಸ್ಥೆಗಳ ಸಂಕ್ಷಿಪ್ತ ನೋಟ.", { body: { en: "Panchayat Raj is organised in tiers. Official details and legal provisions are in the approved course reference — verify with the relevant authority before relying on specifics.", kn: "ಪಂಚಾಯತ್ ರಾಜ್ ಹಂತಗಳಲ್ಲಿ ಸಂಘಟಿತವಾಗಿದೆ. ಅಧಿಕೃತ ವಿವರ ಮತ್ತು ಕಾನೂನು ನಿಬಂಧನೆಗಳು ಅನುಮೋದಿತ ಕೋರ್ಸ್ ಉಲ್ಲೇಖದಲ್ಲಿವೆ — ಬಳಸುವ ಮೊದಲು ಸಂಬಂಧಿತ ಪ್ರಾಧಿಕಾರದೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ." }, takeaways: [{ en: "Local government has more than one tier", kn: "ಸ್ಥಳೀಯ ಸರ್ಕಾರಕ್ಕೆ ಒಂದಕ್ಕಿಂತ ಹೆಚ್ಚು ಹಂತಗಳಿವೆ" }, { en: "Always verify legal details", kn: "ಕಾನೂನು ವಿವರಗಳನ್ನು ಸದಾ ಪರಿಶೀಲಿಸಿ" }], glossary: [{ term: { en: "Gram Sabha", kn: "ಗ್ರಾಮ ಸಭೆ" }, def: { en: "Assembly of residents of a village", kn: "ಹಳ್ಳಿಯ ನಿವಾಸಿಗಳ ಸಭೆ" } }] }),
      lesson("L-PR3", "quiz", 10, "Check your understanding", "ನಿಮ್ಮ ತಿಳುವಳಿಕೆ ಪರೀಕ್ಷಿಸಿ", "Four questions on governance and responsible fieldwork.", "ಆಡಳಿತ ಮತ್ತು ಜವಾಬ್ದಾರಿಯುತ ಕ್ಷೇತ್ರಕಾರ್ಯದ ನಾಲ್ಕು ಪ್ರಶ್ನೆಗಳು.", { questionIds: ["Q1", "Q2", "Q3", "Q4"] }),
      lesson("L-PR4", "reflection", 10, "Reflect: A problem in your village", "ಚಿಂತನೆ: ನಿಮ್ಮ ಹಳ್ಳಿಯ ಸಮಸ್ಯೆ", "Optional recorded answer about a local issue.", "ಸ್ಥಳೀಯ ಸಮಸ್ಯೆಯ ಬಗ್ಗೆ ಐಚ್ಛಿಕ ರೆಕಾರ್ಡ್ ಉತ್ತರ."),
    ] },
  { id: "C-GR", title: { en: "Grievance Handling & Follow-up", kn: "ದೂರು ನಿರ್ವಹಣೆ ಮತ್ತು ಅನುಸರಣೆ" }, summary: { en: "Document issues, find the right pathway and follow up respectfully.", kn: "ಸಮಸ್ಯೆ ದಾಖಲಿಸಿ, ಸರಿಯಾದ ಮಾರ್ಗ ಹುಡುಕಿ, ಗೌರವದಿಂದ ಅನುಸರಿಸಿ." }, topic: "Fieldwork", instructor: "Manjunath Hegde", languages: ["kn", "en"], minutes: 120, status: "Published", version: 2, passMark: 70, prerequisites: ["C-PR"], objectives: [{ en: "Record an issue with only necessary details", kn: "ಅಗತ್ಯ ವಿವರಗಳೊಂದಿಗೆ ಮಾತ್ರ ಸಮಸ್ಯೆ ದಾಖಲಿಸಿ" }],
    lessons: [lesson("L-GR1", "video", 14, "Documenting an issue well", "ಸಮಸ್ಯೆಯನ್ನು ಚೆನ್ನಾಗಿ ದಾಖಲಿಸುವುದು", "What to note, photograph and avoid.", "ಏನು ಗಮನಿಸಬೇಕು, ಫೋಟೋ ಮತ್ತು ತಪ್ಪಿಸಬೇಕಾದದ್ದು.", { transcript: { en: "Good documentation is specific, factual and respectful of privacy…", kn: "ಉತ್ತಮ ದಾಖಲೆ ನಿರ್ದಿಷ್ಟ, ವಾಸ್ತವಿಕ ಮತ್ತು ಗೌಪ್ಯತೆಗೆ ಗೌರವ ನೀಡುವಂಥದ್ದು…" } }), lesson("L-GR2", "reading", 12, "Writing respectful follow-ups", "ಗೌರವಯುತ ಅನುಸರಣಾ ಸಂದೇಶಗಳು", "Tone, facts and next steps.", "ಧ್ವನಿ, ಸಂಗತಿಗಳು ಮತ್ತು ಮುಂದಿನ ಹೆಜ್ಜೆ.", { body: { en: "A good follow-up states the issue, location, date first reported and what you are asking for — politely and without threats.", kn: "ಉತ್ತಮ ಅನುಸರಣೆ ಸಮಸ್ಯೆ, ಸ್ಥಳ, ಮೊದಲು ವರದಿ ಮಾಡಿದ ದಿನಾಂಕ ಮತ್ತು ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಸೌಜನ್ಯದಿಂದ, ಬೆದರಿಕೆ ಇಲ್ಲದೆ ತಿಳಿಸುತ್ತದೆ." }, takeaways: [{ en: "Be factual and polite", kn: "ವಾಸ್ತವಿಕ ಮತ್ತು ಸೌಜನ್ಯಯುತವಾಗಿರಿ" }] }), lesson("L-GR3", "assignment", 30, "Field assignment: log one real local issue", "ಕ್ಷೇತ್ರ ನಿಯೋಜನೆ: ಒಂದು ಸ್ಥಳೀಯ ಸಮಸ್ಯೆ ದಾಖಲಿಸಿ", "Create one grievance in the app with a follow-up date.", "ಆ್ಯಪ್‌ನಲ್ಲಿ ಅನುಸರಣಾ ದಿನಾಂಕದೊಂದಿಗೆ ಒಂದು ದೂರು ರಚಿಸಿ.")] },
  { id: "C-PV", title: { en: "Data Privacy & Responsible AI", kn: "ಡೇಟಾ ಗೌಪ್ಯತೆ ಮತ್ತು ಜವಾಬ್ದಾರಿಯುತ AI" }, summary: { en: "Handle residents' information with care; use AI safely.", kn: "ನಿವಾಸಿಗಳ ಮಾಹಿತಿಯನ್ನು ಜಾಗರೂಕತೆಯಿಂದ ನಿರ್ವಹಿಸಿ; AI ಅನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಬಳಸಿ." }, topic: "Ethics", instructor: "Farah Sultana", languages: ["kn", "en"], minutes: 90, status: "Published", version: 1, passMark: 75, prerequisites: [], objectives: [{ en: "Apply data minimisation", kn: "ಡೇಟಾ ಕನಿಷ್ಠೀಕರಣ ಅನ್ವಯಿಸಿ" }],
    lessons: [lesson("L-PV1", "reading", 15, "Collect less, protect more", "ಕಡಿಮೆ ಸಂಗ್ರಹಿಸಿ, ಹೆಚ್ಚು ರಕ್ಷಿಸಿ", "Why minimal data and clear notice matter.", "ಕನಿಷ್ಠ ಡೇಟಾ ಮತ್ತು ಸ್ಪಷ್ಟ ಸೂಚನೆ ಏಕೆ ಮುಖ್ಯ.", { body: { en: "Only collect information you need for a stated purpose. Never use personal data for political persuasion.", kn: "ಹೇಳಿದ ಉದ್ದೇಶಕ್ಕೆ ಅಗತ್ಯವಿರುವ ಮಾಹಿತಿಯನ್ನು ಮಾತ್ರ ಸಂಗ್ರಹಿಸಿ. ವೈಯಕ್ತಿಕ ಡೇಟಾವನ್ನು ರಾಜಕೀಯ ಮನವೊಲಿಕೆಗೆ ಎಂದಿಗೂ ಬಳಸಬೇಡಿ." }, takeaways: [{ en: "No political profiling", kn: "ರಾಜಕೀಯ ಪ್ರೊಫೈಲಿಂಗ್ ಇಲ್ಲ" }] }), lesson("L-PV2", "video", 11, "Using AI responsibly", "AI ಅನ್ನು ಜವಾಬ್ದಾರಿಯಿಂದ ಬಳಸುವುದು", "AI advises, you decide.", "AI ಸಲಹೆ ನೀಡುತ್ತದೆ, ನೀವು ನಿರ್ಧರಿಸುತ್ತೀರಿ.", { transcript: { en: "Never paste resident details into an AI tool…", kn: "ನಿವಾಸಿಗಳ ವಿವರಗಳನ್ನು ಎಂದಿಗೂ AI ಸಾಧನದಲ್ಲಿ ಅಂಟಿಸಬೇಡಿ…" } })] },
  { id: "C-CM", title: { en: "Community Communication", kn: "ಸಮುದಾಯ ಸಂವಹನ" }, summary: { en: "Plain, respectful messages in Kannada and English.", kn: "ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಸರಳ, ಗೌರವಯುತ ಸಂದೇಶಗಳು." }, topic: "Communication", instructor: "Savitha Rao", languages: ["kn"], minutes: 60, status: "Draft", version: 1, passMark: 70, prerequisites: ["C-GR"], objectives: [{ en: "Write clear updates", kn: "ಸ್ಪಷ್ಟ ಅಪ್‌ಡೇಟ್ ಬರೆಯಿರಿ" }], lessons: [lesson("L-CM1", "reading", 10, "Clear updates", "ಸ್ಪಷ್ಟ ಅಪ್‌ಡೇಟ್‌ಗಳು", "Short, kind and useful.", "ಚಿಕ್ಕ, ದಯೆಯ, ಉಪಯುಕ್ತ.", { body: { en: "(English version pending translation review)", kn: "ಸಂಕ್ಷಿಪ್ತ, ಸೌಜನ್ಯಯುತ ಸಂದೇಶ ಬರೆಯಿರಿ." } })] },
];

export const residents: T.Resident[] = [
  { id: "R-201", name: "Shantamma", locality: "Hosahalli, ward 2", gp: "Hosahalli GP", district: "Mysuru", language: "kn", contactPref: "Not provided", notice: "Given", collectedOn: d("09-02"), source: "Door-to-door visit by P-1042", notes: "Reported hand-pump not working.", },
  { id: "R-202", name: "Mahadevappa", locality: "Hosahalli, ward 4", gp: "Hosahalli GP", district: "Mysuru", language: "kn", contactPref: "In person", notice: "Given", collectedOn: d("09-03"), source: "Gram Sabha meeting", notes: "" },
  { id: "R-203", name: "Fathima B", locality: "Kadakola", gp: "Kadakola GP", district: "Mysuru", language: "en", contactPref: "Phone call", notice: "Pending", collectedOn: d("09-05"), source: "Community meeting", notes: "", correction: "Requested" },
  { id: "R-204", name: "Ramesh Naik", locality: "Kebbehundi", gp: "Kebbehundi GP", district: "Mandya", language: "kn", contactPref: "Not provided", notice: "Given", collectedOn: d("09-06"), source: "Walk-in at Panchayat", notes: "" },
  { id: "R-205", name: "Gowramma", locality: "Dugganahalli", gp: "Dugganahalli GP", district: "Tumakuru", language: "kn", contactPref: "In person", notice: "Given", collectedOn: d("09-07"), source: "Door-to-door visit", notes: "" },
];
export const voterRecords: T.VoterRecord[] = [
  { id: "V-901", residentId: "R-201", epicMasked: "ABC••••001 (fictional)", consent: "Granted", verification: "Not verified externally", source: "Resident-provided during help session", collectedOn: d("09-02"), accessLog: [{ at: d("09-10"), by: "Coordinator Mohan" }] },
  { id: "V-902", residentId: "R-202", epicMasked: "XYZ••••002 (fictional)", consent: "Pending", verification: "Not verified externally", source: "Resident-provided", collectedOn: d("09-03"), accessLog: [] },
  { id: "V-903", residentId: "R-204", epicMasked: "LMN••••003 (fictional)", consent: "Withdrawn", verification: "Not verified externally", source: "Resident-provided", collectedOn: d("09-06"), accessLog: [] },
];

const tl = (a: string, action: string, to?: T.GStatus, note?: string) => ({ at: d(a), actor: "P-1042", action, to, note });
export const grievances: T.Grievance[] = [
  { id: "G-3001", title: "Hand pump not working near ward 2 tank", category: "water", description: "The hand pump near the overhead tank has not worked for two weeks. About 25 households depend on it.", locality: "Hosahalli, ward 2", gp: "Hosahalli GP", district: "Mysuru", urgency: "High", status: "Follow-up Due", ownerId: "P-1042", residentRef: "R-••201", createdAt: d("09-02"), observed: d("09-01"), nextAction: "Call Panchayat office for repair schedule", followUpDate: d("10-18"), pathway: "Gram Panchayat water supply / PDO office (verify)", groupId: "GRP-1", timeline: [tl("09-02", "Created", "Open"), tl("09-04", "Status changed", "In Progress", "Raised with Panchayat office in person"), tl("10-10", "Follow-up scheduled")] },
  { id: "G-3002", title: "Street light out on school road", category: "lighting", description: "Three street lights out on the road to the government school.", locality: "Hosahalli, ward 4", gp: "Hosahalli GP", district: "Mysuru", urgency: "Medium", status: "Open", ownerId: "P-1042", createdAt: d("10-12"), observed: d("10-10"), nextAction: "Collect pole numbers", followUpDate: d("10-24"), timeline: [tl("10-12", "Created", "Open")] },
  { id: "G-3003", title: "Pothole cluster on market road", category: "roads", description: "Several potholes causing two-wheeler accidents.", locality: "Kebbehundi", gp: "Kebbehundi GP", district: "Mandya", urgency: "High", status: "Escalated", ownerId: "P-1043", createdAt: d("08-20"), observed: d("08-18"), nextAction: "Await response from taluk office", followUpDate: d("10-15"), timeline: [tl("08-20", "Created", "Open"), tl("09-15", "Escalated", "Escalated", "No response after two follow-ups")] },
  { id: "G-3004", title: "Garbage not collected at bus stand", category: "sanitation", description: "Waste lies uncollected for a week.", locality: "Dugganahalli", gp: "Dugganahalli GP", district: "Tumakuru", urgency: "Medium", status: "Closure Pending", ownerId: "P-1044", createdAt: d("08-02"), observed: d("08-01"), nextAction: "Participant to confirm closure", followUpDate: d("10-22"), outcome: "Collection resumed twice a week per Panchayat.", timeline: [tl("08-02", "Created", "Open"), tl("10-08", "Marked closure pending", "Closure Pending", "Collection resumed")] },
  { id: "G-3005", title: "Ration card correction help", category: "documents", description: "Resident needs help understanding the correction process.", locality: "Kadakola", gp: "Kadakola GP", district: "Mysuru", urgency: "Low", status: "Closed", ownerId: "P-1042", createdAt: d("07-15"), observed: d("07-14"), nextAction: "—", followUpDate: d("08-01"), outcome: "Resident completed the correction at the service centre.", timeline: [tl("07-15", "Created", "Open"), tl("08-05", "Closure confirmed", "Closed")] },
  { id: "G-3006", title: "Water tank leakage (reopened)", category: "water", description: "Leak reappeared after repair.", locality: "Kodli", gp: "Kodli GP", district: "Kalaburagi", urgency: "High", status: "Reopened", ownerId: "P-1046", createdAt: d("07-01"), observed: d("06-28"), nextAction: "Re-inspect with PDO", followUpDate: d("10-19"), timeline: [tl("07-01", "Created", "Open"), tl("08-01", "Closed", "Closed"), tl("10-05", "Reopened", "Reopened", "Leak returned")] },
  { id: "G-3007", title: "Anganwadi roof damage", category: "facilities", description: "Roof leaks during rain.", locality: "Konnur", gp: "Konnur GP", district: "Belagavi", urgency: "High", status: "In Progress", ownerId: "P-1043", createdAt: d("09-25"), observed: d("09-24"), nextAction: "Share photos with CDPO office", followUpDate: d("10-21"), timeline: [tl("09-25", "Created", "Open"), tl("09-30", "Status changed", "In Progress")] },
];

export const events: T.EventItem[] = [
  { id: "E-501", title: { en: "Gram Sabha Basics Workshop", kn: "ಗ್ರಾಮ ಸಭೆ ಮೂಲಭೂತ ಕಾರ್ಯಾಗಾರ" }, category: "Workshop", date: d("11-02"), time: "10:00–13:00", venue: "Hosahalli GP Hall", district: "Mysuru", language: "kn", audience: "Participants", capacity: 40, registered: ["P-1042", "P-1043"], waitlist: [], status: "Upcoming", agenda: [{ en: "Welcome", kn: "ಸ್ವಾಗತ" }, { en: "How a Gram Sabha runs", kn: "ಗ್ರಾಮ ಸಭೆ ಹೇಗೆ ನಡೆಯುತ್ತದೆ" }], description: { en: "A practical workshop for local participants.", kn: "ಸ್ಥಳೀಯ ಭಾಗವಹಿಸುವವರಿಗೆ ಪ್ರಾಯೋಗಿಕ ಕಾರ್ಯಾಗಾರ." }, attended: [] },
  { id: "E-502", title: { en: "Water Issues Clinic (online)", kn: "ನೀರಿನ ಸಮಸ್ಯೆ ಕ್ಲಿನಿಕ್ (ಆನ್‌ಲೈನ್)" }, category: "Online", date: d("11-08"), time: "18:00–19:00", venue: "Online (link shared on registration)", district: "Mysuru", language: "both", audience: "All participants", capacity: 2, registered: ["P-1043", "P-1044"], waitlist: ["P-1045"], status: "Upcoming", agenda: [{ en: "Common pathways", kn: "ಸಾಮಾನ್ಯ ಮಾರ್ಗಗಳು" }], description: { en: "Bring your open water issues for peer discussion.", kn: "ನಿಮ್ಮ ಬಾಕಿ ನೀರಿನ ಸಮಸ್ಯೆಗಳನ್ನು ತನ್ನಿ." }, attended: [] },
  { id: "E-503", title: { en: "Cohort A Graduation Meet", kn: "ಕೋಹಾರ್ಟ್ A ಪದವಿ ಸಮಾರಂಭ" }, category: "Meet", date: d("09-30"), time: "11:00–13:00", venue: "Mysuru Training Institute (fictional)", district: "Mysuru", language: "both", audience: "Cohort A", capacity: 60, registered: ["P-1042"], waitlist: [], status: "Past", agenda: [], description: { en: "Celebrating the first cohort.", kn: "ಮೊದಲ ಕೋಹಾರ್ಟ್‌ನ ಆಚರಣೆ." }, attended: ["P-1042"] },
  { id: "E-504", title: { en: "District Coordinators Review", kn: "ಜಿಲ್ಲಾ ಸಂಯೋಜಕರ ಪರಿಶೀಲನೆ" }, category: "Review", date: d("12-01"), time: "15:00–16:30", venue: "Online", district: "Mysuru", language: "en", audience: "Coordinators", capacity: 30, registered: [], waitlist: [], status: "Draft", agenda: [], description: { en: "Draft event.", kn: "ಕರಡು ಕಾರ್ಯಕ್ರಮ." }, attended: [] },
];

export const rules: T.RewardRule[] = [
  { id: "RR-1", category: "Learning", points: 20, cap: 300, verification: "Auto (assessment passed)", approval: false, effective: d("09-01") },
  { id: "RR-2", category: "Classroom training", points: 100, cap: 100, verification: "Attendance both days", approval: false, effective: d("09-01") },
  { id: "RR-3", category: "Resident engagement", points: 10, cap: 100, verification: "Coordinator-validated, one per resident", approval: true, effective: d("09-01") },
  { id: "RR-4", category: "Valid issue reporting", points: 15, cap: 120, verification: "Reviewed as valid; no duplicates", approval: true, effective: d("09-01") },
  { id: "RR-5", category: "Verified issue progress", points: 40, cap: 200, verification: "Closure confirmed + reviewed", approval: true, effective: d("09-01") },
  { id: "RR-6", category: "Events", points: 15, cap: 90, verification: "Attendance recorded", approval: false, effective: d("09-01") },
  { id: "RR-7", category: "Follow-up reliability", points: 10, cap: 100, verification: "Follow-up completed on time", approval: false, effective: d("09-01") },
];
export const ledger: T.LedgerEntry[] = [
  { id: "LG-1", pid: ME, at: d("09-15"), category: "Classroom training", points: 100, reason: "Attended both training days", verified: true },
  { id: "LG-2", pid: ME, at: d("09-20"), category: "Learning", points: 20, reason: "Passed assessment: Panchayat Raj Foundations", verified: true },
  { id: "LG-3", pid: ME, at: d("09-22"), category: "Valid issue reporting", points: 15, reason: "Grievance G-3001 reviewed as valid", verified: true },
  { id: "LG-4", pid: ME, at: d("10-01"), category: "Events", points: 15, reason: "Attended Cohort A Graduation Meet", verified: true },
  { id: "LG-5", pid: ME, at: d("10-09"), category: "Follow-up reliability", points: 10, reason: "On-time follow-up on G-3001", verified: true },
  { id: "LG-6", pid: ME, at: d("10-12"), category: "Valid issue reporting", points: 15, reason: "Pending validation: G-3002", verified: false },
];
export const rewardCatalog: T.Reward[] = [
  { id: "RW-1", title: { en: "Digital learning pack (demo)", kn: "ಡಿಜಿಟಲ್ ಕಲಿಕಾ ಪ್ಯಾಕ್ (ಡೆಮೊ)" }, cost: 100 }, { id: "RW-2", title: { en: "Program notebook & pen set (demo)", kn: "ಕಾರ್ಯಕ್ರಮ ನೋಟ್‌ಬುಕ್ ಮತ್ತು ಪೆನ್ (ಡೆಮೊ)" }, cost: 250 }, { id: "RW-3", title: { en: "Invite to leaders' meet (demo)", kn: "ನಾಯಕರ ಸಭೆಗೆ ಆಹ್ವಾನ (ಡೆಮೊ)" }, cost: 500 },
];
export const certificates: T.Certificate[] = [
  { id: "CERT-001", kind: "Classroom", title: { en: "Classroom Training Completion", kn: "ತರಗತಿ ತರಬೇತಿ ಪೂರ್ಣಗೊಳಿಕೆ" }, issued: d("09-15") },
  { id: "CERT-002", kind: "Course", title: { en: "Panchayat Raj Foundations", kn: "ಪಂಚಾಯತ್ ರಾಜ್ ಮೂಲಭೂತ ಅಂಶಗಳು" }, issued: d("09-28"), courseId: "C-PR" },
];
export const notifications: T.Notification[] = [
  { id: "N-1", tab: "Learning", title: { en: "Next lesson ready", kn: "ಮುಂದಿನ ಪಾಠ ಸಿದ್ಧ" }, body: { en: "Continue 'Check your understanding'.", kn: "'ನಿಮ್ಮ ತಿಳುವಳಿಕೆ ಪರೀಕ್ಷಿಸಿ' ಮುಂದುವರಿಸಿ." }, at: d("10-19"), read: false, href: "/app/learning/C-PR" },
  { id: "N-2", tab: "Community", title: { en: "Follow-up due: G-3001", kn: "ಅನುಸರಣೆ ಬಾಕಿ: G-3001" }, body: { en: "Hand pump issue needs a follow-up.", kn: "ಹ್ಯಾಂಡ್ ಪಂಪ್ ಸಮಸ್ಯೆಗೆ ಅನುಸರಣೆ ಬೇಕು." }, at: d("10-18"), read: false, href: "/app/grievances/G-3001" },
  { id: "N-3", tab: "Training", title: { en: "Cohort B reminder", kn: "ಕೋಹಾರ್ಟ್ B ಜ್ಞಾಪನೆ" }, body: { en: "Training at Mysuru Training Institute (fictional).", kn: "ಮೈಸೂರು ತರಬೇತಿ ಸಂಸ್ಥೆಯಲ್ಲಿ ತರಬೇತಿ (ಕಾಲ್ಪನಿಕ)." }, at: d("10-10"), read: true, href: "/app/training" },
  { id: "N-4", tab: "Rewards", title: { en: "15 points validated", kn: "15 ಅಂಕ ದೃಢೀಕರಿಸಲಾಗಿದೆ" }, body: { en: "For on-time follow-up.", kn: "ಸಮಯಕ್ಕೆ ಅನುಸರಣೆಗಾಗಿ." }, at: d("10-09"), read: true, href: "/app/rewards" },
  { id: "N-5", tab: "System", title: { en: "Privacy notice v1.2 (demo)", kn: "ಗೌಪ್ಯತಾ ಸೂಚನೆ v1.2 (ಡೆಮೊ)" }, body: { en: "Review what changed.", kn: "ಏನು ಬದಲಾಗಿದೆ ನೋಡಿ." }, at: d("10-01"), read: true, href: "/privacy" },
];
export const templates: T.Template[] = [
  { id: "TP-1", name: "Training reminder", purpose: "Training reminder", en: "Hello {{name}}, your training at {{venue}} starts on {{date}}. Please bring your ID checklist.", kn: "ನಮಸ್ಕಾರ {{name}}, {{venue}} ನಲ್ಲಿ ನಿಮ್ಮ ತರಬೇತಿ {{date}} ರಂದು ಆರಂಭ.", status: "Published", uses: 14 },
  { id: "TP-2", name: "Follow-up to authority", purpose: "Follow-up to an authority", en: "Respected Sir/Madam, I am following up on the {{issue}} reported at {{location}} on {{date}}. Kindly let us know the expected next step. Thank you.", kn: "ಗೌರವಾನ್ವಿತರೇ, {{date}} ರಂದು {{location}} ನಲ್ಲಿ ವರದಿ ಮಾಡಿದ {{issue}} ಬಗ್ಗೆ ಅನುಸರಿಸುತ್ತಿದ್ದೇನೆ. ಮುಂದಿನ ಹೆಜ್ಜೆ ತಿಳಿಸಿ. ಧನ್ಯವಾದಗಳು.", status: "Published", uses: 9 },
  { id: "TP-3", name: "LMS reminder", purpose: "LMS reminder", en: "Hi {{name}}, your next lesson '{{lesson}}' is ready.", kn: "ನಮಸ್ಕಾರ {{name}}, ನಿಮ್ಮ ಮುಂದಿನ ಪಾಠ '{{lesson}}' ಸಿದ್ಧ.", status: "Draft", uses: 0 },
];
export const audit: T.AuditEntry[] = [
  { id: "AU-1", at: d("10-14T10:12"), actor: "Reviewer Meena", role: "State Administrator", action: "Application decision", resourceType: "Application", resourceId: "APP-26-1001", before: "Under Review", after: "Approved" },
  { id: "AU-2", at: d("10-15T09:00"), actor: "Coordinator Mohan", role: "Taluk / GP Coordinator", action: "Sensitive record view", resourceType: "VoterRecord", resourceId: "V-901", after: "EPIC masked view" },
  { id: "AU-3", at: d("10-16T14:30"), actor: "Savitha Rao", role: "Trainer", action: "Attendance edit", resourceType: "Attendance", resourceId: "CL-A1/P-1041/Day1", before: "Absent", after: "Late" },
];
export const consents: T.ConsentRecord[] = [
  { receiptId: "CR-7000", noticeVersion: "1.2-demo", purposeId: "program-admin", status: "granted", actionTimestamp: d("07-01T10:00"), language: "kn", sourceScreen: "register", subject: ME },
  { receiptId: "CR-7001", noticeVersion: "1.2-demo", purposeId: "promo-comms", status: "declined", actionTimestamp: d("07-01T10:00"), language: "kn", sourceScreen: "register", subject: ME },
  { receiptId: "CR-7002", noticeVersion: "1.2-demo", purposeId: "recorded-answers", status: "granted", actionTimestamp: d("09-20T10:00"), language: "kn", sourceScreen: "lesson", subject: ME },
  { receiptId: "CR-7003", noticeVersion: "1.2-demo", purposeId: "leaderboard", status: "granted", actionTimestamp: d("09-21T10:00"), language: "kn", sourceScreen: "rewards", subject: ME },
];
export const progress: Record<string, T.LessonProgress> = {
  "L-PR1": { done: true, watchedPct: 100, positionSec: 720 }, "L-PR2": { done: true }, "L-PR3": { done: false, attempts: [{ score: 2, total: 4, at: d("10-10"), answers: [0, 1, 0, 1] }] },
  "L-GR1": { done: false, watchedPct: 40, positionSec: 330 },
};

// ---- Admin panel seed: accounts and villages (fictional) ----
import type { User, Village } from "./types";
import { gps, districtOf } from "./seed-geo";
const staff = (id: string, name: string, role: User["role"], scope: Partial<Pick<User, "district" | "taluk" | "gp">> = {}, n: number): User => ({
  id, name, role, status: "Active", phone: `+91 9000000${String(100 + n)}`, email: `${name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/\.$/, "")}@example.org`,
  district: scope.district ?? "", taluk: scope.taluk ?? "", gp: scope.gp ?? "", createdAt: "2026-06-01", lastLogin: "2026-10-2" + (n % 3),
});
export const users: User[] = [
  staff("U-001", "Meena Reviewer", "superAdmin", {}, 1),
  staff("U-002", "Dinesh (District)", "districtAdmin", { district: "Mysuru" }, 2),
  staff("U-003", "Chitra (AC)", "blockAdmin", { district: "Mysuru", taluk: "Nanjangud" }, 3),
  staff("U-004", "Mohan (Local)", "blockAdmin", { district: "Mysuru", taluk: "Nanjangud", gp: "Hosahalli GP" }, 4),
  staff("U-005", "Neha Coordinator", "trainingCoordinator", {}, 5),
  staff("U-006", "Savitha Rao", "trainer", {}, 6),
  staff("U-007", "Girish Grievance", "grievanceManager", {}, 7),
  staff("U-008", "Charu Content", "contentManager", {}, 8),
  ...participants.map((p, i): User => ({
    id: `U-V${p.id.slice(2)}`, name: p.name, role: "volunteer", status: "Active", phone: `+91 9000001${String(100 + i)}`, email: `${p.name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/\.$/, "")}@example.org`,
    district: p.district, taluk: p.taluk, gp: p.gp, participantId: p.id, createdAt: applications.find((a) => a.id === p.appId)?.submittedAt ?? "2026-07-01", lastLogin: i % 3 === 0 ? undefined : "2026-10-1" + (i % 9),
  })),
  { id: "U-V900", name: "Pradeep K", role: "volunteer", status: "Inactive", phone: "+91 9000001990", email: "pradeep.k@example.org", district: "Mandya", taluk: "Pandavapura", gp: "Hirisave GP", createdAt: "2026-08-12", statusReason: "Requested a pause" },
];
export const villages: Village[] = gps.flatMap((g, i): Village[] => {
  const vols = participants.filter((p) => p.gp === g.name).map((p) => p.id);
  const base: Village = { id: `V-${100 + i * 2}`, name: g.name.replace(" GP", ""), gp: g.name, taluk: g.taluk, district: districtOf(g.taluk), population: 900 + i * 173, status: vols.length ? "Enrolled" : "Pending", enrolledOn: vols.length ? `2026-09-${String(2 + i).padStart(2, "0")}` : undefined, volunteerIds: vols };
  const extra: Village = { id: `V-${101 + i * 2}`, name: `${g.name.replace(" GP", "")} Colony`, gp: g.name, taluk: g.taluk, district: districtOf(g.taluk), population: 300 + i * 40, status: i === 4 ? "Inactive" : "Pending", volunteerIds: [] };
  return i % 3 === 0 ? [base, extra] : [base];
});

// ---- Learning resource library seed ----
import type { LearningResource, ResourceCategory } from "./types";
export const resourceCategories: ResourceCategory[] = [
  { id: "RC-1", name: { en: "Gram Panchayat governance", kn: "ಗ್ರಾಮ ಪಂಚಾಯತ್ ಆಡಳಿತ" }, order: 1 },
  { id: "RC-2", name: { en: "Village administration", kn: "ಗ್ರಾಮ ಆಡಳಿತ" }, order: 2 },
  { id: "RC-3", name: { en: "Public services", kn: "ಸಾರ್ವಜನಿಕ ಸೇವೆಗಳು" }, order: 3 },
  { id: "RC-4", name: { en: "Grievance handling", kn: "ದೂರು ನಿರ್ವಹಣೆ" }, order: 4 },
  { id: "RC-5", name: { en: "Digital skills", kn: "ಡಿಜಿಟಲ್ ಕೌಶಲ್ಯ" }, order: 5 },
];
const rs = (id: string, o: Partial<LearningResource> & Pick<LearningResource, "title" | "short" | "categoryId" | "topic" | "type">): LearningResource => ({ full: "", language: "en", audience: ["volunteers", "trainers"], order: 1, status: "Published", publishDate: "2026-09-01", createdAt: "2026-09-01", updatedAt: "2026-09-01", id, ...o });
export const resources: LearningResource[] = [
  rs("LR-1", { title: "Women in village councils (documentary)", short: "A 5-minute documentary on how villagers, especially women, take part in Panchayat governance.", full: "Licensed sample film (CC BY 3.0, Indian Diplomacy). It is not footage of this programme's training.", categoryId: "RC-1", topic: "Participation", type: "videoFile", file: { name: "women-in-panchayat.webm", size: 26712764, mime: "video/webm", path: "/videos/women-in-panchayat.webm" }, thumb: { name: "poster.jpg", size: 111892, mime: "image/jpeg", path: "/videos/women-in-panchayat-poster.jpg" }, order: 1, credit: "Indian Diplomacy, CC BY 3.0, via Wikimedia Commons" }),
  rs("LR-2", { title: "Ministry of Panchayati Raj – official portal", short: "National portal for Panchayati Raj information, schemes and notices. Opens an external website.", categoryId: "RC-1", topic: "Official sources", type: "link", url: "https://panchayat.gov.in/", thumb: { name: "gp.jpg", size: 164938, mime: "image/jpeg", path: "/images/sections/journey.jpg" }, order: 2 }),
  rs("LR-3", { title: "Karnataka Rural Development & Panchayat Raj Department", short: "State department website with circulars and Gram Panchayat information. Opens an external website.", categoryId: "RC-2", topic: "Official sources", type: "link", url: "https://rdpr.karnataka.gov.in/", language: "both", thumb: { name: "village.jpg", size: 156083, mime: "image/jpeg", path: "/images/sections/about.jpg" }, order: 3 }),
  rs("LR-4", { title: "National Portal of India (draft)", short: "Draft entry: find government services and information. Not yet published.", categoryId: "RC-3", topic: "Public services", type: "link", url: "https://www.india.gov.in/", status: "Draft", publishDate: undefined, order: 4 }),
];
