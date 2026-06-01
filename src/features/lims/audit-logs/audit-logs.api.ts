import { limsApi } from "@/lib/lims-api";

export interface AuditLogEntry {
  id: number;
  user_id: number | null;
  entity_type: string;
  entity_id: number | null;
  action: string;
  changes: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditLogPage {
  data: AuditLogEntry[];
  total: number;
  page: number;
  page_size: number;
}

export interface ListAuditLogsParams {
  page?: number;
  page_size?: number;
  user_id?: number;
  entity_type?: string;
  entity_id?: number;
  action?: string;
}

export const auditLogsApi = {
  list: async (params?: ListAuditLogsParams): Promise<AuditLogPage> => {
    const res = await limsApi.get<AuditLogPage>("/audit-logs", { params });
    return res.data;
  },
};
