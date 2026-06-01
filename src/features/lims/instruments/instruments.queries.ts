import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  instrumentsApi,
  type InstrumentCreate, type InstrumentUpdate, type MaintenanceLogCreate,
  type ListInstrumentsParams,
} from "./instruments.api";

export const instrumentKeys = {
  all: ["lims", "instruments"] as const,
  list: (params?: ListInstrumentsParams) => [...instrumentKeys.all, "list", params] as const,
  detail: (id: number) => [...instrumentKeys.all, "detail", id] as const,
};

export function useInstruments(params?: ListInstrumentsParams) {
  return useQuery({
    queryKey: instrumentKeys.list(params),
    queryFn: () => instrumentsApi.list(params),
  });
}

export function useInstrument(id: number) {
  return useQuery({
    queryKey: instrumentKeys.detail(id),
    queryFn: () => instrumentsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateInstrument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InstrumentCreate) => instrumentsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: instrumentKeys.all }),
  });
}

export function useUpdateInstrument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InstrumentUpdate }) =>
      instrumentsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: instrumentKeys.all }),
  });
}

export function useDeleteInstrument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => instrumentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: instrumentKeys.all }),
  });
}

export function useLogMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MaintenanceLogCreate }) =>
      instrumentsApi.logMaintenance(id, data),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: instrumentKeys.detail(id) }),
  });
}
