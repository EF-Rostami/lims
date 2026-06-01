import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  samplesApi,
  type SampleCreate, type SampleUpdate, type SampleReceive, type SampleReject,
  type ListSamplesParams,
} from "./samples.api";

export const sampleKeys = {
  all: ["lims", "samples"] as const,
  list: (params?: ListSamplesParams) => [...sampleKeys.all, "list", params] as const,
  detail: (id: number) => [...sampleKeys.all, "detail", id] as const,
  custody: (id: number) => [...sampleKeys.all, "custody", id] as const,
  types: () => [...sampleKeys.all, "types"] as const,
};

export function useSampleTypes() {
  return useQuery({ queryKey: sampleKeys.types(), queryFn: samplesApi.listTypes, staleTime: 5 * 60 * 1000 });
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
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: sampleKeys.detail(id) }),
  });
}

export function useRejectSample() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SampleReject }) => samplesApi.reject(id, data),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: sampleKeys.detail(id) }),
  });
}
