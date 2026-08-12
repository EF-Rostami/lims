const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
const PREFIX = `${API_BASE}/api/v1/lims/onboarding`;

export interface SheetResult {
  sheet: string;
  imported: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

export interface UploadResult {
  sheets: SheetResult[];
  total_imported: number;
  total_errors: number;
}

export interface InviteRead {
  id: number;
  token: string;
  lab_name: string | null;
  note: string | null;
  expires_at: string;
  used_at: string | null;
  is_active: boolean;
}

export interface InviteInfo {
  lab_name: string | null;
  note: string | null;
  expires_at: string;
}

function authHeaders(token: string, schema: string) {
  return {
    Authorization: `Bearer ${token}`,
    "x-tenant-schema": schema,
  };
}

export const onboardingApi = {
  templateUrl(sample = false) {
    return `${PREFIX}/template${sample ? "?sample=true" : ""}`;
  },

  async upload(file: File, token: string, schema: string): Promise<UploadResult> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${PREFIX}/upload`, {
      method: "POST",
      credentials: "include",
      headers: authHeaders(token, schema),
      body: form,
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body?.detail || "Upload failed");
    return body.data;
  },

  async createInvite(
    token: string,
    schema: string,
    payload: { lab_name?: string; note?: string; expires_days?: number }
  ): Promise<InviteRead> {
    const res = await fetch(`${PREFIX}/invites`, {
      method: "POST",
      credentials: "include",
      headers: { ...authHeaders(token, schema), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body?.detail || "Failed to create invite");
    return body.data;
  },

  async listInvites(token: string, schema: string): Promise<InviteRead[]> {
    const res = await fetch(`${PREFIX}/invites`, {
      credentials: "include",
      headers: authHeaders(token, schema),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body?.detail || "Failed to load invites");
    return body.data;
  },

  async revokeInvite(inviteId: number, token: string, schema: string): Promise<void> {
    await fetch(`${PREFIX}/invites/${inviteId}`, {
      method: "DELETE",
      credentials: "include",
      headers: authHeaders(token, schema),
    });
  },

  async getInviteInfo(inviteToken: string, schema: string): Promise<InviteInfo> {
    const res = await fetch(`${PREFIX}/invites/${inviteToken}/info`, {
      headers: { "x-tenant-schema": schema },
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body?.detail || "Invite not found");
    return body.data;
  },

  async uploadViaInvite(inviteToken: string, file: File, schema: string): Promise<UploadResult> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${PREFIX}/invites/${inviteToken}/upload`, {
      method: "POST",
      headers: { "x-tenant-schema": schema },
      body: form,
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body?.detail || "Upload failed");
    return body.data;
  },
};
