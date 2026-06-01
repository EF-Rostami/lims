import apiClient from "@/lib/api-client";
import { handleApi } from "@/lib/handle-api";
import { 
  ACTION_ENDPOINTS, 
  ActionItem, 
  ActionItemCreate, 
  ActionItemUpdate, 
  ActionItemVerification 
} from "./action-items.types";

export const actionService = {
  /**
   * GET /api/actions
   * Supports filtering by nc_id or status
   */
  async getActions(params?: { nc_id?: number; audit_id?: number; status?: string }) {
    const result = await handleApi(
      apiClient.get<ActionItem[]>(ACTION_ENDPOINTS.base, { params })
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  /**
   * POST /api/actions
   */
  async createAction(data: ActionItemCreate) {
    const result = await handleApi(
      apiClient.post<ActionItem>(ACTION_ENDPOINTS.base, data)
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  /**
   * PATCH /api/actions/{id}/complete
   */
  async completeAction(id: number, data: ActionItemUpdate, auditReason: string) {
    const result = await handleApi(
      apiClient.patch<ActionItem>(
        ACTION_ENDPOINTS.complete(id),
        data,
        { headers: { "X-Audit-Reason": auditReason } }
      )
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  },

  /**
   * POST /api/actions/{id}/verify
   */
  async verifyAction(id: number, data: ActionItemVerification, auditReason: string) {
    const result = await handleApi(
      apiClient.post<ActionItem>(
        ACTION_ENDPOINTS.verify(id),
        data,
        { headers: { "X-Audit-Reason": auditReason } }
      )
    );
    if (result && typeof result === "object" && "detail" in result) throw result;
    return result;
  }
};