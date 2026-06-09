import { limsApi } from "@/lib/lims-api";

export type NotificationType =
  | "TASK_ASSIGNED"
  | "SAMPLE_OVERDUE"
  | "ORDER_DUE"
  | "SLA_WARNING"
  | "SLA_BREACH"
  | "GENERAL";

export type SlaEntityType = "ORDER" | "SAMPLE";

export interface Notification {
  id: number;
  user_id: number;
  notification_type: NotificationType;
  title: string;
  body: string | null;
  is_read: boolean;
  read_at: string | null;
  link_entity: string | null;
  link_id: number | null;
  created_at: string;
}

export interface NotificationCreate {
  user_id: number;
  notification_type?: NotificationType;
  title: string;
  body?: string | null;
  link_entity?: string | null;
  link_id?: number | null;
  send_email?: boolean;
}

export interface UnreadCount {
  count: number;
}

export interface SlaRule {
  id: number;
  name: string;
  entity_type: SlaEntityType;
  entity_filter: string | null;
  warning_hours: number;
  breach_hours: number;
  is_active: boolean;
  created_by_user_id: number | null;
  created_at: string;
  updated_at: string;
}

export type SlaRuleCreate = Omit<SlaRule, "id" | "created_by_user_id" | "created_at" | "updated_at">;
export type SlaRuleUpdate = Partial<SlaRuleCreate>;

export interface SlaItem {
  entity_type: string;
  entity_id: number;
  identifier: string;
  status: "WARNING" | "BREACH";
  hours_remaining: number;
  breach_at: string;
  rule_name: string;
  details: string | null;
}

export interface SlaStatusSummary {
  warning_count: number;
  breach_count: number;
  items: SlaItem[];
}

export const notificationsApi = {
  getUnreadCount: async (): Promise<UnreadCount> => {
    const res = await limsApi.get<UnreadCount>("/notifications/unread-count");
    return res.data;
  },

  list: async (params?: { unread_only?: boolean; page?: number; page_size?: number }): Promise<Notification[]> => {
    const res = await limsApi.get<Notification[]>("/notifications", { params });
    return Array.isArray(res.data) ? res.data : [];
  },

  send: async (data: NotificationCreate): Promise<Notification> => {
    const res = await limsApi.post<Notification>("/notifications", data);
    return res.data;
  },

  markRead: async (id: number): Promise<Notification> => {
    const res = await limsApi.post<Notification>(`/notifications/${id}/read`, {});
    return res.data;
  },

  markAllRead: async (): Promise<{ marked_read: number }> => {
    const res = await limsApi.post<{ marked_read: number }>("/notifications/read-all", {});
    return res.data;
  },

  // SLA
  getSlaStatus: async (): Promise<SlaStatusSummary> => {
    const res = await limsApi.get<SlaStatusSummary>("/notifications/sla/status");
    return res.data;
  },

  listSlaRules: async (): Promise<SlaRule[]> => {
    const res = await limsApi.get<SlaRule[]>("/notifications/sla/rules");
    return Array.isArray(res.data) ? res.data : [];
  },

  createSlaRule: async (data: SlaRuleCreate): Promise<SlaRule> => {
    const res = await limsApi.post<SlaRule>("/notifications/sla/rules", data);
    return res.data;
  },

  updateSlaRule: async (id: number, data: SlaRuleUpdate): Promise<SlaRule> => {
    const res = await limsApi.patch<SlaRule>(`/notifications/sla/rules/${id}`, data);
    return res.data;
  },

  deleteSlaRule: async (id: number): Promise<void> => {
    await limsApi.delete(`/notifications/sla/rules/${id}`);
  },
};
