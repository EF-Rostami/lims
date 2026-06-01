"use client";

import { useQuery } from "@tanstack/react-query";
import saasApi from "@/lib/saas-api";
import { SaasPageHeader } from "@/features/saas/components/SaasPageHeader";
import { SaasDataTable } from "@/features/saas/components/SaasDataTable";
import { SaasStatusBadge } from "@/features/saas/components/SaasStatusBadge";
import { SaasEmptyState } from "@/features/saas/components/SaasEmptyState";

type AuditLog = {
  id: string;
  actor_email: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  status: "success" | "failed" | "denied";
  ip_address: string | null;
  created_at: string;
};

async function fetchAuditLogs(): Promise<AuditLog[]> {
  const res = await saasApi.get<AuditLog[]>("/audit-logs?limit=100");
  return res.data;
}

function auditStatusVariant(status: string): "active" | "inactive" | "failed" {
  if (status === "success") return "active";
  if (status === "failed" || status === "denied") return "failed";
  return "inactive";
}

export default function AuditLogsPage() {
  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: fetchAuditLogs,
    staleTime: 1000 * 30,
  });

  return (
    <div>
      <SaasPageHeader
        title="Audit Logs"
        description="Review actions performed across the platform."
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load audit logs.
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl bg-white p-6 text-sm text-slate-500 shadow-sm">
          Loading logs...
        </div>
      ) : logs.length === 0 ? (
        <SaasEmptyState
          title="No audit logs yet"
          description="Actions taken on the platform will appear here."
        />
      ) : (
        <SaasDataTable
          data={logs}
          columns={[
            { header: "Action", accessor: "action" },
            { header: "Actor", render: (row) => row.actor_email ?? "—" },
            {
              header: "Resource",
              render: (row) =>
                row.resource_type
                  ? `${row.resource_type}${row.resource_id ? ` / ${row.resource_id.slice(0, 8)}` : ""}`
                  : "—",
            },
            {
              header: "Status",
              render: (row) => <SaasStatusBadge status={auditStatusVariant(row.status)} />,
            },
            {
              header: "Time",
              render: (row) => new Date(row.created_at).toLocaleString(),
            },
          ]}
        />
      )}
    </div>
  );
}
