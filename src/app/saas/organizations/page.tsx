"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SaasDataTable } from "@/features/saas/components/SaasDataTable";
import { SaasEmptyState } from "@/features/saas/components/SaasEmptyState";
import { SaasPageHeader } from "@/features/saas/components/SaasPageHeader";
import { OrganizationForm } from "@/features/saas/organizations/OrganizationForm";
import { OrgMembersModal } from "@/features/saas/organizations/OrgMembersModal";
import { organizationsApi } from "@/features/saas/organizations/organizations.api";
import { useOrganizationsUIStore } from "@/features/saas/organizations/organizations.store";
import type { Organization } from "@/generated/saas/models";

export default function OrganizationsPage() {
  const queryClient = useQueryClient();
  const { isFormModalOpen, selectedOrganization, openFormModal, closeFormModal } =
    useOrganizationsUIStore();
  const [membersOrg, setMembersOrg] = useState<Organization | null>(null);

  const {
    data: organizations = [],
    isLoading,
    error: fetchError,
  } = useQuery<Organization[], AxiosError>({
    queryKey: ["organizations"],
    queryFn: organizationsApi.list,
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation<void, AxiosError, string>({
    mutationFn: organizationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      closeFormModal();
    },
  });

  function handleDeleteClick(org: Organization) {
    if (!window.confirm(`Delete organization "${org.name}"? This action cannot be undone.`)) return;
    deleteMutation.mutate(org.id);
  }

  const activeError = fetchError ?? deleteMutation.error;
  const errorMessage =
    typeof activeError?.response?.data === "object" &&
    activeError?.response?.data !== null &&
    "detail" in (activeError.response.data as object)
      ? String((activeError.response.data as { detail: unknown }).detail)
      : activeError?.message;

  return (
    <div className="space-y-6">
      <SaasPageHeader
        title="Organizations"
        description="Manage customer organizations."
        actionLabel="New Organization"
        onAction={() => openFormModal(null)}
      />

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      <Dialog open={isFormModalOpen} onOpenChange={(open) => { if (!open) closeFormModal(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedOrganization ? "Edit Organization" : "New Organization"}
            </DialogTitle>
          </DialogHeader>
          <OrganizationForm key={selectedOrganization?.id ?? "new"} />
        </DialogContent>
      </Dialog>

      {isLoading && organizations.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-sm text-slate-500 shadow-sm">
          Loading organizations...
        </div>
      ) : organizations.length === 0 ? (
        <SaasEmptyState
          title="No organizations yet"
          description="Create your first organization to start tenant provisioning."
          actionLabel="Create Organization"
          onAction={() => openFormModal(null)}
        />
      ) : (
        <SaasDataTable
          data={organizations}
          columns={[
            { header: "Name", accessor: "name" },
            { header: "Status", render: (row) => <span>{row.status.charAt(0) + row.status.slice(1).toLowerCase()}</span> },
            { header: "Country", render: (row) => row.country ?? "—" },
            { header: "Created", render: (row) => new Date(row.created_at).toLocaleDateString() },
            {
              header: "Actions",
              render: (row) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => openFormModal(row)}
                    disabled={deleteMutation.isPending}
                    className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setMembersOrg(row)}
                    disabled={deleteMutation.isPending}
                    className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Members
                  </button>
                  <button
                    onClick={() => handleDeleteClick(row)}
                    disabled={deleteMutation.isPending}
                    className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deleteMutation.isPending && deleteMutation.variables === row.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      <OrgMembersModal
        organization={membersOrg}
        onClose={() => setMembersOrg(null)}
      />
    </div>
  );
}
