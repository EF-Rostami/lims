"use client";

import { SaasPageHeader } from "@/features/saas/components/SaasPageHeader";
import { SaasDataTable } from "@/features/saas/components/SaasDataTable";
import { SaasStatusBadge } from "@/features/saas/components/SaasStatusBadge";

type ProvisioningJob = {
  id: string;
  tenant: string;
  organization: string;
  step: string;
  status: "success" | "pending" | "failed";
  startedAt: string;
};

const jobs: ProvisioningJob[] = [
  {
    id: "1",
    tenant: "Alpha Main Lab",
    organization: "Alpha Laboratories",
    step: "Tenant schema created",
    status: "success",
    startedAt: "2026-05-14 10:20",
  },
  {
    id: "2",
    tenant: "Beta Diagnostics Lab",
    organization: "Beta Diagnostics",
    step: "Creating default roles",
    status: "pending",
    startedAt: "2026-05-14 11:05",
  },
];

export default function ProvisioningPage() {
  return (
    <div>
      <SaasPageHeader
        title="Provisioning"
        description="Monitor tenant provisioning jobs and setup progress."
      />

      <SaasDataTable
        data={jobs}
        columns={[
          { header: "Tenant", accessor: "tenant" },
          { header: "Organization", accessor: "organization" },
          { header: "Current Step", accessor: "step" },
          { header: "Status", render: (row) => <SaasStatusBadge status={row.status} /> },
          { header: "Started At", accessor: "startedAt" },
        ]}
      />
    </div>
  );
}
