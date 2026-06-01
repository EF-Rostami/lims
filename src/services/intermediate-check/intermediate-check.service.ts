// @ts-nocheck — pending migration to features/lims/ pattern
/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/api-client";
import { handleApi } from "@/lib/handle-api";
import type { ApiRequest, ApiResponse } from "@/lib/api-types";
import { INTERMEDIATE_CHECK_ENDPOINTS } from "./intermediate-check.types";

type Check = Extract<ApiResponse<"/api/intermediate-checks/equipment/{equipment_id}/history", "get">, any[]>
type CheckHistory = Extract<ApiResponse<"/api/intermediate-checks/equipment/{equipment_id}/history", "get">, any[]>

export const intermediateCheckService = {
  /**
   * GET /api/intermediate-checks
   */
  async getChecks(params?: { equipment_id?: number; status_filter?: string }) {
    const result = await handleApi(
      apiClient.get<Check>(
        INTERMEDIATE_CHECK_ENDPOINTS.list, 
        { params }
      )
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  /**
   * GET /api/intermediate-checks/equipment/{equipment_id}/history
   */
  async getEquipmentHistory(equipmentId: number) {
    const result = await handleApi(
      apiClient.get<CheckHistory>(
        INTERMEDIATE_CHECK_ENDPOINTS.history(equipmentId)
      )
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  /**
   * POST /api/intermediate-checks
   */
  async createCheck(data: ApiRequest<"/api/intermediate-checks", "post">) {
    const result = await handleApi(
      apiClient.post<ApiResponse<"/api/intermediate-checks", "post">>(
        INTERMEDIATE_CHECK_ENDPOINTS.create,
        data
      )
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  /**
   * PUT /api/intermediate-checks/{check_id}
   */
  async updateCheck(id: number, data: ApiRequest<"/api/intermediate-checks/{check_id}", "put">) {
    const result = await handleApi(
      apiClient.put<ApiResponse<"/api/intermediate-checks/{check_id}", "put">>(
        INTERMEDIATE_CHECK_ENDPOINTS.update(id),
        data
      )
    ) as ApiResponse<"/api/intermediate-checks/{check_id}", "put"> | { detail: any[] };

    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  /**
   * DELETE /api/intermediate-checks/{check_id}
   */
  async deleteCheck(id: number) {
    const result = await handleApi(
      apiClient.delete(INTERMEDIATE_CHECK_ENDPOINTS.delete(id))
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  }
};