import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  qcApi,
  QCMaterialCreate, QCMaterialUpdate,
  QCRunCreate, QCRunStatus,
} from "./qc.api";

const KEYS = {
  materials: (p?: object) => ["qc", "materials", p] as const,
  runs: (p?: object) => ["qc", "runs", p] as const,
  run: (id: number) => ["qc", "run", id] as const,
  chart: (id: number, n: number) => ["qc", "chart", id, n] as const,
  alerts: (p?: object) => ["qc", "alerts", p] as const,
  check: (methodId: number) => ["qc", "check", methodId] as const,
};

// ── Materials ─────────────────────────────────────────────────────────────────

export function useQCMaterials(params?: { method_id?: number; active_only?: boolean }) {
  return useQuery({
    queryKey: KEYS.materials(params),
    queryFn: () => qcApi.listMaterials(params),
  });
}

export function useCreateQCMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: QCMaterialCreate) => qcApi.createMaterial(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["qc", "materials"] }),
  });
}

export function useUpdateQCMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: QCMaterialUpdate }) =>
      qcApi.updateMaterial(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["qc", "materials"] }),
  });
}

export function useDeleteQCMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => qcApi.deleteMaterial(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["qc", "materials"] }),
  });
}

// ── Runs ──────────────────────────────────────────────────────────────────────

export function useQCRuns(params?: { method_id?: number; run_status?: QCRunStatus; limit?: number }) {
  return useQuery({
    queryKey: KEYS.runs(params),
    queryFn: () => qcApi.listRuns(params),
  });
}

export function useSubmitQCRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: QCRunCreate) => qcApi.submitRun(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["qc", "runs"] });
      qc.invalidateQueries({ queryKey: ["qc", "alerts"] });
    },
  });
}

export function useOverrideQCRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, justification }: { id: number; justification: string }) =>
      qcApi.overrideRun(id, justification),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["qc", "runs"] });
      qc.invalidateQueries({ queryKey: ["qc", "alerts"] });
    },
  });
}

export function useDeleteQCRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => qcApi.deleteRun(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["qc", "runs"] }),
  });
}

// ── Chart ─────────────────────────────────────────────────────────────────────

export function useLJChart(materialId: number | null, lastN = 30) {
  return useQuery({
    queryKey: KEYS.chart(materialId!, lastN),
    queryFn: () => qcApi.getChart(materialId!, lastN),
    enabled: materialId != null,
  });
}

// ── Alerts ────────────────────────────────────────────────────────────────────

export function useQCAlerts(params?: { method_id?: number; unresolved_only?: boolean }) {
  return useQuery({
    queryKey: KEYS.alerts(params),
    queryFn: () => qcApi.listAlerts(params),
    refetchInterval: 2 * 60 * 1000,
  });
}

export function useResolveQCAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) =>
      qcApi.resolveAlert(id, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["qc", "alerts"] }),
  });
}

// ── Status check ──────────────────────────────────────────────────────────────

export function useQCStatusCheck(methodId: number | null) {
  return useQuery({
    queryKey: KEYS.check(methodId!),
    queryFn: () => qcApi.checkStatus(methodId!),
    enabled: methodId != null,
  });
}
