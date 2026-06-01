// equipment-dashboard.hooks.ts
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "./equipment-dashboard.service";
import type { Schema } from "@/types/api-types";

type EquipmentStats = Schema["EquipmentStats"];
type ServiceTaskResponse = Schema["ServiceTaskResponse"];

export const dashboardQueryKeys = {
  all: ["equipment-dashboard"] as const,
  stats: () => [...dashboardQueryKeys.all, "stats"] as const,
  activities: (days: number, overdueOnly: boolean) => 
    [...dashboardQueryKeys.all, "activities", { days, overdueOnly }] as const,
};

export function useEquipmentStats() {
  return useQuery<EquipmentStats>({
    queryKey: dashboardQueryKeys.stats(),
    queryFn: dashboardService.getStats,
    staleTime: 1000 * 60 * 5, 
  });
}

/**
 * Hook for upcoming work (default 30 days)
 */
export function useUpcomingActivities(days: number = 30) {
  return useQuery<ServiceTaskResponse[]>({
    queryKey: dashboardQueryKeys.activities(days, false),
    queryFn: () => dashboardService.getActivities(days, false),
  });
}

/**
 * Hook for overdue work
 */
export function useOverdueActivities() {
  return useQuery<ServiceTaskResponse[]>({
    queryKey: dashboardQueryKeys.activities(0, true), // days doesn't matter much for overdue
    queryFn: () => dashboardService.getActivities(0, true),
    refetchOnWindowFocus: true,
    // Highlight overdue items with a faster stale time
    staleTime: 1000 * 30, 
  });
}