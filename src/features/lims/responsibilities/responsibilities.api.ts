import { limsApi } from "@/lib/lims-api";

export type ResponsibilityCategory = "general" | "management" | "technical" | "support" | "quality";

export interface ResponsibilityCreate {
  statement: string;
  category?: ResponsibilityCategory;
  iso_clause_reference?: string | null;
  is_an_authorization?: boolean;
}

export interface ResponsibilityUpdate {
  statement?: string;
  category?: ResponsibilityCategory;
  iso_clause_reference?: string | null;
  is_an_authorization?: boolean;
}

export interface ResponsibilityRead {
  id: number;
  statement: string;
  category: ResponsibilityCategory;
  iso_clause_reference: string | null;
  is_an_authorization: boolean;
}

export interface FunctionalRoleCreate {
  name: string;
  system_key?: string | null;
}

export interface FunctionalRoleRead {
  id: number;
  name: string;
  system_key: string | null;
}

export interface PositionResponsibilityCreate {
  responsibility_id: number;
  override_statement?: string | null;
  is_primary_duty?: boolean;
}

export interface PositionResponsibilityRead {
  id: number;
  position_id: number;
  responsibility_id: number;
  override_statement: string | null;
  is_primary_duty: boolean;
  responsibility_statement: string | null;
  responsibility_category: string | null;
  iso_clause_reference: string | null;
}

export interface EmployeeRoleCreate {
  functional_role_id: number;
}

export interface EmployeeRoleRead {
  id: number;
  employee_id: number;
  functional_role_id: number;
  role_name: string | null;
  role_system_key: string | null;
}

export const responsibilitiesApi = {
  // Responsibility library
  list: () => limsApi.get<ResponsibilityRead[]>("/responsibilities/").then(r => r.data),
  create: (data: ResponsibilityCreate) =>
    limsApi.post<ResponsibilityRead>("/responsibilities/", data).then(r => r.data),
  update: (id: number, data: ResponsibilityUpdate) =>
    limsApi.patch<ResponsibilityRead>(`/responsibilities/${id}`, data).then(r => r.data),
  delete: (id: number) => limsApi.delete(`/responsibilities/${id}`),

  // Functional roles
  listRoles: () => limsApi.get<FunctionalRoleRead[]>("/functional-roles/").then(r => r.data),
  createRole: (data: FunctionalRoleCreate) =>
    limsApi.post<FunctionalRoleRead>("/functional-roles/", data).then(r => r.data),
  deleteRole: (id: number) => limsApi.delete(`/functional-roles/${id}`),

  // Position responsibilities
  listForPosition: (positionId: number) =>
    limsApi.get<PositionResponsibilityRead[]>(`/positions/${positionId}/responsibilities`).then(r => r.data),
  assignToPosition: (positionId: number, data: PositionResponsibilityCreate) =>
    limsApi.post<PositionResponsibilityRead>(`/positions/${positionId}/responsibilities`, data).then(r => r.data),
  removeFromPosition: (positionId: number, linkId: number) =>
    limsApi.delete(`/positions/${positionId}/responsibilities/${linkId}`),

  // Employee roles
  listForEmployee: (employeeId: number) =>
    limsApi.get<EmployeeRoleRead[]>(`/employees/${employeeId}/roles`).then(r => r.data),
  assignToEmployee: (employeeId: number, data: EmployeeRoleCreate) =>
    limsApi.post<EmployeeRoleRead>(`/employees/${employeeId}/roles`, data).then(r => r.data),
  removeFromEmployee: (employeeId: number, linkId: number) =>
    limsApi.delete(`/employees/${employeeId}/roles/${linkId}`),
};
