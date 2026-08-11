import { limsApi } from "@/lib/lims-api";

export interface LabHealthSummary {
  assignment_id: number;
  tenant_schema: string;
  tenant_name: string;
  score: number | null;
  critical_count: number;
  major_count: number;
  total_checks: number;
  passed: number;
  failed: number;
  last_run_at: string | null;
}

export interface ProjectBrief {
  id: number;
  name: string;
  status: string;
  target_go_live: string | null;
}

export interface LabProjectSummary {
  tenant_schema: string;
  tenant_name: string;
  projects: ProjectBrief[];
}

export const labsOverviewApi = {
  getMyLabsHealth: (): Promise<LabHealthSummary[]> =>
    limsApi.get<LabHealthSummary[]>("/consultancy/my-labs/health").then((r) => r.data),

  getMyLabsProjects: (): Promise<LabProjectSummary[]> =>
    limsApi.get<LabProjectSummary[]>("/consultancy/my-labs/projects").then((r) => r.data),
};
