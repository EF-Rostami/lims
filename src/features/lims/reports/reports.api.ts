import { limsApi, extractPage } from "@/lib/lims-api";
import type { components } from "@/generated/lims/api";

export type ReportRead = components["schemas"]["ReportRead"];
export type ReportCreate = components["schemas"]["ReportCreate"];
export type ReportStatus = components["schemas"]["ReportStatus"];

export interface ListReportsParams {
  status?: ReportStatus;
  order_id?: number;
}

export const reportsApi = {
  list: async (params?: ListReportsParams): Promise<ReportRead[]> => {
    const res = await limsApi.get("/reports", { params });
    return extractPage<ReportRead>(res.data);
  },

  get: async (id: number): Promise<ReportRead> => {
    const res = await limsApi.get<ReportRead>(`/reports/${id}`);
    return res.data;
  },

  create: async (data: ReportCreate): Promise<ReportRead> => {
    const res = await limsApi.post<ReportRead>("/reports", data);
    return res.data;
  },

  issue: async (id: number): Promise<ReportRead> => {
    const res = await limsApi.post<ReportRead>(`/reports/${id}/issue`);
    return res.data;
  },
};
