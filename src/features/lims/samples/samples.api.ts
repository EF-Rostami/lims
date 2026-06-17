import { limsApi, extractPage } from "@/lib/lims-api";
import type { components } from "@/generated/lims/api";

export type SampleCondition =
  | "GOOD" | "ACCEPTABLE" | "DAMAGED" | "COMPROMISED"
  | "HAEMOLYSED" | "LIPAEMIC" | "ICTERIC";

export type SampleRead = components["schemas"]["SampleRead"] & {
  storage_location_id?: number | null;
  position_label?: string | null;
  received_condition?: SampleCondition | null;
  receipt_discrepancies?: string | null;
  disposed_at?: string | null;
  disposal_reason?: string | null;
  disposed_by_user_id?: number | null;
};
export type SampleCreate = components["schemas"]["SampleCreate"];
export type SampleUpdate = components["schemas"]["SampleUpdate"];

export interface SampleReceive {
  received_at?: string | null;
  received_condition?: SampleCondition | null;
  receipt_discrepancies?: string | null;
  notes?: string | null;
}

export interface SampleDispose {
  disposal_reason: string;
}

export type SampleReject = components["schemas"]["SampleReject"];
export type SampleStatus = components["schemas"]["SampleStatus"];
export type SampleTypeRead = components["schemas"]["SampleTypeRead"] & {
  special_instructions?: string | null;
};
export type CustodyEventRead = components["schemas"]["CustodyEventRead"];

export interface SampleTypeCreate {
  name: string;
  code: string;
  description?: string | null;
  container_type?: string | null;
  stability_hours?: number | null;
  special_instructions?: string | null;
  is_active?: boolean;
}
export type SampleTypeUpdate = Partial<SampleTypeCreate>;

export type LocationType =
  | "ROOM" | "FREEZER" | "REFRIGERATOR" | "CABINET"
  | "RACK" | "SHELF" | "BOX" | "POSITION";

export interface StorageLocation {
  id: number;
  name: string;
  code: string | null;
  location_type: LocationType;
  parent_id: number | null;
  description: string | null;
  temperature_min: number | null;
  temperature_max: number | null;
  capacity: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type StorageLocationCreate = Omit<StorageLocation, "id" | "created_at" | "updated_at">;
export type StorageLocationUpdate = Partial<StorageLocationCreate>;

export interface StorageAssignment {
  id: number;
  sample_id: number;
  location_id: number;
  position_label: string | null;
  stored_at: string;
  stored_by_user_id: number | null;
  removed_at: string | null;
  removed_by_user_id: number | null;
  notes: string | null;
  location: StorageLocation | null;
}

export interface StorageAssignCreate {
  location_id: number;
  position_label?: string | null;
  notes?: string | null;
}

export interface ListSamplesParams {
  status?: SampleStatus;
  client_id?: number;
  location_id?: number;
}

export const samplesApi = {
  listTypes: async (activeOnly = true): Promise<SampleTypeRead[]> => {
    const res = await limsApi.get<SampleTypeRead[]>("/samples/types", {
      params: { active_only: activeOnly },
    });
    return res.data;
  },

  createType: async (data: SampleTypeCreate): Promise<SampleTypeRead> => {
    const res = await limsApi.post<SampleTypeRead>("/samples/types", data);
    return res.data;
  },

  updateType: async (id: number, data: SampleTypeUpdate): Promise<SampleTypeRead> => {
    const res = await limsApi.patch<SampleTypeRead>(`/samples/types/${id}`, data);
    return res.data;
  },

  deleteType: async (id: number): Promise<void> => {
    await limsApi.delete(`/samples/types/${id}`);
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

  dispose: async (id: number, data: SampleDispose): Promise<SampleRead> => {
    const res = await limsApi.post<SampleRead>(`/samples/${id}/dispose`, data);
    return res.data;
  },

  getCustody: async (id: number): Promise<CustodyEventRead[]> => {
    const res = await limsApi.get<CustodyEventRead[]>(`/samples/${id}/custody`);
    return res.data;
  },

  assignStorage: async (id: number, data: StorageAssignCreate): Promise<SampleRead> => {
    const res = await limsApi.post<SampleRead>(`/samples/${id}/assign-storage`, data);
    return res.data;
  },

  removeStorage: async (id: number): Promise<SampleRead> => {
    const res = await limsApi.post<SampleRead>(`/samples/${id}/remove-storage`, {});
    return res.data;
  },

  getStorageHistory: async (id: number): Promise<StorageAssignment[]> => {
    const res = await limsApi.get<StorageAssignment[]>(`/samples/${id}/storage-history`);
    return res.data;
  },

  // Storage Locations
  listStorageLocations: async (): Promise<StorageLocation[]> => {
    const res = await limsApi.get<StorageLocation[]>("/samples/storage-locations");
    return res.data;
  },

  getStorageLocation: async (id: number): Promise<StorageLocation> => {
    const res = await limsApi.get<StorageLocation>(`/samples/storage-locations/${id}`);
    return res.data;
  },

  createStorageLocation: async (data: StorageLocationCreate): Promise<StorageLocation> => {
    const res = await limsApi.post<StorageLocation>("/samples/storage-locations", data);
    return res.data;
  },

  updateStorageLocation: async (id: number, data: StorageLocationUpdate): Promise<StorageLocation> => {
    const res = await limsApi.patch<StorageLocation>(`/samples/storage-locations/${id}`, data);
    return res.data;
  },

  deleteStorageLocation: async (id: number): Promise<void> => {
    await limsApi.delete(`/samples/storage-locations/${id}`);
  },

  getSamplesAtLocation: async (id: number): Promise<SampleRead[]> => {
    const res = await limsApi.get<SampleRead[]>(`/samples/storage-locations/${id}/samples`);
    return res.data;
  },
};
