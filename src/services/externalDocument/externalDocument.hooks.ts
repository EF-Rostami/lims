import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { externalDocumentService } from "./externalDocument.service";
import type { Schema } from "@/types/api-types";

type ExternalDocument = Schema["ExternalDocumentRead"];
type ExternalDocumentCreate = Schema["ExternalDocumentCreate"];

export const externalDocumentQueryKeys = {
  all: ["external-documents"] as const,
  overdue: ["external-documents", "overdue"] as const,
};

export function useListExternalDocuments() {
  return useQuery<ExternalDocument[]>({
    queryKey: externalDocumentQueryKeys.all,
    queryFn: externalDocumentService.getExternalDocuments,
  });
}

export function useOverdueExternalDocuments() {
  return useQuery<ExternalDocument[]>({
    queryKey: externalDocumentQueryKeys.overdue,
    queryFn: externalDocumentService.getOverdueExternalDocuments,
  });
}

export function useCreateExternalDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExternalDocumentCreate) =>
      externalDocumentService.createExternalDocument(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: externalDocumentQueryKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: externalDocumentQueryKeys.overdue,
      });
    },
  });
}

export function useMarkExternalDocumentReviewed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      externalDocumentService.markExternalDocumentReviewed(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: externalDocumentQueryKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: externalDocumentQueryKeys.overdue,
      });
    },
  });
}