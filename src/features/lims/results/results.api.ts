import { limsApi, extractPage } from "@/lib/lims-api";
import type { components } from "@/generated/lims/api";

export type ResultRead = components["schemas"]["ResultRead"];
export type ResultEnter = components["schemas"]["ResultEnter"];
export type ResultReject = components["schemas"]["ResultReject"];
export type ResultStatus = components["schemas"]["ResultStatus"];
export type ResultFlag = components["schemas"]["ResultFlag"];

export interface ListResultsParams {
  status?: ResultStatus;
  order_id?: number;
  order_item_id?: number;
  flag?: ResultFlag;
}

export const resultsApi = {
  list: async (params?: ListResultsParams): Promise<ResultRead[]> => {
    const res = await limsApi.get("/results", { params });
    return extractPage<ResultRead>(res.data);
  },

  get: async (id: number): Promise<ResultRead> => {
    const res = await limsApi.get<ResultRead>(`/results/${id}`);
    return res.data;
  },

  enter: async (id: number, data: ResultEnter): Promise<ResultRead> => {
    const res = await limsApi.post<ResultRead>(`/results/${id}/enter`, data);
    return res.data;
  },

  validate: async (id: number): Promise<ResultRead> => {
    const res = await limsApi.post<ResultRead>(`/results/${id}/validate`);
    return res.data;
  },

  approve: async (id: number): Promise<ResultRead> => {
    const res = await limsApi.post<ResultRead>(`/results/${id}/approve`);
    return res.data;
  },

  reject: async (id: number, data: ResultReject): Promise<ResultRead> => {
    const res = await limsApi.post<ResultRead>(`/results/${id}/reject`, data);
    return res.data;
  },
};
