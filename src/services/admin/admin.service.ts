// @ts-nocheck — pending migration to features/lims/ pattern
import apiClient from "@/lib/api-client";
import { handleApi } from "@/lib/handle-api";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ApiRequest, ApiResponse } from "@/lib/api-types";
import { ADMIN_ENDPOINTS } from "./admin.types";

export interface ReadinessData {
  step0: boolean;
  step1: boolean;
  step2: boolean;
  step3: boolean;
  step4: boolean;
  overall_progress: number;
  system_health: "setup" | "operational";
}
export const adminService = {
  /**
   * GET /api/admin/readiness
   * Fetches the QMS implementation progress
   */
getReadiness() {
    return handleApi(
      apiClient.get<ApiResponse<"/api/admin/readiness", "get">>(
        ADMIN_ENDPOINTS.readiness
      )
    ) as Promise<ReadinessData>; // <--- FORCE THE TYPE HERE
  },

  /**
   * GET /api/admin/permissions
   * Fetches master list of all permission definitions
   */
  getPermissions() {
    return handleApi(
      apiClient.get<ApiResponse<"/api/admin/permissions", "get">>(
        ADMIN_ENDPOINTS.permissions
      )
    );
  },

  /**
   * GET /api/admin/roles-matrix
   * Fetches roles with their nested permissions
   */
  getRolesMatrix() {
    return handleApi(
      apiClient.get<ApiResponse<"/api/admin/roles-matrix", "get">>(
        ADMIN_ENDPOINTS.rolesMatrix
      )
    );
  },

  /**
   * POST /api/admin/matrix/toggle
   * Connects or disconnects a permission from a role
   */

togglePermission(data: { role_id: number; permission_id: number; action: string }) {
  return handleApi(
    apiClient.post(
      ADMIN_ENDPOINTS.togglePermission, 
      null, // Body is null
      { 
        params: { 
          role_id: data.role_id, 
          permission_id: data.permission_id, 
          action: data.action 
        } 
      } // Data is sent as ?role_id=1&permission_id=5...
    )
  );
  },
};