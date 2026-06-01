// @ts-nocheck — QMS module pending backend_v3 migration
/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/api-client";
import { handleApi } from "@/lib/handle-api";
import type { ApiResponse } from "@/lib/api-types";
import { AUDIT_ENDPOINTS } from "./audit.types";

type AuditLogResponse = Extract<ApiResponse<"/api/audit-trail/search", "get">, any[]>;


export const auditService = {
  /**
   * GET /api/audit-trail/search
   */
  async searchLogs(params: {
    table_name?: string;
    record_id?: number;
    user_id?: number;
    action?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }) {
    const result = await handleApi(
      apiClient.get<AuditLogResponse>(AUDIT_ENDPOINTS.search, { params })
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  /**
   * GET /api/audit-trail/resource/{table_name}/{record_id}
   */
  async getResourceHistory(tableName: string, recordId: number) {
    const result = await handleApi(
      apiClient.get<AuditLogResponse>(AUDIT_ENDPOINTS.resource(tableName, recordId))
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },
};