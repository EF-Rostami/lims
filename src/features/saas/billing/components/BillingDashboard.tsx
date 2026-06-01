// @/features/saas/billing/components/BillingDashboard.tsx
"use client";

import { SaasPageHeader } from "@/features/saas/components/SaasPageHeader";
import { usePlans } from "../hooks/useBillingQueries";
import { useBillingUIStore } from "../store/billing.store";
import { PlanModal } from "./PlanModal";

export function BillingDashboard() {
  const { data: plans = [], isLoading } = usePlans();
  const { openPlanModal, setSelectedPlan, selectedPlan } = useBillingUIStore();

  const activePlans = plans.filter((p) => p.is_active).length;

  return (
    <div className="space-y-6">
      <SaasPageHeader
        title="Billing"
        description="Manage pricing plans and their feature entitlements."
        actionLabel="New Plan"
        onAction={openPlanModal}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plans table */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Pricing Plans</h3>
            <span className="text-xs text-slate-400">{activePlans} active</span>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-2 animate-pulse">
              <div className="h-10 bg-slate-100 rounded-lg" />
              <div className="h-10 bg-slate-100 rounded-lg" />
            </div>
          ) : plans.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No plans yet. Create one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto text-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Limits</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {plans.map((plan) => (
                    <tr
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                        selectedPlan?.id === plan.id ? "bg-slate-50 border-l-2 border-slate-900" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{plan.name}</div>
                        <div className="font-mono text-xs text-slate-400">{plan.code}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900">
                          {plan.price} {plan.currency}
                        </span>
                        <span className="text-slate-400 text-xs ml-1">
                          /{plan.billing_cycle.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 space-y-0.5">
                        <div>Tenants: {plan.max_tenants ?? "∞"}</div>
                        <div>Users: {plan.max_users ?? "∞"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            plan.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {plan.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Feature detail panel */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Plan Details</h3>
          </div>
          <div className="p-4 text-sm">
            {selectedPlan ? (
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-slate-900">{selectedPlan.name}</p>
                  <p className="text-slate-500 mt-0.5 text-xs">
                    {selectedPlan.description || "No description."}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1.5">Features</p>
                  <pre className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs font-mono text-slate-700 overflow-x-auto max-h-48">
                    {JSON.stringify(selectedPlan.features ?? {}, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-center text-slate-400 py-8 text-xs">
                Select a plan to view its details.
              </p>
            )}
          </div>
        </div>
      </div>

      <PlanModal />
    </div>
  );
}
