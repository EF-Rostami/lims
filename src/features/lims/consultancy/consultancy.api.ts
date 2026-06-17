import { limsApi } from "@/lib/lims-api";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProjectStatus = "SCOPING" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
export type TaskStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "BLOCKED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ComplianceStatus = "NOT_ASSESSED" | "COMPLIANT" | "PARTIAL" | "DEFICIENT" | "NOT_APPLICABLE";
export type AssessmentStatus = "DRAFT" | "IN_PROGRESS" | "COMPLETED";

export interface ComplianceClause {
  id: number;
  framework_id: number;
  clause_number: string;
  title: string;
  description: string | null;
  parent_clause_id: number | null;
  sort_order: number;
}

export interface ComplianceFrameworkListItem {
  id: number;
  code: string;
  name: string;
  version: string | null;
}

export interface ComplianceFrameworkRead extends ComplianceFrameworkListItem {
  description: string | null;
  clauses: ComplianceClause[];
}

export interface ConsultancyProjectCreate {
  name: string;
  framework_id: number;
  start_date?: string | null;
  target_go_live?: string | null;
}

export interface ConsultancyProjectUpdate {
  name?: string;
  status?: ProjectStatus;
  start_date?: string | null;
  target_go_live?: string | null;
}

export interface ConsultancyProjectListItem {
  id: number;
  name: string;
  framework_id: number;
  status: string;
  mode: string;
  target_go_live: string | null;
  actual_go_live: string | null;
}

