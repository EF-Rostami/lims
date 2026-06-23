import { limsApi } from "@/lib/lims-api";

export type AuditType = "internal" | "management_review" | "surveillance";
export type AuditStatus = "planned" | "open" | "reported" | "closed";
export type ChecklistResponse = "conforming" | "nonconforming" | "not_applicable" | "not_assessed";
export type FindingType = "conformity" | "observation" | "minor_nc" | "major_nc";
export type FindingStatus = "open" | "closed";

// ── Programs ──────────────────────────────────────────────────────────────────

export interface IAProgramCreate {
  name: string;
  year: number;
  description?: string | null;
  planned_by_user_id?: number | null;
  is_active?: boolean;
}

export interface IAProgramUpdate extends Partial<IAProgramCreate> {}

export interface IAProgramRead extends IAProgramCreate {
  id: number;
  audit_count: number;
}

// ── Audits ────────────────────────────────────────────────────────────────────

export interface IAAuditCreate {
  program_id?: number | null;
  title: string;
  audit_type?: AuditType;
  scope?: string | null;
  lead_auditor_user_id?: number | null;
  auditee_user_id?: number | null;
  planned_date?: string | null;
}

export interface IAAuditUpdate {
  title?: string;
  audit_type?: AuditType;
  scope?: string | null;
  lead_auditor_user_id?: number | null;
  auditee_user_id?: number | null;
  planned_date?: string | null;
  actual_date?: string | null;
}

export interface IAAuditSummary {
  id: number;
  reference_number: string;
  title: string;
  audit_type: AuditType;
  status: AuditStatus;
  planned_date?: string | null;
  actual_date?: string | null;
  lead_auditor_user_id?: number | null;
  auditee_user_id?: number | null;
  open_findings: number;
  total_findings: number;
  program_id?: number | null;
}

export interface IAChecklistItemRead {
  id: number;
  audit_id: number;
  clause_ref?: string | null;
  requirement: string;
  response: ChecklistResponse;
  notes?: string | null;
  order_index: number;
}

export interface IAFindingRead {
  id: number;
  audit_id: number;
  checklist_item_id?: number | null;
  finding_type: FindingType;
  title: string;
  description: string;
  clause_ref?: string | null;
  status: FindingStatus;
  due_date?: string | null;
  ca_description?: string | null;
  closed_at?: string | null;
  reported_by_user_id?: number | null;
  responsible_user_id?: number | null;
  capa_finding_id?: number | null;
}

export interface IAAuditRead extends IAAuditCreate {
  id: number;
  reference_number: string;
  status: AuditStatus;
  actual_date?: string | null;
  report_date?: string | null;
  report_summary?: string | null;
  close_date?: string | null;
  close_notes?: string | null;
  checklist_items: IAChecklistItemRead[];
  findings: IAFindingRead[];
}

// ── Checklist ─────────────────────────────────────────────────────────────────

export interface IAChecklistItemCreate {
  clause_ref?: string | null;
  requirement: string;
  response?: ChecklistResponse;
  notes?: string | null;
  order_index?: number;
}

export interface IAChecklistItemUpdate extends Partial<IAChecklistItemCreate> {}

// ── Findings ──────────────────────────────────────────────────────────────────

export interface IAFindingCreate {
  finding_type: FindingType;
  title: string;
  description: string;
  clause_ref?: string | null;
  checklist_item_id?: number | null;
  due_date?: string | null;
  responsible_user_id?: number | null;
}

export interface IAFindingUpdate {
  finding_type?: FindingType;
  title?: string;
  description?: string;
  clause_ref?: string | null;
  due_date?: string | null;
  ca_description?: string | null;
  responsible_user_id?: number | null;
}

// ── Summary ───────────────────────────────────────────────────────────────────

