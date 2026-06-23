import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi, type TenantUserCreate, type RoleType, type ListUsersParams } from "./users.api";

export const userKeys = {
  all: ["lims", "users"] as const,
  list: (params?: ListUsersParams) => [...userKeys.all, "list", params] as const,
  detail: (id: number) => [...userKeys.all, "detail", id] as const,
};

export function useUsers(params?: ListUsersParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.list(params),
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.get(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TenantUserCreate) => usersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useAssignRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleName }: { userId: number; roleName: RoleType | string }) =>
      usersApi.assignRole(userId, roleName),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: userKeys.detail(userId) });
      qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useRemoveRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleName }: { userId: number; roleName: RoleType | string }) =>
      usersApi.removeRole(userId, roleName),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: userKeys.detail(userId) });
      qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
