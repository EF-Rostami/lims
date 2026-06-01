"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CreateSubscriptionPayload, Organization, Subscription, UpdateSubscriptionPayload } from "@/generated/saas/models";
import { billingApi } from "@/features/saas/billing/api/billing.api";

type Props = {
  subscription?: Subscription | null;
  organizations: Organization[];
  isSubmitting?: boolean;
  onSubmit: (payload: CreateSubscriptionPayload | UpdateSubscriptionPayload) => Promise<void>;
  onCancel: () => void;
};

export function SubscriptionForm({ subscription, organizations, isSubmitting = false, onSubmit, onCancel }: Props) {
  const isEdit = Boolean(subscription);

  const { data: plans = [] } = useQuery({
    queryKey: ["billing", "plans"],
    queryFn: billingApi.listPlans,
    staleTime: 1000 * 60 * 5,
  });

  const [ownerId, setOwnerId] = useState(subscription?.owner_id ?? organizations[0]?.id ?? "");
  const [planId, setPlanId] = useState(subscription?.plan_id ?? "");
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY" | "ONE_TIME">(
    subscription?.billing_cycle ?? "MONTHLY"
  );
  const [startDate, setStartDate] = useState(subscription?.start_date?.slice(0, 10) ?? "");
  const [endDate, setEndDate] = useState(subscription?.end_date?.slice(0, 10) ?? "");
  const [autoRenew, setAutoRenew] = useState(subscription?.auto_renew ?? true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isEdit) {
      await onSubmit({
        end_date: endDate ? new Date(endDate).toISOString() : null,
        auto_renew: autoRenew,
      } satisfies UpdateSubscriptionPayload);
    } else {
      if (!ownerId || !planId || !startDate) return;
      await onSubmit({
        owner_type: "ORGANIZATION",
        owner_id: ownerId,
        plan_id: planId,
        billing_cycle: billingCycle,
        start_date: new Date(startDate).toISOString(),
        end_date: endDate ? new Date(endDate).toISOString() : null,
        auto_renew: autoRenew,
      } satisfies CreateSubscriptionPayload);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Organization</label>
          <select
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            disabled={isEdit}
            required={!isEdit}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
          >
            <option value="">Select organization</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Plan</label>
          <select
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            disabled={isEdit}
            required={!isEdit}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
          >
            <option value="">Select plan</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} — {plan.currency} {plan.price} / {plan.billing_cycle.toLowerCase()}
              </option>
            ))}
          </select>
          {plans.length === 0 && (
            <p className="mt-1 text-xs text-slate-400">No plans yet — create one in Billing first.</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Billing Cycle</label>
          <select
            value={billingCycle}
            onChange={(e) => setBillingCycle(e.target.value as "MONTHLY" | "YEARLY" | "ONE_TIME")}
            disabled={isEdit}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
          >
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
            <option value="ONE_TIME">One-time</option>
          </select>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            id="auto-renew"
            type="checkbox"
            checked={autoRenew}
            onChange={(e) => setAutoRenew(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          <label htmlFor="auto-renew" className="text-sm font-medium text-slate-700">Auto-renew</label>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required={!isEdit}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : isEdit ? "Update Subscription" : "Create Subscription"}
        </button>
      </div>
    </form>
  );
}
