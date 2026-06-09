import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  notificationsApi,
  type NotificationCreate,
  type SlaRuleCreate,
  type SlaRuleUpdate,
} from "./notifications.api";

const _base = ["lims", "notifications"] as const;

export const notificationKeys = {
  all: _base,
  list: (params?: object) => [..._base, "list", params] as const,
  unread: [..._base, "unread-count"] as const,
  slaStatus: [..._base, "sla", "status"] as const,
  slaRules: [..._base, "sla", "rules"] as const,
};

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unread,
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

export function useNotifications(params?: { unread_only?: boolean }) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsApi.list(params),
  });
}

export function useSendNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: NotificationCreate) => notificationsApi.send(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useSlaStatus() {
  return useQuery({
    queryKey: notificationKeys.slaStatus,
    queryFn: notificationsApi.getSlaStatus,
    staleTime: 60_000,
  });
}

export function useSlaRules() {
  return useQuery({
    queryKey: notificationKeys.slaRules,
    queryFn: notificationsApi.listSlaRules,
  });
}

export function useCreateSlaRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SlaRuleCreate) => notificationsApi.createSlaRule(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.slaRules }),
  });
}

export function useUpdateSlaRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SlaRuleUpdate }) =>
      notificationsApi.updateSlaRule(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.slaRules }),
  });
}

export function useDeleteSlaRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsApi.deleteSlaRule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.slaRules });
      qc.invalidateQueries({ queryKey: notificationKeys.slaStatus });
    },
  });
}
