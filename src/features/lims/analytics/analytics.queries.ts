import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "./analytics.api";

const STALE = 5 * 60 * 1000; // 5 min

export function useOverview() {
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => analyticsApi.getOverview(),
    staleTime: STALE,
    refetchInterval: STALE,
  });
}

export function useThroughput(days = 30) {
  return useQuery({
    queryKey: ["analytics", "throughput", days],
    queryFn: () => analyticsApi.getThroughput(days),
    staleTime: STALE,
  });
}

export function useTAT(days = 30) {
  return useQuery({
    queryKey: ["analytics", "tat", days],
    queryFn: () => analyticsApi.getTAT(days),
    staleTime: STALE,
  });
}

export function useEquipment() {
  return useQuery({
    queryKey: ["analytics", "equipment"],
    queryFn: () => analyticsApi.getEquipment(),
    staleTime: STALE,
  });
}

export function useQCAnalytics(days = 30) {
  return useQuery({
    queryKey: ["analytics", "qc", days],
    queryFn: () => analyticsApi.getQC(days),
    staleTime: STALE,
  });
}
