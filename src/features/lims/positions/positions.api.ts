import { limsApi } from "@/lib/lims-api";
import type { components } from "@/generated/lims/api";

export type PositionRead = components["schemas"]["PositionRead"];
export type PositionCreate = components["schemas"]["PositionCreate"];
export type PositionUpdate = components["schemas"]["PositionUpdate"];
export type PositionTree = components["schemas"]["PositionTree"];

export const positionsApi = {
  list: async (): Promise<PositionRead[]> => {
    const res = await limsApi.get<PositionRead[]>("/positions/");
    return res.data;
  },

  hierarchy: async (): Promise<PositionTree[]> => {
    const res = await limsApi.get<PositionTree[]>("/positions/hierarchy");
    return res.data;
  },

  get: async (id: number): Promise<PositionRead> => {
    const res = await limsApi.get<PositionRead>(`/positions/${id}`);
    return res.data;
  },

  create: async (data: PositionCreate): Promise<PositionRead> => {
    const res = await limsApi.post<PositionRead>("/positions/", data);
    return res.data;
  },

  update: async (id: number, data: PositionUpdate): Promise<PositionRead> => {
    const res = await limsApi.patch<PositionRead>(`/positions/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await limsApi.delete(`/positions/${id}`);
  },
};
