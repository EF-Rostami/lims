// @/features/saas/billing/components/PlanModal.tsx
"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useBillingUIStore } from "../store/billing.store";
import { useCreatePlanMutation } from "../hooks/useBillingQueries";

interface BackendErrorDetail {
  detail?: string;
}

export function PlanModal() {
  const { isPlanModalOpen, closePlanModal } = useBillingUIStore();
  const createPlanMutation = useCreatePlanMutation();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0.00");
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY" | "ONE_TIME">("MONTHLY");
  const [maxTenants, setMaxTenants] = useState("");
  const [maxUsers, setMaxUsers] = useState("");

  function handleClose() {
    setName(""); setCode(""); setDescription(""); setPrice("0.00");
    setMaxTenants(""); setMaxUsers("");
    closePlanModal();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPlanMutation.mutateAsync({
        name,
        code: code.toUpperCase().trim(),
        description: description || null,
        price,
        currency: "EUR",
        billing_cycle: billingCycle,
        max_tenants: maxTenants ? parseInt(maxTenants, 10) : null,
        max_users: maxUsers ? parseInt(maxUsers, 10) : null,
        max_storage_gb: null,
        features: {},
        is_active: true,
      });
      handleClose();
    } catch {
      // error shown inline
    }
  };

  const axiosError = createPlanMutation.error as AxiosError<BackendErrorDetail> | null;
  const errorMessage = axiosError?.response?.data?.detail ?? axiosError?.message;

  return (
    <Dialog open={isPlanModalOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Plan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Name *</label>
              <input
                type="text" required value={name}
                onChange={(e) => { setName(e.target.value); setCode(e.target.value.replace(/\s+/g, "_").toUpperCase()); }}
                placeholder="Enterprise"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Code *</label>
              <input
                type="text" required value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ENTERPRISE"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Price (EUR) *</label>
              <input
                type="number" step="0.01" min="0" required value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Billing Cycle *</label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as "MONTHLY" | "YEARLY" | "ONE_TIME")}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
                <option value="ONE_TIME">One-time</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Max Tenants</label>
              <input
                type="number" placeholder="Unlimited" value={maxTenants}
                onChange={(e) => setMaxTenants(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Max Users</label>
              <input
                type="number" placeholder="Unlimited" value={maxUsers}
                onChange={(e) => setMaxUsers(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Description</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              rows={2} placeholder="Optional description..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
            />
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-red-100 bg-red-50 p-2 text-xs font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          <DialogFooter>
            <button
              type="button" onClick={handleClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={createPlanMutation.isPending}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {createPlanMutation.isPending ? "Saving..." : "Create Plan"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
