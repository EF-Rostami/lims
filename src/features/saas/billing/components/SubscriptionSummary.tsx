/* eslint-disable @typescript-eslint/no-explicit-any */
// @/features/saas/billing/components/SubscriptionSummary.tsx
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { billingKeys } from "../hooks/useBillingQueries";
import { saasApi } from "@/lib/saas-api";

interface SubscriptionSummaryProps {
  ownerId: string;
}

export function SubscriptionSummary({ ownerId }: SubscriptionSummaryProps) {
  // TanStack Query to isolate the active customer plan metrics
  const { data: subscription, isLoading } = useQuery({
    queryKey: [...billingKeys.subscriptions(), ownerId],
    queryFn: async () => {
      // Assuming a simple filter helper endpoint or listing the target owner's records
      const allSubs = await saasApi.get<any[]>(`/global/billing/subscriptions`);
      return allSubs.data.find((sub) => sub.owner_id === ownerId) || null;
    },
  });

  if (isLoading) {
    return <div className="h-32 w-full animate-pulse rounded-xl bg-slate-100" />;
  }

  if (!subscription) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center">
        <h3 className="text-sm font-semibold text-slate-900">No Active Subscription found</h3>
        <p className="mt-1 text-xs text-slate-500">Select a subscription plan below to unlock system operations.</p>
      </div>
    );
  }

  const isHealthy = subscription.status === "ACTIVE" || subscription.status === "TRIALING";

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* Current Plan Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Plan</span>
        <div className="mt-2 flex items-baseline justify-between">
          <h3 className="text-xl font-bold text-slate-900">
            {subscription.plan?.name || "Premium Operational Tier"}
          </h3>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
              isHealthy ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10" : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10"
            }`}
          >
            {subscription.status.toLowerCase()}
          </span>
        </div>
        <p className="mt-4 text-xs font-medium text-slate-500">
          Cycle renews on: <span className="font-semibold text-slate-700">{new Date(subscription.end_date ?? "").toLocaleDateString()}</span>
        </p>
      </div>

      {/* Financial Details Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Billing Terms</span>
        <h3 className="mt-2 text-xl font-bold text-slate-900">
          {new Intl.NumberFormat("en-US", { style: "currency", currency: subscription.plan?.currency || "EUR" }).format(Number(subscription.plan?.price || 0))}
        </h3>
        <p className="mt-4 text-xs font-medium text-slate-500">
          Frequency: <span className="font-semibold text-slate-700 capitalize">{subscription.billing_cycle.toLowerCase()}</span>
          {subscription.auto_renew && <span className="ml-2 text-emerald-600 font-bold">(Auto-Renews)</span>}
        </p>
      </div>

      {/* Quick Infrastructure Isolation Analytics */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Provision Limits</span>
        <div className="mt-3 space-y-2">
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>Environment Tenants</span>
              <span>Max: {subscription.plan?.max_tenants ?? "∞"}</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
              <div className="h-1.5 rounded-full bg-slate-900" style={{ width: "45%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}