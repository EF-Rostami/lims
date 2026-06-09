import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  muApi,
  MUBudgetCreate, MUBudgetUpdate,
  MUComponentCreate,
  MUDecisionRuleCreate, MUDecisionRuleUpdate,
  MUResultEntryCreate, MUResultEntryUpdate,
} from "./mu.api";

const KEYS = {
  budgets: (p?: object) => ["mu", "budgets", p] as const,
  budget: (id: number) => ["mu", "budget", id] as const,
  rules: (p?: object) => ["mu", "rules", p] as const,
  entries: (p?: object) => ["mu", "entries", p] as const,
  entry: (id: number) => ["mu", "entry", id] as const,
  breakdown: (id: number) => ["mu", "breakdown", id] as const,
};

// ── Budgets ───────────────────────────────────────────────────────────────────

export function useMUBudgets(params?: { method_id?: number }) {
  return useQuery({
    queryKey: KEYS.budgets(params),
    queryFn: () => muApi.listBudgets(params),
  });
}

export function useMUBudget(id: number | null) {
  return useQuery({
    queryKey: KEYS.budget(id!),
    queryFn: () => muApi.getBudget(id!),
    enabled: id != null,
  });
}

export function useCreateMUBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MUBudgetCreate) => muApi.createBudget(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mu", "budgets"] }),
  });
}

export function useUpdateMUBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MUBudgetUpdate }) =>
      muApi.updateBudget(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mu", "budgets"] }),
  });
}

export function useDeleteMUBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => muApi.deleteBudget(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mu", "budgets"] }),
  });
}

// ── Components ────────────────────────────────────────────────────────────────

export function useAddMUComponent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ budgetId, data }: { budgetId: number; data: MUComponentCreate }) =>
      muApi.addComponent(budgetId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mu", "budgets"] }),
  });
}

export function useUpdateMUComponent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MUComponentCreate> }) =>
      muApi.updateComponent(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mu", "budgets"] }),
  });
}

export function useDeleteMUComponent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => muApi.deleteComponent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mu", "budgets"] }),
  });
}

// ── Decision Rules ────────────────────────────────────────────────────────────

export function useMURules(params?: { method_id?: number }) {
  return useQuery({
    queryKey: KEYS.rules(params),
    queryFn: () => muApi.listRules(params),
  });
}

export function useCreateMURule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MUDecisionRuleCreate) => muApi.createRule(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mu", "rules"] }),
  });
}

export function useUpdateMURule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MUDecisionRuleUpdate }) =>
      muApi.updateRule(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mu", "rules"] }),
  });
}

export function useDeleteMURule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => muApi.deleteRule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mu", "rules"] }),
  });
}

// ── Result Entries ────────────────────────────────────────────────────────────

export function useMUEntries(params?: { result_id?: number }) {
  return useQuery({
    queryKey: KEYS.entries(params),
    queryFn: () => muApi.listEntries(params),
  });
}

export function useMUEntry(id: number | null) {
  return useQuery({
    queryKey: KEYS.entry(id!),
    queryFn: () => muApi.getEntry(id!),
    enabled: id != null,
  });
}

export function useCreateMUEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MUResultEntryCreate) => muApi.createEntry(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mu", "entries"] }),
  });
}

export function useUpdateMUEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MUResultEntryUpdate }) =>
      muApi.updateEntry(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mu", "entries"] });
      qc.invalidateQueries({ queryKey: ["mu", "entry"] });
      qc.invalidateQueries({ queryKey: ["mu", "breakdown"] });
    },
  });
}

export function useDeleteMUEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => muApi.deleteEntry(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mu", "entries"] }),
  });
}

export function useMUBreakdown(entryId: number | null) {
  return useQuery({
    queryKey: KEYS.breakdown(entryId!),
    queryFn: () => muApi.getBreakdown(entryId!),
    enabled: entryId != null,
  });
}
