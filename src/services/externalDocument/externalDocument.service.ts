// @ts-nocheck — pending migration to features/lims/ pattern
import apiClient from "@/lib/api-client";
import { handleApi } from "@/lib/handle-api";
import type { ApiRequest, ApiResponse } from "@/lib/api-types";
import { EXTERNAL_DOCUMENT_ENDPOINTS } from "./externalDocument.types";


export const externalDocumentService = {

  /**
   * GET /api/documents/external
   */
  getExternalDocuments() {
    return handleApi(
      apiClient.get<ApiResponse<"/api/documents/external", "get">>(
        EXTERNAL_DOCUMENT_ENDPOINTS.list
      )
    );
  },

  /**
   * POST /api/documents/external
   */
  createExternalDocument(
    data: ApiRequest<"/api/documents/external", "post">
  ) {
    return handleApi(
      apiClient.post<ApiResponse<"/api/documents/external", "post">>(
        EXTERNAL_DOCUMENT_ENDPOINTS.create,
        data
      )
    );
  },

  /**
   * GET /api/documents/external/overdue
   */
  getOverdueExternalDocuments() {
    return handleApi(
      apiClient.get<ApiResponse<"/api/documents/external/overdue", "get">>(
        EXTERNAL_DOCUMENT_ENDPOINTS.overdue
      )
    );
  },

  /**
   * POST /api/documents/external/{doc_id}/mark-reviewed
   */
  markExternalDocumentReviewed(id: number) {
    return handleApi(
      apiClient.post<
        ApiResponse<"/api/documents/external/{doc_id}/mark-reviewed", "post">
      >(EXTERNAL_DOCUMENT_ENDPOINTS.markReviewed(id))
    ) as Promise<{ message: string }>;
  },
};