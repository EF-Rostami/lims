import saasApi from "@/lib/saas-api";

export type TrialRequestStatus = "PENDING" | "CONTACTED" | "PROVISIONED" | "REJECTED";

export type TrialRequest = {
  id: string;
  full_name: string;
  email: string;
  lab_name: string;
  plan: string;
  notes: string | null;
  status: TrialRequestStatus;
  created_at: string;
  updated_at: string;
};

export const trialRequestsApi = {
  list: async (): Promise<TrialRequest[]> => {
    const res = await saasApi.get<TrialRequest[]>("/trial-requests");
    return res.data;
  },

  updateStatus: async (id: string, status: TrialRequestStatus): Promise<TrialRequest> => {
    const res = await saasApi.patch<TrialRequest>(`/trial-requests/${id}/status`, { status });
    return res.data;
  },
};
