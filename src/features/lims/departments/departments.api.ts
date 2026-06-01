import { limsApi } from "@/lib/lims-api";
import type { components } from "@/generated/lims/api";

export type DepartmentRead = components["schemas"]["DepartmentRead"];
export type DepartmentCreate = components["schemas"]["DepartmentCreate"];
export type DepartmentUpdate = components["schemas"]["DepartmentUpdate"];

export const departmentsApi = {
  list: async (): Promise<DepartmentRead[]> => {
    const res = await limsApi.get<DepartmentRead[]>("/departments/");
    return res.data;
  },

  tree: async (): Promise<DepartmentRead[]> => {
    const res = await limsApi.get<DepartmentRead[]>("/departments/tree");
    return res.data;
  },

  get: async (id: number): Promise<DepartmentRead> => {
    const res = await limsApi.get<DepartmentRead>(`/departments/${id}`);
    return res.data;
  },

  create: async (data: DepartmentCreate): Promise<DepartmentRead> => {
    const res = await limsApi.post<DepartmentRead>("/departments/", data);
    return res.data;
  },

  update: async (id: number, data: DepartmentUpdate): Promise<DepartmentRead> => {
    const res = await limsApi.patch<DepartmentRead>(`/departments/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await limsApi.delete(`/departments/${id}`);
  },
};
