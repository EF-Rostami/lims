import { limsApi } from "@/lib/lims-api";

export type ValidationParameter =
  | "accuracy" | "precision" | "linearity" | "lod" | "loq"
  | "robustness" | "selectivity" | "recovery" | "measurement_uncertainty"
  | "bias" | "repeatability" | "reproducibility";

export type ValidationStatus = "under_validation" | "validated" | "expired" | "failed";
export type RunStatus = "draft" | "complete" | "failed";
export type PassFail = "pass" | "fail" | "pending";

// ── Criteria ──────────────────────────────────────────────────────────────────

export interface ValidationCriteriaCreate {
  parameter: ValidationParameter;
  target_value?: number | null;
  tolerance_pct?: number | null;
  tolerance_abs?: number | null;
  unit?: string | null;
  description?: string | null;
}

export interface ValidationCriteriaRead extends ValidationCriteriaCreate {
  id: number;
  study_id: number;
}

// ── Results ───────────────────────────────────────────────────────────────────

export interface ValidationResultCreate {
  parameter: ValidationParameter;
  measured_value?: number | null;
  calculated_value?: number | null;
  unit?: string | null;
  pass_fail: PassFail;
  notes?: string | null;
}

export interface ValidationResultRead extends ValidationResultCreate {
  id: number;
  run_id: number;
}

// ── Runs ──────────────────────────────────────────────────────────────────────

export interface ValidationRunCreate {
  run_number: number;
  run_date?: string | null;
  operator_user_id?: number | null;
  run_status: RunStatus;
  notes?: string | null;
}

export interface ValidationRunUpdate {
  run_date?: string | null;
  run_status?: RunStatus;
  notes?: string | null;
}

export interface ValidationRunRead extends ValidationRunCreate {
  id: number;
  study_id: number;
  results: ValidationResultRead[];
}

// ── Studies ───────────────────────────────────────────────────────────────────

export interface ValidationStudyCreate {
  method_id: number;
  title: string;
  analyst_user_id?: number | null;
  started_at?: string | null;
  completed_at?: string | null;
  valid_until?: string | null;
  conclusion?: string | null;
  notes?: string | null;
}

export interface ValidationStudyUpdate {
  title?: string;
  validation_status?: ValidationStatus;
  analyst_user_id?: number | null;
  started_at?: string | null;
  completed_at?: string | null;
  valid_until?: string | null;
  conclusion?: string | null;
  notes?: string | null;
}

export interface ValidationStudySummary {
  id: number;
  method_id: number;
  method_name?: string | null;
  method_code?: string | null;
  title: string;
  validation_status: ValidationStatus;
  started_at?: string | null;
  completed_at?: string | null;
  valid_until?: string | null;
  run_count: number;
  criteria_count: number;
}

export interface ValidationStudyRead extends ValidationStudyCreate {
  id: number;
  validation_status: ValidationStatus;
  method_name?: string | null;
  method_code?: string | null;
  criteria: ValidationCriteriaRead[];
  runs: ValidationRunRead[];
}

export interface MethodValidationStatus {
  method_id: number;
  method_code: string;
  method_name: string;
  validation_status: ValidationStatus | "not_validated";
  study_id?: number | null;
  valid_until?: string | null;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const validationApi = {
  // Studies
  listStudies: (params?: { method_id?: number; validation_status?: ValidationStatus }) => {
    const qs = new URLSearchParams();
    if (params?.method_id) qs.set("method_id", String(params.method_id));
    if (params?.validation_status) qs.set("validation_status", params.validation_status);
    const q = qs.toString();
    return limsApi.get<ValidationStudySummary[]>(`/validation/studies${q ? `?${q}` : ""}`).then(r => r.data);
  },
  getStudy: (id: number) =>
    limsApi.get<ValidationStudyRead>(`/validation/studies/${id}`).then(r => r.data),
  createStudy: (data: ValidationStudyCreate) =>
    limsApi.post<ValidationStudyRead>("/validation/studies", data).then(r => r.data),
  updateStudy: (id: number, data: ValidationStudyUpdate) =>
    limsApi.patch<ValidationStudyRead>(`/validation/studies/${id}`, data).then(r => r.data),
  deleteStudy: (id: number) =>
    limsApi.delete(`/validation/studies/${id}`),

  // Criteria
  upsertCriteria: (studyId: number, data: ValidationCriteriaCreate) =>
    limsApi.put<ValidationCriteriaRead>(`/validation/studies/${studyId}/criteria`, data).then(r => r.data),
  deleteCriteria: (id: number) =>
    limsApi.delete(`/validation/criteria/${id}`),

  // Runs
  createRun: (studyId: number, data: ValidationRunCreate) =>
    limsApi.post<ValidationRunRead>(`/validation/studies/${studyId}/runs`, data).then(r => r.data),
  updateRun: (id: number, data: ValidationRunUpdate) =>
    limsApi.patch<ValidationRunRead>(`/validation/runs/${id}`, data).then(r => r.data),
  deleteRun: (id: number) =>
    limsApi.delete(`/validation/runs/${id}`),

  // Results
  addResult: (runId: number, data: ValidationResultCreate) =>
    limsApi.put<ValidationResultRead>(`/validation/runs/${runId}/results`, data).then(r => r.data),
  deleteResult: (id: number) =>
    limsApi.delete(`/validation/results/${id}`),

  // Status overview
  getMethodStatus: () =>
    limsApi.get<MethodValidationStatus[]>("/validation/status").then(r => r.data),
};
