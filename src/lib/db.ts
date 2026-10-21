"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type * as T from "./types";
import { initial, type DbData } from "./initialData";
import { clearBlobs } from "./blobStore";
import { nextId } from "./ids";
import { roleUsers, inScope, type RoleUser } from "./scope";

const now = () => new Date().toISOString().slice(0, 16).replace("T", " ");
const counter = { n: 5000 };
/** Unique even after a reload: ids already present in the saved data are skipped. */
const nid = (p: string): string => { const blob = JSON.stringify(strip(useDb.getState())); return nextId(p, (id) => blob.includes(`"${id}"`), counter); };

interface Actions {
  reset: () => void;
  log: (e: Omit<T.AuditEntry, "id" | "at">) => void;
  patch: (fn: (d: DbData) => void) => void;
}
export const useDb = create<DbData & Actions>()(
  persist(
    (set) => ({
      ...initial(),
      reset: () => { void clearBlobs(); set({ ...initial() }); },
      patch: (fn) => set((s) => { const d = structuredClone(strip(s)); fn(d); return d; }),
      log: (e) => set((s) => ({ audit: [{ id: nid("AU"), at: now(), ...e }, ...s.audit] })),
    }),
    { name: "gn-demo-db-v3", storage: createJSONStorage(() => localStorage), partialize: (s) => strip(s) as never },
  ),
);
function strip(s: DbData & Partial<Actions>): DbData {
  const { reset, log, patch, ...data } = s as DbData & Actions; void reset; void log; void patch; return data;
}
export const getDb = () => useDb.getState();
export { nid, now };

export type { DbData, RoleUser };
export { roleUsers, inScope };