export interface ConsultancyProjectRead extends ConsultancyProjectListItem {
  consultant_id: number | null;
  start_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface GapAssessmentCreate {
  title: string;
}

export interface GapAssessmentUpdate {
  title?: string;
  status?: AssessmentStatus;
}

export interface GapAssessmentRead {
  id: number;
  project_id: number;
  title: string;
  status: string;
  assessed_by_id: number | null;
  assessed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GapAssessmentItemUpdate {
  compliance_status?: ComplianceStatus;
  finding?: string | null;
  recommendation?: string | null;
  risk_level?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | null;
}

export interface GapAssessmentItemRead {
  id: number;
  assessment_id: number;
  clause_id: number;
  compliance_status: string;
  finding: string | null;
  recommendation: string | null;
  risk_level: string | null;
  clause: ComplianceClause | null;
}

export interface ConsultancyTaskCreate {
  title: string;
  description?: string | null;
  task_type: string;
  priority?: TaskPriority;
  assigned_to_id?: number | null;
  due_date?: string | null;
  assessment_item_id?: number | null;
  linked_entity_type?: string | null;
  linked_entity_id?: number | null;
}

export interface ConsultancyTaskUpdate {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to_id?: number | null;
  due_date?: string | null;
}

export interface ConsultancyTaskRead {
  id: number;
  project_id: number;
  assessment_item_id: number | null;
  title: string;
  description: string | null;
  task_type: string;
  status: string;
  priority: string;
  assigned_to_id: number | null;
  due_date: string | null;
  completed_at: string | null;
  completed_by_id: number | null;
  linked_entity_type: string | null;
  linked_entity_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface FrameworkTemplateListItem {
  id: number;
  framework_id: number;
  name: string;
  industry: string | null;
  is_active: boolean;
}

export interface FrameworkTemplateItem {
  id: number;
  template_id: number;
  item_type: string;
  clause_id: number | null;
  name: string;
  description: string | null;
  required: boolean;
  default_priority: string;
}

export interface FrameworkTemplateRead extends FrameworkTemplateListItem {
  description: string | null;
  items: FrameworkTemplateItem[];
}

export interface ProvisionSummary {
  tasks_created: number;
  documents_drafted: number;
  methods_linked: number;
  competence_records_created: number;
  assessment_items_created: number;
}

export interface GoLiveCheck {
  name: string;
  passed: boolean;
  details: string;
}

export interface ReadinessReport {
  project_id: number;
  all_passed: boolean;
  checks: GoLiveCheck[];
}

// ── API ───────────────────────────────────────────────────────────────────────

export const consultancyApi = {
  // Frameworks
  listFrameworks: async (): Promise<ComplianceFrameworkListItem[]> => {
    const res = await limsApi.get<ComplianceFrameworkListItem[]>("/consultancy/frameworks");
    return res.data;
  },

  getFramework: async (id: number): Promise<ComplianceFrameworkRead> => {
    const res = await limsApi.get<ComplianceFrameworkRead>(`/consultancy/frameworks/${id}`);
    return res.data;
  },

  // Templates
  listTemplates: async (frameworkId?: number): Promise<FrameworkTemplateListItem[]> => {
    const res = await limsApi.get<FrameworkTemplateListItem[]>("/consultancy/templates", {
      params: frameworkId ? { framework_id: frameworkId } : undefined,
    });
    return res.data;
  },

  getTemplate: async (id: number): Promise<FrameworkTemplateRead> => {
    const res = await limsApi.get<FrameworkTemplateRead>(`/consultancy/templates/${id}`);
    return res.data;
  },

  // Projects
  createProject: async (data: ConsultancyProjectCreate): Promise<ConsultancyProjectRead> => {
    const res = await limsApi.post<ConsultancyProjectRead>("/consultancy/projects", data);
    return res.data;
  },

  listProjects: async (): Promise<ConsultancyProjectListItem[]> => {
    const res = await limsApi.get<ConsultancyProjectListItem[]>("/consultancy/projects");
    return res.data;
  },

  getProject: async (id: number): Promise<ConsultancyProjectRead> => {
    const res = await limsApi.get<ConsultancyProjectRead>(`/consultancy/projects/${id}`);
    return res.data;
  },

  updateProject: async (id: number, data: ConsultancyProjectUpdate): Promise<ConsultancyProjectRead> => {
    const res = await limsApi.patch<ConsultancyProjectRead>(`/consultancy/projects/${id}`, data);
    return res.data;
  },

  provisionTemplate: async (projectId: number, templateId: number): Promise<ProvisionSummary> => {
    const res = await limsApi.post<ProvisionSummary>(`/consultancy/projects/${projectId}/provision`, {
      template_id: templateId,
    });
    return res.data;
  },

  // Go-Live
  getReadiness: async (projectId: number): Promise<ReadinessReport> => {
    const res = await limsApi.get<ReadinessReport>(`/consultancy/projects/${projectId}/readiness`);
    return res.data;
  },

  executeGoLive: async (projectId: number): Promise<ConsultancyProjectRead> => {
    const res = await limsApi.post<ConsultancyProjectRead>(`/consultancy/projects/${projectId}/go-live`);
    return res.data;
  },

  // Assessments
  createAssessment: async (projectId: number, data: GapAssessmentCreate): Promise<GapAssessmentRead> => {
    const res = await limsApi.post<GapAssessmentRead>(`/consultancy/projects/${projectId}/assessments`, data);
    return res.data;
  },

  listAssessments: async (projectId: number): Promise<GapAssessmentRead[]> => {
    const res = await limsApi.get<GapAssessmentRead[]>(`/consultancy/projects/${projectId}/assessments`);
    return res.data;
  },

  getAssessment: async (id: number): Promise<GapAssessmentRead> => {
    const res = await limsApi.get<GapAssessmentRead>(`/consultancy/assessments/${id}`);
    return res.data;
  },

  updateAssessment: async (id: number, data: GapAssessmentUpdate): Promise<GapAssessmentRead> => {
    const res = await limsApi.patch<GapAssessmentRead>(`/consultancy/assessments/${id}`, data);
    return res.data;
  },

  getAssessmentItems: async (assessmentId: number): Promise<GapAssessmentItemRead[]> => {
    const res = await limsApi.get<GapAssessmentItemRead[]>(`/consultancy/assessments/${assessmentId}/items`);
    return res.data;
  },

  updateAssessmentItem: async (
    assessmentId: number,
    itemId: number,
    data: GapAssessmentItemUpdate,
  ): Promise<GapAssessmentItemRead> => {
    const res = await limsApi.patch<GapAssessmentItemRead>(
      `/consultancy/assessments/${assessmentId}/items/${itemId}`,
      data,
    );
    return res.data;
  },

  // Tasks
  createTask: async (projectId: number, data: ConsultancyTaskCreate): Promise<ConsultancyTaskRead> => {
    const res = await limsApi.post<ConsultancyTaskRead>(`/consultancy/projects/${projectId}/tasks`, data);
    return res.data;
  },

  listTasks: async (projectId: number, status?: string): Promise<ConsultancyTaskRead[]> => {
    const res = await limsApi.get<ConsultancyTaskRead[]>(`/consultancy/projects/${projectId}/tasks`, {
      params: status ? { status } : undefined,
    });
    return res.data;
  },

  getTask: async (id: number): Promise<ConsultancyTaskRead> => {
    const res = await limsApi.get<ConsultancyTaskRead>(`/consultancy/tasks/${id}`);
    return res.data;
  },

  updateTask: async (id: number, data: ConsultancyTaskUpdate): Promise<ConsultancyTaskRead> => {
    const res = await limsApi.patch<ConsultancyTaskRead>(`/consultancy/tasks/${id}`, data);
    return res.data;
  },

  completeTask: async (id: number): Promise<ConsultancyTaskRead> => {
    const res = await limsApi.post<ConsultancyTaskRead>(`/consultancy/tasks/${id}/complete`);
    return res.data;
  },
};
