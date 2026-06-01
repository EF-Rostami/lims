"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SaasDataTable } from "@/features/saas/components/SaasDataTable";
import { SaasEmptyState } from "@/features/saas/components/SaasEmptyState";
import { SaasPageHeader } from "@/features/saas/components/SaasPageHeader";
import { SaasStatusBadge } from "@/features/saas/components/SaasStatusBadge";
import { organizationsApi } from "@/features/saas/organizations/organizations.api";
import { TenantForm } from "@/features/saas/tenants/TenantForm";
import type { CreateTenantPayload, Tenant, UpdateTenantPayload } from "@/features/saas/tenants/tenants.api";
import { ProvisionTenantModal } from "@/features/saas/provisioning/ProvisionTenantModal";
import { useTenantsStore } from "@/features/saas/tenants/tenants.store";
import type { Organization } from "@/generated/saas/models";

function tenantStatusVariant(status: Tenant["status"]): "active" | "inactive" | "pending" | "failed" {
  if (status === "ACTIVE") return "active";
  if (status === "SUSPENDED" || status === "ARCHIVED" || status === "DELETED") return "inactive";
  if (status === "PROVISIONING") return "pending";
  return "inactive";
}

export default function TenantsPage() {
  const [showForm, setShowForm] = useState(false);
  const [provisioningTenant, setProvisioningTenant] = useState<{ id: string; name: string } | null>(null);

  const {
    tenants, selectedTenant, isLoading, error,
    fetchTenants, createTenant, updateTenant, deleteTenant,
    activateTenant, suspendTenant, setSelectedTenant, clearError,
  } = useTenantsStore();

  const { data: organizations = [] } = useQuery<Organization[]>({
    queryKey: ["organizations"],
    queryFn: organizationsApi.list,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  const orgNameById = useMemo(
    () => new Map(organizations.map((o) => [o.id, o.name])),
    [organizations]
  );

  function handleCreateClick() {
    clearError(); setSelectedTenant(null); setShowForm(true);
  }

  function handleEditClick(tenant: Tenant) {
    clearError(); setSelectedTenant(tenant); setShowForm(true);
  }

  function handleCancel() {
    clearError(); setSelectedTenant(null); setShowForm(false);
  }

  async function handleSubmit(payload: CreateTenantPayload | UpdateTenantPayload) {
    if (selectedTenant) {
      await updateTenant(selectedTenant.id, payload as UpdateTenantPayload);
    } else {
      await createTenant(payload as CreateTenantPayload);
    }
    if (!useTenantsStore.getState().error) {
      setShowForm(false); setSelectedTenant(null);
    }
  }

  async function handleDelete(tenant: Tenant) {
    if (!window.confirm(`Delete tenant "${tenant.name}"?`)) return;
    await deleteTenant(tenant.id);
  }

  return (
    <div>
      <SaasPageHeader
        title="Tenants"
        description="Manage tenant environments for each organization."
        actionLabel="New Tenant"
        onAction={handleCreateClick}
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) handleCancel(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTenant ? "Edit Tenant" : "New Tenant"}</DialogTitle>
          </DialogHeader>
          <TenantForm
            key={selectedTenant?.id ?? "create"}
            tenant={selectedTenant}
            organizations={organizations}
            isSubmitting={isLoading}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>

      {isLoading && tenants.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-sm text-slate-500 shadow-sm">Loading tenants...</div>
      ) : tenants.length === 0 ? (
        <SaasEmptyState
          title="No tenants yet"
          description="Create your first tenant after setting up an organization."
          actionLabel="Create Tenant"
          onAction={handleCreateClick}
        />
      ) : (
        <SaasDataTable
          data={tenants}
          columns={[
            { header: "Tenant", accessor: "name" },
            { header: "Organization", render: (row) => orgNameById.get(row.organization_id) ?? "—" },
            { header: "Slug", render: (row) => <span className="font-mono text-xs">{row.slug}</span> },
            { header: "Env", render: (row) => <span>{row.environment.charAt(0) + row.environment.slice(1).toLowerCase()}</span> },
            {
              header: "Status",
              render: (row) => <SaasStatusBadge status={tenantStatusVariant(row.status)} />,
            },
            {
              header: "Actions",
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleEditClick(row)}
                    className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  {row.status === "SUSPENDED" && (
                    <button
                      onClick={() => activateTenant(row.id)}
                      className="rounded-md border border-green-300 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
                    >
                      Activate
                    </button>
                  )}
                  {row.status === "PROVISIONING" && (
                    <button
                      onClick={() => setProvisioningTenant({ id: row.id, name: row.name })}
                      className="rounded-md border border-blue-300 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                    >
                      Provision LIMS
                    </button>
                  )}
                  {row.status === "ACTIVE" && (
                    <button
                      onClick={() => suspendTenant(row.id)}
                      className="rounded-md border border-yellow-300 px-3 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-50"
                    >
                      Suspend
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(row)}
                    disabled={row.status === "ACTIVE"}
                    className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      {provisioningTenant && (
        <ProvisionTenantModal
          open={true}
          tenantId={provisioningTenant.id}
          tenantName={provisioningTenant.name}
          onClose={() => setProvisioningTenant(null)}
          onSuccess={() => {
            fetchTenants();
            setProvisioningTenant(null);
          }}
        />
      )}
    </div>
  );
}
