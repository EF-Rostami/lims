"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SaasDataTable } from "@/features/saas/components/SaasDataTable";
import { SaasEmptyState } from "@/features/saas/components/SaasEmptyState";
import { SaasPageHeader } from "@/features/saas/components/SaasPageHeader";
import { SaasStatusBadge } from "@/features/saas/components/SaasStatusBadge";
import { billingApi } from "@/features/saas/billing/api/billing.api";
import { organizationsApi } from "@/features/saas/organizations/organizations.api";
import { SubscriptionForm } from "@/features/saas/subscriptions/SubscriptionForm";
import { useSubscriptionsStore } from "@/features/saas/subscriptions/subscriptions.store";
import type {
  CreateSubscriptionPayload,
  Organization,
  Subscription,
  UpdateSubscriptionPayload,
} from "@/generated/saas/models";

function subStatusVariant(status: string): "active" | "inactive" | "pending" | "failed" {
  if (status === "ACTIVE") return "active";
  if (status === "TRIALING") return "pending";
  if (status === "PAST_DUE") return "failed";
  return "inactive";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function SubscriptionsPage() {
  const [showForm, setShowForm] = useState(false);

  const {
    subscriptions,
    selectedSubscription,
    isLoading,
    error,
    fetchSubscriptions,
    createSubscription,
    updateSubscription,
    setSelectedSubscription,
    clearError,
  } = useSubscriptionsStore();

  const { data: organizations = [] } = useQuery<Organization[]>({
    queryKey: ["organizations"],
    queryFn: organizationsApi.list,
    staleTime: 1000 * 60 * 5,
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["billing", "plans"],
    queryFn: billingApi.listPlans,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  const orgNameById = useMemo(
    () => new Map(organizations.map((o) => [o.id, o.name])),
    [organizations]
  );

  const planNameById = useMemo(
    () => new Map(plans.map((p) => [p.id, p.name])),
    [plans]
  );

  function handleCreateClick() { clearError(); setSelectedSubscription(null); setShowForm(true); }
  function handleEditClick(s: Subscription) { clearError(); setSelectedSubscription(s); setShowForm(true); }
  function handleCancel() { clearError(); setSelectedSubscription(null); setShowForm(false); }

  async function handleSubmit(payload: CreateSubscriptionPayload | UpdateSubscriptionPayload) {
    if (selectedSubscription) {
      await updateSubscription(selectedSubscription.id, payload as UpdateSubscriptionPayload);
    } else {
      await createSubscription(payload as CreateSubscriptionPayload);
    }
    if (!useSubscriptionsStore.getState().error) {
      setShowForm(false);
      setSelectedSubscription(null);
    }
  }

  return (
    <div>
      <SaasPageHeader
        title="Subscriptions"
        description="Manage organization plans and billing cycles."
        actionLabel="New Subscription"
        onAction={handleCreateClick}
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) handleCancel(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedSubscription ? "Edit Subscription" : "New Subscription"}
            </DialogTitle>
          </DialogHeader>
          <SubscriptionForm
            key={selectedSubscription?.id ?? "create"}
            subscription={selectedSubscription}
            organizations={organizations}
            isSubmitting={isLoading}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>

      {isLoading && subscriptions.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-sm text-slate-500 shadow-sm">
          Loading subscriptions...
        </div>
      ) : subscriptions.length === 0 ? (
        <SaasEmptyState
          title="No subscriptions yet"
          description="Create a subscription to assign a plan to an organization."
          actionLabel="Create Subscription"
          onAction={handleCreateClick}
        />
      ) : (
        <SaasDataTable
          data={subscriptions}
          columns={[
            {
              header: "Organization",
              render: (row) => orgNameById.get(row.owner_id) ?? row.owner_id,
            },
            {
              header: "Plan",
              render: (row) => planNameById.get(row.plan_id) ?? row.plan_id,
            },
            {
              header: "Status",
              render: (row) => <SaasStatusBadge status={subStatusVariant(row.status)} />,
            },
            {
              header: "Cycle",
              render: (row) => row.billing_cycle.charAt(0) + row.billing_cycle.slice(1).toLowerCase(),
            },
            { header: "Start", render: (row) => formatDate(row.start_date) },
            { header: "End", render: (row) => formatDate(row.end_date) },
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
                  {row.status === "CANCELLED" ? (
                    <button
                      onClick={() => updateSubscription(row.id, { status: "ACTIVE" })}
                      className="rounded-md border border-green-300 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
                    >
                      Reactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (window.confirm("Cancel this subscription?"))
                          updateSubscription(row.id, { status: "CANCELLED" });
                      }}
                      className="rounded-md border border-orange-300 px-3 py-1 text-xs font-medium text-orange-700 hover:bg-orange-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
