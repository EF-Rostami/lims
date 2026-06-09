import { limsApi } from "@/lib/lims-api";

export type MaterialType = "rm" | "crm";
export type BatchStatus = "active" | "expired" | "depleted" | "quarantine";
export type UsagePurpose = "calibration" | "validation" | "qc_check" | "blind_check" | "other";

// ── Reference Material ────────────────────────────────────────────────────────

export interface ReferenceMaterialCreate {
  name: string;
  rm_code: string;
  material_type: MaterialType;
  matrix?: string | null;
  description?: string | null;
  certified_value?: number | null;
  certified_unit?: string | null;
  expanded_uncertainty?: number | null;
  coverage_factor?: number | null;
  traceability_chain?: string | null;
  producer?: string | null;
  catalog_number?: string | null;
  cas_number?: string | null;
  certificate_number?: string | null;
  certificate_file_id?: number | null;
  is_active?: boolean;
}

export interface ReferenceMaterialUpdate extends Partial<Omit<ReferenceMaterialCreate, "rm_code">> {}

export interface ReferenceMaterialRead extends ReferenceMaterialCreate {
  id: number;
  is_active: boolean;
  active_batch_count: number;
}

// ── Batch ─────────────────────────────────────────────────────────────────────

export interface RMBatchCreate {
  rm_id: number;
  batch_number: string;
  supplier_batch_number?: string | null;
  quantity_received: number;
  quantity_remaining: number;
  unit: string;
  received_date: string;
  expiry_date?: string | null;
  certificate_valid_until?: string | null;
  notes?: string | null;
}

export interface RMBatchUpdate {
  batch_number?: string;
  supplier_batch_number?: string | null;
  quantity_remaining?: number;
  expiry_date?: string | null;
  certificate_valid_until?: string | null;
  status?: BatchStatus;
  notes?: string | null;
}

export interface RMBatchRead extends RMBatchCreate {
  id: number;
  status: BatchStatus;
  days_until_expiry?: number | null;
  days_until_cert_expiry?: number | null;
  material_name?: string | null;
  material_type?: MaterialType | null;
}

// ── Method Approval ───────────────────────────────────────────────────────────

export interface RMMethodApprovalCreate {
  rm_id: number;
  method_id: number;
  notes?: string | null;
}

export interface RMMethodApprovalRead {
  id: number;
  rm_id: number;
  method_id: number;
  approved_by_user_id?: number | null;
  approved_at?: string | null;
  is_active: boolean;
  notes?: string | null;
  material_name?: string | null;
  material_code?: string | null;
  material_type?: MaterialType | null;
}

// ── Usage ─────────────────────────────────────────────────────────────────────

export interface RMUsageCreate {
  batch_id: number;
  result_id?: number | null;
  order_id?: number | null;
  quantity_used: number;
  purpose?: UsagePurpose;
  notes?: string | null;
}

export interface RMUsageRead {
  id: number;
  batch_id: number;
  result_id?: number | null;
  order_id?: number | null;
  quantity_used: number;
  used_by_user_id?: number | null;
  used_at: string;
  purpose: UsagePurpose;
  notes?: string | null;
  batch_number?: string | null;
  material_name?: string | null;
  material_code?: string | null;
}

// ── Alerts ────────────────────────────────────────────────────────────────────

export interface RMExpiryAlert {
  batch_id: number;
  batch_number: string;
  rm_id: number;
  material_name: string;
  material_code: string;
  material_type: MaterialType;
  unit: string;
  quantity_remaining: number;
  expiry_date: string;
  days_until_expiry: number;
  certificate_valid_until?: string | null;
  days_until_cert_expiry?: number | null;
}

export interface RMAlertSummary {
  expiry_alerts: RMExpiryAlert[];
  low_stock_count: number;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const rmApi = {
  // Materials
  listMaterials: (active_only = true) =>
    limsApi.get<ReferenceMaterialRead[]>(`/rm/materials?active_only=${active_only}`).then(r => r.data),
  getMaterial: (id: number) =>
    limsApi.get<ReferenceMaterialRead>(`/rm/materials/${id}`).then(r => r.data),
  createMaterial: (data: ReferenceMaterialCreate) =>
    limsApi.post<ReferenceMaterialRead>("/rm/materials", data).then(r => r.data),
  updateMaterial: (id: number, data: ReferenceMaterialUpdate) =>
    limsApi.patch<ReferenceMaterialRead>(`/rm/materials/${id}`, data).then(r => r.data),
  deleteMaterial: (id: number) =>
    limsApi.delete(`/rm/materials/${id}`),

  // Batches
  listBatches: (params?: { rm_id?: number; batch_status?: BatchStatus }) => {
    const qs = new URLSearchParams();
    if (params?.rm_id) qs.set("rm_id", String(params.rm_id));
    if (params?.batch_status) qs.set("batch_status", params.batch_status);
    const q = qs.toString();
    return limsApi.get<RMBatchRead[]>(`/rm/batches${q ? `?${q}` : ""}`).then(r => r.data);
  },
  getBatch: (id: number) =>
    limsApi.get<RMBatchRead>(`/rm/batches/${id}`).then(r => r.data),
  createBatch: (data: RMBatchCreate) =>
    limsApi.post<RMBatchRead>("/rm/batches", data).then(r => r.data),
  updateBatch: (id: number, data: RMBatchUpdate) =>
    limsApi.patch<RMBatchRead>(`/rm/batches/${id}`, data).then(r => r.data),
  deleteBatch: (id: number) =>
    limsApi.delete(`/rm/batches/${id}`),

  // Usage
  recordUsage: (batchId: number, data: RMUsageCreate) =>
    limsApi.post<RMUsageRead>(`/rm/batches/${batchId}/usage`, data).then(r => r.data),
  listBatchUsage: (batchId: number) =>
    limsApi.get<RMUsageRead[]>(`/rm/batches/${batchId}/usage`).then(r => r.data),
  listUsage: (params?: { result_id?: number; batch_id?: number }) => {
    const qs = new URLSearchParams();
    if (params?.result_id) qs.set("result_id", String(params.result_id));
    if (params?.batch_id) qs.set("batch_id", String(params.batch_id));
    const q = qs.toString();
    return limsApi.get<RMUsageRead[]>(`/rm/usage${q ? `?${q}` : ""}`).then(r => r.data);
  },

  // Method Approvals
  listApprovals: (params?: { method_id?: number; rm_id?: number }) => {
    const qs = new URLSearchParams();
    if (params?.method_id) qs.set("method_id", String(params.method_id));
    if (params?.rm_id) qs.set("rm_id", String(params.rm_id));
    const q = qs.toString();
    return limsApi.get<RMMethodApprovalRead[]>(`/rm/method-approvals${q ? `?${q}` : ""}`).then(r => r.data);
  },
  createApproval: (data: RMMethodApprovalCreate) =>
    limsApi.post<RMMethodApprovalRead>("/rm/method-approvals", data).then(r => r.data),
  deleteApproval: (id: number) =>
    limsApi.delete(`/rm/method-approvals/${id}`),

  // Alerts
  getAlerts: () =>
    limsApi.get<RMAlertSummary>("/rm/alerts").then(r => r.data),
};
