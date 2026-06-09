import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  capaApi,
  type ActionItemCreate, type ActionItemUpdate,
  type FishboneCauseCreate, type FishboneCauseUpdate,
  type FiveWhysUpsert, type ImpactLinkCreate,
} from "./capa.api";

const key = {
  summary: (id: number) => ["capa", "summary", id] as const,
  actions: (id: number) => ["capa", "actions", id] as const,
  fishbone: (id: number) => ["capa", "fishbone", id] as const,
  whys: (id: number) => ["capa", "whys", id] as const,
  impacts: (id: number) => ["capa", "impacts", id] as const,
};

const invalidateSummary = (qc: ReturnType<typeof useQueryClient>, id: number) =>
  qc.invalidateQueries({ queryKey: key.summary(id) });

// ── CAPA Summary ──────────────────────────────────────────────────────────────

export function useCapaSummary(findingId: number) {
  return useQuery({
    queryKey: key.summary(findingId),
    queryFn: () => capaApi.getSummary(findingId),
    enabled: !!findingId,
    staleTime: 30_000,
  });
}

// ── 5 Whys ────────────────────────────────────────────────────────────────────

export function useUpsertFiveWhys(findingId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FiveWhysUpsert) => capaApi.upsertFiveWhys(findingId, data),
    onSuccess: () => invalidateSummary(qc, findingId),
  });
}

// ── Fishbone ──────────────────────────────────────────────────────────────────

export function useCreateFishboneCause(findingId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FishboneCauseCreate) => capaApi.createFishboneCause(findingId, data),
    onSuccess: () => invalidateSummary(qc, findingId),
  });
}

export function useUpdateFishboneCause(findingId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ causeId, data }: { causeId: number; data: FishboneCauseUpdate }) =>
      capaApi.updateFishboneCause(causeId, data),
    onSuccess: () => invalidateSummary(qc, findingId),
  });
}

export function useDeleteFishboneCause(findingId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (causeId: number) => capaApi.deleteFishboneCause(causeId),
    onSuccess: () => invalidateSummary(qc, findingId),
  });
}

// ── Action Items ──────────────────────────────────────────────────────────────

export function useCreateAction(findingId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ActionItemCreate) => capaApi.createAction(findingId, data),
    onSuccess: () => invalidateSummary(qc, findingId),
  });
}

export function useUpdateAction(findingId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ actionId, data }: { actionId: number; data: ActionItemUpdate }) =>
      capaApi.updateAction(actionId, data),
    onSuccess: () => invalidateSummary(qc, findingId),
  });
}

export function useCompleteAction(findingId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ actionId, notes }: { actionId: number; notes?: string }) =>
      capaApi.completeAction(actionId, notes),
    onSuccess: () => invalidateSummary(qc, findingId),
  });
}

export function useVerifyAction(findingId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ actionId, notes }: { actionId: number; notes: string }) =>
      capaApi.verifyAction(actionId, notes),
    onSuccess: () => invalidateSummary(qc, findingId),
  });
}

export function useDeleteAction(findingId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (actionId: number) => capaApi.deleteAction(actionId),
    onSuccess: () => invalidateSummary(qc, findingId),
  });
}

// ── Impact Links ──────────────────────────────────────────────────────────────

export function useCreateImpact(findingId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ImpactLinkCreate) => capaApi.createImpact(findingId, data),
    onSuccess: () => invalidateSummary(qc, findingId),
  });
}

export function useDeleteImpact(findingId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (impactId: number) => capaApi.deleteImpact(impactId),
    onSuccess: () => invalidateSummary(qc, findingId),
  });
}
