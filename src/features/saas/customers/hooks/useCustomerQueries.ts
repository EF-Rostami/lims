// @/features/saas/customers/hooks/useCustomerQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customersApi, type OrganizationCreatePayload, type TenantCreatePayload } from "../api/customers.api";

export const customerKeys = {
  all: ["customers"] as const,
  organizations: () => [...customerKeys.all, "organizations"] as const,
  tenants: (orgId?: string) => [...customerKeys.all, "tenants", { orgId }] as const,
};

export function useOrganizations() {
  return useQuery({
    queryKey: customerKeys.organizations(),
    queryFn: customersApi.listOrganizations,
    staleTime: 60 * 1000,
  });
}

export function useTenants(orgId?: string) {
  return useQuery({
    queryKey: customerKeys.tenants(orgId),
    queryFn: () => customersApi.listTenants(orgId),
  });
}

export function useCreateOrgMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OrganizationCreatePayload) => customersApi.createOrganization(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.organizations() });
    },
  });
}

export function useCreateTenantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TenantCreatePayload) => customersApi.createTenant(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.tenants(variables.organization_id) });
    },
  });
}