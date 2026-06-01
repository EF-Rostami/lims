import { limsApi, extractPage } from "@/lib/lims-api";
import type { components } from "@/generated/lims/api";

export type TestMethodRead = components["schemas"]["TestMethodRead"];
export type TestMethodCreate = components["schemas"]["TestMethodCreate"];
export type TestMethodUpdate = components["schemas"]["TestMethodUpdate"];
export type MethodStatus = components["schemas"]["MethodStatus"];

export interface ListMethodsParams {
  status?: MethodStatus;
  active_only?: boolean;
}

export const methodsApi = {
  list: async (params?: ListMethodsParams): Promise<TestMethodRead[]> => {
    const res = await limsApi.get("/methods", { params });
    return extractPage<TestMethodRead>(res.data);
  },

  get: async (id: number): Promise<TestMethodRead> => {
    const res = await limsApi.get<TestMethodRead>(`/methods/${id}`);
    return res.data;
  },

  create: async (data: TestMethodCreate): Promise<TestMethodRead> => {
    const res = await limsApi.post<TestMethodRead>("/methods", data);
    return res.data;
  },

  update: async (id: number, data: TestMethodUpdate): Promise<TestMethodRead> => {
    const res = await limsApi.patch<TestMethodRead>(`/methods/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await limsApi.delete(`/methods/${id}`);
  },
};
