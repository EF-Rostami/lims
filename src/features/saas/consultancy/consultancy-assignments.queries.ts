import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  consultancyApi,
  type AssignmentStatus,
  type CreateAssignmentPayload,
  type CreateConsultantPayload,
  type UpdateConsultantPayload,
} from "./consultancy-assignments.api";

const KEYS = {
  consultants: ["saas", "consultants"] as const,
  labs: ["saas", "consultancy-labs"] as const,
  assignments: ["saas", "consultancy-assignments"] as const,
};

// ── Consultants ───────────────────────────────────────────────────────────────

export function useConsultants() {
  return useQuery({ queryKey: KEYS.consultants, queryFn: consultancyApi.listConsultants });
}

export function useCreateConsultant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateConsultantPayload) => consultancyApi.createConsultant(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.consultants }),
  });
}

export function useUpdateConsultant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateConsultantPayload }) =>
      consultancyApi.updateConsultant(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.consultants }),
  });
}

export function useDeleteConsultant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => consultancyApi.deleteConsultant(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.consultants }),
  });
}

// ── Labs ──────────────────────────────────────────────────────────────────────

export function useLabOptions() {
  return useQuery({ queryKey: KEYS.labs, queryFn: consultancyApi.listLabs });
}

// ── Assignments ───────────────────────────────────────────────────────────────

export function useAssignments(consultant_email?: string) {
  return useQuery({
    queryKey: [...KEYS.assignments, consultant_email],
    queryFn: () => consultancyApi.listAssignments(consultant_email),
  });
}

export function useCreateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAssignmentPayload) => consultancyApi.createAssignment(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.assignments }),
  });
}

export function useUpdateAssignmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: AssignmentStatus }) =>
      consultancyApi.updateAssignmentStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.assignments }),
  });
}

export function useDeleteAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => consultancyApi.deleteAssignment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.assignments }),
  });
}
