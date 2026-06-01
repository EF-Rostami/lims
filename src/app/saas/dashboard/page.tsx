"use client";

import { useQuery } from "@tanstack/react-query";
import { SaasPageHeader } from "@/features/saas/components/SaasPageHeader";
import { SaasStatCard } from "@/features/saas/components/SaasStatCard";
import { organizationsApi } from "@/features/saas/organizations/organizations.api";
import { tenantsApi } from "@/features/saas/tenants/tenants.api";

export default function SaasDashboardPage() {
  const { data: orgs = [], isLoading: orgsLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: organizationsApi.list,
    staleTime: 1000 * 60 * 5,
  });

  const { data: tenants = [], isLoading: tenantsLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: tenantsApi.list,
    staleTime: 1000 * 60 * 5,
  });

  const pending = tenants.filter((t) => t.status === "PROVISIONING").length;
  const ready = tenants.filter((t) => t.status === "ACTIVE").length;

  const loading = orgsLoading || tenantsLoading;

  return (
    <div>
      <SaasPageHeader
        title="Dashboard"
        description="Overview of organizations and tenant environments."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SaasStatCard
          label="Organizations"
          value={loading ? "—" : String(orgs.length)}
          description="Total customer organizations"
        />
        <SaasStatCard
          label="Tenants"
          value={loading ? "—" : String(tenants.length)}
          description="All tenant environments"
        />
        <SaasStatCard
          label="Active Tenants"
          value={loading ? "—" : String(ready)}
          description="Provisioned and active"
        />
        <SaasStatCard
          label="Pending Provisioning"
          value={loading ? "—" : String(pending)}
          description="Tenants awaiting setup"
        />
      </div>
    </div>
  );
}
