// @/features/saas/organizations/organizations.api.ts
import saasApi from "@/lib/saas-api";
// import type { paths, components } from "@/generated/saas/api";

import type { 
  Organization, 
  CreateOrganizationPayload, 
  UpdateOrganizationPayload 
} from "@/generated/saas/models"; 
// // Extract types cleanly from global OpenAPI path schemas
// export type Organization = components["schemas"]["OrganizationRead"];
// // export type CreateOrganizationPayload = paths["/api/v1/global/customers/organizations"]["post"]["requestBody"]["content"]["application/json"];
// // export type UpdateOrganizationPayload = paths["/api/v1/global/customers/organizations/{organization_id}"]["patch"]["requestBody"]["content"]["application/json"];

export const organizationsApi = {
  list: async (): Promise<Organization[]> => {
    const res = await saasApi.get<Organization[]>("/customers/organizations");
    return res.data;
  },

  getById: async (id: string): Promise<Organization> => {
    const res = await saasApi.get<Organization>(`/customers/organizations/${id}`);
    return res.data;
  },

  create: async (payload: CreateOrganizationPayload): Promise<Organization> => {
    const res = await saasApi.post<Organization>("/customers/organizations", payload);
    return res.data;
  },

  update: async (id: string, payload: UpdateOrganizationPayload): Promise<Organization> => {
    const res = await saasApi.patch<Organization>(`/customers/organizations/${id}`, payload);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await saasApi.delete(`/customers/organizations/${id}`);
  },
};