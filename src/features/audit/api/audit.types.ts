// @ts-nocheck — QMS module pending backend_v3 migration
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApiResponse } from "@/lib/api-types";

export const AUDIT_BASE = "/api/audit-trail" as const;

export const AUDIT_ENDPOINTS = {
  search: `${AUDIT_BASE}/search`,
  resource: (tableName: string, recordId: number) => 
    `${AUDIT_BASE}/resource/${tableName}/${recordId}`,
} as const;

// Extract types from generated OpenAPI spec
export type AuditLog = Extract<ApiResponse<"/api/audit-trail/search", "get">, any[]>[number];