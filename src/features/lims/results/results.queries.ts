import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resultsApi, type ResultEnter, type ResultReject, type ListResultsParams } from "./results.api";

export const resultKeys = {
  all: ["lims", "results"] as const,
  list: (params?: ListResultsParams) => [...resultKeys.all, "list", params] as const,
  detail: (id: number) => [...resultKeys.all, "detail", id] as const,
};

export function useResults(params?: ListResultsParams) {
  return useQuery({
    queryKey: resultKeys.list(params),
    queryFn: () => resultsApi.list(params),
  });
}

export function useResult(id: number) {
  return useQuery({
    queryKey: resultKeys.detail(id),
    queryFn: () => resultsApi.get(id),
    enabled: !!id,
  });
}

export function useEnterResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ResultEnter }) => resultsApi.enter(id, data),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: resultKeys.detail(id) }),
  });
}

export function useValidateResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => resultsApi.validate(id),
    onSuccess: (_, id) => qc.invalidateQueries({ queryKey: resultKeys.detail(id) }),
  });
}

export function useApproveResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => resultsApi.approve(id),
    onSuccess: (_, id) => qc.invalidateQueries({ queryKey: resultKeys.detail(id) }),
  });
}

export function useRejectResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ResultReject }) => resultsApi.reject(id, data),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: resultKeys.detail(id) }),
  });
}
