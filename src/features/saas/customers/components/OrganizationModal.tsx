"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCustomersUIStore } from "../store/customers.store";
import { useCreateOrgMutation } from "../hooks/useCustomerQueries";

export function OrganizationModal() {
  const { isOrgModalOpen, closeOrgModal } = useCustomersUIStore();
  const createOrgMutation = useCreateOrgMutation();

  const [name, setName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [legalName, setLegalName] = useState("");

  function handleClose() {
    setName("");
    setBillingEmail("");
    setLegalName("");
    closeOrgModal();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createOrgMutation.mutateAsync({
      name,
      legal_name: legalName || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      billing_email: (billingEmail || null) as any,
      status: "TRIAL",
    });
    handleClose();
  };

  return (
    <Dialog open={isOrgModalOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Organization</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Corporation"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Legal Name</label>
            <input
              type="text"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="Acme Inc Ltd"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Billing Email</label>
            <input
              type="email"
              value={billingEmail}
              onChange={(e) => setBillingEmail(e.target.value)}
              placeholder="finance@acme.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          {createOrgMutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {(createOrgMutation.error as { response?: { data?: { detail?: string } } })?.response?.data?.detail
                ?? (createOrgMutation.error as Error)?.message
                ?? "Failed to create organization."}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={createOrgMutation.isPending}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createOrgMutation.isPending || !name.trim()}
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createOrgMutation.isPending ? "Creating..." : "Create Organization"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
