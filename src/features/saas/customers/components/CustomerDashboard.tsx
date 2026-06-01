"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SaasPageHeader } from "@/features/saas/components/SaasPageHeader";
import { SaasStatusBadge } from "@/features/saas/components/SaasStatusBadge";
import { ProvisionTenantModal } from "@/features/saas/provisioning/ProvisionTenantModal";
import { customerKeys, useOrganizations, useTenants } from "../hooks/useCustomerQueries";
import { useCustomersUIStore } from "../store/customers.store";
import { OrganizationModal } from "./OrganizationModal";
import { TenantModal } from "./TenantModal";

type OrgStatus = "TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED" | "ARCHIVED";
type TenantStatus = "PROVISIONING" | "ACTIVE" | "SUSPENDED" | "ARCHIVED" | "DELETED";

function orgStatusVariant(status: OrgStatus): "active" | "inactive" | "pending" {
  if (status === "ACTIVE") return "active";
  if (status === "TRIAL") return "pending";
  return "inactive";
}

function tenantStatusVariant(status: TenantStatus): "active" | "inactive" | "pending" {
  if (status === "ACTIVE") return "active";
  if (status === "PROVISIONING") return "pending";
  return "inactive";
}

export function CustomerDashboard() {
  const queryClient = useQueryClient();
  const { data: orgs = [], isLoading: orgsLoading } = useOrganizations();
  const { data: allTenants = [], isLoading: tenantsLoading } = useTenants();
  const { openOrgModal, openTenantModal, setSelectedOrganization, selectedOrganization } =
    useCustomersUIStore();

  const [provisioningTenant, setProvisioningTenant] = useState<{ id: string; name: string } | null>(
    null
  );

  const displayedTenants = selectedOrganization
    ? allTenants.filter((t) => t.organization_id === selectedOrganization.id)
    : allTenants;

  const tenantCountByOrg = allTenants.reduce<Record<string, number>>((acc, t) => {
    acc[t.organization_id] = (acc[t.organization_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <SaasPageHeader
        title="Customers"
        description="Manage organizations and their tenant environments."
        actionLabel="New Organization"
        onAction={() => openOrgModal()}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Organizations */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Organizations</h2>
            {selectedOrganization && (
              <button
                onClick={() => setSelectedOrganization(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Show all
              </button>
            )}
          </div>

          {orgsLoading ? (
            <div className="p-6 text-sm text-slate-500">Loading...</div>
          ) : orgs.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">No organizations yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/40 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-2.5">Name</th>
                    <th className="px-4 py-2.5">Billing Email</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Tenants</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {orgs.map((org) => (
                    <tr
                      key={org.id}
                      onClick={() => setSelectedOrganization(org)}
                      className={`cursor-pointer transition hover:bg-slate-50 ${
                        selectedOrganization?.id === org.id
                          ? "border-l-2 border-slate-900 bg-slate-50"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{org.name}</div>
                        {org.legal_name && (
                          <div className="text-xs text-slate-400">{org.legal_name}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{org.billing_email ?? "—"}</td>
                      <td className="px-4 py-3">
                        <SaasStatusBadge status={orgStatusVariant(org.status as OrgStatus)} />
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {tenantCountByOrg[org.id] ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tenants */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">
              {selectedOrganization ? `${selectedOrganization.name} — Tenants` : "All Tenants"}
            </h2>
            <button
              onClick={() => openTenantModal()}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              + New
            </button>
          </div>

          {tenantsLoading ? (
            <div className="p-6 text-sm text-slate-500">Loading...</div>
          ) : displayedTenants.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">
              {selectedOrganization ? "No tenants for this organization." : "No tenants yet."}
            </div>
          ) : (
            <div className="max-h-125 divide-y divide-slate-100 overflow-y-auto">
              {displayedTenants.map((tenant) => (
                <div key={tenant.id} className="space-y-2 p-4 hover:bg-slate-50/40">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">{tenant.name}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                      {tenant.environment}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-400">{tenant.slug}</span>
                    <SaasStatusBadge status={tenantStatusVariant(tenant.status as TenantStatus)} />
                  </div>
                  {tenant.status === "PROVISIONING" && (
                    <button
                      onClick={() => setProvisioningTenant({ id: tenant.id, name: tenant.name })}
                      className="w-full rounded-md border border-blue-300 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                    >
                      Provision LIMS
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <OrganizationModal />
      <TenantModal />

      {provisioningTenant && (
        <ProvisionTenantModal
          open={true}
          tenantId={provisioningTenant.id}
          tenantName={provisioningTenant.name}
          onClose={() => setProvisioningTenant(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: customerKeys.tenants() });
            setProvisioningTenant(null);
          }}
        />
      )}
    </div>
  );
}
