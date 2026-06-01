// @ts-nocheck — pending migration to features/lims/ pattern
import type { ApiResponse, ApiRequest } from "@/lib/api-types";

export const TASK_BASE = "/api/service_tasks" as const;

export const TASK_ENDPOINTS = {
  queue: `${TASK_BASE}/queue`,
  equipment: (equipmentId: number) => `${TASK_BASE}/equipment/${equipmentId}`,
  detail: (id: number) => `${TASK_BASE}/${id}`,
  // Add the fulfillment endpoint
  fulfill: `${TASK_BASE}/tasks/fulfill`,
} as const;

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ServiceTask = Extract<ApiResponse<"/api/service_tasks/queue", "get">, any[]>[number];

// Extract the Payload type directly from your OpenAPI Schema
export type TaskFulfillmentPayload = ApiRequest<"/api/service_tasks/tasks/fulfill", "post">;

/**
 * Technical data interfaces for your 3 specific forms
 * These match the 'data' dictionary in your Python schema
 */
export interface CalibrationData {
  standard_used: string;
  uncertainty?: string;
  results: string;
  status: 'passed' | 'failed';
}

export interface MaintenanceData {
  work_done: string;
  parts?: string;
  maint_type: 'preventive' | 'corrective';
}

export interface CheckData {
  functional_pass: boolean;
  status: 'passed' | 'failed';
}