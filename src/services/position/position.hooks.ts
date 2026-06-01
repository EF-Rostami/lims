import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { positionService } from "./position.service";
import type { Schema } from "@/types/api-types";

type PositionResponse = Schema["PositionResponse"];
type PositionCreate = Schema["PositionCreate"];

export const positionQueryKeys = {
  all: ["positions"] as const,
  detail: (id: number) => ["positions", id] as const,
};

export function useListPositions() {
  return useQuery<PositionResponse[]>({
    queryKey: positionQueryKeys.all,
    queryFn: positionService.getPositions,
  });
}

export function useGetPosition(id: number) {
  return useQuery<PositionResponse>({
    queryKey: positionQueryKeys.detail(id),
    queryFn: () => positionService.getPosition(id),
    enabled: !!id,
  });
}

export function useCreatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PositionCreate) =>
      positionService.createPosition(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: positionQueryKeys.all,
      });
    },
  });
}

export function useUpdatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: PositionCreate;
    }) => positionService.updatePosition(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: positionQueryKeys.all,
      });
      queryClient.invalidateQueries({ queryKey: ["orgChart"] }); // Keep the tree in sync
    },
  });
}

export function useDeletePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      positionService.deletePosition(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: positionQueryKeys.all,
      });
    },
  });
}