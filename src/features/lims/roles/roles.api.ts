import { limsApi } from "@/lib/lims-api";
import type { components } from "@/generated/lims/api";

export type RoleRead = components["schemas"]["RoleRead"];
export type RoleType = components["schemas"]["RoleType"];

export const rolesApi = {
  list: async (): Promise<RoleRead[]> => {
    const res = await limsApi.get<RoleRead[]>("/roles");
    return res.data;
  },
};
