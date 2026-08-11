import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { complianceApi } from "./compliance.api";

export const complianceKeys = {
  all: ["lims", "compliance"] as const,
  health: () => [...complianceKeys.all, "health"] as const,
  results: () => [...complianceKeys.all, "results"] as const,
  history: (days: number) => [...complianceKeys.all, "history", days] as const,
};

export function useComplianceHealth() {
  return useQuery({
    queryKey: complianceKeys.health(),
    queryFn: () => complianceApi.getHealth(),
  });
}

export function useComplianceResults() {
  return useQuery({
    queryKey: complianceKeys.results(),
    queryFn: () => complianceApi.getResults(),
  });
}

export function useComplianceHistory(days = 90) {
  return useQuery({
    queryKey: complianceKeys.history(days),
    queryFn: () => complianceApi.getHistory(days),
  });
}

export function useRunCompliance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => complianceApi.runNow(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: complianceKeys.all });
    },
  });
}
