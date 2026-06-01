import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService, ReadinessData } from "./admin.service";
import type { Schema } from "@/types/api-types";

type Permission = Schema["PermissionRead"];
type Role = Schema["RoleRead"];


// type TogglePayload = Schema["MatrixToggleRequest"]
export interface TogglePayload {
  role_id: number;
  permission_id: number;
  action: "connect" | "disconnect";
}

export const adminQueryKeys = {
  readiness: ["admin", "readiness"] as const,
  permissions: ["admin", "permissions"] as const,
  matrix: ["admin", "roles-matrix"] as const,
};

export function useReadiness() {
  return useQuery<ReadinessData>({
    queryKey: adminQueryKeys.readiness, // Now this will work!
    queryFn: adminService.getReadiness,
    refetchOnWindowFocus: true,
    staleTime: 5000, // Consider data fresh for 5 seconds
  });
}

export function usePermissions() {
  return useQuery<Permission[]>({
    queryKey: adminQueryKeys.permissions,
    queryFn: adminService.getPermissions,
  });
}

export function useRolesMatrix() {
  return useQuery<Role[]>({
    queryKey: adminQueryKeys.matrix,
    queryFn: adminService.getRolesMatrix,
  });
}

export function useTogglePermission() {
  const queryClient = useQueryClient();

// We add <Data, Error, Variables> generics to useMutation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useMutation<any, Error, TogglePayload>({
    mutationFn: (payload) => adminService.togglePermission(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.matrix });
    },
  });
}