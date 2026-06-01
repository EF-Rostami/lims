import { limsApi } from "@/lib/lims-api";
import type { components } from "@/generated/lims/api";

export type LabFileRead = components["schemas"]["LabFileRead"];
export type LabFileListItem = components["schemas"]["LabFileListItem"];
export type FileCategory = components["schemas"]["FileCategory"];

export interface ListFilesParams {
  category?: FileCategory;
  entity_type?: string;
  entity_id?: number;
}

export interface UploadFileParams {
  file: File;
  category: FileCategory;
  entity_type?: string;
  entity_id?: number;
  description?: string;
}

export const filesApi = {
  list: async (params?: ListFilesParams): Promise<LabFileListItem[]> => {
    const res = await limsApi.get<LabFileListItem[]>("/files", { params });
    return res.data;
  },

  get: async (id: number): Promise<LabFileRead> => {
    const res = await limsApi.get<LabFileRead>(`/files/${id}`);
    return res.data;
  },

  upload: async (params: UploadFileParams): Promise<LabFileRead> => {
    const form = new FormData();
    form.append("file", params.file);
    form.append("category", params.category);
    if (params.entity_type) form.append("entity_type", params.entity_type);
    if (params.entity_id) form.append("entity_id", String(params.entity_id));
    if (params.description) form.append("description", params.description);
    const res = await limsApi.post<LabFileRead>("/files", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await limsApi.delete(`/files/${id}`);
  },

  downloadUrl: (id: number) => `/files/${id}/download`,
};
