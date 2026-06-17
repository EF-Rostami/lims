import { limsApi, extractPage } from "@/lib/lims-api";
import type { components } from "@/generated/lims/api";

export type InstrumentRead = components["schemas"]["InstrumentRead"] & {
  lifecycle_status?: string | null;
};
export type InstrumentCreate = components["schemas"]["InstrumentCreate"];
export type InstrumentUpdate = components["schemas"]["InstrumentUpdate"];
export type InstrumentStatus = components["schemas"]["InstrumentStatus"];
export type CalibrationStatus = components["schemas"]["CalibrationStatus"];
export type MaintenanceLogRead = components["schemas"]["MaintenanceLogRead"];
export type MaintenanceLogCreate = components["schemas"]["MaintenanceLogCreate"];

export interface ListInstrumentsParams {
  status?: InstrumentStatus;
  active_only?: boolean;
}

// ── Calibration Records ───────────────────────────────────────────────────────

export type CalibrationType = "internal" | "external" | "factory";
export type CalibrationResult = "pass" | "fail" | "conditional";

export interface CalibrationRecordCreate {
  calibration_type: CalibrationType;
  calibration_date: string;
  result: CalibrationResult;
  certificate_number?: string | null;
  calibrated_by?: string | null;
  next_due_date?: string | null;
  standard_used?: string | null;
  traceability_reference?: string | null;
  uncertainty_value?: number | null;
  notes?: string | null;
}

export interface CalibrationRecordUpdate {
  calibration_type?: CalibrationType;
  calibration_date?: string;
  result?: CalibrationResult;
  certificate_number?: string | null;
  calibrated_by?: string | null;
  next_due_date?: string | null;
  standard_used?: string | null;
  traceability_reference?: string | null;
  uncertainty_value?: number | null;
  notes?: string | null;
}

export interface CalibrationRecord {
  id: number;
  instrument_id: number;
  calibration_type: CalibrationType;
  calibration_date: string;
  result: CalibrationResult;
  certificate_number: string | null;
  calibrated_by: string | null;
  performed_by_user_id: number | null;
  next_due_date: string | null;
  standard_used: string | null;
  traceability_reference: string | null;
  uncertainty_value: number | null;
  notes: string | null;
  approved_by_user_id: number | null;
  approved_at: string | null;
}

// ── Intermediate Checks ───────────────────────────────────────────────────────

export type CheckResult = "pass" | "fail" | "warning";

export interface IntermediateCheckCreate {
  check_date: string;
  check_type: string;
  result: CheckResult;
  reference_value?: number | null;
  measured_value?: number | null;
  tolerance_pct?: number | null;
  deviation_pct?: number | null;
  notes?: string | null;
}

export interface IntermediateCheckUpdate {
  check_date?: string;
  check_type?: string;
  result?: CheckResult;
  reference_value?: number | null;
  measured_value?: number | null;
  tolerance_pct?: number | null;
  deviation_pct?: number | null;
  notes?: string | null;
}

export interface IntermediateCheck {
  id: number;
  instrument_id: number;
  check_date: string;
  check_type: string;
  performed_by_user_id: number | null;
  result: CheckResult;
  reference_value: number | null;
  measured_value: number | null;
  tolerance_pct: number | null;
  deviation_pct: number | null;
  notes: string | null;
}

// ── Qualifications (IQ/OQ/PQ) ────────────────────────────────────────────────

export type QualificationType = "iq" | "oq" | "pq" | "requalification";
export type QualificationStatus = "planned" | "in_progress" | "completed" | "failed" | "cancelled";
export type QualificationConclusion = "pending" | "conforming" | "non_conforming" | "conditional";

export interface QualificationItemCreate {
  item_number: number;
  description: string;
  acceptance_criteria?: string | null;
  result?: string | null;
  passed?: boolean | null;
  notes?: string | null;
}

export interface QualificationItemUpdate {
  description?: string;
  acceptance_criteria?: string | null;
  result?: string | null;
  passed?: boolean | null;
  notes?: string | null;
}

export interface QualificationItem {
  id: number;
  qualification_id: number;
  item_number: number;
  description: string;
  acceptance_criteria: string | null;
  result: string | null;
  passed: boolean | null;
  notes: string | null;
}

export interface QualificationCreate {
  qualification_type: QualificationType;
  reference_number: string;
  title: string;
  start_date?: string | null;
  next_requalification_due?: string | null;
  protocol?: string | null;
  notes?: string | null;
}

export interface QualificationUpdate {
  title?: string;
  status?: QualificationStatus;
  conclusion?: QualificationConclusion;
  start_date?: string | null;
  completion_date?: string | null;
  next_requalification_due?: string | null;
  protocol?: string | null;
  summary?: string | null;
  notes?: string | null;
}

export interface Qualification {
  id: number;
  instrument_id: number;
  qualification_type: QualificationType;
  reference_number: string;
  title: string;
  status: QualificationStatus;
  conclusion: QualificationConclusion;
  conducted_by_user_id: number | null;
  approved_by_user_id: number | null;
  start_date: string | null;
  completion_date: string | null;
  approved_at: string | null;
  next_requalification_due: string | null;
  protocol: string | null;
  summary: string | null;
  notes: string | null;
  items: QualificationItem[];
}

