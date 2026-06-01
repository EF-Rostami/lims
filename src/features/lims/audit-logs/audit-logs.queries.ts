import { useQuery } from "@tanstack/react-query";
import { auditLogsApi, type ListAuditLogsParams } from "./audit-logs.api";

export const auditLogKeys = {
  all: ["lims", "audit-logs"] as const,
  list: (params?: ListAuditLogsParams) => [...auditLogKeys.all, "list", params] as const,
};

export function useAuditLogs(params?: ListAuditLogsParams) {
  return useQuery({
    queryKey: auditLogKeys.list(params),
    queryFn: () => auditLogsApi.list(params),
  });
}
