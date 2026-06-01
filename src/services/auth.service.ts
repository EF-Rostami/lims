// @ts-nocheck — pending migration to features/lims/ pattern
// src/services/auth.service.ts
import axios from "axios";
import apiClient from "@/lib/api-client";
import type { paths as SaasPaths } from "@/generated/saas/api";
import type { paths as LimsPaths } from "@/generated/lims/api";
import type { ApiRequest, ApiResponse } from "@/lib/api-types";

/**
 * ==============================================================
 * Inferred Types Mapped to SaaS Control Plane and LIMS Workspaces
 * ==============================================================
 */
// SaaS plane workspace discovery
export type TenantListResponse = ApiResponse<SaasPaths, "/api/v1/global/workplaces", "get">;

// LIMS workspace operations
export type LoginBody = ApiRequest<LimsPaths, "/api/v1/lims/auth/login", "post">;
export type LoginResponse = ApiResponse<LimsPaths, "/api/v1/lims/auth/login", "post">;

export type MeResponse = ApiResponse<LimsPaths, "/api/v1/lims/auth/me", "get">;
export type RefreshResponse = ApiResponse<LimsPaths, "/api/v1/lims/auth/refresh", "post">;
export type LogoutResponse = { message: string }; // Standard JSON fallback

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export const authService = {
  /**
   * 1. Public Workspace Fetch
   * Uses raw unintercepted axios so it never crashes when logged out.
   */
  getAvailableTenants: () =>
    axios.get<TenantListResponse>(`${BASE}/global/workplaces`),

  /**
   * 2. Tenant Workspace Login
   * Explicitly binds the user's dropdown choice to the X-Tenant-Schema header.
   */
  login: (credentials: LoginBody, tenantSchema: string) =>
    apiClient.post<LoginResponse>(`${BASE}/lims/auth/login`, credentials, {
      headers: {
        "X-Tenant-Schema": tenantSchema,
      },
    }),

  /**
   * 3. Get Current User Session Data
   * Retrieves roles, email metadata, and scope variables.
   * The interceptor will automatically attach the local X-Tenant-Schema.
   */
  me: () => 
    apiClient.get<MeResponse>(`${BASE}/lims/auth/me`),

  /**
   * 4. Silent Session Refresh Token Exchange
   * Leveraged by your Axios interceptor whenever a 401 occurs.
   * Forces engine switching via the schema header to safely issue tokens.
   */
  refresh: (tenantSchema: string) => 
    apiClient.post<RefreshResponse>(`${BASE}/lims/auth/refresh`, {}, {
      headers: {
        "X-Tenant-Schema": tenantSchema,
      },
    }),

  /**
   * 5. Logout User
   * Clears out backend cookies and drops connection states.
   */
  logout: () => 
    apiClient.post<LogoutResponse>(`${BASE}/lims/auth/logout`),
};