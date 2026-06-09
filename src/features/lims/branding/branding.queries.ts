import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { brandingApi, type BrandingUpdate } from "./branding.api";

export const brandingKey = ["lims", "branding"] as const;

export function useBrandingData() {
  return useQuery({
    queryKey: brandingKey,
    queryFn: brandingApi.get,
    staleTime: 5 * 60_000,
    retry: false,
    throwOnError: false,
  });
}

export function useUpdateBranding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BrandingUpdate) => brandingApi.update(data),
    onSuccess: (updated) => {
      qc.setQueryData(brandingKey, updated);
    },
  });
}
