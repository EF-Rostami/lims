import saasApi from "@/lib/saas-api";

export type TenantUser = {
  id: number;
  email: string;
  is_active: boolean;
  role: string | null;
  employee_id: number | null;
  first_name: string | null;
  last_name: string | null;
};

export type CreateTenantUserPayload = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
};

export type ResetTenantUserPasswordPayload = {
  new_password: string;
};

export type SeedDemoResult = {
  schema: string;
  demo_email: string;
  tables_cleared: number;
  status: string;
};

export const tenantUsersApi = {
  list: async (tenantId: string): Promise<TenantUser[]> => {
    const res = await saasApi.get<TenantUser[]>(`/customers/tenants/${tenantId}/users`);
    return res.data;
  },

  create: async (tenantId: string, payload: CreateTenantUserPayload): Promise<TenantUser> => {
    const res = await saasApi.post<TenantUser>(`/customers/tenants/${tenantId}/users`, payload);
    return res.data;
  },

  resetPassword: async (tenantId: string, userId: number, payload: ResetTenantUserPasswordPayload): Promise<TenantUser> => {
    const res = await saasApi.patch<TenantUser>(
      `/customers/tenants/${tenantId}/users/${userId}/password`,
      payload,
    );
    return res.data;
  },

  seedDemo: async (tenantId: string): Promise<SeedDemoResult> => {
    const res = await saasApi.post<SeedDemoResult>(`/provisioning/tenants/${tenantId}/seed-demo`);
    return res.data;
  },
};
