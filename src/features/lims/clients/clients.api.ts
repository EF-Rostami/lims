import { limsApi, extractPage } from "@/lib/lims-api";
import type { components } from "@/generated/lims/api";

export type ClientRead = components["schemas"]["ClientRead"];
export type ClientCreate = components["schemas"]["ClientCreate"];
export type ClientUpdate = components["schemas"]["ClientUpdate"];
export type ClientType = components["schemas"]["ClientType"];
export type ClientContactRead = components["schemas"]["ClientContactRead"];
export type ClientContactCreate = components["schemas"]["ClientContactCreate"];

export interface ListClientsParams {
  client_type?: ClientType;
  is_active?: boolean;
}

export const clientsApi = {
  list: async (params?: ListClientsParams): Promise<ClientRead[]> => {
    const res = await limsApi.get("/clients", { params });
    return extractPage<ClientRead>(res.data);
  },

  get: async (id: number): Promise<ClientRead> => {
    const res = await limsApi.get<ClientRead>(`/clients/${id}`);
    return res.data;
  },

  create: async (data: ClientCreate): Promise<ClientRead> => {
    const res = await limsApi.post<ClientRead>("/clients", data);
    return res.data;
  },

  update: async (id: number, data: ClientUpdate): Promise<ClientRead> => {
    const res = await limsApi.patch<ClientRead>(`/clients/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await limsApi.delete(`/clients/${id}`);
  },

  listContacts: async (clientId: number): Promise<ClientContactRead[]> => {
    const res = await limsApi.get<ClientContactRead[]>(`/clients/${clientId}/contacts`);
    return res.data;
  },

  createContact: async (clientId: number, data: ClientContactCreate): Promise<ClientContactRead> => {
    const res = await limsApi.post<ClientContactRead>(`/clients/${clientId}/contacts`, data);
    return res.data;
  },

  deleteContact: async (clientId: number, contactId: number): Promise<void> => {
    await limsApi.delete(`/clients/${clientId}/contacts/${contactId}`);
  },
};
