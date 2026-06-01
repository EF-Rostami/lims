// @ts-nocheck — QMS module pending backend_v3 migration

import apiClient from "@/lib/api-client";
import { handleApi } from "@/lib/handle-api";
import { NC_ENDPOINTS, NCListResponse, NonConformity } from "./non-conformities.types";
import type { ApiRequest, ApiResponse } from "@/lib/api-types";



export const ncService = {
  /**
   * GET /api/non-conformities
   */
  async getNonConformities(params?: { skip?: number; limit?: number; status?: string }) {
    const result = await handleApi(
      apiClient.get<NCListResponse>(NC_ENDPOINTS.list, { params })
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  /**
   * GET /api/non-conformities/{nc_id}
   */
  async getNCById(id: number) {
    const result = await handleApi(
      apiClient.get<ApiResponse<"/api/non-conformities/{nc_id}", "get">>(NC_ENDPOINTS.detail(id))
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result as NonConformity;
  },

  /**
   * POST /api/non-conformities
   */
  async createNC(data: ApiRequest<"/api/non-conformities", "post">) {
    const result = await handleApi(
      apiClient.post<ApiResponse<"/api/non-conformities", "post">>(NC_ENDPOINTS.create, data)
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  /**
   * PUT /api/non-conformities/{nc_id}
   * Supports custom audit headers
   */
  async updateNC(id: number, data: ApiRequest<"/api/non-conformities/{nc_id}", "put">, auditReason?: string) {
    const result = await handleApi(
      apiClient.put<ApiResponse<"/api/non-conformities/{nc_id}", "put">>(
        NC_ENDPOINTS.update(id), 
        data,
        { headers: auditReason ? { "X-Audit-Reason": auditReason } : {} }
      )
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },
};