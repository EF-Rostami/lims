/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { internalDocumentService } from "./internalDocument.service";
import type { Schema } from "@/types/api-types";


type InternalDocument = Schema["InternalDocumentRead"];
type InternalDocumentCreate = Schema["InternalDocumentCreate"];
type SignatureCreate = Schema["SignatureCreate"];
type SignatureReject = Schema["SignatureReject"];
type WorkflowAssignmentCreate = Schema["WorkflowAssignmentCreate"];
type DocumentTypeCreate = Schema["DocumentTypeCreate"];

export const internalDocumentQueryKeys = {
  all: ["internal-documents"] as const,
  myTasks: ["internal-documents", "my-tasks"] as const,
  types: ["internal-documents", "types"] as const,
};

export function useListInternalDocuments(status?: string) {
  return useQuery<InternalDocument[]>({
    // FLATTEN THIS: from [[...], status] to [... , status]
    queryKey: [internalDocumentQueryKeys.all, status].filter(Boolean),
    queryFn: async () => {
      const data = await internalDocumentService.getInternalDocuments(status);
      return data as InternalDocument[];
    },
  });
}

export function useMyTasks() {
  return useQuery<InternalDocument[]>({
    queryKey: internalDocumentQueryKeys.myTasks,
    queryFn: internalDocumentService.getMyTasks,
  });
}

export function useCreateDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InternalDocumentCreate) =>
      internalDocumentService.createDraft(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: internalDocumentQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: internalDocumentQueryKeys.myTasks });
    },
  });
}

export function useSubmitDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => internalDocumentService.submitDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: internalDocumentQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: internalDocumentQueryKeys.myTasks });
    },
  });
}

export function useVerifyDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: number; sig: SignatureCreate }) =>
      internalDocumentService.verifyDocument(payload.id, payload.sig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: internalDocumentQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: internalDocumentQueryKeys.myTasks });
    },
  });
}

export function useApproveDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: number; sig: SignatureCreate }) =>
      internalDocumentService.approveDocument(payload.id, payload.sig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: internalDocumentQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: internalDocumentQueryKeys.myTasks });
    },
  });
}

export function useRejectDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: number; sig: SignatureReject }) =>
      internalDocumentService.rejectDocument(payload.id, payload.sig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: internalDocumentQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: internalDocumentQueryKeys.myTasks });
    },
  });
}

export function useReviseDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => internalDocumentService.reviseDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: internalDocumentQueryKeys.all });
    },
  });
}

export function useUploadDocumentFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: number; file: File }) =>
      internalDocumentService.uploadDocumentFile(payload.id, payload.file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: internalDocumentQueryKeys.all });
    },
  });
}

// export function useUpdateContent() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (payload: { id: number; content: string }) =>
//       internalDocumentService.updateContent(payload.id, payload.content),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: internalDocumentQueryKeys.all });
//     },
//   });
// }

export function useViewDocument(id: number) {
  return useQuery<InternalDocument>({
    queryKey: ["internal-documents", "view", id],
    // Add "as Promise<InternalDocument>" to satisfy the generic requirement
    queryFn: () => internalDocumentService.viewDocument(id) as Promise<InternalDocument>,
    enabled: !!id, 
  });
}

export function useConfirmRead(docId: number) { // Pass ID if available
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => internalDocumentService.confirmRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internal-documents", "view", docId] });
    },
  });
}

export function useDocumentAssignments(id: number) {
  return useQuery({
    queryKey: ["internal-documents", id, "assignments"],
    queryFn: () => internalDocumentService.getAssignments(id),
    enabled: !!id,
  });
}

export function useAssignWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: number; assignments: WorkflowAssignmentCreate[] }) =>
      internalDocumentService.assignWorkflow(payload.id, payload.assignments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: internalDocumentQueryKeys.all });
    },
  });
}

export function useDocumentTypes() {
  return useQuery({
    queryKey: internalDocumentQueryKeys.types,
    queryFn: internalDocumentService.listDocumentTypes,
  });
}

export function useCreateDocumentType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DocumentTypeCreate) =>
      internalDocumentService.createDocumentType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: internalDocumentQueryKeys.types });
    },
  });
}

import { toast } from "sonner"; // or your preferred toast library

export function useUpdateDocumentType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      internalDocumentService.updateDocumentType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: internalDocumentQueryKeys.types });
      toast.success("Category updated successfully");
    },
    onError: () => {
      toast.error("Failed to update category");
    }
  });
}

export function useDeleteDocumentType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => 
      internalDocumentService.deleteDocumentType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: internalDocumentQueryKeys.types });
      toast.success("Category removed from system");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Could not delete category");
    }
  });
}