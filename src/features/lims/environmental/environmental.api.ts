import { limsApi } from "@/lib/lims-api";

export type ParameterType =
  | "temperature"
  | "humidity"
  | "pressure"
  | "light"
  | "vibration"
  | "air_quality";

export type ReadingStatus = "normal" | "warning" | "out_of_range";

// ── Parameters ────────────────────────────────────────────────────────────────

export interface ParameterCreate {
  name: string;
  parameter_type: ParameterType;
  unit: string;
  location?: string | null;
  is_active?: boolean;
  global_min?: number | null;
  global_max?: number | null;
  warning_margin?: number | null;
}

export interface ParameterUpdate {
  name?: string;
  unit?: string;
  location?: string | null;
  is_active?: boolean;
  global_min?: number | null;
  global_max?: number | null;
  warning_margin?: number | null;
}

export interface ParameterRead extends ParameterCreate {
  id: number;
  is_active: boolean;
  latest_value?: number | null;
  latest_status?: ReadingStatus | null;
  latest_recorded_at?: string | null;
}

// ── Readings ──────────────────────────────────────────────────────────────────

export interface ReadingCreate {
  parameter_id: number;
  value: number;
  notes?: string | null;
}

export interface ReadingRead {
  id: number;
  parameter_id: number;
  value: number;
  recorded_at: string;
  status: ReadingStatus;
  notes?: string | null;
  auto_finding_id?: number | null;
  parameter_name?: string | null;
  unit?: string | null;
}

// ── Thresholds ────────────────────────────────────────────────────────────────

export interface ThresholdCreate {
  parameter_id: number;
  method_id?: number | null;
  min_value?: number | null;
  max_value?: number | null;
  is_active?: boolean;
}

export interface ThresholdUpdate {
  min_value?: number | null;
  max_value?: number | null;
  is_active?: boolean;
}

export interface ThresholdRead extends ThresholdCreate {
  id: number;
}

// ── Snapshots ─────────────────────────────────────────────────────────────────

export interface SnapshotCreate {
  notes?: string | null;
  result_id?: number | null;
  order_id?: number | null;
}

export interface SnapshotReadingRead {
  parameter_id: number;
  parameter_name: string;
  value: number;
  unit: string;
  status: ReadingStatus;
  min_threshold?: number | null;
  max_threshold?: number | null;
}

export interface SnapshotRead {
  id: number;
  taken_at: string;
  is_compliant: boolean;
  notes?: string | null;
  result_id?: number | null;
  order_id?: number | null;
  readings: SnapshotReadingRead[];
}

export interface SnapshotListItem {
  id: number;
  taken_at: string;
  is_compliant: boolean;
  result_id?: number | null;
  order_id?: number | null;
  reading_count: number;
}

// ── Condition check ───────────────────────────────────────────────────────────

export interface ConditionCheckResult {
  is_clear: boolean;
  blocking_parameters: ParameterRead[];
}

// ── API ───────────────────────────────────────────────────────────────────────

export const environmentalApi = {
  // Parameters
  listParameters: (active_only = true) =>
    limsApi.get<ParameterRead[]>(`/environmental/parameters?active_only=${active_only}`).then(r => r.data),
  createParameter: (data: ParameterCreate) =>
    limsApi.post<ParameterRead>("/environmental/parameters", data).then(r => r.data),
  updateParameter: (id: number, data: ParameterUpdate) =>
    limsApi.patch<ParameterRead>(`/environmental/parameters/${id}`, data).then(r => r.data),
  deleteParameter: (id: number) =>
    limsApi.delete(`/environmental/parameters/${id}`),

  // Readings
  logReading: (data: ReadingCreate) =>
    limsApi.post<ReadingRead>("/environmental/readings", data).then(r => r.data),
  listReadings: (params?: { parameter_id?: number; reading_status?: ReadingStatus; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.parameter_id) qs.set("parameter_id", String(params.parameter_id));
    if (params?.reading_status) qs.set("reading_status", params.reading_status);
    if (params?.limit) qs.set("limit", String(params.limit));
    const q = qs.toString();
    return limsApi.get<ReadingRead[]>(`/environmental/readings${q ? `?${q}` : ""}`).then(r => r.data);
  },

  // Thresholds
  listThresholds: (parameter_id?: number) => {
    const q = parameter_id ? `?parameter_id=${parameter_id}` : "";
    return limsApi.get<ThresholdRead[]>(`/environmental/thresholds${q}`).then(r => r.data);
  },
  createThreshold: (data: ThresholdCreate) =>
    limsApi.post<ThresholdRead>("/environmental/thresholds", data).then(r => r.data),
  updateThreshold: (id: number, data: ThresholdUpdate) =>
    limsApi.patch<ThresholdRead>(`/environmental/thresholds/${id}`, data).then(r => r.data),
  deleteThreshold: (id: number) =>
    limsApi.delete(`/environmental/thresholds/${id}`),

  // Snapshots
  takeSnapshot: (data: SnapshotCreate) =>
    limsApi.post<SnapshotRead>("/environmental/snapshots", data).then(r => r.data),
  listSnapshots: (limit = 100) =>
    limsApi.get<SnapshotListItem[]>(`/environmental/snapshots?limit=${limit}`).then(r => r.data),
  getSnapshot: (id: number) =>
    limsApi.get<SnapshotRead>(`/environmental/snapshots/${id}`).then(r => r.data),

  // Condition check
  checkConditions: (method_id?: number) => {
    const q = method_id ? `?method_id=${method_id}` : "";
    return limsApi.get<ConditionCheckResult>(`/environmental/check${q}`).then(r => r.data);
  },
};
