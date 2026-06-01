import saasApi from "@/lib/saas-api";

export type TenantStatus = "PROVISIONING" | "ACTIVE" | "SUSPENDED" | "ARCHIVED" | "DELETED";
export type TenantEnvironment = "PRODUCTION" | "STAGING" | "TEST";

export type Tenant = {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  environment: TenantEnvironment;
  status: TenantStatus;
  created_at: string;
};

export type CreateTenantPayload = {
  organization_id: string;
  name: string;
  slug: string;
  environment: TenantEnvironment;
};

export type UpdateTenantPayload = {
  name?: string | null;
  status?: TenantStatus | null;
};

export const tenantsApi = {
  list: async (): Promise<Tenant[]> => {
    const res = await saasApi.get<Tenant[]>("/customers/tenants");
    return res.data;
  },

  create: async (payload: CreateTenantPayload): Promise<Tenant> => {
    const res = await saasApi.post<Tenant>("/customers/tenants", payload);
    return res.data;
  },

  update: async (id: string, payload: UpdateTenantPayload): Promise<Tenant> => {
    const res = await saasApi.patch<Tenant>(`/customers/tenants/${id}`, payload);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await saasApi.delete(`/customers/tenants/${id}`);
  },
};
