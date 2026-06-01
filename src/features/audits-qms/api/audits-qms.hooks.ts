/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auditService } from "./audits-qms.service";

import { toast } from "sonner";
import type { Audit, AuditFindingCreate } from "./audits-qms.types";
import { useAuditedMutation } from "@/features/audit/hooks/useAuditedMutation";

export const auditKeys = {
  all: ["audits"] as const,
  lists: () => [...auditKeys.all, "list"] as const,
  detail: (id: number) => [...auditKeys.all, "detail", id] as const,
  findings: (id: number) => [...auditKeys.detail(id), "findings"] as const,
};

export function useAudits(params?: { audit_type?: string }) {
  return useQuery<Audit[]>({
    queryKey: [...auditKeys.lists(), params],
    queryFn: () => auditService.getAudits(params),
  });
}

export function useAudit(id: number) {
  return useQuery<Audit>({
    queryKey: auditKeys.detail(id),
    queryFn: () => auditService.getAuditById(id),
    enabled: !!id,
  });
}

export function useAuditFindings(auditId: number) {
  return useQuery({
    queryKey: auditKeys.findings(auditId),
    queryFn: () => auditService.getFindings(auditId),
    enabled: !!auditId,
  });
}

export function useUpdateAudit() {
  const queryClient = useQueryClient();
  const { auditedRequest } = useAuditedMutation();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await auditedRequest(async (reason) => {
        return await auditService.updateAudit(id, data, reason);
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
      toast.success("Audit updated successfully");
    },
  });
}

export function useCreateFinding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ auditId, data }: { auditId: number; data: AuditFindingCreate }) => 
      auditService.createFinding(auditId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.findings(variables.auditId) });
      toast.success("Finding recorded");
    },
    onError: (err: any) => toast.error(err.detail || "Failed to add finding"),
  });
}