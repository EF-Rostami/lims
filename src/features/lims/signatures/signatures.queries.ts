import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { signaturesApi, type SignatureCreate, type ListSignaturesParams } from "./signatures.api";

export const signatureKeys = {
  all: ["lims", "signatures"] as const,
  list: (params: ListSignaturesParams) => [...signatureKeys.all, "list", params] as const,
};

export function useSignatures(params: ListSignaturesParams) {
  return useQuery({
    queryKey: signatureKeys.list(params),
    queryFn: () => signaturesApi.list(params),
    enabled: !!params.entity_type && !!params.entity_id,
  });
}

export function useCreateSignature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SignatureCreate) => signaturesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: signatureKeys.all }),
  });
}
