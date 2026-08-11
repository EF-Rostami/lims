import { limsApi } from "@/lib/lims-api";

export interface ComplianceCheckRead {
  id: number;
  check_key: string;
  clause_ref: string;
  question: string;
  guidance: string | null;
  severity: string;
  layer: string;
  is_active: boolean;
}

export interface ComplianceCheckResultRead {
  id: number;
  check_id: number;
  run_id: string;
  status: "PASS" | "FAIL" | "WARNING" | "NA" | "ERROR";
  failing_record_ids: number[] | null;
  evidence_summary: string | null;
  evaluated_at: string;
  check: ComplianceCheckRead;
}

export interface ComplianceRunSummary {
  run_id: string;
  evaluated_at: string;
  total: number;
  passed: number;
  failed: number;
  warnings: number;
  not_applicable: number;
  errors: number;
  score: number;
  critical_failures: string[];
  major_failures: string[];
}

export interface ScoreHistoryPoint {
  run_id: string;
  evaluated_at: string;
  score: number;
}

export const complianceApi = {
  getHealth: (): Promise<ComplianceRunSummary | null> =>
    limsApi.get<ComplianceRunSummary | null>("/compliance/health").then((r) => r.data),

  getResults: (): Promise<ComplianceCheckResultRead[]> =>
    limsApi.get<ComplianceCheckResultRead[]>("/compliance/results").then((r) => r.data),

  runNow: (): Promise<{ run_id: string; status: string }> =>
    limsApi.post<{ run_id: string; status: string }>("/compliance/run").then((r) => r.data),

  getHistory: (days = 90): Promise<ScoreHistoryPoint[]> =>
    limsApi.get<ScoreHistoryPoint[]>(`/compliance/history?days=${days}`).then((r) => r.data),
};
