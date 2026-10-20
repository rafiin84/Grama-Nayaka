"use client";
import { dictionaries } from "./i18n";
import { usePrefs } from "./store";
import type { L } from "./types";

export function useT() {
  const lang = usePrefs((s) => s.lang);
  /** Co-located bilingual copy: both languages are required by the signature. */
  const tr = (en: string, kn: string) => (lang === "kn" ? kn : en);
  /** Content that may lack a translation: falls back and marks it clearly. */
  const loc = (l: L) => {
    const v = l[lang];
    if (v && v.trim()) return v;
    return `${l[lang === "kn" ? "en" : "kn"]} ${lang === "kn" ? "(ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಮಾತ್ರ)" : "(Kannada only)"}`;
  };
  return { t: dictionaries[lang], lang, tr, loc };
}
