/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { maintenanceService } from "./maintenance.service";
import { equipmentQueryKeys } from "../equipment/equipment.hooks";
import { taskQueryKeys } from "../task-service/task-service.hooks"; // New import
import { dashboardQueryKeys } from "../equipment-dashboard/equipment-dashboard.hooks";

import type { Schema } from "@/types/api-types";
import { toast } from "sonner";

type Maintenance = Schema["Maintenance"];
type MaintenanceUpdate = Schema["MaintenanceUpdate"];

export const maintenanceQueryKeys = {
  all: ["maintenances"] as const,
  history: (equipmentId: number) => [...maintenanceQueryKeys.all, "history", equipmentId] as const,
  detail: (id: number) => [...maintenanceQueryKeys.all, "detail", id] as const,
};

export function useMaintenances(params?: { equipment_id?: number; status_filter?: string; maintenance_type?: string }) {
  return useQuery<Maintenance[]>({
    queryKey: [...maintenanceQueryKeys.all, params],
    queryFn: () => maintenanceService.getMaintenances(params),
  });
}

export function useEquipmentMaintenanceHistory(equipmentId: number) {
  return useQuery<Maintenance[]>({
    queryKey: maintenanceQueryKeys.history(equipmentId),
    queryFn: () => maintenanceService.getEquipmentHistory(equipmentId),
    enabled: !!equipmentId,
  });
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: maintenanceService.createMaintenance,
    onSuccess: (data: any) => {
      // 1. Invalidate Maintenance lists
      queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.all });

      // 2. Refresh the Task Queue (Crucial to clear the 'Planned' task)
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });

      // 3. Refresh Equipment details and specific Task History
      if (data?.equipment_id) {
        queryClient.invalidateQueries({ 
          queryKey: equipmentQueryKeys.detail(data.equipment_id) 
        });
        queryClient.invalidateQueries({ 
          queryKey: taskQueryKeys.equipment(data.equipment_id) 
        });
      }

      // 4. Refresh global equipment and dashboard stats
      queryClient.invalidateQueries({ queryKey: ["equipment"], exact: false });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all });

      toast.success("Maintenance record created");
    },
    onError: (error: any) => {
      toast.error(error?.detail || "Failed to create maintenance record");
    }
  });
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: MaintenanceUpdate }) => {
      return await maintenanceService.updateMaintenance(id, data);
    },
    onSuccess: (updatedData: any) => {
      queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all }); // Refresh tasks on update
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all });
      
      if (updatedData?.id) {
        queryClient.setQueryData(maintenanceQueryKeys.detail(updatedData.id), updatedData);
      }
      toast.success("Maintenance updated successfully");
    },
  });
}

export function useDeleteMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      maintenanceService.deleteMaintenance(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all }); // Refresh queue after deletion
    },
  });
}