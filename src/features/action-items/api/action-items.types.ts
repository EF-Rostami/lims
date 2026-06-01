// @ts-nocheck — QMS module pending backend_v3 migration
import type { Schema } from "@/types/api-types";

export const ACTION_BASE = "/api/actions" as const;

export const ACTION_ENDPOINTS = {
  base: ACTION_BASE,
  detail: (id: number) => `${ACTION_BASE}/${id}`,
  complete: (id: number) => `${ACTION_BASE}/${id}/complete`,
  verify: (id: number) => `${ACTION_BASE}/${id}/verify`,
} as const;

export type ActionItem = Schema["ActionItemRead"];
export type ActionItemCreate = Schema["ActionItemCreate"];
export type ActionItemUpdate = Schema["ActionItemUpdate"];
export type ActionItemVerification = Schema["ActionItemVerification"];

// Status helper for UI logic
export enum ActionStatus {
  IN_PROGRESS = "IN_PROGRESS",
  VERIFICATION_DUE = "VERIFICATION_DUE",
  CLOSED = "CLOSED",
}