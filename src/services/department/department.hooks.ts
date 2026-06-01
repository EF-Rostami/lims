import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentService } from "./department.service";

import type { Schema } from "@/types/api-types";

type DepartmentResponse = Schema["DepartmentResponse"];
type DepartmentCreate = Schema["DepartmentCreate"];

export const departmentQueryKeys = {
  all: ["departments"] as const,
};

export function useListDepartments() {
  return useQuery<DepartmentResponse[]>({
    queryKey: departmentQueryKeys.all,
    queryFn: departmentService.getDepartments,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DepartmentCreate) =>
      departmentService.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: departmentQueryKeys.all,
      });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: DepartmentCreate;
    }) => departmentService.updateDepartment(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: departmentQueryKeys.all,
      });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      departmentService.deleteDepartment(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: departmentQueryKeys.all,
      });
    },
  });
}