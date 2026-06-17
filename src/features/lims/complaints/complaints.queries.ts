import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  complaintsApi,
  type CustomerComplaintCreate,
  type CustomerComplaintUpdate,
  type ComplaintStatus,
} from "./complaints.api";

export const complaintKeys = {
  all: ["lims", "complaints"] as const,
  list: (params?: { status?: ComplaintStatus; client_id?: number }) =>
    [...complaintKeys.all, "list", params] as const,
  detail: (id: number) => [...complaintKeys.all, "detail", id] as const,
};

export function useComplaints(params?: { status?: ComplaintStatus; client_id?: number }) {
  return useQuery({
    queryKey: complaintKeys.list(params),
    queryFn: () => complaintsApi.list(params),
  });
}

export function useComplaint(id: number) {
  return useQuery({
    queryKey: complaintKeys.detail(id),
    queryFn: () => complaintsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CustomerComplaintCreate) => complaintsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: complaintKeys.all }),
  });
}

export function useUpdateComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CustomerComplaintUpdate }) =>
      complaintsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: complaintKeys.all }),
  });
}

export function useInvestigateComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => complaintsApi.investigate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: complaintKeys.all }),
  });
}

export function useResolveComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => complaintsApi.resolve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: complaintKeys.all }),
  });
}

export function useCloseComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => complaintsApi.close(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: complaintKeys.all }),
  });
}

export function useNotifyCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => complaintsApi.notifyCustomer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: complaintKeys.all }),
  });
}
