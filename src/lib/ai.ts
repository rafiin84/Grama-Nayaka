import type { Lang } from "./i18n";
// Deterministic local mock. No model is called and no resident/voter data is ever sent anywhere.
export const VERIFY = { en: "Please verify with the relevant authority before relying on this.", kn: "ಇದನ್ನು ಅವಲಂಬಿಸುವ ಮೊದಲು ಸಂಬಂಧಿತ ಪ್ರಾಧಿಕಾರದೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ." };
export function chat(prompt: string, ctx: string, lang: Lang): { text: string; sources: string[] } {
  const p = prompt.toLowerCase();
  const T = (en: string, kn: string) => (lang === "kn" ? kn : en);
  let text: string; let sources: string[] = [];
  if (/panchayat|ಪಂಚಾಯತ್|gram sabha|ಗ್ರಾಮ ಸಭೆ/.test(p)) { text = T("Panchayat Raj is a system of local self-government with more than one tier. The Gram Sabha is where residents of a village meet to discuss local matters with the Panchayat. Details of powers and procedures should be checked in the approved course material.", "ಪಂಚಾಯತ್ ರಾಜ್ ಹಲವು ಹಂತಗಳ ಸ್ಥಳೀಯ ಸ್ವಯಂ ಸರ್ಕಾರ ವ್ಯವಸ್ಥೆ. ಗ್ರಾಮ ಸಭೆ ಎಂದರೆ ಹಳ್ಳಿಯ ನಿವಾಸಿಗಳು ಪಂಚಾಯತ್‌ನೊಂದಿಗೆ ಸ್ಥಳೀಯ ವಿಷಯ ಚರ್ಚಿಸುವ ಸಭೆ. ಅಧಿಕಾರ ಮತ್ತು ಕಾರ್ಯವಿಧಾನದ ವಿವರಗಳನ್ನು ಅನುಮೋದಿತ ಕೋರ್ಸ್ ಸಾಮಗ್ರಿಯಲ್ಲಿ ಪರಿಶೀಲಿಸಿ."); sources = ["Course: Panchayat Raj Foundations · Reading 2"]; }
  else if (/water|ನೀರು|collect|follow/.test(p)) { text = T("Before following up on a water issue, note: the exact location, since when it has been a problem, how many households are affected, what you or the residents already tried, and any photos. Do not collect ID numbers or opinions about people.", "ನೀರಿನ ಸಮಸ್ಯೆಯ ಅನುಸರಣೆಗೆ ಮೊದಲು ಗಮನಿಸಿ: ನಿಖರ ಸ್ಥಳ, ಎಷ್ಟು ದಿನದಿಂದ, ಎಷ್ಟು ಮನೆಗಳಿಗೆ ತೊಂದರೆ, ಈಗಾಗಲೇ ಏನು ಪ್ರಯತ್ನಿಸಲಾಗಿದೆ, ಫೋಟೋಗಳು. ಗುರುತಿನ ಸಂಖ್ಯೆ ಅಥವಾ ವ್ಯಕ್ತಿಗಳ ಬಗ್ಗೆ ಅಭಿಪ್ರಾಯ ಸಂಗ್ರಹಿಸಬೇಡಿ."); sources = ["Course: Grievance Handling & Follow-up · Video 1"]; }
  else if (/draft|message|ಸಂದೇಶ/.test(p)) { text = T("Open the Draft Studio tab to prepare a respectful follow-up. I suggest keeping it short, factual and polite.", "ಗೌರವಯುತ ಅನುಸರಣಾ ಸಂದೇಶ ತಯಾರಿಸಲು ಕರಡು ಸ್ಟುಡಿಯೋ ಟ್ಯಾಬ್ ತೆರೆಯಿರಿ. ಚಿಕ್ಕ, ವಾಸ್ತವಿಕ ಮತ್ತು ಸೌಜನ್ಯಯುತವಾಗಿರಲಿ."); }
  else if (/summar|open issues|ಸಾರಾಂಶ/.test(p)) { text = T("You have open cases that need attention. Start with those with an overdue follow-up date, then those marked Closure Pending that await your confirmation. (Summary uses case titles only; no resident details are used.)", "ಗಮನ ಬೇಕಾದ ಬಾಕಿ ಪ್ರಕರಣಗಳಿವೆ. ಮೊದಲು ವಿಳಂಬ ಅನುಸರಣೆ, ನಂತರ ನಿಮ್ಮ ದೃಢೀಕರಣಕ್ಕೆ ಕಾಯುತ್ತಿರುವ 'ಮುಚ್ಚಲು ಬಾಕಿ' ಪ್ರಕರಣಗಳು. (ಸಾರಾಂಶ ಶೀರ್ಷಿಕೆಗಳನ್ನು ಮಾತ್ರ ಬಳಸುತ್ತದೆ; ನಿವಾಸಿ ವಿವರ ಬಳಸುವುದಿಲ್ಲ.)"); }
  else text = T("I can help with learning questions, issue follow-up steps and message drafts. I may be wrong, and I cannot give legal advice or make decisions for you.", "ಕಲಿಕೆಯ ಪ್ರಶ್ನೆ, ಸಮಸ್ಯೆ ಅನುಸರಣಾ ಹೆಜ್ಜೆ ಮತ್ತು ಸಂದೇಶ ಕರಡಿಗೆ ನಾನು ನೆರವಾಗಬಲ್ಲೆ. ನಾನು ತಪ್ಪಬಹುದು; ಕಾನೂನು ಸಲಹೆ ಅಥವಾ ನಿಮ್ಮ ಪರವಾಗಿ ನಿರ್ಧಾರ ನೀಡಲಾರೆ.");
  return { text: `${text}\n\n${VERIFY[lang]}${ctx ? `\n(${T("Context", "ಸಂದರ್ಭ")}: ${ctx})` : ""}`, sources };
}
const pathways: Record<string, { en: string; kn: string; docs: string; days: number }> = {
  water: { en: "Gram Panchayat (water supply / PDO office), then taluk-level drinking water engineering office", kn: "ಗ್ರಾಮ ಪಂಚಾಯತ್ (ನೀರು ಸರಬರಾಜು / PDO ಕಚೇರಿ), ನಂತರ ತಾಲ್ಲೂಕು ಮಟ್ಟದ ಕುಡಿಯುವ ನೀರು ಇಂಜಿನಿಯರಿಂಗ್ ಕಚೇರಿ", docs: "Location, households affected, photos, dates of earlier requests", days: 7 },
  roads: { en: "Gram Panchayat, then taluk-level public works / road authority", kn: "ಗ್ರಾಮ ಪಂಚಾಯತ್, ನಂತರ ತಾಲ್ಲೂಕು ಮಟ್ಟದ ಲೋಕೋಪಯೋಗಿ / ರಸ್ತೆ ಪ್ರಾಧಿಕಾರ", docs: "Road name, stretch, photos, accident reports if any", days: 10 },
  sanitation: { en: "Gram Panchayat sanitation / solid waste in-charge", kn: "ಗ್ರಾಮ ಪಂಚಾಯತ್ ನೈರ್ಮಲ್ಯ / ಘನತ್ಯಾಜ್ಯ ಉಸ್ತುವಾರಿ", docs: "Location, days uncollected, photos", days: 5 },
  lighting: { en: "Gram Panchayat (street lighting) or electricity supply company local office", kn: "ಗ್ರಾಮ ಪಂಚಾಯತ್ (ಬೀದಿ ದೀಪ) ಅಥವಾ ವಿದ್ಯುತ್ ಕಂಪನಿ ಸ್ಥಳೀಯ ಕಚೇರಿ", docs: "Pole numbers or landmarks, number of lights out", days: 7 },
};
export function pathway(p: { category: string; where: string; duration: string; tried: string; evidence: boolean }, lang: Lang) {
  const T = (en: string, kn: string) => (lang === "kn" ? kn : en); const x = pathways[p.category] ?? { en: "Relevant Panchayat or department office (to be confirmed)", kn: "ಸಂಬಂಧಿತ ಪಂಚಾಯತ್ ಅಥವಾ ಇಲಾಖೆ ಕಚೇರಿ (ದೃಢೀಕರಿಸಬೇಕು)", docs: "Location, short description, photos", days: 7 };
  const known = !!pathways[p.category];
  return {
    summary: T(`Issue at ${p.where || "the stated location"}, ongoing ${p.duration || "for an unspecified time"}.${p.tried ? " Already tried: " + p.tried + "." : ""}`, `${p.where || "ತಿಳಿಸಿದ ಸ್ಥಳ"} ನಲ್ಲಿ ಸಮಸ್ಯೆ, ${p.duration || "ಅವಧಿ ತಿಳಿಸಿಲ್ಲ"}.${p.tried ? " ಈಗಾಗಲೇ ಪ್ರಯತ್ನಿಸಿದ್ದು: " + p.tried + "." : ""}`),
    authority: lang === "kn" ? x.kn : x.en, docs: x.docs + (p.evidence ? "" : T(" (collect photos if possible)", " (ಸಾಧ್ಯವಾದರೆ ಫೋಟೋ ಸಂಗ್ರಹಿಸಿ)")),
    next: T("Share the details politely with the office and ask what the next step and timeline are.", "ವಿವರಗಳನ್ನು ಸೌಜನ್ಯದಿಂದ ಕಚೇರಿಗೆ ತಿಳಿಸಿ ಮತ್ತು ಮುಂದಿನ ಹೆಜ್ಜೆ ಹಾಗೂ ಕಾಲಮಿತಿ ಕೇಳಿ."), days: x.days,
    confidence: known ? T("Medium — a common pathway, but local arrangements differ.", "ಮಧ್ಯಮ — ಸಾಮಾನ್ಯ ಮಾರ್ಗ, ಆದರೆ ಸ್ಥಳೀಯ ವ್ಯವಸ್ಥೆ ಬೇರೆಯಾಗಿರಬಹುದು.") : T("Low — category unclear; please confirm the right office locally.", "ಕಡಿಮೆ — ವರ್ಗ ಸ್ಪಷ್ಟವಿಲ್ಲ; ಸರಿಯಾದ ಕಚೇರಿಯನ್ನು ಸ್ಥಳೀಯವಾಗಿ ಖಚಿತಪಡಿಸಿ."),
  };
}
export function compose(kind: string, tone: string, lang: Lang, v: Record<string, string>) {
  const kn = lang === "kn"; const warm = tone === "Warm";
  const g = kn ? (warm ? "ನಮಸ್ಕಾರ" : "ಗೌರವಾನ್ವಿತರೇ") : warm ? "Hello" : "Respected Sir/Madam";
  const body: Record<string, [string, string]> = {
    "Resident update": [`Update on the ${v.issue}: we have followed up and the next step is ${v.step}. We will keep you informed.`, `${v.issue} ಬಗ್ಗೆ ಅಪ್‌ಡೇಟ್: ಅನುಸರಣೆ ಮಾಡಿದ್ದೇವೆ; ಮುಂದಿನ ಹೆಜ್ಜೆ ${v.step}. ನಿಮಗೆ ತಿಳಿಸುತ್ತಿರುತ್ತೇವೆ.`],
    "Follow-up to an authority": [`I am following up on the ${v.issue} at ${v.location}, first reported on ${v.date}. Kindly let us know the expected next step and timeline. Thank you for your time.`, `${v.date} ರಂದು ${v.location} ನಲ್ಲಿ ವರದಿ ಮಾಡಿದ ${v.issue} ಬಗ್ಗೆ ಅನುಸರಿಸುತ್ತಿದ್ದೇನೆ. ಮುಂದಿನ ಹೆಜ್ಜೆ ಮತ್ತು ಕಾಲಮಿತಿ ತಿಳಿಸಿ. ನಿಮ್ಮ ಸಮಯಕ್ಕೆ ಧನ್ಯವಾದಗಳು.`],
    "Event invitation": [`You are invited to ${v.issue} on ${v.date} at ${v.location}. Everyone is welcome.`, `${v.date} ರಂದು ${v.location} ನಲ್ಲಿ ${v.issue} ಕಾರ್ಯಕ್ರಮಕ್ಕೆ ಆಹ್ವಾನ. ಎಲ್ಲರಿಗೂ ಸ್ವಾಗತ.`],
    "LMS reminder": [`Your next lesson '${v.issue}' is ready. A few minutes today keeps you on track.`, `ನಿಮ್ಮ ಮುಂದಿನ ಪಾಠ '${v.issue}' ಸಿದ್ಧ. ಇಂದು ಕೆಲವು ನಿಮಿಷ ಕಲಿತರೆ ಸರಿಯಾದ ಹಾದಿಯಲ್ಲಿರುತ್ತೀರಿ.`],
    "Training reminder": [`Reminder: training starts on ${v.date} at ${v.location}.`, `ಜ್ಞಾಪನೆ: ${v.date} ರಂದು ${v.location} ನಲ್ಲಿ ತರಬೇತಿ ಆರಂಭ.`],
    "Course completion congratulations": [`Congratulations on completing ${v.issue}! Well done.`, `${v.issue} ಪೂರ್ಣಗೊಳಿಸಿದ್ದಕ್ಕೆ ಅಭಿನಂದನೆಗಳು!`],
    "Missing-information request": [`To follow up on ${v.issue}, could you please share ${v.step}? Share only what you are comfortable with.`, `${v.issue} ಅನುಸರಣೆಗೆ ${v.step} ಹಂಚಿಕೊಳ್ಳಬಹುದೇ? ನಿಮಗೆ ಸರಿ ಎನಿಸಿದಷ್ಟು ಮಾತ್ರ.`],
  };
  const b = body[kind]?.[kn ? 1 : 0] ?? "";
  return `${g},\n\n${b}\n\n${kn ? "ಧನ್ಯವಾದಗಳು," : "Thank you,"}\n${v.sender}`;
}
