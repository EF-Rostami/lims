import { limsApi } from "@/lib/lims-api";

export type QCMaterialType =
  | "blank" | "standard" | "control_low" | "control_mid" | "control_high" | "spike";

export type QCRunStatus = "pending" | "warning" | "accepted" | "rejected" | "overridden";
export type AlertSeverity = "warning" | "reject";

// ── Materials ─────────────────────────────────────────────────────────────────

export interface QCMaterialCreate {
  method_id: number;
  name: string;
  material_type: QCMaterialType;
  target_mean?: number | null;
  target_sd?: number | null;
  unit?: string | null;
  lot_number?: string | null;
  expiry_date?: string | null;
}

export interface QCMaterialUpdate extends Partial<Omit<QCMaterialCreate, "method_id">> {
  is_active?: boolean;
}

export interface QCMaterialRead extends QCMaterialCreate {
  id: number;
  is_active: boolean;
  method_name?: string | null;
  method_code?: string | null;
}

// ── Runs ──────────────────────────────────────────────────────────────────────

export interface QCResultInput {
  material_id: number;
  measured_value: number;
}

export interface QCResultRead {
  id: number;
  run_id: number;
  material_id: number;
  material_name?: string | null;
  material_type?: QCMaterialType | null;
  measured_value: number;
  z_score?: number | null;
  westgard_flags?: string[] | null;
  target_mean?: number | null;
  target_sd?: number | null;
  unit?: string | null;
}

export interface QCRunCreate {
  method_id: number;
  run_date: string;
  operator_user_id?: number | null;
  batch_ref?: string | null;
  notes?: string | null;
  results: QCResultInput[];
}

export interface QCRunRead {
  id: number;
  method_id: number;
  method_name?: string | null;
  method_code?: string | null;
  run_date: string;
  operator_user_id?: number | null;
  batch_ref?: string | null;
  run_status: QCRunStatus;
  westgard_violations?: string[] | null;
  override_justification?: string | null;
  notes?: string | null;
  results: QCResultRead[];
}

// ── Alerts ────────────────────────────────────────────────────────────────────

export interface QCAlertRead {
  id: number;
  run_id: number;
  method_id: number;
  method_name?: string | null;
  method_code?: string | null;
  rule_name: string;
  severity: AlertSeverity;
  description: string;
  is_resolved: boolean;
  resolved_by_user_id?: number | null;
  resolved_at?: string | null;
  resolution_note?: string | null;
}

// ── Levey-Jennings ────────────────────────────────────────────────────────────

export interface LJDataPoint {
  run_id: number;
  run_date: string;
  measured_value: number;
  z_score?: number | null;
  westgard_flags: string[];
  run_status: QCRunStatus;
}

export interface LJChartData {
  material_id: number;
  material_name: string;
  material_type: QCMaterialType;
  method_code: string;
  method_name: string;
  target_mean?: number | null;
  target_sd?: number | null;
  computed_mean?: number | null;
  computed_sd?: number | null;
  unit?: string | null;
  points: LJDataPoint[];
}

// ── Status check ──────────────────────────────────────────────────────────────

export interface QCStatusCheck {
  method_id: number;
  has_active_rejects: boolean;
  has_active_warnings: boolean;
  open_reject_count: number;
  open_warning_count: number;
  blocks_approval: boolean;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const qcApi = {
  // Materials
  listMaterials: (params?: { method_id?: number; active_only?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.method_id) qs.set("method_id", String(params.method_id));
    if (params?.active_only !== undefined) qs.set("active_only", String(params.active_only));
    const q = qs.toString();
    return limsApi.get<QCMaterialRead[]>(`/qc/materials${q ? `?${q}` : ""}`).then(r => r.data);
  },
  createMaterial: (data: QCMaterialCreate) =>
    limsApi.post<QCMaterialRead>("/qc/materials", data).then(r => r.data),
  updateMaterial: (id: number, data: QCMaterialUpdate) =>
    limsApi.patch<QCMaterialRead>(`/qc/materials/${id}`, data).then(r => r.data),
  deleteMaterial: (id: number) =>
    limsApi.delete(`/qc/materials/${id}`),

  // Runs
  listRuns: (params?: { method_id?: number; run_status?: QCRunStatus; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.method_id) qs.set("method_id", String(params.method_id));
    if (params?.run_status) qs.set("run_status", params.run_status);
    if (params?.limit) qs.set("limit", String(params.limit));
    const q = qs.toString();
    return limsApi.get<QCRunRead[]>(`/qc/runs${q ? `?${q}` : ""}`).then(r => r.data);
  },
  submitRun: (data: QCRunCreate) =>
    limsApi.post<QCRunRead>("/qc/runs", data).then(r => r.data),
  getRun: (id: number) =>
    limsApi.get<QCRunRead>(`/qc/runs/${id}`).then(r => r.data),
  overrideRun: (id: number, justification: string) =>
    limsApi.post<QCRunRead>(`/qc/runs/${id}/override`, { override_justification: justification }).then(r => r.data),
  deleteRun: (id: number) =>
    limsApi.delete(`/qc/runs/${id}`),

  // Chart
  getChart: (materialId: number, lastN = 30) =>
    limsApi.get<LJChartData>(`/qc/materials/${materialId}/chart?last_n=${lastN}`).then(r => r.data),

  // Alerts
  listAlerts: (params?: { method_id?: number; unresolved_only?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.method_id) qs.set("method_id", String(params.method_id));
    if (params?.unresolved_only !== undefined) qs.set("unresolved_only", String(params.unresolved_only));
    const q = qs.toString();
    return limsApi.get<QCAlertRead[]>(`/qc/alerts${q ? `?${q}` : ""}`).then(r => r.data);
  },
  resolveAlert: (id: number, resolution_note?: string) =>
    limsApi.post<QCAlertRead>(`/qc/alerts/${id}/resolve`, { resolution_note }).then(r => r.data),

  // Status check
  checkStatus: (methodId: number) =>
    limsApi.get<QCStatusCheck>(`/qc/check/${methodId}`).then(r => r.data),
};
