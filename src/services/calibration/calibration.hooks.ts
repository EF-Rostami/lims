
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { calibrationService } from "./calibration.service";
import { equipmentQueryKeys } from "../equipment/equipment.hooks"; // Import equipment keys
import { dashboardQueryKeys } from "../equipment-dashboard/equipment-dashboard.hooks";
import { taskQueryKeys } from "../task-service/task-service.hooks"; // New import

import type { Schema } from "@/types/api-types";
import { toast } from "sonner";

type Calibration = Schema["Calibration"];
type CalibrationCreate = Schema["CalibrationCreate"];

export const calibrationQueryKeys = {
  all: ["calibrations"] as const,
  history: (equipmentId: number) => [...calibrationQueryKeys.all, "history", equipmentId] as const,
  detail: (id: number) => [...calibrationQueryKeys.all, "detail", id] as const,
};

export function useCalibrations(params?: { equipment_id?: number; status_filter?: string }) {
  return useQuery<Calibration[]>({
    queryKey: [...calibrationQueryKeys.all, params],
    queryFn: () => calibrationService.getCalibrations(params),
  });
}

export function useEquipmentCalibrationHistory(equipmentId: number) {
  return useQuery<Calibration[]>({
    queryKey: calibrationQueryKeys.history(equipmentId),
    queryFn: () => calibrationService.getEquipmentHistory(equipmentId),
    enabled: !!equipmentId,
  });
}

export function useCreateCalibration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CalibrationCreate) => calibrationService.createCalibration(data),
    onSuccess: (newCal: any) => {
      // 1. Invalidate ALL calibration related data
      queryClient.invalidateQueries({ queryKey: calibrationQueryKeys.all });
      
      // 2. Refresh the Service Task Queue (CRITICAL: Removes the item from "Planned")
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });

      // 3. Refresh specific equipment detail
      if (newCal?.equipment_id) {
        queryClient.invalidateQueries({ 
          queryKey: equipmentQueryKeys.detail(newCal.equipment_id) 
        });
        // Also refresh the specific task history for this asset
        queryClient.invalidateQueries({ 
          queryKey: taskQueryKeys.equipment(newCal.equipment_id) 
        });
      }

      // 4. Invalidate global lists
      queryClient.invalidateQueries({ queryKey: ["equipment"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["equipment-dashboard"] });

      toast.success("Record saved. Awaiting supervisor verification.");
    },
    onError: (error: any) => {
      console.error("Calibration Error:", error);
      toast.error(error?.detail || "Failed to record calibration");
    }
  });
}

/**
 * Hook: Supervisor verification (The 'Locking' action)
 */
export function useVerifyCalibration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => calibrationService.verifyCalibration(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: calibrationQueryKeys.all });
      
      // Refresh Task Engine state (in case verification triggers next task logic)
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });

      if (data?.equipment_id) {
        queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.detail(data.equipment_id) });
      }
      
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all });

      toast.success("Record verified and locked. Equipment status restored.");
    },
    onError: (error: any) => {
      toast.error(error?.detail || "Verification failed");
    }
  });
}

export function useUpdateCalibration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: CalibrationCreate;
    }) => calibrationService.updateCalibration(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: calibrationQueryKeys.all,
      });
    },
  });
}

export function useDeleteCalibration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      calibrationService.deleteCalibration(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: calibrationQueryKeys.all,
      });
    },
  });
}