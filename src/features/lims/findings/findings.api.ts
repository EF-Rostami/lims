import { limsApi, extractPage } from "@/lib/lims-api";
import type { components } from "@/generated/lims/api";

export type FindingRead = components["schemas"]["FindingRead"];
export type FindingCreate = components["schemas"]["FindingCreate"];
export type FindingUpdate = components["schemas"]["FindingUpdate"];
export type FindingResolve = components["schemas"]["FindingResolve"];
export type FindingStatus = components["schemas"]["FindingStatus"];
export type FindingSeverity = components["schemas"]["FindingSeverity"];

export interface ListFindingsParams {
  status?: FindingStatus;
  severity?: FindingSeverity;
  assigned_to_user_id?: number;
}

export const findingsApi = {
  list: async (params?: ListFindingsParams): Promise<FindingRead[]> => {
    const res = await limsApi.get("/findings", { params });
    return extractPage<FindingRead>(res.data);
  },

  get: async (id: number): Promise<FindingRead> => {
    const res = await limsApi.get<FindingRead>(`/findings/${id}`);
    return res.data;
  },

  create: async (data: FindingCreate): Promise<FindingRead> => {
    const res = await limsApi.post<FindingRead>("/findings", data);
    return res.data;
  },

  update: async (id: number, data: FindingUpdate): Promise<FindingRead> => {
    const res = await limsApi.patch<FindingRead>(`/findings/${id}`, data);
    return res.data;
  },

  resolve: async (id: number, data: FindingResolve): Promise<FindingRead> => {
    const res = await limsApi.post<FindingRead>(`/findings/${id}/resolve`, data);
    return res.data;
  },
};
