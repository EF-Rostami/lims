
import apiClient from "@/lib/api-client";
import { handleApi } from "@/lib/handle-api";
import { ServiceTask, TASK_ENDPOINTS, TaskFulfillmentPayload } from "./task-service.types";


export const taskService = {
  /**
   * GET /api/service_tasks/queue
   * Fetches the global list of planned or overdue tasks
   */
  async getTaskQueue(params?: { status?: string; equipment_id?: number }) {
    const result = await handleApi(
      apiClient.get<ServiceTask[]>(TASK_ENDPOINTS.queue, { params })
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  /**
   * GET /api/service_tasks/equipment/{id}
   * Fetches full task history (completed/failed/planned) for a specific asset
   */
  async getEquipmentTasks(equipmentId: number) {
    const result = await handleApi(
      apiClient.get<ServiceTask[]>(TASK_ENDPOINTS.equipment(equipmentId))
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  /**
   * GET /api/service_tasks/{id}
   */
  async getTaskDetail(id: number) {
    const result = await handleApi(
      apiClient.get<ServiceTask>(TASK_ENDPOINTS.detail(id))
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

/**
   * POST /api/service_tasks/tasks/fulfill
   * Submits calibration, maintenance, or check results
   */
  async fulfillTask(payload: TaskFulfillmentPayload) {
    const result = await handleApi(
      apiClient.post(TASK_ENDPOINTS.fulfill, payload)
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  }
};