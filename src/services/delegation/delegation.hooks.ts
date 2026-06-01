import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { delegationService } from "./delegation.service";
import type { Schema } from "@/types/api-types";

// Ensure these types in your api-types include:
// permission_ids: number[]
// position_id: number
type DelegationResponse = Schema["DelegationResponse"];
type DelegationCreate = Schema["DelegationCreate"];

export const delegationQueryKeys = {
  all: ["delegations"] as const,
  active: ["delegations", "active"] as const,
  user: (id: number) => ["delegations", "user", id] as const,
};

export function useListDelegations() {
  return useQuery<DelegationResponse[]>({
    queryKey: delegationQueryKeys.all,
    queryFn: delegationService.getDelegations,
  });
}

export function useActiveDelegations() {
  return useQuery<DelegationResponse[]>({
    queryKey: delegationQueryKeys.active,
    queryFn: delegationService.getActiveDelegations,
    // Refetch active delegations periodically (every 5 mins) since they are time-dependent
    staleTime: 1000 * 60 * 5, 
  });
}

export function useCreateDelegation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DelegationCreate) =>
      delegationService.createDelegation(data),
    onSuccess: () => {
      // Invalidate everything to ensure lists and alerts update
      queryClient.invalidateQueries({ queryKey: delegationQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: delegationQueryKeys.active });
    },
  });
}


export function useUpdateDelegation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DelegationCreate }) =>
      delegationService.updateDelegation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: delegationQueryKeys.all });
    },
  });
}

export function useRevokeDelegation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => delegationService.revokeDelegation(id),
    onSuccess: () => {
      // Vital: When authority is revoked, the Alert component must disappear immediately
      queryClient.invalidateQueries({ queryKey: delegationQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: delegationQueryKeys.active });
    },
  });
}