// ── API ───────────────────────────────────────────────────────────────────────

export const instrumentsApi = {
  list: async (params?: ListInstrumentsParams): Promise<InstrumentRead[]> => {
    const res = await limsApi.get("/instruments", { params });
    return extractPage<InstrumentRead>(res.data);
  },

  get: async (id: number): Promise<InstrumentRead> => {
    const res = await limsApi.get<InstrumentRead>(`/instruments/${id}`);
    return res.data;
  },

  create: async (data: InstrumentCreate): Promise<InstrumentRead> => {
    const res = await limsApi.post<InstrumentRead>("/instruments", data);
    return res.data;
  },

  update: async (id: number, data: InstrumentUpdate): Promise<InstrumentRead> => {
    const res = await limsApi.patch<InstrumentRead>(`/instruments/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await limsApi.delete(`/instruments/${id}`);
  },

  getMaintenance: async (id: number): Promise<MaintenanceLogRead[]> => {
    const res = await limsApi.get<MaintenanceLogRead[]>(`/instruments/${id}/maintenance`);
    return res.data;
  },

  logMaintenance: async (id: number, data: MaintenanceLogCreate): Promise<MaintenanceLogRead> => {
    const res = await limsApi.post<MaintenanceLogRead>(`/instruments/${id}/maintenance`, data);
    return res.data;
  },

  listCalibrations: async (id: number): Promise<CalibrationRecord[]> => {
    const res = await limsApi.get<CalibrationRecord[]>(`/instruments/${id}/calibrations`);
    return res.data;
  },

  createCalibration: async (id: number, data: CalibrationRecordCreate): Promise<CalibrationRecord> => {
    const res = await limsApi.post<CalibrationRecord>(`/instruments/${id}/calibrations`, data);
    return res.data;
  },

  updateCalibration: async (calId: number, data: CalibrationRecordUpdate): Promise<CalibrationRecord> => {
    const res = await limsApi.patch<CalibrationRecord>(`/instruments/calibrations/${calId}`, data);
    return res.data;
  },

  approveCalibration: async (calId: number): Promise<CalibrationRecord> => {
    const res = await limsApi.post<CalibrationRecord>(`/instruments/calibrations/${calId}/approve`);
    return res.data;
  },

  deleteCalibration: async (calId: number): Promise<void> => {
    await limsApi.delete(`/instruments/calibrations/${calId}`);
  },

  listChecks: async (id: number): Promise<IntermediateCheck[]> => {
    const res = await limsApi.get<IntermediateCheck[]>(`/instruments/${id}/checks`);
    return res.data;
  },

  createCheck: async (id: number, data: IntermediateCheckCreate): Promise<IntermediateCheck> => {
    const res = await limsApi.post<IntermediateCheck>(`/instruments/${id}/checks`, data);
    return res.data;
  },

  updateCheck: async (checkId: number, data: IntermediateCheckUpdate): Promise<IntermediateCheck> => {
    const res = await limsApi.patch<IntermediateCheck>(`/instruments/checks/${checkId}`, data);
    return res.data;
  },

  deleteCheck: async (checkId: number): Promise<void> => {
    await limsApi.delete(`/instruments/checks/${checkId}`);
  },

  listQualifications: async (id: number): Promise<Qualification[]> => {
    const res = await limsApi.get<Qualification[]>(`/instruments/${id}/qualifications`);
    return res.data;
  },

  createQualification: async (id: number, data: QualificationCreate): Promise<Qualification> => {
    const res = await limsApi.post<Qualification>(`/instruments/${id}/qualifications`, data);
    return res.data;
  },

  updateQualification: async (qualId: number, data: QualificationUpdate): Promise<Qualification> => {
    const res = await limsApi.patch<Qualification>(`/instruments/qualifications/${qualId}`, data);
    return res.data;
  },

  approveQualification: async (qualId: number): Promise<Qualification> => {
    const res = await limsApi.post<Qualification>(`/instruments/qualifications/${qualId}/approve`);
    return res.data;
  },

  deleteQualification: async (qualId: number): Promise<void> => {
    await limsApi.delete(`/instruments/qualifications/${qualId}`);
  },

  addQualificationItem: async (qualId: number, data: QualificationItemCreate): Promise<QualificationItem> => {
    const res = await limsApi.post<QualificationItem>(`/instruments/qualifications/${qualId}/items`, data);
    return res.data;
  },

  updateQualificationItem: async (itemId: number, data: QualificationItemUpdate): Promise<QualificationItem> => {
    const res = await limsApi.patch<QualificationItem>(`/instruments/qualification-items/${itemId}`, data);
    return res.data;
  },

  deleteQualificationItem: async (itemId: number): Promise<void> => {
    await limsApi.delete(`/instruments/qualification-items/${itemId}`);
  },
};
