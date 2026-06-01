import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentsApi, type DepartmentCreate, type DepartmentUpdate } from "./departments.api";

export const departmentKeys = {
  all: ["lims", "departments"] as const,
  list: () => [...departmentKeys.all, "list"] as const,
  tree: () => [...departmentKeys.all, "tree"] as const,
  detail: (id: number) => [...departmentKeys.all, "detail", id] as const,
};

export function useDepartments() {
  return useQuery({ queryKey: departmentKeys.list(), queryFn: departmentsApi.list });
}

export function useDepartmentTree() {
  return useQuery({ queryKey: departmentKeys.tree(), queryFn: departmentsApi.tree });
}

export function useDepartment(id: number) {
  return useQuery({
    queryKey: departmentKeys.detail(id),
    queryFn: () => departmentsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DepartmentCreate) => departmentsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: departmentKeys.all }),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DepartmentUpdate }) =>
      departmentsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: departmentKeys.all }),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => departmentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: departmentKeys.all }),
  });
}
