/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { equipmentService } from "./equipment.service";
import type { Schema } from "@/types/api-types";
import { toast } from "sonner";

type Equipment = Schema["Equipment"];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type EquipmentCreate = Schema["EquipmentCreate"];
type EquipmentUpdate = Schema["EquipmentUpdate"];



export const equipmentQueryKeys = {
  all: ["equipment"] as const,
  details: () => [...equipmentQueryKeys.all, "detail"] as const,
  detail: (id: number) => [...equipmentQueryKeys.details(), id] as const,
  timeline: (id: number) => [...equipmentQueryKeys.detail(id), "timeline"] as const,
};

/**
 * Hook: List all equipment
 */
export function useEquipments(enabled: boolean = true) {
  return useQuery<Equipment[]>({
    queryKey: equipmentQueryKeys.all,
    queryFn: equipmentService.getEquipments,
    enabled: enabled,
  });
}

/**
 * Hook: Get single equipment by ID
 */
export function useEquipment(id: number | null) {
  return useQuery({
    queryKey: equipmentQueryKeys.detail(id!),
    queryFn: () => equipmentService.getEquipment(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // Optional: 5 min stale time
  });
}

/**
 * Hook: Create Equipment
 */
export function useCreateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: equipmentService.createEquipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.all });
      toast.success("Equipment registered successfully");
    },
    onError: (error: any) => {
      toast.error(error?.detail || "Failed to register equipment");
    }
  });
}

/**
 * Hook: Update Equipment
 */
export function useUpdateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: EquipmentUpdate }) => {
      return await equipmentService.updateEquipment(id, data);
    },
    onSuccess: (updatedData: any) => {
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.all });
      
      if (updatedData?.id) {
        queryClient.setQueryData(
          equipmentQueryKeys.detail(updatedData.id), 
          updatedData
        );
      }
      toast.success("Equipment details updated");
    },
  });
}

/**
 * Hook: Soft Delete Equipment
 */
export function useDeleteEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: equipmentService.deleteEquipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.all });
      toast.success("Equipment marked as inactive");
    },
  });
}

/**
 * Hook: Get unified timeline for equipment
 */
export function useEquipmentTimeline(id: number) {
  return useQuery({
    queryKey: equipmentQueryKeys.timeline(id),
    queryFn: () => equipmentService.getTimeline(id),
    enabled: !!id,
  });
}

/**
 * Hook: Log a new Calibration event
 */
export function useLogCalibration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      equipmentService.logCalibration(id, data),
    onSuccess: (_, variables) => {
      // Invalidate both timeline and equipment details
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.detail(variables.id) });
      toast.success("Calibration recorded and pending verification");
    },
    onError: (error: any) => {
      toast.error(error?.detail || "Failed to record calibration");
    }
  });
}

/**
 * Hook: Supervisor Verification (Compliance Lock)
 */
export function useVerifyCalibration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ equipmentId, calibrationId }: { equipmentId: number; calibrationId: number }) =>
      equipmentService.verifyCalibration(equipmentId, calibrationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.detail(variables.equipmentId) });
      toast.success("Calibration verified. Equipment is now Operational.");
    },
  });
}

/**
 * Hook: Add a new Requirement/Plan to existing equipment
 */
export function useAddRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ equipmentId, data }: { equipmentId: number; data: any }) => 
      equipmentService.addRequirement(equipmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.detail(variables.equipmentId) });
      toast.success("New service plan added");
    },
  });
}

/**
 * Hook: Update a specific Requirement (Frequency, Policy, etc.)
 */
export function useUpdateRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requirementId, data }: { requirementId: number; data: any }) => 
      equipmentService.updateRequirement(requirementId, data),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuccess: (_, variables) => {
      // You can pass equipmentId inside 'variables' if your service returns it 
      // or if you include it in the mutation call
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.all });
      toast.success("Plan frequency updated");
    },
  });
}

/**
 * Hook: Soft Delete Equipment Requirement
 */
export function useDeleteRequirement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requirementId: number) => equipmentService.deleteRequirement(requirementId),
    // We remove the unused parameters entirely to satisfy ESLint
    onSuccess: () => {
      // We invalidate all equipment to ensure the list and details are fresh
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.all });
      toast.success("Service plan removed.");
    },
    onError: (error: any) => {
      toast.error(error?.detail || "Failed to remove service plan");
    }
  });
}

