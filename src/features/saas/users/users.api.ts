import saasApi from "@/lib/saas-api";

export type SaaSRole = "platform_owner" | "platform_admin" | "support_engineer" | "billing_admin";

export type SaaSUser = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  user_roles: Array<{ role?: { name?: string }; name?: string } | string>;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateUserPayload = {
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  password: string;
  role?: SaaSRole;
  is_active?: boolean;
  is_superuser?: boolean;
};

export type UpdateUserPayload = {
  first_name?: string | null;
  last_name?: string | null;
  role?: SaaSRole;
  is_active?: boolean;
  is_superuser?: boolean;
};

export function getRoleName(user: SaaSUser): string {
  const first = user.user_roles?.[0];
  if (!first) return "—";
  if (typeof first === "string") return first;
  return first.role?.name ?? first.name ?? "—";
}

export const usersApi = {
  list: async (): Promise<SaaSUser[]> => {
    const res = await saasApi.get<SaaSUser[]>("/saas/auth/users");
    return res.data;
  },
  create: async (payload: CreateUserPayload): Promise<SaaSUser> => {
    const res = await saasApi.post<SaaSUser>("/saas/auth/users", payload);
    return res.data;
  },
  update: async (id: string, payload: UpdateUserPayload): Promise<SaaSUser> => {
    const res = await saasApi.patch<SaaSUser>(`/saas/auth/users/${id}`, payload);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await saasApi.delete(`/saas/auth/users/${id}`);
  },
};
