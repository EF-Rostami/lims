// @/features/saas/provisioning/provisioning.api.ts
import { TenantProvisionRequest, TenantProvisionResponse } from "@/generated/saas/models";
import saasApi from "@/lib/saas-api";


export const provisioningApi = {
  /**
   * Triggers tenant schema isolation initialization routines inside the Control Plane.
   */
  provisionTenant: async (
    tenantId: string,
    payload: TenantProvisionRequest
  ): Promise<TenantProvisionResponse> => {
    const res = await saasApi.post<TenantProvisionResponse>(
      `/provisioning/tenants/${tenantId}`,
      payload
    );
    return res.data;
  },
};