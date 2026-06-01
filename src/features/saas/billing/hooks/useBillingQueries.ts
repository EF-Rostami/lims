// @/features/saas/billing/hooks/useBillingQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingApi, type PlanCreatePayload, type SubscriptionCreatePayload, type PaymentCreatePayload } from "../api/billing.api";

export const billingKeys = {
  all: ["billing"] as const,
  plans: () => [...billingKeys.all, "plans"] as const,
  subscriptions: () => [...billingKeys.all, "subscriptions"] as const,
  invoices: () => [...billingKeys.all, "invoices"] as const,
};

export function usePlans() {
  return useQuery({
    queryKey: billingKeys.plans(),
    queryFn: billingApi.listPlans,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePlanMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PlanCreatePayload) => billingApi.createPlan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.plans() });
    },
  });
}

export function useCreateSubscriptionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubscriptionCreatePayload) => billingApi.createSubscription(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscriptions() });
    },
  });
}

export function useCreatePaymentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentCreatePayload) => billingApi.createPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices() });
    },
  });
}