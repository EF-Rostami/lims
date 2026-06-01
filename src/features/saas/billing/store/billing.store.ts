// @/features/saas/billing/store/billing.store.ts
import { create } from "zustand";
import type { Plan, Subscription, Invoice } from "../api/billing.api";

type BillingUIState = {
  selectedPlan: Plan | null;
  selectedSubscription: Subscription | null;
  selectedInvoice: Invoice | null;
  isPlanModalOpen: boolean;
  isSubscriptionModalOpen: boolean;
  isPaymentModalOpen: boolean;

  setSelectedPlan: (plan: Plan | null) => void;
  setSelectedSubscription: (sub: Subscription | null) => void;
  setSelectedInvoice: (invoice: Invoice | null) => void;
  openPlanModal: () => void;
  closePlanModal: () => void;
  openSubscriptionModal: (sub?: Subscription | null) => void;
  closeSubscriptionModal: () => void;
  openPaymentModal: (invoice?: Invoice | null) => void;
  closePaymentModal: () => void;
};

export const useBillingUIStore = create<BillingUIState>((set) => ({
  selectedPlan: null,
  selectedSubscription: null,
  selectedInvoice: null,
  isPlanModalOpen: false,
  isSubscriptionModalOpen: false,
  isPaymentModalOpen: false,

  setSelectedPlan: (plan) => set({ selectedPlan: plan }),
  setSelectedSubscription: (sub) => set({ selectedSubscription: sub }),
  setSelectedInvoice: (invoice) => set({ selectedInvoice: invoice }),
  
  openPlanModal: () => set({ isPlanModalOpen: true }),
  closePlanModal: () => set({ isPlanModalOpen: false }),
  
  openSubscriptionModal: (sub = null) => set({ selectedSubscription: sub, isSubscriptionModalOpen: true }),
  closeSubscriptionModal: () => set({ selectedSubscription: null, isSubscriptionModalOpen: false }),
  
  openPaymentModal: (invoice = null) => set({ selectedInvoice: invoice, isPaymentModalOpen: true }),
  closePaymentModal: () => set({ selectedInvoice: null, isPaymentModalOpen: false }),
}));