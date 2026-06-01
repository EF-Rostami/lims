// @ts-nocheck — pending migration to features/lims/ pattern
import apiClient from "@/lib/api-client";
import { handleApi } from "@/lib/handle-api";
import type { ApiRequest, ApiResponse } from "@/lib/api-types";
import { INTERNAL_DOCUMENT_ENDPOINTS } from "./internalDocument.types";
import { Schema } from "@/types/api-types";

export const internalDocumentService = {

  // GET /api/documents/internal
  getInternalDocuments(status?: string) {
    return handleApi(
      apiClient.get<ApiResponse<"/api/documents/internal", "get">>(
        INTERNAL_DOCUMENT_ENDPOINTS.list,
        { params: status ? { status } : undefined }
      )
    );
  },

  getMyTasks() {
    return handleApi(
      apiClient.get<ApiResponse<"/api/documents/internal/my-tasks", "get">>(
        INTERNAL_DOCUMENT_ENDPOINTS.myTasks
      )
    );
  },

  getDocument(id: number) {
    return handleApi(
      apiClient.get<ApiResponse<"/api/documents/internal/{doc_id}", "get">>(
        INTERNAL_DOCUMENT_ENDPOINTS.get(id)
      )
    ) as Promise<Schema["InternalDocumentRead"]>;
  },

  createDraft(data: ApiRequest<"/api/documents/internal", "post">) {
    return handleApi(
      apiClient.post<ApiResponse<"/api/documents/internal", "post">>(
        INTERNAL_DOCUMENT_ENDPOINTS.create,
        data
      )
    );
  },

  submitDocument(id: number) {
    return handleApi(
      apiClient.post<ApiResponse<"/api/documents/internal/{doc_id}/submit", "post">>(
        INTERNAL_DOCUMENT_ENDPOINTS.submit(id)
      )
    );
  },

  verifyDocument(id: number, sig: Schema["SignatureCreate"]) {
    return handleApi(
      apiClient.post<ApiResponse<"/api/documents/internal/{doc_id}/verify", "post">>(
        INTERNAL_DOCUMENT_ENDPOINTS.verify(id),
        sig
      )
    );
  },

  approveDocument(id: number, sig: Schema["SignatureCreate"]) {
    return handleApi(
      apiClient.post<ApiResponse<"/api/documents/internal/{doc_id}/approve", "post">>(
        INTERNAL_DOCUMENT_ENDPOINTS.approve(id),
        sig
      )
    );
  },

  rejectDocument(id: number, sig: Schema["SignatureReject"]) {
    return handleApi(
      apiClient.post<ApiResponse<"/api/documents/internal/{doc_id}/reject", "post">>(
        INTERNAL_DOCUMENT_ENDPOINTS.reject(id),
        sig
      )
    );
  },

  reviseDocument(id: number) {
    return handleApi(
      apiClient.post<ApiResponse<"/api/documents/internal/{doc_id}/revise", "post">>(
        INTERNAL_DOCUMENT_ENDPOINTS.revise(id)
      )
    );
  },

  uploadDocumentFile(id: number, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return handleApi(
      apiClient.post<ApiResponse<"/api/documents/internal/{doc_id}/upload", "post">>(
        INTERNAL_DOCUMENT_ENDPOINTS.upload(id),
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )
    );
  },

  downloadDocument(id: number) {
    return handleApi(
      apiClient.get<Blob>(
        INTERNAL_DOCUMENT_ENDPOINTS.download(id),
        { responseType: "blob" }
      )
    );
  },

  // updateContent(id: number, content: string) {
  //   return handleApi(
  //     apiClient.patch<ApiResponse<"/api/documents/internal/{doc_id}/content", "patch">>(
  //       INTERNAL_DOCUMENT_ENDPOINTS.content(id),
  //       { content }
  //     )
  //   );
  // },

  viewDocument(id: number) {
    return handleApi(
      apiClient.get<ApiResponse<"/api/documents/internal/{doc_id}/view", "get">>(
        INTERNAL_DOCUMENT_ENDPOINTS.view(id)
      )
    );
  },

  confirmRead(id: number) {
    return handleApi(
      apiClient.post<ApiResponse<"/api/documents/internal/{doc_id}/confirm-read", "post">>(
        INTERNAL_DOCUMENT_ENDPOINTS.confirmRead(id)
      )
    );
  },

  getAssignments(id: number) {
    return handleApi(
      apiClient.get<ApiResponse<"/api/documents/internal/{doc_id}/assignments", "get">>(
        INTERNAL_DOCUMENT_ENDPOINTS.assignments(id)
      )
    );
  },

  assignWorkflow(id: number, data: Schema["WorkflowAssignmentCreate"][]) {
    return handleApi(
      apiClient.post<ApiResponse<"/api/documents/internal/{doc_id}/assign-workflow", "post">>(
        INTERNAL_DOCUMENT_ENDPOINTS.assignWorkflow(id),
        data
      )
    );
  },

  listDocumentTypes() {
    return handleApi(
      apiClient.get<ApiResponse<"/api/documents/internal/config/types", "get">>(
        INTERNAL_DOCUMENT_ENDPOINTS.configTypes
      )
    );
  },

  createDocumentType(data: Schema["DocumentTypeCreate"]) {
    return handleApi(
      apiClient.post<ApiResponse<"/api/documents/internal/config/types", "post">>(
        INTERNAL_DOCUMENT_ENDPOINTS.configTypes,
        data
      )
    );
  },

  updateDocumentType(id: number, data: Partial<Schema["DocumentTypeUpdate"]>) {
    return handleApi(
      apiClient.patch<ApiResponse<"/api/documents/internal/config/types/{type_id}", "patch">>(
        INTERNAL_DOCUMENT_ENDPOINTS.configTypeDetail(id), // Using Detail/Update endpoint
        data
      )
    );
  },

  deleteDocumentType(id: number) {
    return handleApi(
      apiClient.delete<ApiResponse<"/api/documents/internal/config/types/{type_id}", "delete">>(
        INTERNAL_DOCUMENT_ENDPOINTS.configTypeDetail(id)
      )
    );
  },




};