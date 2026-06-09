import { limsApi } from "@/lib/lims-api";

// ── Finding (re-export subset from findings) ──────────────────────────────────

export type FindingSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type FindingStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface FindingListItem {
  id: number;
  title: string;
  description: string;
  severity: FindingSeverity;
  status: FindingStatus;
  entity_type: string | null;
  entity_id: number | null;
  assigned_to_user_id: number | null;
  due_date: string | null;
  created_at: string;
}

// ── 5 Whys ────────────────────────────────────────────────────────────────────

export interface FiveWhyStep {
  id: number;
  finding_id: number;
  step_number: number;
  why_text: string | null;
  because_text: string | null;
}

export interface FiveWhysUpsert {
  steps: Array<{
    step_number: number;
    why_text?: string | null;
    because_text?: string | null;
  }>;
}

// ── Fishbone ──────────────────────────────────────────────────────────────────

export type FishboneCategory =
  | "machine" | "method" | "material" | "man" | "measurement" | "environment";

export interface FishboneCause {
  id: number;
  finding_id: number;
  category: FishboneCategory;
  cause_text: string;
  is_root_cause: boolean;
}

export interface FishboneCauseCreate {
  category: FishboneCategory;
  cause_text: string;
  is_root_cause?: boolean;
}

export interface FishboneCauseUpdate {
  cause_text?: string;
  is_root_cause?: boolean;
}

// ── Action Items ──────────────────────────────────────────────────────────────

export type ActionType = "corrective" | "preventive";
export type ActionStatus = "open" | "in_progress" | "completed" | "verified";

export interface ActionItem {
  id: number;
  finding_id: number;
  action_type: ActionType;
  title: string;
  description: string | null;
  responsible_user_id: number | null;
  due_date: string | null;
  status: ActionStatus;
  completed_at: string | null;
  verification_notes: string | null;
  verified_by_user_id: number | null;
  verified_at: string | null;
}

export interface ActionItemCreate {
  action_type: ActionType;
  title: string;
  description?: string | null;
  responsible_user_id?: number | null;
  due_date?: string | null;
}

export interface ActionItemUpdate {
  action_type?: ActionType;
  title?: string;
  description?: string | null;
  responsible_user_id?: number | null;
  due_date?: string | null;
  status?: ActionStatus;
  verification_notes?: string | null;
}

// ── Impact Links ──────────────────────────────────────────────────────────────

export type ImpactEntityType =
  | "sample" | "result" | "order" | "qc_run" | "instrument" | "other";

export interface ImpactLink {
  id: number;
  finding_id: number;
  entity_type: ImpactEntityType;
  entity_id: number | null;
  entity_label: string;
  impact_description: string | null;
}

export interface ImpactLinkCreate {
  entity_type: ImpactEntityType;
  entity_label: string;
  entity_id?: number | null;
  impact_description?: string | null;
}

// ── CAPA Summary ──────────────────────────────────────────────────────────────

export interface CapaSummary {
  finding_id: number;
  five_whys: FiveWhyStep[];
  fishbone: FishboneCause[];
  actions: ActionItem[];
  impacts: ImpactLink[];
  root_cause_identified: boolean;
  open_actions: number;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const capaApi = {
  // Summary
  getSummary: async (findingId: number): Promise<CapaSummary> => {
    const res = await limsApi.get<CapaSummary>(`/capa/findings/${findingId}`);
    return res.data;
  },

  // 5 Whys
  getFiveWhys: async (findingId: number): Promise<FiveWhyStep[]> => {
    const res = await limsApi.get<FiveWhyStep[]>(`/capa/findings/${findingId}/five-whys`);
    return res.data;
  },

  upsertFiveWhys: async (findingId: number, data: FiveWhysUpsert): Promise<FiveWhyStep[]> => {
    const res = await limsApi.put<FiveWhyStep[]>(`/capa/findings/${findingId}/five-whys`, data);
    return res.data;
  },

  // Fishbone
  listFishbone: async (findingId: number): Promise<FishboneCause[]> => {
    const res = await limsApi.get<FishboneCause[]>(`/capa/findings/${findingId}/fishbone`);
    return res.data;
  },

  createFishboneCause: async (findingId: number, data: FishboneCauseCreate): Promise<FishboneCause> => {
    const res = await limsApi.post<FishboneCause>(`/capa/findings/${findingId}/fishbone`, data);
    return res.data;
  },

  updateFishboneCause: async (causeId: number, data: FishboneCauseUpdate): Promise<FishboneCause> => {
    const res = await limsApi.patch<FishboneCause>(`/capa/fishbone/${causeId}`, data);
    return res.data;
  },

  deleteFishboneCause: async (causeId: number): Promise<void> => {
    await limsApi.delete(`/capa/fishbone/${causeId}`);
  },

  // Action Items
  listActions: async (findingId: number): Promise<ActionItem[]> => {
    const res = await limsApi.get<ActionItem[]>(`/capa/findings/${findingId}/actions`);
    return res.data;
  },

  createAction: async (findingId: number, data: ActionItemCreate): Promise<ActionItem> => {
    const res = await limsApi.post<ActionItem>(`/capa/findings/${findingId}/actions`, data);
    return res.data;
  },

  updateAction: async (actionId: number, data: ActionItemUpdate): Promise<ActionItem> => {
    const res = await limsApi.patch<ActionItem>(`/capa/actions/${actionId}`, data);
    return res.data;
  },

  completeAction: async (actionId: number, notes?: string): Promise<ActionItem> => {
    const res = await limsApi.post<ActionItem>(`/capa/actions/${actionId}/complete`, { notes: notes ?? null });
    return res.data;
  },

  verifyAction: async (actionId: number, verificationNotes: string): Promise<ActionItem> => {
    const res = await limsApi.post<ActionItem>(`/capa/actions/${actionId}/verify`, { verification_notes: verificationNotes });
    return res.data;
  },

  deleteAction: async (actionId: number): Promise<void> => {
    await limsApi.delete(`/capa/actions/${actionId}`);
  },

  // Impact Links
  listImpacts: async (findingId: number): Promise<ImpactLink[]> => {
    const res = await limsApi.get<ImpactLink[]>(`/capa/findings/${findingId}/impacts`);
    return res.data;
  },

  createImpact: async (findingId: number, data: ImpactLinkCreate): Promise<ImpactLink> => {
    const res = await limsApi.post<ImpactLink>(`/capa/findings/${findingId}/impacts`, data);
    return res.data;
  },

  deleteImpact: async (impactId: number): Promise<void> => {
    await limsApi.delete(`/capa/impacts/${impactId}`);
  },
};
