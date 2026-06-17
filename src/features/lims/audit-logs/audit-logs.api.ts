import { limsApi } from "@/lib/lims-api";

export interface AuditLogEntry {
  id: number;
  user_id: number | null;
  user_email: string | null;
  entity_type: string | null;
  entity_id: number | null;
  action: string;
  description: string | null;
  performed_at: string;
}

export interface AuditLogPage {
  data: AuditLogEntry[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
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
    const res = await limsApi.get<{
      success: boolean;
      data: AuditLogEntry[];
      meta: { total: number; page: number; page_size: number; total_pages: number };
    }>("/audit-logs", { params });
    const { data, meta } = res.data;
    return {
      data,
      total: meta.total,
      page: meta.page,
      page_size: meta.page_size,
      total_pages: meta.total_pages,
    };
  },
};
