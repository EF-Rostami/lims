import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  findingsApi,
  type FindingCreate, type FindingUpdate, type FindingResolve,
  type ListFindingsParams,
} from "./findings.api";

export const findingKeys = {
  all: ["lims", "findings"] as const,
  list: (params?: ListFindingsParams) => [...findingKeys.all, "list", params] as const,
  detail: (id: number) => [...findingKeys.all, "detail", id] as const,
};

export function useFindings(params?: ListFindingsParams) {
  return useQuery({
    queryKey: findingKeys.list(params),
    queryFn: () => findingsApi.list(params),
  });
}

export function useFinding(id: number) {
  return useQuery({
    queryKey: findingKeys.detail(id),
    queryFn: () => findingsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateFinding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FindingCreate) => findingsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: findingKeys.all }),
  });
}

export function useUpdateFinding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FindingUpdate }) => findingsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: findingKeys.all }),
  });
}

export function useResolveFinding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FindingResolve }) => findingsApi.resolve(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: findingKeys.all }),
  });
}
