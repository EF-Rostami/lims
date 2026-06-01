import { saasApi } from "@/lib/saas-api";

export interface SaasLoginPayload {
  email: string;
  password: string;
}

export interface SaasUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface SaasAuthResponse {
  access_token: string;
  token_type: string;
  user: SaasUser;
}

export const saasAuthApi = {
  login: async (payload: SaasLoginPayload): Promise<SaasAuthResponse> => {
    const res = await saasApi.post<SaasAuthResponse>(
      "/saas/auth/login",
      payload
    );
    return res.data;
  },

  refresh: async (): Promise<SaasAuthResponse> => {
    const res = await saasApi.post<SaasAuthResponse>(
      "/saas/auth/refresh"
    );
    return res.data;
  },

  me: async (): Promise<SaasUser> => {
    const res = await saasApi.get<SaasUser>("/saas/auth/me");
    return res.data;
  },

  logout: async (): Promise<void> => {
    await saasApi.post("/saas/auth/logout");
  },
};