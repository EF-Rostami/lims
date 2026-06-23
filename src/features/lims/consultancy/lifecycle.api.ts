import { limsApi } from "@/lib/lims-api";

export interface LifecycleTransitionRequest {
  new_status: string;
  audit_note?: string | null;
}

export interface LifecycleTransitionResult {
  instrument_id?: number;
  method_id?: number;
  document_id?: number;
  new_status: string;
}

export const INSTRUMENT_STATUSES = [
  "UNVERIFIED",
  "CALIBRATION_PENDING",
  "CALIBRATED",
  "APPROVED",
  "OUT_OF_SERVICE",
] as const;

export const METHOD_STATUSES = [
  "DRAFT",
  "VALIDATION_IN_PROGRESS",
  "VALIDATED",
  "APPROVED",
  "ACTIVE",
  "RETIRED",
] as const;

export const DOCUMENT_STATUSES = [
  "DRAFT",
  "UNDER_REVIEW",
  "APPROVED",
  "ACTIVE",
  "RETIRED",
] as const;

export const lifecycleApi = {
  transitionInstrument: async (
    instrumentId: number,
    data: LifecycleTransitionRequest,
  ): Promise<LifecycleTransitionResult> => {
    const res = await limsApi.post<LifecycleTransitionResult>(
      `/consultancy/lifecycle/instruments/${instrumentId}/transition`,
      data,
    );
    return res.data;
  },

  transitionMethod: async (
    methodId: number,
    data: LifecycleTransitionRequest,
  ): Promise<LifecycleTransitionResult> => {
    const res = await limsApi.post<LifecycleTransitionResult>(
      `/consultancy/lifecycle/methods/${methodId}/transition`,
      data,
    );
    return res.data;
  },

  transitionDocument: async (
    documentId: number,
    data: LifecycleTransitionRequest,
  ): Promise<LifecycleTransitionResult> => {
    const res = await limsApi.post<LifecycleTransitionResult>(
      `/consultancy/lifecycle/documents/${documentId}/transition`,
      data,
    );
    return res.data;
  },
};
