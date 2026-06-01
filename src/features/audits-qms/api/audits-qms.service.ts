// @ts-nocheck — QMS module pending backend_v3 migration
import apiClient from "@/lib/api-client";
import { handleApi } from "@/lib/handle-api";
import { AUDIT_ENDPOINTS, AuditListResponse, AuditFindingCreate, Audit } from "./audits-qms.types";
import type { ApiRequest, ApiResponse } from "@/lib/api-types";

export const auditService = {
  /** Main Audits **/
  async getAudits(params?: { skip?: number; limit?: number; audit_type?: string }) {
    const result = await handleApi(
      apiClient.get<AuditListResponse>(AUDIT_ENDPOINTS.list, { params })
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  async getAuditById(id: number) {
    const result = await handleApi(
      apiClient.get<ApiResponse<"/api/audits/{audit_id}", "get">>(AUDIT_ENDPOINTS.detail(id))
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result as Audit;
  },

  async createAudit(data: ApiRequest<"/api/audits", "post">) {
    const result = await handleApi(
      apiClient.post<ApiResponse<"/api/audits", "post">>(AUDIT_ENDPOINTS.create, data)
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  async updateAudit(id: number, data: ApiRequest<"/api/audits/{audit_id}", "put">, auditReason: string) {
    const result = await handleApi(
      apiClient.put<ApiResponse<"/api/audits/{audit_id}", "put">>(
        AUDIT_ENDPOINTS.update(id), 
        data,
        { headers: { "X-Audit-Reason": auditReason } }
      )
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  /** Findings **/
  async getFindings(auditId: number) {
    const result = await handleApi(
      apiClient.get<ApiResponse<"/api/audits/{audit_id}/findings", "get">>(AUDIT_ENDPOINTS.findings(auditId))
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  async createFinding(auditId: number, data: AuditFindingCreate) {
    const result = await handleApi(
      apiClient.post<ApiResponse<"/api/audits/{audit_id}/findings", "post">>(AUDIT_ENDPOINTS.findings(auditId), data)
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  }
};