// @ts-nocheck — needs reconciliation with regenerated SaaS types
// @/features/saas/billing/components/PricingCards.tsx
"use client";

import React from "react";
import { usePlans, useSubscribeMutation } from "../hooks/useBillingQueries";
import { useBillingUIStore } from "../store/billing.store";
import type { Plan } from "../api/billing.api";

interface PricingCardsProps {
  ownerId: string; // Targets an assigned Organization ID or Tenant ID
  ownerType: "ORGANIZATION" | "TENANT";
}

export function PricingCards({ ownerId, ownerType }: PricingCardsProps) {
  const { data: plans, isLoading, error } = usePlans();
  const subscribeMutation = useSubscribeMutation();
  const { openCheckoutModal } = useBillingUIStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-rose-50 p-4 text-xs text-rose-700 font-medium border border-rose-100">
        Failed to fetch subscription parameters from your control panel.
      </div>
    );
  }

  const handleSelection = async (plan: Plan) => {
    // If it's a paid tier, trigger checkout overlay states inside the store
    if (Number(plan.price) > 0) {
      openCheckoutModal(plan);
      return;
    }

    // Direct registration fallback for free tiers matching the exact SubscriptionCreate schema properties
    subscribeMutation.mutate({
      plan_id: plan.id,
      owner_id: ownerId,
      owner_type: ownerType,
      billing_cycle: plan.billing_cycle, // Sourced from the plan ("MONTHLY", "YEARLY", "ONE_TIME")
      start_date: new Date().toISOString(), // Required string ISO timestamp format
      auto_renew: true, // Required fallback parameter boolean
      end_date: null,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Available Subscription Plans</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Scale platform limitations dynamically.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans?.filter(p => p.is_active).map((plan) => (
          <div 
            key={plan.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">{plan.name}</span>
                <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 border border-slate-100">
                  {plan.code}
                </span>
              </div>
              
              <p className="mt-2 text-xs text-slate-500 font-medium leading-relaxed min-h-8">
                {plan.description || "No plan description context configured."}
              </p>

              <div className="my-4 flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: plan.currency }).format(Number(plan.price))}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold lowercase">
                  / {plan.billing_cycle}
                </span>
              </div>

              {/* Structural limits rendering derived straight from PlanRead */}
              <ul className="space-y-2 border-t border-slate-50 pt-3 text-xs font-medium text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-slate-400">✔</span> 
                  {plan.max_tenants ? `Up to ${plan.max_tenants} active tenants` : "Unlimited environments"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-slate-400">✔</span>
                  {plan.max_users ? `Up to ${plan.max_users} user positions` : "Unlimited workspace team limits"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-slate-400">✔</span>
                  {plan.max_storage_gb ? `${plan.max_storage_gb} GB isolation storage` : "Standard storage capacity"}
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelection(plan)}
              disabled={subscribeMutation.isPending}
              className="mt-6 w-full rounded-lg bg-slate-900 py-2 text-center text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400"
            >
              {subscribeMutation.isPending ? "Configuring tier..." : Number(plan.price) === 0 ? "Activate Tier" : "Select Package"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}