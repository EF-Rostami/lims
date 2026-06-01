/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { auditService } from "./audit.service";
import type { AuditLog } from "./audit.types";

export const auditQueryKeys = {
  all: ["audit-trail"] as const,
  search: (params: any) => [...auditQueryKeys.all, "search", params] as const,
  resource: (tableName: string, recordId: number) => 
    [...auditQueryKeys.all, "resource", tableName, recordId] as const,
};

export function useAuditSearch(params: {
  table_name?: string;
  record_id?: number;
  user_id?: number;
  action?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery<AuditLog[]>({
    queryKey: auditQueryKeys.search(params),
    queryFn: () => auditService.searchLogs(params),
  });
}

export function useResourceAuditHistory(tableName: string, recordId: number) {
  return useQuery<AuditLog[]>({
    queryKey: auditQueryKeys.resource(tableName, recordId),
    queryFn: () => auditService.getResourceHistory(tableName, recordId),
    enabled: !!tableName && !!recordId,
  });
}