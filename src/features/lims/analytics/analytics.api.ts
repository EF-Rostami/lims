import { limsApi } from "@/lib/lims-api";

export interface DailyCount { date: string; count: number }
export interface DailyAvg { date: string; avg_hours: number }
export interface StatusCount { status: string; count: number }

// ── Overview ──────────────────────────────────────────────────────────────────

export interface OverviewKPIs {
  samples_today: number;
  samples_pending: number;
  orders_in_progress: number;
  results_pending_approval: number;
  open_qc_alerts: number;
  instruments_active: number;
  instruments_maintenance: number;
  open_nc_findings: number;
}

export interface OverviewData {
  kpis: OverviewKPIs;
  samples_by_status: StatusCount[];
  orders_by_status: StatusCount[];
}

// ── Throughput ────────────────────────────────────────────────────────────────

export interface TestVolume { test_code: string; test_name: string; count: number }

export interface ThroughputData {
  samples_by_day: DailyCount[];
  results_by_day: DailyCount[];
  total_samples_30d: number;
  total_results_30d: number;
  top_tests: TestVolume[];
}

// ── TAT ───────────────────────────────────────────────────────────────────────

export interface TATByTest {
  test_code: string; test_name: string;
  avg_tat_hours: number; min_tat_hours: number; max_tat_hours: number; count: number;
}

export interface TATBucket { label: string; count: number }

export interface TATByPriority { priority: string; avg_tat_hours: number; count: number }

export interface TATData {
  by_test: TATByTest[];
  distribution: TATBucket[];
  by_priority: TATByPriority[];
  daily_avg: DailyAvg[];
  overall_avg_hours?: number | null;
}

// ── Equipment ─────────────────────────────────────────────────────────────────

export interface InstrumentSummary {
  id: number; code: string; name: string;
  status: string; calibration_status: string;
  next_calibration_due?: string | null;
  next_maintenance_due?: string | null;
}

export interface EquipmentData {
  by_status: StatusCount[];
  by_calibration: StatusCount[];
  calibration_overdue: number;
  maintenance_due: number;
  instruments: InstrumentSummary[];
}

// ── QC ────────────────────────────────────────────────────────────────────────

export interface QCDailyStats {
  date: string;
  accepted: number; warning: number; rejected: number; overridden: number; total: number;
  pass_rate: number;
}

export interface QCData {
  daily_stats: QCDailyStats[];
  open_rejects: number; open_warnings: number;
  total_runs_30d: number; overall_pass_rate: number;
}

// ── Compliance ────────────────────────────────────────────────────────────────

export interface PersonnelCompliance {
  cleared_analysts: number; total_analysts: number;
  expiring_soon: number; expired_count: number;
}
export interface EquipmentCompliance {
  in_service: number; total: number;
  calibration_overdue: number; maintenance_overdue: number;
}
export interface MethodsCompliance {
  active_validated: number; active_total: number; inactive_total: number;
}
export interface QCCompliance {
  open_alerts: number; open_rejections: number; pass_rate_30d: number;
}
export interface DocumentCompliance {
  issued: number; draft: number; total: number;
}
export interface FindingsCompliance {
  open_nc: number; overdue_nc: number; open_observations: number;
}
export interface CapaCompliance {
  open_actions: number; overdue_actions: number;
}
export interface SamplesCompliance {
  pending: number; rejected_last_30d: number;
}
export interface ComplianceSummary {
  personnel: PersonnelCompliance;
  equipment: EquipmentCompliance;
  methods: MethodsCompliance;
  qc: QCCompliance;
  documents: DocumentCompliance;
  findings: FindingsCompliance;
  capa: CapaCompliance;
  samples: SamplesCompliance;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const analyticsApi = {
  getOverview: () =>
    limsApi.get<OverviewData>("/analytics/overview").then(r => r.data),

  getThroughput: (days = 30) =>
    limsApi.get<ThroughputData>(`/analytics/throughput?days=${days}`).then(r => r.data),

  getTAT: (days = 30) =>
    limsApi.get<TATData>(`/analytics/tat?days=${days}`).then(r => r.data),

  getEquipment: () =>
    limsApi.get<EquipmentData>("/analytics/equipment").then(r => r.data),

  getQC: (days = 30) =>
    limsApi.get<QCData>(`/analytics/qc?days=${days}`).then(r => r.data),

  getCompliance: () =>
    limsApi.get<ComplianceSummary>("/analytics/compliance").then(r => r.data),

  exportCSV: async (entity: "samples" | "results" | "tat", dateFrom?: string, dateTo?: string) => {
    const qs = new URLSearchParams({ entity });
    if (dateFrom) qs.set("date_from", dateFrom);
    if (dateTo) qs.set("date_to", dateTo);
    const resp = await limsApi.get(`/analytics/export?${qs.toString()}`, { responseType: "blob" });
    const url = URL.createObjectURL(resp.data as Blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entity}_export.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
