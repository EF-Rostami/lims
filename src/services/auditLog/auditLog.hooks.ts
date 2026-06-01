import { useQuery } from "@tanstack/react-query";
import { auditLogService } from "./auditLog.service";
import { AuditLogEntry } from "./auditLog.types";

export const auditQueryKeys = {
  all: ["audit_logs"] as const,
  resource: (table: string, id: number) => [...auditQueryKeys.all, "resource", table, id] as const,
};

export function useResourceAudit(tableName: string, recordId: number) {
  return useQuery<AuditLogEntry[]>({
    queryKey: auditQueryKeys.resource(tableName, recordId),
    queryFn: () => auditLogService.getResourceLogs(tableName, recordId),
    enabled: !!recordId && !!tableName,
  });
}