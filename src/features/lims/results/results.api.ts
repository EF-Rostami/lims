import { limsApi, extractPage } from "@/lib/lims-api";

export type ResultStatus = "PENDING" | "ENTERED" | "VALIDATED" | "APPROVED" | "REJECTED";
export type ResultFlag = "NORMAL" | "HIGH" | "LOW" | "CRITICAL_HIGH" | "CRITICAL_LOW" | "ABNORMAL";

export interface ResultEnter {
  result_value?: string | null;
  result_unit?: string | null;
  reference_range?: string | null;
  result_flag?: ResultFlag | null;
  comments?: string | null;
  instrument_id?: number | null;
  run_date?: string | null;
  dilution_factor?: number | null;
}

export interface ResultReject {
  rejection_reason: string;
}

export interface ResultRead {
  id: number;
  order_item_id: number;
  sample_id?: number | null;
  test_code: string;
  test_name: string;
  result_value?: string | null;
  result_unit?: string | null;
  reference_range?: string | null;
  result_flag?: ResultFlag | null;
  status: ResultStatus;
  instrument_id?: number | null;
  instrument_name?: string | null;
  instrument_code?: string | null;
  run_date?: string | null;
  dilution_factor?: number | null;
  entered_by_user_id?: number | null;
  entered_at?: string | null;
  validated_by_user_id?: number | null;
  validated_at?: string | null;
  approved_by_user_id?: number | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  comments?: string | null;
}

export interface ListResultsParams {
  status?: ResultStatus;
  instrument_id?: number;
  page?: number;
  page_size?: number;
}

export const resultsApi = {
  list: async (params?: ListResultsParams): Promise<ResultRead[]> => {
    const res = await limsApi.get("/results", { params });
    return extractPage<ResultRead>(res.data);
  },

  get: async (id: number): Promise<ResultRead> => {
    const res = await limsApi.get(`/results/${id}`);
    return res.data?.data ?? res.data;
  },

  enter: async (id: number, data: ResultEnter): Promise<ResultRead> => {
    const res = await limsApi.post(`/results/${id}/enter`, data);
    return res.data?.data ?? res.data;
  },

  validate: async (id: number): Promise<ResultRead> => {
    const res = await limsApi.post(`/results/${id}/validate`);
    return res.data?.data ?? res.data;
  },

  approve: async (id: number): Promise<ResultRead> => {
    const res = await limsApi.post(`/results/${id}/approve`);
    return res.data?.data ?? res.data;
  },

  reject: async (id: number, data: ResultReject): Promise<ResultRead> => {
    const res = await limsApi.post(`/results/${id}/reject`, data);
    return res.data?.data ?? res.data;
  },
};
