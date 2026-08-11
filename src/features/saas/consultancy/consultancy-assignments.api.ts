import saasApi from "@/lib/saas-api";

export type ConsultantStatus = "ACTIVE" | "SUSPENDED" | "WITHDRAWN";
export type AssignmentStatus = "ACTIVE" | "SUSPENDED" | "WITHDRAWN";

export type Consultant = {
  id: number;
  email: string;
  full_name: string;
  company: string | null;
  phone: string | null;
  status: ConsultantStatus;
  created_at: string;
  updated_at: string;
};

export type CreateConsultantPayload = {
  email: string;
  full_name: string;
  company?: string;
  phone?: string;
};

export type UpdateConsultantPayload = {
  full_name?: string;
  company?: string;
  phone?: string;
  status?: ConsultantStatus;
};

export type LabOption = {
  tenant_name: string;
  tenant_schema: string;
  org_name: string;
};

export type ConsultantLabAssignment = {
  id: number;
  consultant_email: string;
  tenant_schema: string;
  tenant_name: string;
  org_name: string | null;
  is_active: boolean;
  status: AssignmentStatus;
  assigned_at: string;
};

export type ConsultantLabAssignmentProvisioned = ConsultantLabAssignment & {
  temp_password: string | null;
};

export type CreateAssignmentPayload = {
  consultant_email: string;
  tenant_schema: string;
  tenant_name: string;
  org_name?: string;
};

export const consultancyApi = {
  // Consultants
  listConsultants: async (): Promise<Consultant[]> => {
    const res = await saasApi.get<Consultant[]>("/consultancy/consultants");
    return res.data;
  },
  createConsultant: async (payload: CreateConsultantPayload): Promise<Consultant> => {
    const res = await saasApi.post<Consultant>("/consultancy/consultants", payload);
    return res.data;
  },
  updateConsultant: async (id: number, payload: UpdateConsultantPayload): Promise<Consultant> => {
    const res = await saasApi.patch<Consultant>(`/consultancy/consultants/${id}`, payload);
    return res.data;
  },
  deleteConsultant: async (id: number): Promise<void> => {
    await saasApi.delete(`/consultancy/consultants/${id}`);
  },

  // Labs dropdown
  listLabs: async (): Promise<LabOption[]> => {
    const res = await saasApi.get<LabOption[]>("/consultancy/labs");
    return res.data;
  },

  // Assignments
  listAssignments: async (consultant_email?: string): Promise<ConsultantLabAssignment[]> => {
    const params = consultant_email ? { consultant_email } : undefined;
    const res = await saasApi.get<ConsultantLabAssignment[]>("/consultancy/assignments", { params });
    return res.data;
  },
  createAssignment: async (payload: CreateAssignmentPayload): Promise<ConsultantLabAssignmentProvisioned> => {
    const res = await saasApi.post<ConsultantLabAssignmentProvisioned>("/consultancy/assignments", payload);
    return res.data;
  },
  updateAssignmentStatus: async (id: number, status: AssignmentStatus): Promise<ConsultantLabAssignment> => {
    const res = await saasApi.patch<ConsultantLabAssignment>(`/consultancy/assignments/${id}/status`, { status });
    return res.data;
  },
  deleteAssignment: async (id: number): Promise<void> => {
    await saasApi.delete(`/consultancy/assignments/${id}`);
  },
};
