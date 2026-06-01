import saasApi from "@/lib/saas-api";
import type { Subscription, CreateSubscriptionPayload, UpdateSubscriptionPayload } from "@/generated/saas/models";

export const subscriptionsApi = {
  list: async (ownerId?: string): Promise<Subscription[]> => {
    const url = ownerId
      ? `/billing/subscriptions?owner_id=${ownerId}`
      : "/billing/subscriptions";
    const res = await saasApi.get<Subscription[]>(url);
    return res.data;
  },

  create: async (payload: CreateSubscriptionPayload): Promise<Subscription> => {
    const res = await saasApi.post<Subscription>("/billing/subscriptions", payload);
    return res.data;
  },

  update: async (id: string, payload: UpdateSubscriptionPayload): Promise<Subscription> => {
    const res = await saasApi.patch<Subscription>(`/billing/subscriptions/${id}`, payload);
    return res.data;
  },
};
