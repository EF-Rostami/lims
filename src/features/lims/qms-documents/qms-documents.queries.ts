import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  qmsDocumentsApi,
  type InternalDocumentCreate,
  type InternalDocumentUpdate,
  type InternalDocumentRevise,
} from "./qms-documents.api";

export const qmsAckKeys = {
  list: (docId: number) => ["lims", "qms-documents", docId, "acknowledgements"] as const,
};

export const qmsDocKeys = {
  all: ["lims", "qms-documents"] as const,
  list: () => [...qmsDocKeys.all, "list"] as const,
  detail: (id: number) => [...qmsDocKeys.all, "detail", id] as const,
  docTypes: () => ["lims", "qms-document-types"] as const,
};

export function useDocumentTypes() {
  return useQuery({
    queryKey: qmsDocKeys.docTypes(),
    queryFn: () => qmsDocumentsApi.listDocumentTypes(),
  });
}

export function useQmsDocuments() {
  return useQuery({
    queryKey: qmsDocKeys.list(),
    queryFn: () => qmsDocumentsApi.list(),
  });
}

export function useQmsDocument(id: number) {
  return useQuery({
    queryKey: qmsDocKeys.detail(id),
    queryFn: () => qmsDocumentsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateQmsDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InternalDocumentCreate) => qmsDocumentsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: qmsDocKeys.all }),
  });
}

export function useUpdateQmsDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InternalDocumentUpdate }) =>
      qmsDocumentsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: qmsDocKeys.all }),
  });
}

export function useReviseQmsDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InternalDocumentRevise }) =>
      qmsDocumentsApi.revise(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: qmsDocKeys.all }),
  });
}

export function useDocumentAcknowledgements(docId: number | null) {
  return useQuery({
    queryKey: qmsAckKeys.list(docId ?? 0),
    queryFn: () => qmsDocumentsApi.listAcknowledgements(docId!),
    enabled: !!docId,
  });
}

export function useAcknowledgeDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ docId, userId }: { docId: number; userId: number }) =>
      qmsDocumentsApi.acknowledge(docId, userId),
    onSuccess: (_, { docId }) => {
      qc.invalidateQueries({ queryKey: qmsAckKeys.list(docId) });
    },
  });
}
