// @ts-nocheck — pending migration to features/lims/ pattern
import apiClient from "@/lib/api-client";
import { handleApi } from "@/lib/handle-api";
import type { ApiRequest, ApiResponse } from "@/lib/api-types";
import { DELEGATION_ENDPOINTS } from "./delegation.types";

export const delegationService = {
  /**
   * GET /api/delegations
   */
  getDelegations() {
    return handleApi(
      apiClient.get<ApiResponse<"/api/delegations", "get">>(
        DELEGATION_ENDPOINTS.list
      )
    );
  },

  /**
   * GET /api/delegations/active
   */
  getActiveDelegations() {
    return handleApi(
      apiClient.get<ApiResponse<"/api/delegations/active", "get">>(
        DELEGATION_ENDPOINTS.active
      )
    );
  },

  /**
   * POST /api/delegations
   */
  createDelegation(data: ApiRequest<"/api/delegations", "post">) {
    return handleApi(
      apiClient.post<ApiResponse<"/api/delegations", "post">>(
        DELEGATION_ENDPOINTS.create,
        data
      )
    )
  },

  /**
   * PUT /api/delegations/{delegation_id}
   */
  updateDelegation(id: number, data: ApiRequest<"/api/delegations/{delegation_id}", "put">) {
    return handleApi(
      apiClient.put<ApiResponse<"/api/delegations/{delegation_id}", "put">>(
        DELEGATION_ENDPOINTS.update(id),
        data
      )
    );
  },

  /**
   * DELETE /api/delegations/{id} (Revoke)
   */
  revokeDelegation(id: number) {
    return handleApi(
      apiClient.delete<ApiResponse<"/api/delegations/{delegation_id}", "delete">>(
        DELEGATION_ENDPOINTS.delete(id)
      )
    );
  },
};