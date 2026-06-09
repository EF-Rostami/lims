import { limsApi } from "@/lib/lims-api";
import type { components } from "@/generated/lims/api";

// ---- Types from generated schema ----
export type RoleRead = components["schemas"]["RoleRead"];
export type PermissionRead = components["schemas"]["PermissionRead"];
export type EmployeeRead = {
  id: number;
  user_id: number;
  employee_id_number: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  roles: string[];
  primary_position: string | null;
  primary_department: string | null;
};

export type QMSReadiness = {
  step0: boolean;
  step1: boolean;
  step2: boolean;
  step3: boolean;
  step4: boolean;
  overall_progress: number;
};

export type DocumentTypeRead = {
  id: number;
  name: string;
  prefix: string;
  description: string | null;
  can_create: string;
  can_verify: string;
  can_approve: string;
};

export type DocumentTypeCreate = {
  name: string;
  prefix: string;
  description?: string;
  can_create?: string;
  can_verify?: string;
  can_approve?: string;
};

export type DocumentTypeUpdate = Partial<DocumentTypeCreate>;

export type DocumentAssignmentRead = {
  id: number;
  user_id: number;
  assignment_role: string;
  is_completed: boolean;
};

export type InternalDocumentRead = {
  id: number;
  title: string;
  system_id: string;
  status: string;
  document_type_id: number;
  assignments: DocumentAssignmentRead[];
};

export type InternalDocumentCreate = {
  title: string;
  document_type_id: number;
  assignments: { user_id: number; assignment_role: string }[];
};

// ---- API functions ----

export const consultantApi = {
  // QMS readiness
  readiness: async (): Promise<QMSReadiness> => {
    const res = await limsApi.get<QMSReadiness>("/admin/readiness");
    return res.data;
  },

  // Employees (rich list)
  listEmployees: async (): Promise<EmployeeRead[]> => {
    const res = await limsApi.get<EmployeeRead[]>("/employees");
    return res.data;
  },

  // Roles + Permissions matrix
  listRoles: async (): Promise<RoleRead[]> => {
    const res = await limsApi.get<RoleRead[]>("/roles");
    return res.data;
  },

  listPermissions: async (): Promise<PermissionRead[]> => {
    const res = await limsApi.get<PermissionRead[]>("/permissions");
    return res.data;
  },

  addPermissionToRole: async (roleId: number, permissionCode: string): Promise<void> => {
    await limsApi.post(`/roles/${roleId}/permissions/${permissionCode}`);
  },

  removePermissionFromRole: async (roleId: number, permissionCode: string): Promise<void> => {
    await limsApi.delete(`/roles/${roleId}/permissions/${permissionCode}`);
  },

  // Document Types
  listDocumentTypes: async (): Promise<DocumentTypeRead[]> => {
    const res = await limsApi.get<DocumentTypeRead[]>("/document-types");
    return res.data;
  },

  createDocumentType: async (data: DocumentTypeCreate): Promise<DocumentTypeRead> => {
    const res = await limsApi.post<DocumentTypeRead>("/document-types", data);
    return res.data;
  },

  updateDocumentType: async (id: number, data: DocumentTypeUpdate): Promise<DocumentTypeRead> => {
    const res = await limsApi.patch<DocumentTypeRead>(`/document-types/${id}`, data);
    return res.data;
  },

  deleteDocumentType: async (id: number): Promise<void> => {
    await limsApi.delete(`/document-types/${id}`);
  },

  // Internal Documents
  listDocuments: async (): Promise<InternalDocumentRead[]> => {
    const res = await limsApi.get<InternalDocumentRead[]>("/documents");
    return res.data;
  },

  createDocument: async (data: InternalDocumentCreate): Promise<InternalDocumentRead> => {
    const res = await limsApi.post<InternalDocumentRead>("/documents", data);
    return res.data;
  },
};
