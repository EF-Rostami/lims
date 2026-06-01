import { limsApi, extractPage } from "@/lib/lims-api";
import type { components } from "@/generated/lims/api";

export type InstrumentRead = components["schemas"]["InstrumentRead"];
export type InstrumentCreate = components["schemas"]["InstrumentCreate"];
export type InstrumentUpdate = components["schemas"]["InstrumentUpdate"];
export type InstrumentStatus = components["schemas"]["InstrumentStatus"];
export type CalibrationStatus = components["schemas"]["CalibrationStatus"];
export type MaintenanceLogRead = components["schemas"]["MaintenanceLogRead"];
export type MaintenanceLogCreate = components["schemas"]["MaintenanceLogCreate"];

export interface ListInstrumentsParams {
  status?: InstrumentStatus;
  calibration_status?: CalibrationStatus;
  active_only?: boolean;
}

export const instrumentsApi = {
  list: async (params?: ListInstrumentsParams): Promise<InstrumentRead[]> => {
    const res = await limsApi.get("/instruments", { params });
    return extractPage<InstrumentRead>(res.data);
  },

  get: async (id: number): Promise<InstrumentRead> => {
    const res = await limsApi.get<InstrumentRead>(`/instruments/${id}`);
    return res.data;
  },

  create: async (data: InstrumentCreate): Promise<InstrumentRead> => {
    const res = await limsApi.post<InstrumentRead>("/instruments", data);
    return res.data;
  },

  update: async (id: number, data: InstrumentUpdate): Promise<InstrumentRead> => {
    const res = await limsApi.patch<InstrumentRead>(`/instruments/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await limsApi.delete(`/instruments/${id}`);
  },

  logMaintenance: async (id: number, data: MaintenanceLogCreate): Promise<MaintenanceLogRead> => {
    const res = await limsApi.post<MaintenanceLogRead>(`/instruments/${id}/maintenance`, data);
    return res.data;
  },
};
