
import { useQuery } from "@tanstack/react-query";
import { orgChartService } from "./orgChart.service";
import type { OrgChartResponse } from "./orgChart.types";

export const orgChartQueryKeys = {
  all: ["orgChart"] as const,
};

/**
 * Hook to fetch the full organization chart tree
 */
export function useOrgChart() {
  return useQuery<OrgChartResponse>({
    queryKey: orgChartQueryKeys.all,
    queryFn: orgChartService.getOrgChart,
  });
}