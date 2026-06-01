import { limsApi, extractPage } from "@/lib/lims-api";
import type { components } from "@/generated/lims/api";

export type SampleRead = components["schemas"]["SampleRead"];
export type SampleCreate = components["schemas"]["SampleCreate"];
export type SampleUpdate = components["schemas"]["SampleUpdate"];
export type SampleReceive = components["schemas"]["SampleReceive"];
export type SampleReject = components["schemas"]["SampleReject"];
export type SampleStatus = components["schemas"]["SampleStatus"];
export type SampleTypeRead = components["schemas"]["SampleTypeRead"];
export type CustodyEventRead = components["schemas"]["CustodyEventRead"];

export interface ListSamplesParams {
  status?: SampleStatus;
  client_id?: number;
  sample_type_id?: number;
}

export const samplesApi = {
  listTypes: async (): Promise<SampleTypeRead[]> => {
    const res = await limsApi.get<SampleTypeRead[]>("/samples/types");
    return res.data;
  },

  list: async (params?: ListSamplesParams): Promise<SampleRead[]> => {
    const res = await limsApi.get("/samples", { params });
    return extractPage<SampleRead>(res.data);
  },

  get: async (id: number): Promise<SampleRead> => {
    const res = await limsApi.get<SampleRead>(`/samples/${id}`);
    return res.data;
  },

  create: async (data: SampleCreate): Promise<SampleRead> => {
    const res = await limsApi.post<SampleRead>("/samples", data);
    return res.data;
  },

  update: async (id: number, data: SampleUpdate): Promise<SampleRead> => {
    const res = await limsApi.patch<SampleRead>(`/samples/${id}`, data);
    return res.data;
  },

  receive: async (id: number, data: SampleReceive): Promise<SampleRead> => {
    const res = await limsApi.post<SampleRead>(`/samples/${id}/receive`, data);
    return res.data;
  },

  reject: async (id: number, data: SampleReject): Promise<SampleRead> => {
    const res = await limsApi.post<SampleRead>(`/samples/${id}/reject`, data);
    return res.data;
  },

  getCustody: async (id: number): Promise<CustodyEventRead[]> => {
    const res = await limsApi.get<CustodyEventRead[]>(`/samples/${id}/custody`);
    return res.data;
  },
};
