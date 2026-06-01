// @ts-nocheck — pending migration to features/lims/ pattern
import apiClient from "@/lib/api-client";
import { handleApi } from "@/lib/handle-api";
import type { ApiRequest, ApiResponse } from "@/lib/api-types";
import { DEPARTMENT_ENDPOINTS } from "./department.types";

export const departmentService = {
  /**
   * GET /api/departments
   */
  getDepartments() {
    return handleApi(
      apiClient.get<ApiResponse<"/api/departments", "get">>(
        DEPARTMENT_ENDPOINTS.list
      )
    );
  },

  /**
   * POST /api/departments
   */
  createDepartment(
    data: ApiRequest<"/api/departments", "post">
  ) {
    return handleApi(
      apiClient.post<ApiResponse<"/api/departments", "post">>(
        DEPARTMENT_ENDPOINTS.create,
        data
      )
    );
  },

  /**
   * PUT /api/departments/{department_id}
   */
  updateDepartment(
    id: number,
    data: ApiRequest<"/api/departments/{department_id}", "put">
  ) {
    return handleApi(
      apiClient.put<ApiResponse<"/api/departments/{department_id}", "put">>(
        DEPARTMENT_ENDPOINTS.update(id),
        data
      )
    );
  },

  /**
   * DELETE /api/departments/{department_id}
   */
  deleteDepartment(id: number) {
    return handleApi(
      apiClient.delete<ApiResponse<"/api/departments/{department_id}", "delete">>(
        DEPARTMENT_ENDPOINTS.delete(id)
      )
    );
  },
};