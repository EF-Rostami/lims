import { useQuery } from "@tanstack/react-query";
import { labsOverviewApi } from "./labs-overview.api";

export const labsOverviewKeys = {
  health: ["consultant", "my-labs", "health"] as const,
  projects: ["consultant", "my-labs", "projects"] as const,
};

export function useMyLabsHealth() {
  return useQuery({
    queryKey: labsOverviewKeys.health,
    queryFn: labsOverviewApi.getMyLabsHealth,
  });
}

export function useMyLabsProjects() {
  return useQuery({
    queryKey: labsOverviewKeys.projects,
    queryFn: labsOverviewApi.getMyLabsProjects,
  });
}
