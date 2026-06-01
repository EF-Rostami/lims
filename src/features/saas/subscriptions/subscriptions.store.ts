import { create } from "zustand";
import type { Subscription, CreateSubscriptionPayload, UpdateSubscriptionPayload } from "@/generated/saas/models";
import { subscriptionsApi } from "./subscriptions.api";

type SubscriptionsState = {
  subscriptions: Subscription[];
  selectedSubscription: Subscription | null;
  isLoading: boolean;
  error: string | null;

  fetchSubscriptions: () => Promise<void>;
  createSubscription: (payload: CreateSubscriptionPayload) => Promise<void>;
  updateSubscription: (id: string, payload: UpdateSubscriptionPayload) => Promise<void>;

  setSelectedSubscription: (s: Subscription | null) => void;
  clearError: () => void;
};

function extractError(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { detail?: string } }; message?: string };
  return e?.response?.data?.detail ?? e?.message ?? fallback;
}

export const useSubscriptionsStore = create<SubscriptionsState>((set, get) => ({
  subscriptions: [],
  selectedSubscription: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchSubscriptions: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await subscriptionsApi.list();
      set({ subscriptions: data, isLoading: false });
    } catch (err) {
      set({ error: extractError(err, "Failed to load subscriptions"), isLoading: false });
    }
  },

  createSubscription: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await subscriptionsApi.create(payload);
      set({ subscriptions: [created, ...get().subscriptions], isLoading: false });
    } catch (err) {
      set({ error: extractError(err, "Failed to create subscription"), isLoading: false });
    }
  },

  updateSubscription: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await subscriptionsApi.update(id, payload);
      set({
        subscriptions: get().subscriptions.map((s) => (s.id === id ? updated : s)),
        selectedSubscription: null,
        isLoading: false,
      });
    } catch (err) {
      set({ error: extractError(err, "Failed to update subscription"), isLoading: false });
    }
  },

  setSelectedSubscription: (s) => set({ selectedSubscription: s }),
}));
