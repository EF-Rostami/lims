import { limsApi } from "@/lib/lims-api";
import type { components } from "@/generated/lims/api";

export type UserRead = components["schemas"]["UserRead"];
export type TenantUserCreate = components["schemas"]["TenantUserCreate"];
export type TenantUserMetadata = components["schemas"]["TenantUserMetadata"];
export type RoleType = components["schemas"]["RoleType"];

export interface ListUsersParams {
  is_active?: boolean;
  user_type?: string;
}

export const usersApi = {
  list: async (params?: ListUsersParams): Promise<UserRead[]> => {
    const res = await limsApi.get<UserRead[]>("/users", { params });
    return res.data;
  },

  get: async (id: number): Promise<UserRead> => {
    const res = await limsApi.get<UserRead>(`/users/${id}`);
    return res.data;
  },

  create: async (data: TenantUserCreate): Promise<TenantUserMetadata> => {
    const res = await limsApi.post<TenantUserMetadata>("/users", data);
    return res.data;
  },

  assignRole: async (userId: number, roleName: RoleType): Promise<void> => {
    await limsApi.post(`/users/${userId}/roles`, null, { params: { role_name: roleName } });
  },

  removeRole: async (userId: number, roleName: RoleType): Promise<void> => {
    await limsApi.delete(`/users/${userId}/roles/${roleName}`);
  },
};
