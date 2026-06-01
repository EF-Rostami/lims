/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskService } from "./task-service.service";
import { ServiceTask, TaskFulfillmentPayload } from "./task-service.types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const taskQueryKeys = {
  all: ["service_tasks"] as const,
  queue: (params: any) => [...taskQueryKeys.all, "queue", params] as const,
  equipment: (equipmentId: number) => [...taskQueryKeys.all, "equipment", equipmentId] as const,
  detail: (id: number) => [...taskQueryKeys.all, "detail", id] as const,
};

/**
 * Hook for the main Work Queue Dashboard
 */
export function useTaskQueue(params?: { status?: string; equipment_id?: number }) {
  return useQuery<ServiceTask[]>({
    queryKey: taskQueryKeys.queue(params),
    queryFn: () => taskService.getTaskQueue(params),
  });
}

/**
 * Hook for the Equipment "Timeline" or "Task History" tab
 */
export function useEquipmentTasks(equipmentId: number) {
  return useQuery<ServiceTask[]>({
    queryKey: taskQueryKeys.equipment(equipmentId),
    queryFn: () => taskService.getEquipmentTasks(equipmentId),
    enabled: !!equipmentId,
  });
}

/**
 * Manual Refresh Hook (to be used after calibration/maintenance success)
 */
export function useInvalidateTasks() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
  };
}

/**
 * Mutation hook to fulfill a task
 * Handles invalidation, notifications, and redirection
 */
export function useFulfillTask() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: TaskFulfillmentPayload) => taskService.fulfillTask(payload),
    onSuccess: (data: any) => {
      // Refresh all task-related lists
      queryClient.invalidateQueries({ queryKey: ["service_tasks"] });
      queryClient.invalidateQueries({ queryKey: ["equipment"] });

      if (data.is_failure) {
        toast.warning(`Record Saved. Equipment OOS. NC: ${data.nc_number}`);
      } else {
        toast.success("Task completed successfully.");
      }

      // Redirect back to the dashboard
      router.push("/equipment.dashboard");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit record");
    }
  });
}