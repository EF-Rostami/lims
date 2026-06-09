import type { components } from "@/generated/lims/api";

export type TenantLoginRequest =
  components["schemas"]["TenantLoginRequest"];

export type TenantTokenResponse =
  components["schemas"]["TenantTokenResponse"];

export type TenantUserMetadata =
  components["schemas"]["TenantUserMetadata"];

export type LimsUserMetadata = TenantUserMetadata;

export interface MFARequiredResponse {
  mfa_required: true;
  mfa_token: string;
}

export type LoginResult = TenantTokenResponse | MFARequiredResponse;

function isMFARequired(r: LoginResult): r is MFARequiredResponse {
  return (r as MFARequiredResponse).mfa_required === true;
}

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export const limsAuthApi = {
  login: async (
    email: string,
    password: string,
    tenantSchema: string
  ): Promise<LoginResult> => {
    const res = await fetch(`${API_BASE}/api/v1/lims/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-schema": tenantSchema,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      throw new Error("Tenant login failed");
    }

    return res.json();
  },

  verifyMfa: async (
    code: string,
    mfaToken: string,
    tenantSchema: string
  ): Promise<TenantTokenResponse> => {
    const res = await fetch(`${API_BASE}/api/v1/lims/auth/mfa/verify`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-schema": tenantSchema,
      },
      body: JSON.stringify({ code, mfa_token: mfaToken }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || "MFA verification failed");
    }

    return res.json();
  },

  refresh: async (tenantSchema: string): Promise<TenantTokenResponse> => {
    const res = await fetch(`${API_BASE}/api/v1/lims/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-schema": tenantSchema,
      },
    });

    if (!res.ok) {
      throw new Error("Tenant refresh failed");
    }

    return res.json();
  },

  me: async (
    accessToken: string,
    tenantSchema: string
  ): Promise<TenantUserMetadata> => {
    const res = await fetch(`${API_BASE}/api/v1/lims/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-tenant-schema": tenantSchema,
      },
    });

    if (!res.ok) {
      throw new Error("Could not fetch LIMS user metadata");
    }

    return res.json();
  },

  logout: async (tenantSchema: string): Promise<void> => {
    await fetch(`${API_BASE}/api/v1/lims/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "x-tenant-schema": tenantSchema,
      },
    });
  },
};

export { isMFARequired };
