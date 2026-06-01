import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { positionsApi, type PositionCreate, type PositionUpdate } from "./positions.api";

export const positionKeys = {
  all: ["lims", "positions"] as const,
  list: () => [...positionKeys.all, "list"] as const,
  hierarchy: () => [...positionKeys.all, "hierarchy"] as const,
  detail: (id: number) => [...positionKeys.all, "detail", id] as const,
};

export function usePositions() {
  return useQuery({ queryKey: positionKeys.list(), queryFn: positionsApi.list });
}

export function usePositionHierarchy() {
  return useQuery({ queryKey: positionKeys.hierarchy(), queryFn: positionsApi.hierarchy });
}

export function usePosition(id: number) {
  return useQuery({
    queryKey: positionKeys.detail(id),
    queryFn: () => positionsApi.get(id),
    enabled: !!id,
  });
}

export function useCreatePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PositionCreate) => positionsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: positionKeys.all }),
  });
}

export function useUpdatePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PositionUpdate }) =>
      positionsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: positionKeys.all }),
  });
}

export function useDeletePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => positionsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: positionKeys.all }),
  });
}
