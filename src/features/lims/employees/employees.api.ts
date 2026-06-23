import { limsApi } from "@/lib/lims-api";

export interface EmployeePositionRead {
  id: number;
  employee_id: number;
  position_id: number;
  is_primary: boolean;
  start_date: string | null;
  end_date: string | null;
  position_title: string | null;
  department_name: string | null;
}

export interface EmployeePositionCreate {
  position_id: number;
  is_primary?: boolean;
  start_date?: string | null;
  end_date?: string | null;
}

export interface EmployeeRead {
  id: number;
  user_id: number;
  employee_id_number: string;
  first_name: string;
  last_name: string;
  email: string | null;
  positions: EmployeePositionRead[];
}

export interface EmployeeCreate {
  user_id: number;
  employee_id_number: string;
  first_name: string;
  last_name: string;
}

export interface EmployeeUpdate {
  employee_id_number?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

export type DelegationStatus = "planned" | "active" | "expired" | "revoked";
export type ActivationType = "self" | "manager" | "admin";

export interface DelegationRead {
  id: number;
  primary_employee_id: number;
  deputy_employee_id: number;
  position_id: number;
  scope: string | null;
  start_date: string;
  end_date: string;
  status: DelegationStatus;
  activation_type: ActivationType;
  primary_employee_name: string | null;
  deputy_employee_name: string | null;
  position_title: string | null;
}

export interface DelegationCreate {
  primary_employee_id: number;
  deputy_employee_id: number;
  position_id: number;
  scope?: string | null;
  start_date: string;
  end_date: string;
  activation_type: ActivationType;
}

export interface DelegationUpdate {
  scope?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

export const employeesApi = {
  list: async (params?: { department_id?: number }): Promise<EmployeeRead[]> => {
    const res = await limsApi.get<EmployeeRead[]>("/employees/", { params });
    return res.data;
  },

  get: async (id: number): Promise<EmployeeRead> => {
    const res = await limsApi.get<EmployeeRead>(`/employees/${id}`);
    return res.data;
  },

  create: async (data: EmployeeCreate): Promise<EmployeeRead> => {
    const res = await limsApi.post<EmployeeRead>("/employees/", data);
    return res.data;
  },

  update: async (id: number, data: EmployeeUpdate): Promise<EmployeeRead> => {
    const res = await limsApi.patch<EmployeeRead>(`/employees/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await limsApi.delete(`/employees/${id}`);
  },

  assignPosition: async (employeeId: number, data: EmployeePositionCreate): Promise<EmployeePositionRead> => {
    const res = await limsApi.post<EmployeePositionRead>(`/employees/${employeeId}/positions`, data);
    return res.data;
  },

  removePosition: async (employeeId: number, linkId: number): Promise<void> => {
    await limsApi.delete(`/employees/${employeeId}/positions/${linkId}`);
  },
};

export const delegationsApi = {
  list: async (params?: { employee_id?: number }): Promise<DelegationRead[]> => {
    const res = await limsApi.get<DelegationRead[]>("/delegations/", { params });
    return res.data;
  },

  create: async (data: DelegationCreate): Promise<DelegationRead> => {
    const res = await limsApi.post<DelegationRead>("/delegations/", data);
    return res.data;
  },

  update: async (id: number, data: DelegationUpdate): Promise<DelegationRead> => {
    const res = await limsApi.patch<DelegationRead>(`/delegations/${id}`, data);
    return res.data;
  },

  activate: async (id: number): Promise<DelegationRead> => {
    const res = await limsApi.post<DelegationRead>(`/delegations/${id}/activate`);
    return res.data;
  },

  revoke: async (id: number): Promise<DelegationRead> => {
    const res = await limsApi.post<DelegationRead>(`/delegations/${id}/revoke`);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await limsApi.delete(`/delegations/${id}`);
  },
};
