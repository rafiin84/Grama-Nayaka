"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lang } from "./i18n";

import type { Role } from "./types";
import { setActiveScope, type ScopeSel } from "./scope";
export type { Role };

export type Stage = "applicant" | "approved" | "training" | "lms" | "fieldwork" | "completed";
interface PrefState {
  lang: Lang;
  role: Role;
  stage: Stage;
  setStage: (s: Stage) => void;
  scopeSel: ScopeSel;
  setScope: (role: Role, value: string) => void;
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
      scopeSel: {},
      setScope: (role, value) => set((s) => { const scopeSel = { ...s.scopeSel, [role]: value }; setActiveScope(scopeSel); return { scopeSel }; }),
      setLang: (lang) => set({ lang }),
      setRole: (role) => set({ role }),
    }),
    { name: "gn-prefs", onRehydrateStorage: () => (state) => { if (state) setActiveScope(state.scopeSel); } },
  ),
);

export const isAdminRole = (r: Role) => r !== "participant" && r !== "trainer";
