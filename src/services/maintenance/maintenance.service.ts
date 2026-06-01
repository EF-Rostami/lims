// @ts-nocheck — pending migration to features/lims/ pattern
/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/api-client";
import { handleApi } from "@/lib/handle-api";
import type { ApiRequest, ApiResponse } from "@/lib/api-types";
import { MAINTENANCE_ENDPOINTS } from "./maintenance.types";

type Maintenance = Extract <ApiResponse<"/api/maintenances", "get">, any[]>
type MainHistory = Extract <ApiResponse<"/api/maintenances/equipment/{equipment_id}/history", "get">, any[]>
export const maintenanceService = {
  /**
   * GET /api/maintenances
   */
  async getMaintenances(params?: { equipment_id?: number; status_filter?: string; maintenance_type?: string }) {
    const result = await handleApi(
      apiClient.get<Maintenance>(MAINTENANCE_ENDPOINTS.list, {
        params,
      })
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  /**
   * GET /api/maintenances/equipment/{equipment_id}/history
   */
  async getEquipmentHistory(equipmentId: number) {
    const result = await handleApi(
      apiClient.get<MainHistory>(
        MAINTENANCE_ENDPOINTS.history(equipmentId)
      )
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  /**
   * POST /api/maintenances
   */
  async createMaintenance(data: ApiRequest<"/api/maintenances", "post">) {
    const result = await handleApi(
      apiClient.post<ApiResponse<"/api/maintenances", "post">>(
        MAINTENANCE_ENDPOINTS.create,
        data
      )
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  /**
   * PUT /api/maintenances/{maintenance_id}
   */
  async updateMaintenance(id: number, data: ApiRequest<"/api/maintenances/{maintenance_id}", "put">) {
    const result = await handleApi(
      apiClient.put<ApiResponse<"/api/maintenances/{maintenance_id}", "put">>(
        MAINTENANCE_ENDPOINTS.update(id),
        data
      )
    ) as ApiResponse<"/api/maintenances/{maintenance_id}", "put"> | { detail: any[] };

    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  /**
   * DELETE /api/maintenances/{maintenance_id}
   */
  async deleteMaintenance(id: number) {
    const result = await handleApi(
      apiClient.delete(MAINTENANCE_ENDPOINTS.delete(id))
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  }
};