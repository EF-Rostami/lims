// @ts-nocheck — pending migration to features/lims/ pattern
/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/api-client";
import { handleApi } from "@/lib/handle-api";
import type { ApiRequest, ApiResponse } from "@/lib/api-types";
import { EQUIPMENT_ENDPOINTS } from "./equipment.types";

type Equipment = Extract< ApiResponse<"/api/equipment", "get">, any[]>;

export const equipmentService = {
  /**
   * GET /api/equipment
   */
// equipment.service.ts
  async getEquipments() {
    const result = await handleApi(
      apiClient.get<Equipment>(EQUIPMENT_ENDPOINTS.list)
    );

    // CRITICAL: Ensure errors are thrown so React Query catches them
    if (result && typeof result === 'object' && 'detail' in result) {
      throw result;
    }

    return result;
  },
  

  /**
   * GET /api/equipment/{equipment_id}
   */
  async getEquipment(id: number) {
    const result = await handleApi(
      apiClient.get<ApiResponse<"/api/equipment/{equipment_id}", "get">>(
        EQUIPMENT_ENDPOINTS.detail(id)
      )
    );
    if (result && typeof result === 'object' && 'detail' in result) throw result;
    return result;
  },

  /**
   * POST /api/equipment
   */
  async createEquipment(data: ApiRequest<"/api/equipment", "post">) {
    const result = await handleApi(
      apiClient.post<ApiResponse<"/api/equipment", "post">>(
        EQUIPMENT_ENDPOINTS.create,
        data
      )
    );
    if (result && typeof result === 'object' && 'detail' in result) throw result;
    return result;
  },

  /**
   * PUT /api/equipment/{equipment_id}
   */
  async updateEquipment(id: number, data: ApiRequest<"/api/equipment/{equipment_id}", "put">) {
    const result = await handleApi(
      apiClient.put<ApiResponse<"/api/equipment/{equipment_id}", "put">>(
        EQUIPMENT_ENDPOINTS.update(id),
        data
      )
    ) as ApiResponse<"/api/equipment/{equipment_id}", "put"> | { detail: any[] };

    if (result && typeof result === 'object' && 'detail' in result) throw result;
    return result;
  },

  /**
   * DELETE /api/equipment/{equipment_id}
   */
  async deleteEquipment(id: number) {
    const result = await handleApi(
      apiClient.delete(EQUIPMENT_ENDPOINTS.delete(id))
    );
    if (result && typeof result === 'object' && 'detail' in result) throw result;
    return result;
  },


  /**
   * GET /api/equipment/{id}/timeline
   */
  async getTimeline(id: number) {
    const result = await handleApi(
      apiClient.get<ApiResponse<"/api/equipment/{equipment_id}/timeline", "get">>(
        EQUIPMENT_ENDPOINTS.timeline(id)
      )
    );
    if (result && typeof result === 'object' && 'detail' in result) throw result;
    return result;
  },

  /**
   * POST /api/equipment/{id}/calibrate
   */
  async logCalibration(id: number, data: any) { // Type with CalibrationCreate if available
    const result = await handleApi(
      apiClient.post(EQUIPMENT_ENDPOINTS.calibrate(id), data)
    );
    if (result && typeof result === 'object' && 'detail' in result) throw result;
    return result;
  },

  /**
   * PATCH /api/equipment/{eqId}/verify-calibration/{calId}
   */
  async verifyCalibration(equipmentId: number, calibrationId: number) {
    const result = await handleApi(
      apiClient.patch(EQUIPMENT_ENDPOINTS.verifyCalibration(equipmentId, calibrationId))
    );
    if (result && typeof result === 'object' && 'detail' in result) throw result;
    return result;
  },

  /**
   * POST /api/equipment/{id}/requirements
   */
  async addRequirement(equipmentId: number, data: any) {
    const result = await handleApi(
      apiClient.post(EQUIPMENT_ENDPOINTS.addRequirement(equipmentId), data)
    );
    if (result && typeof result === 'object' && 'detail' in result) throw result;
    return result;
  },

  /**
   * PATCH /api/equipment/requirements/{reqId}
   */
  async updateRequirement(requirementId: number, data: any) {
    const result = await handleApi(
      apiClient.patch(EQUIPMENT_ENDPOINTS.updateRequirement(requirementId), data)
    );
    if (result && typeof result === 'object' && 'detail' in result) throw result;
    return result;
  },

  /**
   * DELETE /api/equipment/requirements/{reqId}
   */
  async deleteRequirement(requirementId: number) {
    const result = await handleApi(
      apiClient.delete(EQUIPMENT_ENDPOINTS.deleteRequirement(requirementId))
    );
    if (result && typeof result === 'object' && 'detail' in result) throw result;
    return result;
  },
};