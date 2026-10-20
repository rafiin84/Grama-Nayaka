"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lang } from "./i18n";

export type Role = "state" | "district" | "ac" | "local" | "trainer" | "participant";

export type Stage = "applicant" | "approved" | "training" | "lms" | "fieldwork" | "completed";
interface PrefState {
  lang: Lang;
  role: Role;
  stage: Stage;
  setStage: (s: Stage) => void;
  setLang: (l: Lang) => void;
  setRole: (r: Role) => void;
}

// Only non-sensitive demo preferences are persisted.
export const usePrefs = create<PrefState>()(
  persist(
    (set) => ({
      lang: "kn",
      role: "participant",
      stage: "lms",
      setStage: (stage) => set({ stage }),
      setLang: (lang) => set({ lang }),
      setRole: (role) => set({ role }),
    }),
    { name: "gn-prefs" },
  ),
);

export const isAdminRole = (r: Role) => r !== "participant" && r !== "trainer";
