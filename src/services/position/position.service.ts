// @ts-nocheck — pending migration to features/lims/ pattern
import apiClient from "@/lib/api-client";
import { handleApi } from "@/lib/handle-api";
import type { ApiRequest, ApiResponse } from "@/lib/api-types";
import { POSITION_ENDPOINTS } from "./position.types";
import { Schema } from "@/types/api-types";


export const positionService = {

  /**
   * GET /api/positions
   */
  getPositions() {
    return handleApi(
      apiClient.get<ApiResponse<"/api/positions", "get">>(
        POSITION_ENDPOINTS.list
      )
    );
  },

  /**
   * GET /api/positions/{position_id}
   */
  getPosition(id: number) {
    return handleApi(
      apiClient.get<ApiResponse<"/api/positions/{position_id}", "get">>(
        POSITION_ENDPOINTS.get(id)
      )
    ) as Promise<Schema["PositionResponse"]>;
  },

  /**
   * POST /api/positions
   */
  createPosition(
    data: ApiRequest<"/api/positions", "post">
  ) {
    return handleApi(
      apiClient.post<ApiResponse<"/api/positions", "post">>(
        POSITION_ENDPOINTS.create,
        data
      )
    );
  },

  /**
   * PUT /api/positions/{position_id}
   */
  updatePosition(
    id: number,
    data: ApiRequest<"/api/positions/{position_id}", "put">
  ) {
    return handleApi(
      apiClient.put<ApiResponse<"/api/positions/{position_id}", "put">>(
        POSITION_ENDPOINTS.update(id),
        data
      )
    );
  },

  /**
   * DELETE /api/positions/{position_id}
   */
  deletePosition(id: number) {
    return handleApi(
      apiClient.delete<ApiResponse<"/api/positions/{position_id}", "delete">>(
        POSITION_ENDPOINTS.delete(id)
      )
    );
  },
};