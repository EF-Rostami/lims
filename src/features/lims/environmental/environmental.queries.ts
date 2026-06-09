import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  environmentalApi,
  ParameterCreate,
  ParameterUpdate,
  ReadingCreate,
  ReadingStatus,
  SnapshotCreate,
  ThresholdCreate,
  ThresholdUpdate,
} from "./environmental.api";

const KEYS = {
  parameters: ["environmental", "parameters"] as const,
  readings: (params?: object) => ["environmental", "readings", params] as const,
  thresholds: (parameterId?: number) => ["environmental", "thresholds", parameterId] as const,
  snapshots: ["environmental", "snapshots"] as const,
  snapshot: (id: number) => ["environmental", "snapshot", id] as const,
  check: (methodId?: number) => ["environmental", "check", methodId] as const,
};

// ── Parameters ────────────────────────────────────────────────────────────────

export function useParameters(active_only = true) {
  return useQuery({
    queryKey: [...KEYS.parameters, active_only],
    queryFn: () => environmentalApi.listParameters(active_only),
  });
}

export function useCreateParameter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ParameterCreate) => environmentalApi.createParameter(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.parameters }),
  });
}

export function useUpdateParameter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ParameterUpdate }) =>
      environmentalApi.updateParameter(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.parameters }),
  });
}

export function useDeleteParameter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => environmentalApi.deleteParameter(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.parameters }),
  });
}

// ── Readings ──────────────────────────────────────────────────────────────────

export function useReadings(params?: {
  parameter_id?: number;
  reading_status?: ReadingStatus;
  limit?: number;
}) {
  return useQuery({
    queryKey: KEYS.readings(params),
    queryFn: () => environmentalApi.listReadings(params),
  });
}

export function useLogReading() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReadingCreate) => environmentalApi.logReading(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.parameters });
      qc.invalidateQueries({ queryKey: ["environmental", "readings"] });
      qc.invalidateQueries({ queryKey: ["environmental", "check"] });
    },
  });
}

// ── Thresholds ────────────────────────────────────────────────────────────────

export function useThresholds(parameter_id?: number) {
  return useQuery({
    queryKey: KEYS.thresholds(parameter_id),
    queryFn: () => environmentalApi.listThresholds(parameter_id),
  });
}

export function useCreateThreshold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ThresholdCreate) => environmentalApi.createThreshold(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["environmental", "thresholds"] }),
  });
}

export function useUpdateThreshold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ThresholdUpdate }) =>
      environmentalApi.updateThreshold(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["environmental", "thresholds"] }),
  });
}

export function useDeleteThreshold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => environmentalApi.deleteThreshold(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["environmental", "thresholds"] }),
  });
}

// ── Snapshots ─────────────────────────────────────────────────────────────────

export function useSnapshots(limit = 100) {
  return useQuery({
    queryKey: [...KEYS.snapshots, limit],
    queryFn: () => environmentalApi.listSnapshots(limit),
  });
}

export function useSnapshot(id: number) {
  return useQuery({
    queryKey: KEYS.snapshot(id),
    queryFn: () => environmentalApi.getSnapshot(id),
    enabled: !!id,
  });
}

export function useTakeSnapshot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SnapshotCreate) => environmentalApi.takeSnapshot(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.snapshots }),
  });
}

// ── Condition check ───────────────────────────────────────────────────────────

export function useConditionCheck(method_id?: number) {
  return useQuery({
    queryKey: KEYS.check(method_id),
    queryFn: () => environmentalApi.checkConditions(method_id),
    refetchInterval: 2 * 60 * 1000,
  });
}
