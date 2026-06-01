/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { intermediateCheckService } from "./intermediate-check.service";
import { equipmentQueryKeys } from "../equipment/equipment.hooks";

import type { Schema } from "@/types/api-types";
import { toast } from "sonner";
import { dashboardQueryKeys } from "../equipment-dashboard/equipment-dashboard.hooks";

type IntermediateCheck = Schema["IntermediateCheck"];
type IntermediateCheckUpdate = Schema["IntermediateCheckUpdate"];

export const checkQueryKeys = {
  all: ["intermediate-checks"] as const,
  history: (equipmentId: number) => [...checkQueryKeys.all, "history", equipmentId] as const,
  detail: (id: number) => [...checkQueryKeys.all, "detail", id] as const,
};

export function useIntermediateChecks(params?: { equipment_id?: number; status_filter?: string }) {
  return useQuery<IntermediateCheck[]>({
    queryKey: [...checkQueryKeys.all, params],
    queryFn: () => intermediateCheckService.getChecks(params),
  });
}

export function useEquipmentCheckHistory(equipmentId: number) {
  return useQuery<IntermediateCheck[]>({
    queryKey: checkQueryKeys.history(equipmentId),
    queryFn: () => intermediateCheckService.getEquipmentHistory(equipmentId),
    enabled: !!equipmentId,
  });
}

export function useCreateIntermediateCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: intermediateCheckService.createCheck,
    onSuccess: () => {
      // Refresh related data
      queryClient.invalidateQueries({ queryKey: checkQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all });
      
      toast.success("Intermediate check recorded successfully");
    },
    onError: (error: any) => {
      toast.error(error?.detail || "Failed to record check");
    }
  });
}

export function useUpdateIntermediateCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: IntermediateCheckUpdate }) => {
      return await intermediateCheckService.updateCheck(id, data);
    },
    onSuccess: (updatedData: any) => {
      queryClient.invalidateQueries({ queryKey: checkQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.all });
      
      if (updatedData?.id) {
        queryClient.setQueryData(checkQueryKeys.detail(updatedData.id), updatedData);
      }
      toast.success("Intermediate check updated");
    },
  });
}



export function useDeleteIntermediateCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      intermediateCheckService.deleteCheck(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: checkQueryKeys.all,
      });
    },
  });
}