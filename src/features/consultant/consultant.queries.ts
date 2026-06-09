import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  consultantApi,
  DocumentTypeCreate,
  DocumentTypeUpdate,
  InternalDocumentCreate,
} from "./consultant.api";

export const consultantKeys = {
  readiness: ["consultant", "readiness"] as const,
  employees: ["consultant", "employees"] as const,
  roles: ["consultant", "roles"] as const,
  permissions: ["consultant", "permissions"] as const,
  documentTypes: ["consultant", "document-types"] as const,
  documents: ["consultant", "documents"] as const,
};

export function useQMSReadiness() {
  return useQuery({
    queryKey: consultantKeys.readiness,
    queryFn: consultantApi.readiness,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
}

export function useEmployeeList() {
  return useQuery({
    queryKey: consultantKeys.employees,
    queryFn: consultantApi.listEmployees,
  });
}

export function useRolesList() {
  return useQuery({
    queryKey: consultantKeys.roles,
    queryFn: consultantApi.listRoles,
  });
}

export function usePermissionsList() {
  return useQuery({
    queryKey: consultantKeys.permissions,
    queryFn: consultantApi.listPermissions,
  });
}

export function useTogglePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      permissionCode,
      action,
    }: {
      roleId: number;
      permissionCode: string;
      action: "connect" | "disconnect";
    }) =>
      action === "connect"
        ? consultantApi.addPermissionToRole(roleId, permissionCode)
        : consultantApi.removePermissionFromRole(roleId, permissionCode),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: consultantKeys.roles });
    },
  });
}

export function useDocumentTypesList() {
  return useQuery({
    queryKey: consultantKeys.documentTypes,
    queryFn: consultantApi.listDocumentTypes,
  });
}

export function useCreateDocumentType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DocumentTypeCreate) => consultantApi.createDocumentType(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: consultantKeys.documentTypes });
      qc.invalidateQueries({ queryKey: consultantKeys.readiness });
    },
  });
}

export function useUpdateDocumentType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DocumentTypeUpdate }) =>
      consultantApi.updateDocumentType(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: consultantKeys.documentTypes });
    },
  });
}

export function useDeleteDocumentType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => consultantApi.deleteDocumentType(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: consultantKeys.documentTypes });
      qc.invalidateQueries({ queryKey: consultantKeys.readiness });
    },
  });
}

export function useDocumentsList() {
  return useQuery({
    queryKey: consultantKeys.documents,
    queryFn: consultantApi.listDocuments,
  });
}

export function useCreateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InternalDocumentCreate) => consultantApi.createDocument(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: consultantKeys.documents });
      qc.invalidateQueries({ queryKey: consultantKeys.readiness });
    },
  });
}
