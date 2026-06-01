import { useQuery } from "@tanstack/react-query";
import { rolesApi } from "./roles.api";

export const roleKeys = {
  all: ["lims", "roles"] as const,
  list: () => [...roleKeys.all, "list"] as const,
};

export function useRoles() {
  return useQuery({
    queryKey: roleKeys.list(),
    queryFn: rolesApi.list,
    staleTime: 5 * 60 * 1000,
  });
}
