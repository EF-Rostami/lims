import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  delegationsApi, employeesApi,
  DelegationCreate, DelegationUpdate, EmployeeUpdate, EmployeePositionCreate,
} from "./employees.api";

const KEYS = {
  employees: (params?: object) => ["employees", params] as const,
  employee: (id: number) => ["employees", id] as const,
  delegations: (params?: object) => ["delegations", params] as const,
};

// ── Employees ─────────────────────────────────────────────────────────────────

export function useEmployees(params?: { department_id?: number }) {
  return useQuery({
    queryKey: KEYS.employees(params),
    queryFn: () => employeesApi.list(params),
  });
}

export function useEmployee(id: number) {
  return useQuery({
    queryKey: KEYS.employee(id),
    queryFn: () => employeesApi.get(id),
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EmployeeUpdate }) =>
      employeesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useAssignPosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, data }: { employeeId: number; data: EmployeePositionCreate }) =>
      employeesApi.assignPosition(employeeId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useRemovePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, linkId }: { employeeId: number; linkId: number }) =>
      employeesApi.removePosition(employeeId, linkId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

// ── Delegations ───────────────────────────────────────────────────────────────

export function useDelegations(params?: { employee_id?: number }) {
  return useQuery({
    queryKey: KEYS.delegations(params),
    queryFn: () => delegationsApi.list(params),
  });
}

export function useCreateDelegation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DelegationCreate) => delegationsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delegations"] }),
  });
}

export function useUpdateDelegation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DelegationUpdate }) =>
      delegationsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delegations"] }),
  });
}

export function useActivateDelegation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => delegationsApi.activate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delegations"] }),
  });
}

export function useRevokeDelegation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => delegationsApi.revoke(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delegations"] }),
  });
}

export function useDeleteDelegation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => delegationsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delegations"] }),
  });
}