export interface IASummary {
  planned_audits: number;
  open_audits: number;
  reported_audits: number;
  closed_audits: number;
  open_major_nc: number;
  open_minor_nc: number;
  open_observations: number;
  overdue_findings: number;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const iaApi = {
  // Summary
  getSummary: () =>
    limsApi.get<IASummary>("/ia/summary").then(r => r.data),

  // Programs
  listPrograms: () =>
    limsApi.get<IAProgramRead[]>("/ia/programs").then(r => r.data),
  createProgram: (data: IAProgramCreate) =>
    limsApi.post<IAProgramRead>("/ia/programs", data).then(r => r.data),
  updateProgram: (id: number, data: IAProgramUpdate) =>
    limsApi.patch<IAProgramRead>(`/ia/programs/${id}`, data).then(r => r.data),
  deleteProgram: (id: number) =>
    limsApi.delete(`/ia/programs/${id}`),

  // Audits
  listAudits: (params?: { program_id?: number; status?: AuditStatus }) => {
    const qs = new URLSearchParams();
    if (params?.program_id) qs.set("program_id", String(params.program_id));
    if (params?.status) qs.set("status", params.status);
    const q = qs.toString();
    return limsApi.get<IAAuditSummary[]>(`/ia/audits${q ? `?${q}` : ""}`).then(r => r.data);
  },
  getAudit: (id: number) =>
    limsApi.get<IAAuditRead>(`/ia/audits/${id}`).then(r => r.data),
  createAudit: (data: IAAuditCreate) =>
    limsApi.post<IAAuditRead>("/ia/audits", data).then(r => r.data),
  updateAudit: (id: number, data: IAAuditUpdate) =>
    limsApi.patch<IAAuditRead>(`/ia/audits/${id}`, data).then(r => r.data),
  deleteAudit: (id: number) =>
    limsApi.delete(`/ia/audits/${id}`),
  openAudit: (id: number) =>
    limsApi.post<IAAuditRead>(`/ia/audits/${id}/open`, {}).then(r => r.data),
  reportAudit: (id: number, report_summary: string) =>
    limsApi.post<IAAuditRead>(`/ia/audits/${id}/report`, { report_summary }).then(r => r.data),
  closeAudit: (id: number, close_notes?: string) =>
    limsApi.post<IAAuditRead>(`/ia/audits/${id}/close`, { close_notes }).then(r => r.data),

  // Checklist
  addChecklistItem: (auditId: number, data: IAChecklistItemCreate) =>
    limsApi.post<IAChecklistItemRead>(`/ia/audits/${auditId}/checklist`, data).then(r => r.data),
  updateChecklistItem: (id: number, data: IAChecklistItemUpdate) =>
    limsApi.patch<IAChecklistItemRead>(`/ia/checklist/${id}`, data).then(r => r.data),
  deleteChecklistItem: (id: number) =>
    limsApi.delete(`/ia/checklist/${id}`),

  // Findings
  listFindings: (params?: { audit_id?: number; status?: FindingStatus; finding_type?: FindingType }) => {
    const qs = new URLSearchParams();
    if (params?.audit_id) qs.set("audit_id", String(params.audit_id));
    if (params?.status) qs.set("status", params.status);
    if (params?.finding_type) qs.set("finding_type", params.finding_type);
    const q = qs.toString();
    return limsApi.get<IAFindingRead[]>(`/ia/findings${q ? `?${q}` : ""}`).then(r => r.data);
  },
  createFinding: (auditId: number, data: IAFindingCreate) =>
    limsApi.post<IAFindingRead>(`/ia/audits/${auditId}/findings`, data).then(r => r.data),
  updateFinding: (id: number, data: IAFindingUpdate) =>
    limsApi.patch<IAFindingRead>(`/ia/findings/${id}`, data).then(r => r.data),
  closeFinding: (id: number, ca_description: string) =>
    limsApi.post<IAFindingRead>(`/ia/findings/${id}/close`, { ca_description }).then(r => r.data),
  linkCapa: (id: number, capa_finding_id: number) =>
    limsApi.post<IAFindingRead>(`/ia/findings/${id}/link-capa`, { capa_finding_id }).then(r => r.data),
  deleteFinding: (id: number) =>
    limsApi.delete(`/ia/findings/${id}`),
};
