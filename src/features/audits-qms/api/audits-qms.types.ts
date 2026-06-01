// @ts-nocheck — QMS module pending backend_v3 migration
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApiResponse } from "@/lib/api-types";
import type { Schema } from "@/types/api-types";

export const AUDIT_BASE = "/api/audits" as const;

export const AUDIT_ENDPOINTS = {
  list: AUDIT_BASE,
  create: AUDIT_BASE,
  detail: (id: number) => `${AUDIT_BASE}/${id}`,
  update: (id: number) => `${AUDIT_BASE}/${id}`,
  findings: (id: number) => `${AUDIT_BASE}/${id}/findings`,
} as const;

export type Audit = Schema["AuditResponse"];
export type AuditCreate = Schema["AuditCreate"];
export type AuditUpdate = Schema["AuditUpdate"];
export type AuditFinding = Schema["AuditFindingResponse"];
export type AuditFindingCreate = Schema["AuditFindingCreate"];

export type AuditListResponse = Extract<ApiResponse<"/api/audits", "get">, any[]>;