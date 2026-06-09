import { limsApi } from "@/lib/lims-api";

export type ComponentType = "type_a" | "type_b";
export type Distribution = "normal" | "rectangular" | "triangular";
export type Verdict = "conforming" | "non_conforming" | "undecided" | "no_limits";

// ── Components ────────────────────────────────────────────────────────────────

export interface MUComponentCreate {
  name: string;
  component_type: ComponentType;
  distribution?: Distribution;
  u_value?: number | null;
  sensitivity_coefficient?: number;
  notes?: string | null;
}

export interface MUComponentRead extends MUComponentCreate {
  id: number;
  budget_id: number;
}

// ── Budgets ───────────────────────────────────────────────────────────────────

export interface MUBudgetCreate {
  method_id: number;
  name: string;
  coverage_factor?: number;
  confidence_level?: number;
  description?: string | null;
  is_active?: boolean;
}

export interface MUBudgetUpdate extends Partial<Omit<MUBudgetCreate, "method_id">> {}

export interface MUBudgetRead extends MUBudgetCreate {
  id: number;
  components: MUComponentRead[];
  method_name?: string | null;
  method_code?: string | null;
}

// ── Decision Rules ────────────────────────────────────────────────────────────

export interface MUDecisionRuleCreate {
  method_id: number;
  name: string;
  guard_band_factor?: number;
  description?: string | null;
  is_active?: boolean;
}

export interface MUDecisionRuleUpdate extends Partial<Omit<MUDecisionRuleCreate, "method_id">> {}

export interface MUDecisionRuleRead extends MUDecisionRuleCreate {
  id: number;
  method_name?: string | null;
  method_code?: string | null;
}

// ── Result Entries ────────────────────────────────────────────────────────────

export interface MUResultEntryCreate {
  result_id: number;
  budget_id?: number | null;
  type_a_n?: number | null;
  type_a_mean?: number | null;
  type_a_sd?: number | null;
  component_overrides?: Record<string, number> | null;
  extra_type_b_u?: number | null;
  spec_lower?: number | null;
  spec_upper?: number | null;
  decision_rule_id?: number | null;
}

export interface MUResultEntryUpdate extends Partial<Omit<MUResultEntryCreate, "result_id">> {}

export interface MUResultEntryRead {
  id: number;
  result_id: number;
  budget_id?: number | null;
  type_a_n?: number | null;
  type_a_mean?: number | null;
  type_a_sd?: number | null;
  type_a_u?: number | null;
  component_overrides?: Record<string, number> | null;
  combined_u?: number | null;
  coverage_factor: number;
  expanded_u?: number | null;
  reported_value?: string | null;
  spec_lower?: number | null;
  spec_upper?: number | null;
  decision_rule_id?: number | null;
  verdict?: Verdict | null;
  budget?: MUBudgetRead | null;
  decision_rule?: MUDecisionRuleRead | null;
  test_code?: string | null;
  test_name?: string | null;
  result_value?: string | null;
  result_unit?: string | null;
}

// ── Breakdown ─────────────────────────────────────────────────────────────────

export interface ComponentContribution {
  component_id: number;
  name: string;
  component_type: ComponentType;
  distribution: Distribution;
  raw_u: number;
  standard_u: number;
  sensitivity_coefficient: number;
  contribution_u: number;
  contribution_variance: number;
}

export interface UncertaintyBreakdown {
  type_a_u?: number | null;
  components: ComponentContribution[];
  combined_u?: number | null;
  coverage_factor: number;
  expanded_u?: number | null;
  reported_value?: string | null;
  verdict?: Verdict | null;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const muApi = {
  // Budgets
  listBudgets: (params?: { method_id?: number }) => {
    const qs = new URLSearchParams();
    if (params?.method_id) qs.set("method_id", String(params.method_id));
    const q = qs.toString();
    return limsApi.get<MUBudgetRead[]>(`/mu/budgets${q ? `?${q}` : ""}`).then(r => r.data);
  },
  getBudget: (id: number) =>
    limsApi.get<MUBudgetRead>(`/mu/budgets/${id}`).then(r => r.data),
  createBudget: (data: MUBudgetCreate) =>
    limsApi.post<MUBudgetRead>("/mu/budgets", data).then(r => r.data),
  updateBudget: (id: number, data: MUBudgetUpdate) =>
    limsApi.patch<MUBudgetRead>(`/mu/budgets/${id}`, data).then(r => r.data),
  deleteBudget: (id: number) =>
    limsApi.delete(`/mu/budgets/${id}`),

  // Components
  addComponent: (budgetId: number, data: MUComponentCreate) =>
    limsApi.post<MUComponentRead>(`/mu/budgets/${budgetId}/components`, data).then(r => r.data),
  updateComponent: (id: number, data: Partial<MUComponentCreate>) =>
    limsApi.patch<MUComponentRead>(`/mu/components/${id}`, data).then(r => r.data),
  deleteComponent: (id: number) =>
    limsApi.delete(`/mu/components/${id}`),

  // Decision rules
  listRules: (params?: { method_id?: number }) => {
    const qs = new URLSearchParams();
    if (params?.method_id) qs.set("method_id", String(params.method_id));
    const q = qs.toString();
    return limsApi.get<MUDecisionRuleRead[]>(`/mu/rules${q ? `?${q}` : ""}`).then(r => r.data);
  },
  createRule: (data: MUDecisionRuleCreate) =>
    limsApi.post<MUDecisionRuleRead>("/mu/rules", data).then(r => r.data),
  updateRule: (id: number, data: MUDecisionRuleUpdate) =>
    limsApi.patch<MUDecisionRuleRead>(`/mu/rules/${id}`, data).then(r => r.data),
  deleteRule: (id: number) =>
    limsApi.delete(`/mu/rules/${id}`),

  // Result entries
  listEntries: (params?: { result_id?: number }) => {
    const qs = new URLSearchParams();
    if (params?.result_id) qs.set("result_id", String(params.result_id));
    const q = qs.toString();
    return limsApi.get<MUResultEntryRead[]>(`/mu/entries${q ? `?${q}` : ""}`).then(r => r.data);
  },
  getEntry: (id: number) =>
    limsApi.get<MUResultEntryRead>(`/mu/entries/${id}`).then(r => r.data),
  createEntry: (data: MUResultEntryCreate) =>
    limsApi.post<MUResultEntryRead>("/mu/entries", data).then(r => r.data),
  updateEntry: (id: number, data: MUResultEntryUpdate) =>
    limsApi.patch<MUResultEntryRead>(`/mu/entries/${id}`, data).then(r => r.data),
  deleteEntry: (id: number) =>
    limsApi.delete(`/mu/entries/${id}`),
  getBreakdown: (id: number) =>
    limsApi.get<UncertaintyBreakdown>(`/mu/entries/${id}/breakdown`).then(r => r.data),
};
