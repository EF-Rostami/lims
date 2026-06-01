/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ncService } from "./non-conformities.service";
import { useAuditedMutation } from "../../audit/hooks/useAuditedMutation";
import { toast } from "sonner";
import type { NonConformity, NonConformityUpdate } from "./non-conformities.types";

export const ncQueryKeys = {
  all: ["non-conformities"] as const,
  lists: () => [...ncQueryKeys.all, "list"] as const,
  detail: (id: number) => [...ncQueryKeys.all, "detail", id] as const,
};

export function useNonConformities(params?: { status?: string }) {
  return useQuery<NonConformity[]>({
    queryKey: [...ncQueryKeys.lists(), params],
    queryFn: () => ncService.getNonConformities(params),
  });
}

export function useNonConformity(id: number | null) {
  return useQuery<NonConformity>({
    queryKey: ncQueryKeys.detail(id!),
    queryFn: () => ncService.getNCById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // Optional: 5 min stale time
  });
}


export function useCreateNC() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ncService.createNC,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ncQueryKeys.all });
      toast.success("Non-conformity registered successfully");
    },
    onError: (error: any) => {
      toast.error(error?.detail || "Failed to register non-conformity");
    }
  });
}

export function useUpdateNC() {
  const queryClient = useQueryClient();
  const { auditedRequest } = useAuditedMutation();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: NonConformityUpdate }) => {
      // Force RFC Modal before proceeding
      return await auditedRequest(async (reason) => {
        return await ncService.updateNC(id, data, reason);
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ncQueryKeys.all });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ncQueryKeys.detail(data.id) });
      }
      toast.success("NC updated and change logged");
    },
  });
}