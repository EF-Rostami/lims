import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  rmApi,
  BatchStatus,
  RMBatchCreate, RMBatchUpdate,
  RMMethodApprovalCreate,
  RMUsageCreate,
  ReferenceMaterialCreate, ReferenceMaterialUpdate,
} from "./rm.api";

const KEYS = {
  materials: (active_only?: boolean) => ["rm", "materials", active_only] as const,
  batches: (params?: object) => ["rm", "batches", params] as const,
  batchUsage: (batchId: number) => ["rm", "batch-usage", batchId] as const,
  usage: (params?: object) => ["rm", "usage", params] as const,
  approvals: (params?: object) => ["rm", "approvals", params] as const,
  alerts: ["rm", "alerts"] as const,
};

// ── Materials ─────────────────────────────────────────────────────────────────

export function useMaterials(active_only = true) {
  return useQuery({
    queryKey: KEYS.materials(active_only),
    queryFn: () => rmApi.listMaterials(active_only),
  });
}

export function useCreateMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReferenceMaterialCreate) => rmApi.createMaterial(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rm", "materials"] }),
  });
}

export function useUpdateMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReferenceMaterialUpdate }) =>
      rmApi.updateMaterial(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rm", "materials"] }),
  });
}

export function useDeleteMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rmApi.deleteMaterial(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rm", "materials"] }),
  });
}

// ── Batches ───────────────────────────────────────────────────────────────────

export function useBatches(params?: { rm_id?: number; batch_status?: BatchStatus }) {
  return useQuery({
    queryKey: KEYS.batches(params),
    queryFn: () => rmApi.listBatches(params),
  });
}

export function useCreateBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RMBatchCreate) => rmApi.createBatch(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rm", "batches"] });
      qc.invalidateQueries({ queryKey: ["rm", "materials"] });
      qc.invalidateQueries({ queryKey: KEYS.alerts });
    },
  });
}

export function useUpdateBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RMBatchUpdate }) =>
      rmApi.updateBatch(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rm", "batches"] }),
  });
}

export function useDeleteBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rmApi.deleteBatch(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rm", "batches"] });
      qc.invalidateQueries({ queryKey: ["rm", "materials"] });
    },
  });
}

// ── Usage ─────────────────────────────────────────────────────────────────────

export function useBatchUsage(batchId: number) {
  return useQuery({
    queryKey: KEYS.batchUsage(batchId),
    queryFn: () => rmApi.listBatchUsage(batchId),
    enabled: !!batchId,
  });
}

export function useUsage(params?: { result_id?: number; batch_id?: number }) {
  return useQuery({
    queryKey: KEYS.usage(params),
    queryFn: () => rmApi.listUsage(params),
  });
}

export function useRecordUsage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, data }: { batchId: number; data: RMUsageCreate }) =>
      rmApi.recordUsage(batchId, data),
    onSuccess: (_, { batchId }) => {
      qc.invalidateQueries({ queryKey: ["rm", "batches"] });
      qc.invalidateQueries({ queryKey: KEYS.batchUsage(batchId) });
      qc.invalidateQueries({ queryKey: ["rm", "usage"] });
    },
  });
}

// ── Method Approvals ──────────────────────────────────────────────────────────

export function useApprovals(params?: { method_id?: number; rm_id?: number }) {
  return useQuery({
    queryKey: KEYS.approvals(params),
    queryFn: () => rmApi.listApprovals(params),
  });
}

export function useCreateApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RMMethodApprovalCreate) => rmApi.createApproval(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rm", "approvals"] }),
  });
}

export function useDeleteApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rmApi.deleteApproval(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rm", "approvals"] }),
  });
}

// ── Alerts ────────────────────────────────────────────────────────────────────

export function useRMAlerts() {
  return useQuery({
    queryKey: KEYS.alerts,
    queryFn: () => rmApi.getAlerts(),
    refetchInterval: 5 * 60 * 1000,
  });
}
