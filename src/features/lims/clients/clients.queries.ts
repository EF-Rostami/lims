import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clientsApi,
  type ClientCreate, type ClientUpdate, type ClientContactCreate,
  type ListClientsParams,
} from "./clients.api";

export const clientKeys = {
  all: ["lims", "clients"] as const,
  list: (params?: ListClientsParams) => [...clientKeys.all, "list", params] as const,
  detail: (id: number) => [...clientKeys.all, "detail", id] as const,
  contacts: (clientId: number) => [...clientKeys.all, "contacts", clientId] as const,
};

export function useClients(params?: ListClientsParams) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => clientsApi.list(params),
  });
}

export function useClient(id: number) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => clientsApi.get(id),
    enabled: !!id,
  });
}

export function useClientContacts(clientId: number) {
  return useQuery({
    queryKey: clientKeys.contacts(clientId),
    queryFn: () => clientsApi.listContacts(clientId),
    enabled: !!clientId,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ClientCreate) => clientsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: clientKeys.all }),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClientUpdate }) => clientsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: clientKeys.all }),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => clientsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: clientKeys.all }),
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: number; data: ClientContactCreate }) =>
      clientsApi.createContact(clientId, data),
    onSuccess: (_, { clientId }) =>
      qc.invalidateQueries({ queryKey: clientKeys.contacts(clientId) }),
  });
}
