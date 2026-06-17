import { limsApi } from "@/lib/lims-api";

export type ComplaintStatus =
  | "received"
  | "under_investigation"
  | "resolved"
  | "closed";

export type ComplaintCategory =
  | "result_error"
  | "report_delay"
  | "communication"
  | "sample_handling"
  | "billing"
  | "other";

export interface CustomerComplaintRead {
  id: number;
  complaint_number: string;
  customer_name: string;
  received_date: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  description: string;
  client_id: number | null;
  received_by_user_id: number | null;
  assigned_to_user_id: number | null;
  investigated_by_user_id: number | null;
  investigation_notes: string | null;
  root_cause: string | null;
  resolution_description: string | null;
  preventive_action: string | null;
  customer_notified_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  related_order_id: number | null;
  related_result_id: number | null;
}

export interface CustomerComplaintCreate {
  customer_name: string;
  received_date: string;
  category: ComplaintCategory;
  description: string;
  client_id?: number | null;
  assigned_to_user_id?: number | null;
  related_order_id?: number | null;
  related_result_id?: number | null;
}

export interface CustomerComplaintUpdate {
  customer_name?: string | null;
  category?: ComplaintCategory | null;
  description?: string | null;
  client_id?: number | null;
  assigned_to_user_id?: number | null;
  investigated_by_user_id?: number | null;
  investigation_notes?: string | null;
  root_cause?: string | null;
  resolution_description?: string | null;
  preventive_action?: string | null;
}

export const complaintsApi = {
  list: async (params?: { status?: ComplaintStatus; client_id?: number }): Promise<CustomerComplaintRead[]> => {
    const res = await limsApi.get<CustomerComplaintRead[]>("/complaints", { params });
    return res.data;
  },

  get: async (id: number): Promise<CustomerComplaintRead> => {
    const res = await limsApi.get<CustomerComplaintRead>(`/complaints/${id}`);
    return res.data;
  },

  create: async (data: CustomerComplaintCreate): Promise<CustomerComplaintRead> => {
    const res = await limsApi.post<CustomerComplaintRead>("/complaints", data);
    return res.data;
  },

  update: async (id: number, data: CustomerComplaintUpdate): Promise<CustomerComplaintRead> => {
    const res = await limsApi.patch<CustomerComplaintRead>(`/complaints/${id}`, data);
    return res.data;
  },

  investigate: async (id: number): Promise<CustomerComplaintRead> => {
    const res = await limsApi.post<CustomerComplaintRead>(`/complaints/${id}/investigate`);
    return res.data;
  },

  resolve: async (id: number): Promise<CustomerComplaintRead> => {
    const res = await limsApi.post<CustomerComplaintRead>(`/complaints/${id}/resolve`);
    return res.data;
  },

  close: async (id: number): Promise<CustomerComplaintRead> => {
    const res = await limsApi.post<CustomerComplaintRead>(`/complaints/${id}/close`);
    return res.data;
  },

  notifyCustomer: async (id: number): Promise<CustomerComplaintRead> => {
    const res = await limsApi.post<CustomerComplaintRead>(`/complaints/${id}/notify-customer`);
    return res.data;
  },
};
