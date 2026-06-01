// equipment-dashboard.service.ts
import apiClient from "@/lib/api-client";
import { handleApi } from "@/lib/handle-api";
import { DASHBOARD_ENDPOINTS } from "./equipment-dashboard.types";
import type { Schema } from "@/types/api-types";

type EquipmentStats = Schema["EquipmentStats"];
// CHANGE THIS: UpcomingActivity is gone, we use ServiceTaskResponse now
type ServiceTaskResponse = Schema["ServiceTaskResponse"]; 

export const dashboardService = {
  async getStats(): Promise<EquipmentStats> {
    const result = await handleApi(apiClient.get<EquipmentStats>(DASHBOARD_ENDPOINTS.stats));
    if (result && typeof result === 'object' && 'detail' in result) throw result;
    return result as EquipmentStats;
  },

  async getActivities(days: number = 30, overdueOnly: boolean = false): Promise<ServiceTaskResponse[]> {
    const result = await handleApi(
      apiClient.get<ServiceTaskResponse[]>(
        DASHBOARD_ENDPOINTS.activities(days, overdueOnly)
      )
    );
    if (result && typeof result === 'object' && 'detail' in result) throw result;
    return (result as ServiceTaskResponse[]) || [];
  }
};