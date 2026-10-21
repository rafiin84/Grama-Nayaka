"use client";
import { useDb } from "./db";
import { usePrefs } from "./store";
import { can, canChangeSettings, canManageUsers } from "./rbac";
import type { Action, Module } from "./types";

/** Permission checks against the editable RBAC matrix (UI simulation; production must enforce on a server). */
export function useCan() {
  const rbac = useDb((s) => s.rbac); const role = usePrefs((s) => s.role);
  return { can: (m: Module, a: Action) => can(rbac, role, m, a), manageUsers: canManageUsers(rbac, role), changeSettings: canChangeSettings(rbac, role), role };
}
