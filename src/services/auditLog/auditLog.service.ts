import apiClient from "@/lib/api-client";
import { handleApi } from "@/lib/handle-api";
import { AuditLogEntry } from "./auditLog.types";

export const auditLogService = {
  async getResourceLogs(tableName: string, recordId: number) {
    const result = await handleApi(
      apiClient.get<AuditLogEntry[]>(`/api/auditLog/resource/${tableName}/${recordId}`)
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result as AuditLogEntry[];
  },

  async getGlobalSummary(limit: number = 100) {
    const result = await handleApi(
      apiClient.get<AuditLogEntry[]>("/api/auditLog/summary", { params: { limit } })
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result as AuditLogEntry[];
  }
};