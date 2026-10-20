export const NOTICE_VERSION = "1.2-demo";
export interface Purpose { id: string; required: boolean; en: string; kn: string; descEn: string; descKn: string }
export const purposes: Purpose[] = [
  { id: "program-admin", required: true, en: "Application and programme administration", kn: "ಅರ್ಜಿ ಮತ್ತು ಕಾರ್ಯಕ್ರಮ ನಿರ್ವಹಣೆ", descEn: "To review your application, run training, track learning progress and contact you about the programme.", descKn: "ನಿಮ್ಮ ಅರ್ಜಿ ಪರಿಶೀಲಿಸಲು, ತರಬೇತಿ ನಡೆಸಲು, ಕಲಿಕೆಯ ಪ್ರಗತಿ ಗಮನಿಸಲು ಮತ್ತು ಕಾರ್ಯಕ್ರಮದ ಬಗ್ಗೆ ಸಂಪರ್ಕಿಸಲು." },
  { id: "promo-comms", required: false, en: "Optional: promotional messages", kn: "ಐಚ್ಛಿಕ: ಪ್ರಚಾರ ಸಂದೇಶಗಳು", descEn: "Updates about new programmes and events. You can say no and still join.", descKn: "ಹೊಸ ಕಾರ್ಯಕ್ರಮ ಮತ್ತು ಕಾರ್ಯಕ್ರಮಗಳ ಮಾಹಿತಿ. ಬೇಡವೆಂದರೂ ಸೇರಬಹುದು." },
  { id: "recorded-answers", required: false, en: "Optional: audio/video recorded answers", kn: "ಐಚ್ಛಿಕ: ಆಡಿಯೋ/ವೀಡಿಯೋ ಉತ್ತರಗಳು", descEn: "Lets you submit spoken answers to reflection prompts, reviewed only by authorised trainers.", descKn: "ಚಿಂತನಾ ಪ್ರಶ್ನೆಗಳಿಗೆ ಮಾತಿನ ಉತ್ತರ ಸಲ್ಲಿಸಲು; ಅಧಿಕೃತ ತರಬೇತುದಾರರು ಮಾತ್ರ ನೋಡುತ್ತಾರೆ." },
  { id: "leaderboard", required: false, en: "Optional: show my name on leaderboards", kn: "ಐಚ್ಛಿಕ: ಲೀಡರ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ನನ್ನ ಹೆಸರು", descEn: "Otherwise you appear only as an anonymous participant ID.", descKn: "ಇಲ್ಲದಿದ್ದರೆ ಅನಾಮಧೇಯ ಐಡಿ ಮಾತ್ರ ತೋರಿಸಲಾಗುತ್ತದೆ." },
];
export const MOCK_OTP = "123456"; // demo only. Never sent, logged or stored.
