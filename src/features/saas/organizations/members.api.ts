import saasApi from "@/lib/saas-api";

export type MemberRole = "OWNER" | "ADMIN" | "BILLING_MANAGER" | "VIEWER";
export type MemberStatus = "ACTIVE" | "INVITED" | "DISABLED";

export type OrgMember = {
  id: string;
  organization_id: string;
  saas_user_id: string;
  role: MemberRole;
  status: MemberStatus;
  created_at: string;
};

export type AddMemberPayload = {
  organization_id: string;
  saas_user_id: string;
  role?: MemberRole;
};

export type UpdateMemberPayload = {
  role?: MemberRole;
  status?: MemberStatus;
};

export const membersApi = {
  listByOrg: async (orgId: string): Promise<OrgMember[]> => {
    const res = await saasApi.get<OrgMember[]>(`/customers/organizations/${orgId}/members`);
    return res.data;
  },
  add: async (payload: AddMemberPayload): Promise<OrgMember> => {
    const res = await saasApi.post<OrgMember>("/customers/members", payload);
    return res.data;
  },
  update: async (memberId: string, payload: UpdateMemberPayload): Promise<OrgMember> => {
    const res = await saasApi.patch<OrgMember>(`/customers/members/${memberId}`, payload);
    return res.data;
  },
  remove: async (memberId: string): Promise<void> => {
    await saasApi.delete(`/customers/members/${memberId}`);
  },
};
