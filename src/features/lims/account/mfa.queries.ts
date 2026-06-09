import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mfaApi } from "./mfa.api";

export const mfaStatusKey = ["lims", "mfa", "status"] as const;

export function useMFAStatus() {
  return useQuery({
    queryKey: mfaStatusKey,
    queryFn: mfaApi.getStatus,
  });
}

export function useBeginMFASetup() {
  return useMutation({
    mutationFn: mfaApi.beginSetup,
  });
}

export function useConfirmMFASetup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => mfaApi.confirmSetup(code),
    onSuccess: () => qc.invalidateQueries({ queryKey: mfaStatusKey }),
  });
}

export function useDisableMFA() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ password, code }: { password: string; code: string }) =>
      mfaApi.disable(password, code),
    onSuccess: () => qc.invalidateQueries({ queryKey: mfaStatusKey }),
  });
}

export function useRegenerateBackupCodes() {
  return useMutation({
    mutationFn: (code: string) => mfaApi.regenerateBackupCodes(code),
  });
}
