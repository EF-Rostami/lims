import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  samplesApi,
  type SampleCreate,
  type SampleUpdate,
  type SampleReceive,
  type SampleReject,
  type ListSamplesParams,
  type SampleTypeCreate,
  type SampleTypeUpdate,
  type StorageAssignCreate,
  type StorageLocationCreate,
  type StorageLocationUpdate,
} from "./samples.api";

const _base = ["lims", "samples"] as const;
const _storagBase = ["lims", "storage-locations"] as const;

export const sampleKeys = {
  all: _base,
  list: (params?: ListSamplesParams) => [..._base, "list", params] as const,
  detail: (id: number) => [..._base, "detail", id] as const,
  custody: (id: number) => [..._base, "custody", id] as const,
  storageHistory: (id: number) => [..._base, "storage-history", id] as const,
  types: () => [..._base, "types"] as const,
  locations: _storagBase,
  locationSamples: (id: number) => [..._storagBase, "samples", id] as const,
};

export function useSampleTypes(activeOnly = true) {
  return useQuery({
    queryKey: [...sampleKeys.types(), activeOnly],
    queryFn: () => samplesApi.listTypes(activeOnly),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSampleType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SampleTypeCreate) => samplesApi.createType(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sampleKeys.types() }),
  });
}

export function useUpdateSampleType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SampleTypeUpdate }) =>
      samplesApi.updateType(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sampleKeys.types() }),
  });
}

export function useDeleteSampleType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => samplesApi.deleteType(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: sampleKeys.types() }),
  });
}

export function useSamples(params?: ListSamplesParams) {
  return useQuery({
    queryKey: sampleKeys.list(params),
    queryFn: () => samplesApi.list(params),
  });
}

export function useSample(id: number) {
  return useQuery({
    queryKey: sampleKeys.detail(id),
    queryFn: () => samplesApi.get(id),
    enabled: !!id,
  });
}

export function useSampleCustody(id: number) {
  return useQuery({
    queryKey: sampleKeys.custody(id),
    queryFn: () => samplesApi.getCustody(id),
    enabled: !!id,
  });
}

export function useSampleStorageHistory(id: number | null) {
  return useQuery({
    queryKey: sampleKeys.storageHistory(id!),
    queryFn: () => samplesApi.getStorageHistory(id!),
    enabled: !!id,
  });
}

export function useCreateSample() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SampleCreate) => samplesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sampleKeys.all }),
  });
}

export function useUpdateSample() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SampleUpdate }) => samplesApi.update(id, data),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: sampleKeys.detail(id) }),
  });
}

export function useReceiveSample() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SampleReceive }) => samplesApi.receive(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sampleKeys.all }),
  });
}

export function useRejectSample() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SampleReject }) => samplesApi.reject(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sampleKeys.all }),
  });
}

export function useAssignStorage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: StorageAssignCreate }) =>
      samplesApi.assignStorage(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sampleKeys.all });
      qc.invalidateQueries({ queryKey: sampleKeys.locations });
    },
  });
}

export function useRemoveStorage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => samplesApi.removeStorage(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sampleKeys.all });
      qc.invalidateQueries({ queryKey: sampleKeys.locations });
    },
  });
}

// Storage Location hooks
export function useStorageLocations() {
  return useQuery({
    queryKey: sampleKeys.locations,
    queryFn: samplesApi.listStorageLocations,
    staleTime: 60_000,
  });
}

export function useSamplesAtLocation(locationId: number | null) {
  return useQuery({
    queryKey: sampleKeys.locationSamples(locationId!),
    queryFn: () => samplesApi.getSamplesAtLocation(locationId!),
    enabled: !!locationId,
  });
}

export function useCreateStorageLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StorageLocationCreate) => samplesApi.createStorageLocation(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sampleKeys.locations }),
  });
}

export function useUpdateStorageLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: StorageLocationUpdate }) =>
      samplesApi.updateStorageLocation(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sampleKeys.locations }),
  });
}

export function useDeleteStorageLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => samplesApi.deleteStorageLocation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: sampleKeys.locations }),
  });
}
