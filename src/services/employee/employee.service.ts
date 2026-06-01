// @ts-nocheck — pending migration to features/lims/ pattern
/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/api-client";
import { handleApi } from "@/lib/handle-api";
import type { ApiRequest, ApiResponse } from "@/lib/api-types";
import { EMPLOYEE_ENDPOINTS } from "./employee.types";

export const employeeService = {
  /**
   * GET /api/employees
   */
  async getEmployees() {
    const result = await handleApi(
      apiClient.get<ApiResponse<"/api/employees", "get">>(
        EMPLOYEE_ENDPOINTS.list
      )
    );
    // If handleApi returns an error object instead of throwing, 
    // we throw it here to clean up the TypeScript return type.
    if ('detail' in result) throw result; 
    return result;
  },

  /**
   * GET /api/employees/{emp_id}
   */
  async getEmployee(id: number) {
    const result = await handleApi(
      apiClient.get<ApiResponse<"/api/employees/{emp_id}", "get">>(
        EMPLOYEE_ENDPOINTS.update(id)
      )
    );
    if ('detail' in result) throw result;
    return result;
  },

  /**
   * POST /api/employees/register
   */
  async registerEmployee(data: ApiRequest<"/api/employees/register", "post">) {
    const result = await handleApi(
      apiClient.post<ApiResponse<"/api/employees/register", "post">>(
        EMPLOYEE_ENDPOINTS.register,
        data
      )
    );
    if (result && typeof result === 'object' && 'detail' in result) {
     throw result;
    }
    return result;
  },

/**
 * PUT /api/employees/{emp_id}
 */
async updateEmployee(id: number, data: ApiRequest<"/api/employees/{emp_id}", "put">) {
  // 1. Tell TS that result is the successful Response type OR the Error type
  const result = await handleApi(
    apiClient.put<ApiResponse<"/api/employees/{emp_id}", "put">>(
      EMPLOYEE_ENDPOINTS.update(id),
      data
    )
  ) as ApiResponse<"/api/employees/{emp_id}", "put"> | { detail: any[] };

  // 2. Now TS allows this check because 'detail' exists on one side of the Union
  if (result && typeof result === 'object' && 'detail' in result) {
    throw result;
  }

  return result;
}
};