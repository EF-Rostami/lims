// @ts-nocheck — pending migration to features/lims/ pattern
/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/api-client";
import { handleApi } from "@/lib/handle-api";
import type { ApiRequest, ApiResponse } from "@/lib/api-types";
import { CALIBRATION_ENDPOINTS } from "./calibration.types";

type Calibration = Extract <ApiResponse<"/api/calibrations", "get">, any[]>
type CalHistory = Extract <ApiResponse<"/api/calibrations/equipment/{equipment_id}/history", "get">, any[]>
export const calibrationService = {
  /**
   * GET /api/calibrations
   */
  async getCalibrations(params?: { equipment_id?: number; status_filter?: string }) {
    const result = await handleApi(
      apiClient.get<Calibration>(CALIBRATION_ENDPOINTS.list, {
        params,
      })
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  /**
   * GET /api/calibrations/equipment/{equipment_id}/history
   */
  async getEquipmentHistory(equipmentId: number) {
    const result = await handleApi(
      apiClient.get<CalHistory>(
        CALIBRATION_ENDPOINTS.history(equipmentId)
      )
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  /**
   * POST /api/calibrations
   */
  async createCalibration(data: ApiRequest<"/api/calibrations", "post">) {
    const result = await handleApi(
      apiClient.post<ApiResponse<"/api/calibrations", "post">>(
        CALIBRATION_ENDPOINTS.create,
        data
      )
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  /**
   * PUT /api/calibrations/{calibration_id}
   */
  async updateCalibration(id: number, data: ApiRequest<"/api/calibrations/{calibration_id}", "put">) {
    const result = await handleApi(
      apiClient.put<ApiResponse<"/api/calibrations/{calibration_id}", "put">>(
        CALIBRATION_ENDPOINTS.update(id),
        data
      )
    ) as ApiResponse<"/api/calibrations/{calibration_id}", "put"> | { detail: any[] };

    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },
  
/**
  * PATCH /api/calibrations/{id}/verify
   * Supervisor signature to lock record and return equipment to Operational status.
   */
  async verifyCalibration(id: number) {
    const result = await handleApi(
      apiClient.patch<ApiResponse<"/api/calibrations/{calibration_id}/verify", "patch">>(
        CALIBRATION_ENDPOINTS.verify(id)
      )
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  /**
   * DELETE /api/calibrations/{calibration_id}
   */
  async deleteCalibration(id: number) {
    const result = await handleApi(
      apiClient.delete(CALIBRATION_ENDPOINTS.delete(id))
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  }
};