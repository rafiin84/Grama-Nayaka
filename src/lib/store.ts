"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lang } from "./i18n";

import type { Role } from "./types";
import { setActiveScope, setActiveSession, type ScopeSel } from "./scope";
import type { Session } from "./session";
import { DEMO_ME, setMe } from "./seed";
export type { Role };

export type Stage = "applicant" | "approved" | "training" | "lms" | "fieldwork" | "completed";
interface PrefState {
  lang: Lang;
  role: Role;
  stage: Stage;
  setStage: (s: Stage) => void;
  scopeSel: ScopeSel;
  session: Session | null;
  signIn: (s: Session) => void;
  signOut: () => void;
  renameSession: (name: string) => void;
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
      session: null,
      signIn: (session) => set((s) => { setActiveSession(session); setMe(session.participantId ?? DEMO_ME); const scopeSel = session.trainerId ? { ...s.scopeSel, trainer: `t:${session.trainerId}` } : s.scopeSel; setActiveScope(scopeSel); return { session, role: session.role, scopeSel, ...(session.applicant ? { stage: "applicant" as Stage } : {}) }; }),
      signOut: () => set(() => { setActiveSession(null); setMe(DEMO_ME); setActiveScope({}); return { session: null, role: "participant" as Role, scopeSel: {} }; }),
      renameSession: (name) => set((s) => { if (!s.session) return {}; const session = { ...s.session, name }; setActiveSession(session); return { session }; }),
      setScope: (role, value) => set((s) => { const scopeSel = { ...s.scopeSel, [role]: value }; setActiveScope(scopeSel); return { scopeSel }; }),
      setLang: (lang) => set({ lang }),
      setRole: (role) => set({ role }),
    }),
    { name: "gn-prefs", onRehydrateStorage: () => (state) => { if (state) { setActiveScope(state.scopeSel); setActiveSession(state.session ?? null); setMe(state.session?.participantId ?? DEMO_ME); } } },
  ),
);

export const isAdminRole = (r: Role) => r !== "participant" && r !== "trainer";
