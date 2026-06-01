"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCustomersUIStore } from "../store/customers.store";
import { useCreateTenantMutation, useOrganizations } from "../hooks/useCustomerQueries";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function TenantModal() {
  const { isTenantModalOpen, closeTenantModal, selectedOrganization } = useCustomersUIStore();
  const { data: organizations } = useOrganizations();
  const createTenantMutation = useCreateTenantMutation();

  const [organizationId, setOrganizationId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [environment, setEnvironment] = useState<"PRODUCTION" | "STAGING" | "TEST">("PRODUCTION");

  function handleClose() {
    setName("");
    setSlug("");
    closeTenantModal();
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
    setSlug(slugify(e.target.value));
  }

  const activeOrgId = organizationId || selectedOrganization?.id || organizations?.[0]?.id || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId) return;
    try {
      await createTenantMutation.mutateAsync({
        name,
        slug,
        organization_id: activeOrgId,
        environment,
      });
      handleClose();
    } catch {
      // error displayed below
    }
  };

  const axiosError = createTenantMutation.error as AxiosError<{ detail?: string }> | null;
  const errorMessage = axiosError?.response?.data?.detail ?? axiosError?.message;

  return (
    <Dialog open={isTenantModalOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Tenant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Organization *</label>
            <select
              value={activeOrgId}
              onChange={(e) => setOrganizationId(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="" disabled>Select organization</option>
              {organizations?.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="Main Lab"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Slug *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="main-lab"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Environment *</label>
            <div className="grid grid-cols-3 gap-2">
              {(["PRODUCTION", "STAGING", "TEST"] as const).map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => setEnvironment(env)}
                  className={`rounded-lg border py-2 text-xs font-medium transition ${
                    environment === env
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {env.charAt(0) + env.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {createTenantMutation.isError && errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={createTenantMutation.isPending}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTenantMutation.isPending || !name.trim() || !slug.trim()}
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createTenantMutation.isPending ? "Creating..." : "Create Tenant"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
