// @/features/saas/organizations/OrganizationForm.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { organizationsApi } from "./organizations.api";
import { useOrganizationsUIStore } from "./organizations.store";

export function OrganizationForm() {
  const queryClient = useQueryClient();
  const { selectedOrganization, closeFormModal } = useOrganizationsUIStore();
  const isEdit = Boolean(selectedOrganization);

  const [name, setName] = useState(selectedOrganization?.name ?? "");
  const [legalName, setLegalName] = useState(selectedOrganization?.legal_name ?? "");
  const [billingEmail, setBillingEmail] = useState(selectedOrganization?.billing_email ?? "");
  const [country, setCountry] = useState(selectedOrganization?.country ?? "");

  const { mutate, isPending, error } = useMutation<unknown, AxiosError, void>({
    mutationFn: async () => {
      const payload = {
        name,
        status: (selectedOrganization?.status ?? "TRIAL") as "TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED" | "ARCHIVED",
        legal_name: legalName || null,
        billing_email: billingEmail || null,
        country: country || null,
      };

      if (isEdit && selectedOrganization) {
        await organizationsApi.update(selectedOrganization.id, payload);
      } else {
        await organizationsApi.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      closeFormModal();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    mutate();
  };

  const errorMessage = error?.message;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-1">
      {errorMessage && (
        <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-xs font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Organization Name *</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none disabled:bg-slate-50"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Corporation"
            maxLength={255}
            required
            disabled={isPending}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Legal Name</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none disabled:bg-slate-50"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            placeholder="Acme Corp LLC"
            maxLength={255}
            disabled={isPending}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Billing Email</label>
          <input
            type="email"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none disabled:bg-slate-50"
            value={billingEmail}
            onChange={(e) => setBillingEmail(e.target.value)}
            placeholder="billing@acme.com"
            disabled={isPending}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Country</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none disabled:bg-slate-50"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="United States"
            maxLength={100}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={closeFormModal}
          disabled={isPending}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400"
        >
          {isPending ? "Saving..." : isEdit ? "Update Organization" : "Create Organization"}
        </button>
      </div>
    </form>
  );
}
