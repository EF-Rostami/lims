import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { methodsApi, type TestMethodCreate, type TestMethodUpdate, type ListMethodsParams } from "./methods.api";

export const methodKeys = {
  all: ["lims", "methods"] as const,
  list: (params?: ListMethodsParams) => [...methodKeys.all, "list", params] as const,
  detail: (id: number) => [...methodKeys.all, "detail", id] as const,
};

export function useMethods(params?: ListMethodsParams) {
  return useQuery({
    queryKey: methodKeys.list(params),
    queryFn: () => methodsApi.list(params),
  });
}

export function useMethod(id: number) {
  return useQuery({
    queryKey: methodKeys.detail(id),
    queryFn: () => methodsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TestMethodCreate) => methodsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: methodKeys.all }),
  });
}

export function useUpdateMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TestMethodUpdate }) => methodsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: methodKeys.all }),
  });
}

export function useDeleteMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => methodsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: methodKeys.all }),
  });
}
