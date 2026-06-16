import { limsApi } from "@/lib/lims-api";

export interface DocumentTypeRead {
  id: number;
  name: string;
  prefix: string;
  description: string | null;
  can_create: string;
  can_verify: string;
  can_approve: string;
}

export interface InternalDocumentRead {
  id: number;
  title: string;
  system_id: string;
  status: string;
  document_type_id: number;
  version: string;
  revision_number: number;
  effective_date: string | null;
  review_due_date: string | null;
  supersedes_document_id: number | null;
  change_summary: string | null;
  assignments: { id: number; user_id: number; assignment_role: string; is_completed: boolean }[];
}

export interface InternalDocumentCreate {
  title: string;
  document_type_id: number;
  version?: string;
  effective_date?: string | null;
  review_due_date?: string | null;
  change_summary?: string | null;
  assignments?: { user_id: number; assignment_role: string }[];
}

export interface InternalDocumentUpdate {
  title?: string | null;
  effective_date?: string | null;
  review_due_date?: string | null;
  change_summary?: string | null;
}

export interface InternalDocumentRevise {
  version: string;
  change_summary: string;
  title?: string | null;
  effective_date?: string | null;
  review_due_date?: string | null;
  assignments?: { user_id: number; assignment_role: string }[];
}

export const qmsDocumentsApi = {
  listDocumentTypes: async (): Promise<DocumentTypeRead[]> => {
    const res = await limsApi.get<DocumentTypeRead[]>("/document-types");
    return res.data;
  },

  list: async (): Promise<InternalDocumentRead[]> => {
    const res = await limsApi.get<InternalDocumentRead[]>("/documents");
    return res.data;
  },

  get: async (id: number): Promise<InternalDocumentRead> => {
    const res = await limsApi.get<InternalDocumentRead>(`/documents/${id}`);
    return res.data;
  },

  create: async (data: InternalDocumentCreate): Promise<InternalDocumentRead> => {
    const res = await limsApi.post<InternalDocumentRead>("/documents", data);
    return res.data;
  },

  update: async (id: number, data: InternalDocumentUpdate): Promise<InternalDocumentRead> => {
    const res = await limsApi.patch<InternalDocumentRead>(`/documents/${id}`, data);
    return res.data;
  },

  revise: async (id: number, data: InternalDocumentRevise): Promise<InternalDocumentRead> => {
    const res = await limsApi.post<InternalDocumentRead>(`/documents/${id}/revise`, data);
    return res.data;
  },
};
