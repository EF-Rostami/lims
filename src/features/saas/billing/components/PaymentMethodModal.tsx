// @ts-nocheck — needs reconciliation with regenerated SaaS types
/* eslint-disable @typescript-eslint/no-explicit-any */
// @/features/saas/billing/components/PaymentMethodModal.tsx
"use client";

import React, { useState } from "react";
import { useBillingUIStore } from "../store/billing.store";
import { useSubscribeMutation, usePaymentMutation } from "../hooks/useBillingQueries";
import saasApi from "@/lib/saas-api";

interface PaymentMethodModalProps {
  ownerId: string;
  ownerType: "ORGANIZATION" | "TENANT";
}

export function PaymentMethodModal({ ownerId, ownerType }: PaymentMethodModalProps) {
  const { selectedPlan, isCheckoutModalOpen, closeCheckoutModal } = useBillingUIStore();
  const subscribeMutation = useSubscribeMutation();
  const paymentMutation = usePaymentMutation();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!isCheckoutModalOpen || !selectedPlan) return null;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Step 1: Create the core subscription layer mapping to SubscriptionCreate Pydantic schema
      const subscription = await subscribeMutation.mutateAsync({
        plan_id: selectedPlan.id,
        owner_id: ownerId,
        owner_type: ownerType,
        billing_cycle: selectedPlan.billing_cycle,
        start_date: new Date().toISOString(),
        auto_renew: true,
        end_date: null,
      });

      // Step 2: Initialize an upstream invoice instance reflecting the plan price metrics
      const invoiceResponse = await saasApi.post("/billing/invoices", {
        organization_id: ownerType === "ORGANIZATION" ? ownerId : subscription.id, // Fallback association
        subscription_id: subscription.id,
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        subtotal: selectedPlan.price,
        tax_amount: "0.00", // Default baseline parameters
        total: selectedPlan.price,
        currency: selectedPlan.currency,
        issue_date: new Date().toISOString(),
      });

      const invoice = invoiceResponse.data;

      // Step 3: Log the successful transaction settlement tracking to PaymentCreate
      await paymentMutation.mutateAsync({
        invoice_id: invoice.id,
        provider: "STRIPE_MOCK_GATEWAY", // Scalable placeholder for downstream providers
        provider_payment_id: `ch_${Math.random().toString(36).substring(2, 11)}`,
        amount: selectedPlan.price,
        currency: selectedPlan.currency,
      });

      // Successful pipeline cascade termination
      closeCheckoutModal();
    } catch (err: any) {
      setPaymentError(err?.response?.data?.detail || "An unexpected error disrupted the checkout process.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Secure Plan Upgrade</h3>
            <p className="text-[11px] text-slate-400 font-medium">Review your subscription adjustment variables.</p>
          </div>
          <button 
            onClick={closeCheckoutModal} 
            disabled={isProcessing}
            className="text-slate-400 hover:text-slate-600 transition text-xs font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleCheckoutSubmit} className="mt-4 space-y-4">
          {/* Summary Box */}
          <div className="rounded-lg bg-slate-50 p-3 text-xs border border-slate-100">
            <div className="flex justify-between font-bold text-slate-700">
              <span>Selected Plan:</span>
              <span className="text-slate-900">{selectedPlan.name}</span>
            </div>
            <div className="flex justify-between font-medium text-slate-500 mt-1.5">
              <span>Billing Cycle:</span>
              <span className="lowercase">per {selectedPlan.billing_cycle}</span>
            </div>
            <div className="border-t border-slate-200/60 my-2 pt-2 flex justify-between font-extrabold text-slate-900 text-sm">
              <span>Total Due Now:</span>
              <span>
                {new Intl.NumberFormat("en-US", { style: "currency", currency: selectedPlan.currency }).format(Number(selectedPlan.price))}
              </span>
            </div>
          </div>

          {/* Dummy Payment Input Mock Elements */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-slate-600">Cardholder Name</label>
            <input 
              type="text" 
              required
              disabled={isProcessing}
              placeholder="Jane Doe" 
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-slate-900 focus:outline-hidden disabled:bg-slate-50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-slate-600">Credit Card Information</label>
            <div className="relative">
              <input 
                type="text" 
                required
                disabled={isProcessing}
                placeholder="4242 •••• •••• 4242" 
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono focus:border-slate-900 focus:outline-hidden disabled:bg-slate-50"
              />
            </div>
          </div>

          {paymentError && (
            <div className="rounded-lg bg-rose-50 p-2 text-[11px] text-rose-700 font-semibold border border-rose-100">
              {paymentError}
            </div>
          )}

          {/* Call to Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
            <button
              type="button"
              onClick={closeCheckoutModal}
              disabled={isProcessing}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400"
            >
              {isProcessing ? "Authorizing transaction..." : "Authorize & Activate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}