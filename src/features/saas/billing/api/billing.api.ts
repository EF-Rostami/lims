// @/features/saas/billing/api/billing.api.ts
import saasApi from "@/lib/saas-api";
import type { components } from "@/generated/saas/api";

// Pure schemas extracted from code-gen components
export type Plan = components["schemas"]["PlanRead"];
export type PlanCreatePayload = components["schemas"]["PlanCreate"];

export type Subscription = components["schemas"]["SubscriptionRead"];
export type SubscriptionCreatePayload = components["schemas"]["SubscriptionCreate"];
export type SubscriptionUpdatePayload = components["schemas"]["SubscriptionUpdate"];

export type Invoice = components["schemas"]["InvoiceRead"];
export type InvoiceCreatePayload = components["schemas"]["InvoiceCreate"];
export type InvoiceUpdatePayload = components["schemas"]["InvoiceUpdate"];

export type Payment = components["schemas"]["PaymentRead"];
export type PaymentCreatePayload = components["schemas"]["PaymentCreate"];

export const billingApi = {
  // Pricing Plans
  listPlans: async (): Promise<Plan[]> => {
    const res = await saasApi.get<Plan[]>("/billing/plans");
    return res.data;
  },
  createPlan: async (payload: PlanCreatePayload): Promise<Plan> => {
    const res = await saasApi.post<Plan>("/billing/plans", payload);
    return res.data;
  },

  // Corporate Subscriptions
  createSubscription: async (payload: SubscriptionCreatePayload): Promise<Subscription> => {
    const res = await saasApi.post<Subscription>("/billing/subscriptions", payload);
    return res.data;
  },
  updateSubscription: async (id: string, payload: SubscriptionUpdatePayload): Promise<Subscription> => {
    const res = await saasApi.patch<Subscription>(`/billing/subscriptions/${id}`, payload);
    return res.data;
  },

  // Invoices & Financial Audits
  createInvoice: async (payload: InvoiceCreatePayload): Promise<Invoice> => {
    const res = await saasApi.post<Invoice>("/billing/invoices", payload);
    return res.data;
  },
  updateInvoice: async (id: string, payload: InvoiceUpdatePayload): Promise<Invoice> => {
    const res = await saasApi.patch<Invoice>(`/billing/invoices/${id}`, payload);
    return res.data;
  },

  // Payments Ledger
  createPayment: async (payload: PaymentCreatePayload): Promise<Payment> => {
    const res = await saasApi.post<Payment>("/billing/payments", payload);
    return res.data;
  },
};