import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  competenceApi,
  CompetenceStatus, CompetenceRecordCreate, CompetenceRecordUpdate,
  TrainingRecordCreate, TrainingRecordUpdate,
} from "./competence.api";

const KEYS = {
  records: (params?: object) => ["competence", "records", params] as const,
  matrix: ["competence", "matrix"] as const,
  check: (params: object) => ["competence", "check", params] as const,
  expiring: (days: number) => ["competence", "expiring", days] as const,
  training: (params?: object) => ["competence", "training", params] as const,
};

// ── Competence records ────────────────────────────────────────────────────────

export function useCompetenceRecords(params?: {
  employee_id?: number;
  method_id?: number;
  instrument_id?: number;
  record_status?: CompetenceStatus;
}) {
  return useQuery({
    queryKey: KEYS.records(params),
    queryFn: () => competenceApi.listRecords(params),
  });
}

export function useCreateCompetenceRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CompetenceRecordCreate) => competenceApi.createRecord(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["competence", "records"] });
      // Mark matrix stale but don't re-fetch immediately — it's expensive.
      // It will re-fetch automatically when the Matrix tab is next activated.
      qc.invalidateQueries({ queryKey: KEYS.matrix, refetchType: "none" });
      qc.invalidateQueries({ queryKey: ["competence", "expiring"], refetchType: "none" });
    },
  });
}

export function useUpdateCompetenceRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompetenceRecordUpdate }) =>
      competenceApi.updateRecord(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["competence", "records"] });
      qc.invalidateQueries({ queryKey: KEYS.matrix, refetchType: "none" });
    },
  });
}

export function useDeleteCompetenceRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => competenceApi.deleteRecord(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["competence", "records"] });
      qc.invalidateQueries({ queryKey: KEYS.matrix, refetchType: "none" });
    },
  });
}

// ── Matrix ────────────────────────────────────────────────────────────────────

export function useCompetenceMatrix() {
  return useQuery({
    queryKey: KEYS.matrix,
    queryFn: () => competenceApi.getMatrix(),
    staleTime: 2 * 60 * 1000, // treat as fresh for 2 min — matrix is expensive to rebuild
  });
}

// ── Authorization check ───────────────────────────────────────────────────────

export function useAuthorizationCheck(params: {
  user_id: number;
  method_id?: number;
  instrument_id?: number;
}) {
  return useQuery({
    queryKey: KEYS.check(params),
    queryFn: () => competenceApi.checkAuthorization(params),
    enabled: !!params.user_id && (!!params.method_id || !!params.instrument_id),
  });
}

// ── Expiring competences ──────────────────────────────────────────────────────

export function useExpiringCompetences(days = 30) {
  return useQuery({
    queryKey: KEYS.expiring(days),
    queryFn: () => competenceApi.getExpiring(days),
    refetchInterval: 10 * 60 * 1000,
  });
}

// ── Training records ──────────────────────────────────────────────────────────

export function useTrainingRecords(params?: {
  employee_id?: number;
  competence_record_id?: number;
}) {
  return useQuery({
    queryKey: KEYS.training(params),
    queryFn: () => competenceApi.listTraining(params),
  });
}

export function useCreateTrainingRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TrainingRecordCreate) => competenceApi.createTraining(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["competence", "training"] }),
  });
}

export function useUpdateTrainingRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TrainingRecordUpdate }) =>
      competenceApi.updateTraining(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["competence", "training"] }),
  });
}

export function useDeleteTrainingRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => competenceApi.deleteTraining(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["competence", "training"] }),
  });
}
