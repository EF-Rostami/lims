/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { actionService } from "./action-items.service";
import { toast } from "sonner";
import { useAuditedMutation } from "@/features/audit/hooks/useAuditedMutation";
import { ActionItemUpdate, ActionItemVerification } from "./action-items.types";

export const actionKeys = {
  all: ["action-items"] as const,
  list: (params?: any) => [...actionKeys.all, "list", params] as const,
};

export function useActionItems(params?: { nc_id?: number; status?: string }) {
  return useQuery({
    queryKey: actionKeys.list(params),
    queryFn: () => actionService.getActions(params),
  });
}

export function useCompleteAction() {
  const queryClient = useQueryClient();
  const { auditedRequest } = useAuditedMutation();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ActionItemUpdate }) => {
      return await auditedRequest(async (reason) => {
        return await actionService.completeAction(id, data, reason);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: actionKeys.all });
      toast.success("Action marked as completed. Pending verification.");
    },
    onError: (err: any) => toast.error(err.detail || "Completion failed"),
  });
}

// export function useVerifyAction() {
//   const queryClient = useQueryClient();
//   const { auditedRequest } = useAuditedMutation();

//   return useMutation({
//     mutationFn: async ({ id, data }: { id: number; data: ActionItemVerification }) => {
//       return await auditedRequest(async (reason) => {
//         return await actionService.verifyAction(id, data, reason);
//       });
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: actionKeys.all });
//       toast.success("Action verified and closed.");
//     },
//     onError: (err: any) => toast.error(err.detail || "Verification failed"),
//   });
// }

export function useVerifyAction() {
  const queryClient = useQueryClient();
  const { auditedRequest } = useAuditedMutation();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ActionItemVerification }) => {
      // 1. Pause and get the reason
      return await auditedRequest(async (reason) => {
        // 2. Pass the reason into the service call
        return await actionService.verifyAction(id, data, reason);
      });
    },
    onSuccess: () => {
      // 3. Refresh the UI and the Audit History tab
      queryClient.invalidateQueries({ queryKey: actionKeys.all });
      queryClient.invalidateQueries({ queryKey: ["audit-trail"] }); // Refresh history
      toast.success("Action verified and logged.");
    },
    onError: (err: any) => toast.error(err.message || "Verification failed"),
  });
}