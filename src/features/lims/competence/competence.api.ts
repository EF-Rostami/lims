import { limsApi } from "@/lib/lims-api";

export type CompetenceScope = "method" | "instrument" | "general";
export type CompetenceLevel = "trainee" | "competent" | "assessor";
export type CompetenceStatus = "active" | "expired" | "suspended" | "pending_revalidation";
export type TrainingType = "initial" | "refresher" | "on_the_job" | "external" | "internal";

// ── Competence Record ─────────────────────────────────────────────────────────

export interface CompetenceRecordCreate {
  employee_id: number;
  scope: CompetenceScope;
  method_id?: number | null;
  instrument_id?: number | null;
  level: CompetenceLevel;
  valid_from?: string | null;
  valid_until?: string | null;
  revalidation_interval_months?: number | null;
  notes?: string | null;
}

export interface CompetenceRecordUpdate {
  level?: CompetenceLevel;
  status?: CompetenceStatus;
  valid_from?: string | null;
  valid_until?: string | null;
  revalidation_interval_months?: number | null;
  notes?: string | null;
}

export interface CompetenceRecordRead {
  id: number;
  employee_id: number;
  scope: CompetenceScope;
  method_id?: number | null;
  instrument_id?: number | null;
  level: CompetenceLevel;
  status: CompetenceStatus;
  valid_from?: string | null;
  valid_until?: string | null;
  revalidation_interval_months?: number | null;
  assessed_by_user_id?: number | null;
  assessed_at?: string | null;
  notes?: string | null;
  days_until_expiry?: number | null;
  employee_name?: string | null;
  employee_number?: string | null;
  method_name?: string | null;
  method_code?: string | null;
  instrument_name?: string | null;
  instrument_code?: string | null;
}

// ── Training Record ───────────────────────────────────────────────────────────

export interface TrainingRecordCreate {
  employee_id: number;
  course_name: string;
  training_type: TrainingType;
  provider?: string | null;
  completed_at: string;
  valid_until?: string | null;
  pass_score?: number | null;
  achieved_score?: number | null;
  competence_record_id?: number | null;
  notes?: string | null;
}

export interface TrainingRecordUpdate extends Partial<Omit<TrainingRecordCreate, "employee_id">> {}

export interface TrainingRecordRead extends TrainingRecordCreate {
  id: number;
  recorded_by_user_id?: number | null;
  certificate_file_id?: number | null;
  days_until_expiry?: number | null;
  employee_name?: string | null;
  employee_number?: string | null;
}

// ── Authorization check ───────────────────────────────────────────────────────

export interface AuthorizationCheckResult {
  user_id: number;
  is_authorized: boolean;
  level?: CompetenceLevel | null;
  competence_record_id?: number | null;
  method_id?: number | null;
  instrument_id?: number | null;
  reason?: string | null;
}

// ── Matrix ────────────────────────────────────────────────────────────────────

export interface MatrixCell {
  competence_record_id?: number | null;
  level?: CompetenceLevel | null;
  status?: CompetenceStatus | null;
  valid_until?: string | null;
  days_until_expiry?: number | null;
}

export interface MatrixRow {
  employee_id: number;
  employee_name: string;
  employee_number: string;
  cells: Record<string, MatrixCell>;
}

export interface CompetenceMatrix {
  method_columns: { id: number; code: string; name: string }[];
  instrument_columns: { id: number; code: string; name: string }[];
  rows: MatrixRow[];
}

// ── Expiry alert ──────────────────────────────────────────────────────────────

export interface CompetenceExpiryAlert {
  competence_record_id: number;
  employee_id: number;
  employee_name: string;
  employee_number: string;
  scope: CompetenceScope;
  level: CompetenceLevel;
  status: CompetenceStatus;
  method_name?: string | null;
  method_code?: string | null;
  instrument_name?: string | null;
  instrument_code?: string | null;
  valid_until?: string | null;
  days_until_expiry?: number | null;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const competenceApi = {
  // Competence records
  listRecords: (params?: {
    employee_id?: number;
    method_id?: number;
    instrument_id?: number;
    record_status?: CompetenceStatus;
  }) => {
    const qs = new URLSearchParams();
    if (params?.employee_id) qs.set("employee_id", String(params.employee_id));
    if (params?.method_id) qs.set("method_id", String(params.method_id));
    if (params?.instrument_id) qs.set("instrument_id", String(params.instrument_id));
    if (params?.record_status) qs.set("record_status", params.record_status);
    const q = qs.toString();
    return limsApi.get<CompetenceRecordRead[]>(`/competence/records${q ? `?${q}` : ""}`).then(r => r.data);
  },
  createRecord: (data: CompetenceRecordCreate) =>
    limsApi.post<CompetenceRecordRead>("/competence/records", data).then(r => r.data),
  updateRecord: (id: number, data: CompetenceRecordUpdate) =>
    limsApi.patch<CompetenceRecordRead>(`/competence/records/${id}`, data).then(r => r.data),
  deleteRecord: (id: number) =>
    limsApi.delete(`/competence/records/${id}`),

  // Matrix
  getMatrix: () =>
    limsApi.get<CompetenceMatrix>("/competence/matrix").then(r => r.data),

  // Authorization check
  checkAuthorization: (params: { user_id: number; method_id?: number; instrument_id?: number }) => {
    const qs = new URLSearchParams({ user_id: String(params.user_id) });
    if (params.method_id) qs.set("method_id", String(params.method_id));
    if (params.instrument_id) qs.set("instrument_id", String(params.instrument_id));
    return limsApi.get<AuthorizationCheckResult>(`/competence/check?${qs}`).then(r => r.data);
  },

  // Expiring competences
  getExpiring: (days = 30) =>
    limsApi.get<CompetenceExpiryAlert[]>(`/competence/expiring?days=${days}`).then(r => r.data),

  // Training records
  listTraining: (params?: { employee_id?: number; competence_record_id?: number }) => {
    const qs = new URLSearchParams();
    if (params?.employee_id) qs.set("employee_id", String(params.employee_id));
    if (params?.competence_record_id) qs.set("competence_record_id", String(params.competence_record_id));
    const q = qs.toString();
    return limsApi.get<TrainingRecordRead[]>(`/competence/training${q ? `?${q}` : ""}`).then(r => r.data);
  },
  createTraining: (data: TrainingRecordCreate) =>
    limsApi.post<TrainingRecordRead>("/competence/training", data).then(r => r.data),
  updateTraining: (id: number, data: TrainingRecordUpdate) =>
    limsApi.patch<TrainingRecordRead>(`/competence/training/${id}`, data).then(r => r.data),
  deleteTraining: (id: number) =>
    limsApi.delete(`/competence/training/${id}`),
};
