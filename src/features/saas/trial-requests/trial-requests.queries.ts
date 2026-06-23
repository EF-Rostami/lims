import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trialRequestsApi, type TrialRequestStatus } from "./trial-requests.api";

const keys = {
  all: ["saas", "trial-requests"] as const,
};

export function useTrialRequests() {
  return useQuery({
    queryKey: keys.all,
    queryFn: trialRequestsApi.list,
  });
}

export function useUpdateTrialRequestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TrialRequestStatus }) =>
      trialRequestsApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
