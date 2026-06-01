// @ts-nocheck — QMS module pending backend_v3 migration
import type { components } from "@/generated/saas/api";

export type TenantWorkspace =
  components["schemas"]["TenantDropdownSchema"];

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export const workspacesApi = {
  list: async (): Promise<TenantWorkspace[]> => {
    const res = await fetch(`${API_BASE}/api/v1/global/customers/workspaces`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Could not discover tenant workspaces.");
    }

    return res.json();
  },
};