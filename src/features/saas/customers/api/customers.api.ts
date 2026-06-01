// @/features/saas/customers/api/customers.api.ts
import saasApi from "@/lib/saas-api";
import type { components } from "@/generated/saas/api";

// Pure schemas extracted from code-gen components
export type Organization = components["schemas"]["OrganizationRead"];
export type OrganizationCreatePayload = components["schemas"]["OrganizationCreate"];
export type OrganizationUpdatePayload = components["schemas"]["OrganizationUpdate"];

export type OrganizationMember = components["schemas"]["OrganizationMemberRead"];
export type MemberCreatePayload = components["schemas"]["OrganizationMemberCreate"];
export type MemberUpdatePayload = components["schemas"]["OrganizationMemberUpdate"];

export type Tenant = components["schemas"]["TenantRead"];
export type TenantCreatePayload = components["schemas"]["TenantCreate"];
export type TenantUpdatePayload = components["schemas"]["TenantUpdate"];

export type TenantRegistry = components["schemas"]["TenantRegistryRead"];
export type RegistryCreatePayload = components["schemas"]["TenantRegistryCreate"];

export const customersApi = {
  // Organizations
  listOrganizations: async (): Promise<Organization[]> => {
    const res = await saasApi.get<Organization[]>("/customers/organizations");
    return res.data;
  },
  createOrganization: async (payload: OrganizationCreatePayload): Promise<Organization> => {
    const res = await saasApi.post<Organization>("/customers/organizations", payload);
    return res.data;
  },
  updateOrganization: async (id: string, payload: OrganizationUpdatePayload): Promise<Organization> => {
    const res = await saasApi.patch<Organization>(`/customers/organizations/${id}`, payload);
    return res.data;
  },
  deleteOrganization: async (id: string): Promise<void> => {
    await saasApi.delete(`/customers/organizations/${id}`);
  },

  // Tenants
  listTenants: async (orgId?: string): Promise<Tenant[]> => {
    const url = orgId ? `/customers/tenants?organization_id=${orgId}` : "/customers/tenants";
    const res = await saasApi.get<Tenant[]>(url);
    return res.data;
  },
  createTenant: async (payload: TenantCreatePayload): Promise<Tenant> => {
    const res = await saasApi.post<Tenant>("/customers/tenants", payload);
    return res.data;
  },
  deleteTenant: async (id: string): Promise<void> => {
    await saasApi.delete(`/customers/tenants/${id}`);
  },

  // Tenant Registry (Provisioning / DB isolation configurations)
  getTenantRegistry: async (tenantId: string): Promise<TenantRegistry> => {
    const res = await saasApi.get<TenantRegistry>(`/customers/tenants/${tenantId}/registry`);
    return res.data;
  },
  provisionTenantRegistry: async (payload: RegistryCreatePayload): Promise<TenantRegistry> => {
    const res = await saasApi.post<TenantRegistry>("/customers/tenant-registry", payload);
    return res.data;
  },
};