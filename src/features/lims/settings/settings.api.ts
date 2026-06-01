import { limsApi } from "@/lib/lims-api";
import type { components } from "@/generated/lims/api";

export type SettingRead = components["schemas"]["SettingRead"];
export type SettingCreate = components["schemas"]["SettingCreate"];
export type SettingUpdate = components["schemas"]["SettingUpdate"];
export type SettingListItem = components["schemas"]["SettingListItem"];

export const settingsApi = {
  list: async (): Promise<SettingListItem[]> => {
    const res = await limsApi.get<SettingListItem[]>("/settings");
    return res.data;
  },

  get: async (key: string): Promise<SettingRead> => {
    const res = await limsApi.get<SettingRead>(`/settings/${key}`);
    return res.data;
  },

  create: async (data: SettingCreate): Promise<SettingRead> => {
    const res = await limsApi.post<SettingRead>("/settings", data);
    return res.data;
  },

  update: async (key: string, data: SettingUpdate): Promise<SettingRead> => {
    const res = await limsApi.put<SettingRead>(`/settings/${key}`, data);
    return res.data;
  },

  delete: async (key: string): Promise<void> => {
    await limsApi.delete(`/settings/${key}`);
  },
};
