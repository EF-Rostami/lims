import { limsApi } from "@/lib/lims-api";

// ─── Row types (match backend schemas) ────────────────────────────────────

export type DeptRow = { code: string; name: string; parent_code?: string };
export type PosRow = { title: string; department_code: string; supervisor_title?: string };
export type EmpRow = { employee_id_number: string; first_name: string; last_name: string; email: string };
export type InstrRow = { code: string; name: string; manufacturer?: string; model_number?: string; serial_number?: string; location?: string; description?: string };
export type MethodRow = { code: string; name: string; unit?: string; version?: string; description?: string };
export type ClientRow = { code: string; name: string; client_type?: string; contact_name?: string; contact_email?: string; contact_phone?: string; city?: string; country?: string };

export type IntakeStagedData = {
  departments: DeptRow[];
  positions: PosRow[];
  employees: EmpRow[];
  instruments: InstrRow[];
  methods: MethodRow[];
  clients: ClientRow[];
};

// ─── Session types ─────────────────────────────────────────────────────────

export type IntakeRead = {
  id: number;
  token: string;
  label: string | null;
  expires_at: string;
  is_confirmed: boolean;
  is_expired: boolean;
  has_data: boolean;
  import_result: ImportResult | null;
  created_at: string;
};

export type IntakePublicInfo = {
  token: string;
  label: string | null;
  expires_at: string;
  is_confirmed: boolean;
  is_expired: boolean;
  has_data: boolean;
};

export type EntityResult = {
  imported: number;
  errors: { row: number; error: string }[];
};

export type ImportResult = {
  departments: EntityResult;
  positions: EntityResult;
  employees: EntityResult;
  instruments: EntityResult;
  methods: EntityResult;
  clients: EntityResult;
};

// ─── API ──────────────────────────────────────────────────────────────────

export const intakeApi = {
  createSession: async (label: string | null, expiresHours = 72): Promise<IntakeRead> => {
    const res = await limsApi.post<IntakeRead>("/intake/", { label, expires_hours: expiresHours });
    return res.data;
  },

  listSessions: async (): Promise<IntakeRead[]> => {
    const res = await limsApi.get<IntakeRead[]>("/intake/");
    return res.data;
  },

  confirmImport: async (token: string, tempPassword: string): Promise<ImportResult> => {
    const res = await limsApi.post<ImportResult>(`/intake/${token}/confirm`, {
      temp_password: tempPassword,
    });
    return res.data;
  },

  deleteSession: async (token: string): Promise<void> => {
    await limsApi.delete(`/intake/${token}`);
  },

  // ─── Authenticated submit (consultant direct-import flow) ────────────
  submitDataAuthenticated: async (token: string, data: IntakeStagedData): Promise<IntakePublicInfo> => {
    const res = await limsApi.post<IntakePublicInfo>(`/intake/${token}/submit`, data);
    return res.data;
  },

  // ─── Public (no auth) ─────────────────────────────────────────────────

  getPublicInfo: async (token: string, schema?: string): Promise<IntakePublicInfo> => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_LIMS || "http://127.0.0.1:8000/api/v1/lims"}/intake/${token}/info`,
      {
        headers: schema ? { "x-tenant-schema": schema } : {},
        credentials: "include",
      }
    );
    if (!res.ok) throw new Error("Intake session not found or expired");
    return res.json();
  },

  submitPublicData: async (
    token: string,
    data: IntakeStagedData,
    schema?: string
  ): Promise<IntakePublicInfo> => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_LIMS || "http://127.0.0.1:8000/api/v1/lims"}/intake/${token}/submit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(schema ? { "x-tenant-schema": schema } : {}),
        },
        credentials: "include",
        body: JSON.stringify(data),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || "Submit failed");
    }
    return res.json();
  },
};
