import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  validationApi,
  ValidationStatus,
  ValidationStudyCreate, ValidationStudyUpdate,
  ValidationCriteriaCreate,
  ValidationRunCreate, ValidationRunUpdate,
  ValidationResultCreate,
} from "./validation.api";

const KEYS = {
  studies: (params?: object) => ["validation", "studies", params] as const,
  study: (id: number) => ["validation", "study", id] as const,
  status: ["validation", "status"] as const,
};

// ── Studies ───────────────────────────────────────────────────────────────────

export function useValidationStudies(params?: { method_id?: number; validation_status?: ValidationStatus }) {
  return useQuery({
    queryKey: KEYS.studies(params),
    queryFn: () => validationApi.listStudies(params),
  });
}

export function useValidationStudy(id: number | null) {
  return useQuery({
    queryKey: KEYS.study(id!),
    queryFn: () => validationApi.getStudy(id!),
    enabled: id != null,
  });
}

export function useCreateStudy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ValidationStudyCreate) => validationApi.createStudy(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["validation", "studies"] });
      qc.invalidateQueries({ queryKey: KEYS.status });
    },
  });
}

export function useUpdateStudy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ValidationStudyUpdate }) =>
      validationApi.updateStudy(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["validation", "studies"] });
      qc.invalidateQueries({ queryKey: KEYS.study(id) });
      qc.invalidateQueries({ queryKey: KEYS.status });
    },
  });
}

export function useDeleteStudy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => validationApi.deleteStudy(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["validation", "studies"] });
      qc.invalidateQueries({ queryKey: KEYS.status });
    },
  });
}

// ── Criteria ──────────────────────────────────────────────────────────────────

export function useUpsertCriteria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ studyId, data }: { studyId: number; data: ValidationCriteriaCreate }) =>
      validationApi.upsertCriteria(studyId, data),
    onSuccess: (_, { studyId }) => qc.invalidateQueries({ queryKey: KEYS.study(studyId) }),
  });
}

export function useDeleteCriteria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, studyId }: { id: number; studyId: number }) =>
      validationApi.deleteCriteria(id),
    onSuccess: (_, { studyId }) => qc.invalidateQueries({ queryKey: KEYS.study(studyId) }),
  });
}

// ── Runs ──────────────────────────────────────────────────────────────────────

export function useCreateRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ studyId, data }: { studyId: number; data: ValidationRunCreate }) =>
      validationApi.createRun(studyId, data),
    onSuccess: (_, { studyId }) => qc.invalidateQueries({ queryKey: KEYS.study(studyId) }),
  });
}

export function useUpdateRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, studyId, data }: { id: number; studyId: number; data: ValidationRunUpdate }) =>
      validationApi.updateRun(id, data),
    onSuccess: (_, { studyId }) => qc.invalidateQueries({ queryKey: KEYS.study(studyId) }),
  });
}

export function useDeleteRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, studyId }: { id: number; studyId: number }) =>
      validationApi.deleteRun(id),
    onSuccess: (_, { studyId }) => qc.invalidateQueries({ queryKey: KEYS.study(studyId) }),
  });
}

// ── Results ───────────────────────────────────────────────────────────────────

export function useAddResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ runId, studyId, data }: { runId: number; studyId: number; data: ValidationResultCreate }) =>
      validationApi.addResult(runId, data),
    onSuccess: (_, { studyId }) => qc.invalidateQueries({ queryKey: KEYS.study(studyId) }),
  });
}

export function useDeleteResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, studyId }: { id: number; studyId: number }) =>
      validationApi.deleteResult(id),
    onSuccess: (_, { studyId }) => qc.invalidateQueries({ queryKey: KEYS.study(studyId) }),
  });
}

// ── Status ────────────────────────────────────────────────────────────────────

export function useMethodValidationStatus() {
  return useQuery({
    queryKey: KEYS.status,
    queryFn: () => validationApi.getMethodStatus(),
    refetchInterval: 5 * 60 * 1000,
  });
}
