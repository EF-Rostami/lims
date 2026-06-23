import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { responsibilitiesApi } from "./responsibilities.api";
import type {
  EmployeeRoleCreate,
  FunctionalRoleCreate,
  PositionResponsibilityCreate,
  ResponsibilityCreate,
  ResponsibilityUpdate,
} from "./responsibilities.api";

const keys = {
  responsibilities: ["responsibilities"] as const,
  roles: ["functional-roles"] as const,
  positionResponsibilities: (positionId: number) =>
    ["position-responsibilities", positionId] as const,
  employeeRoles: (employeeId: number) => ["employee-roles", employeeId] as const,
};

// ── Responsibilities ──────────────────────────────────────────────────────────

export function useResponsibilities() {
  return useQuery({
    queryKey: keys.responsibilities,
    queryFn: responsibilitiesApi.list,
  });
}

export function useCreateResponsibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ResponsibilityCreate) => responsibilitiesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.responsibilities }),
  });
}

export function useUpdateResponsibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ResponsibilityUpdate }) =>
      responsibilitiesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.responsibilities }),
  });
}

export function useDeleteResponsibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => responsibilitiesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.responsibilities }),
  });
}

// ── Functional Roles ──────────────────────────────────────────────────────────

export function useFunctionalRoles() {
  return useQuery({
    queryKey: keys.roles,
    queryFn: responsibilitiesApi.listRoles,
  });
}

export function useCreateFunctionalRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FunctionalRoleCreate) => responsibilitiesApi.createRole(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.roles }),
  });
}

export function useDeleteFunctionalRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => responsibilitiesApi.deleteRole(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.roles }),
  });
}

// ── Position Responsibilities ─────────────────────────────────────────────────

export function usePositionResponsibilities(positionId: number | null) {
  return useQuery({
    queryKey: keys.positionResponsibilities(positionId ?? 0),
    queryFn: () => responsibilitiesApi.listForPosition(positionId!),
    enabled: positionId !== null,
  });
}

export function useAssignPositionResponsibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      positionId,
      data,
    }: {
      positionId: number;
      data: PositionResponsibilityCreate;
    }) => responsibilitiesApi.assignToPosition(positionId, data),
    onSuccess: (_, { positionId }) =>
      qc.invalidateQueries({ queryKey: keys.positionResponsibilities(positionId) }),
  });
}

export function useRemovePositionResponsibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      positionId,
      linkId,
    }: {
      positionId: number;
      linkId: number;
    }) => responsibilitiesApi.removeFromPosition(positionId, linkId),
    onSuccess: (_, { positionId }) =>
      qc.invalidateQueries({ queryKey: keys.positionResponsibilities(positionId) }),
  });
}

// ── Employee Roles ────────────────────────────────────────────────────────────

export function useEmployeeRoles(employeeId: number | null) {
  return useQuery({
    queryKey: keys.employeeRoles(employeeId ?? 0),
    queryFn: () => responsibilitiesApi.listForEmployee(employeeId!),
    enabled: employeeId !== null,
  });
}

export function useAssignEmployeeRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      data,
    }: {
      employeeId: number;
      data: EmployeeRoleCreate;
    }) => responsibilitiesApi.assignToEmployee(employeeId, data),
    onSuccess: (_, { employeeId }) =>
      qc.invalidateQueries({ queryKey: keys.employeeRoles(employeeId) }),
  });
}

export function useRemoveEmployeeRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      linkId,
    }: {
      employeeId: number;
      linkId: number;
    }) => responsibilitiesApi.removeFromEmployee(employeeId, linkId),
    onSuccess: (_, { employeeId }) =>
      qc.invalidateQueries({ queryKey: keys.employeeRoles(employeeId) }),
  });
}
