import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { saasMfaApi } from "./saas-mfa.api";

const MFA_STATUS_KEY = ["saas-mfa-status"];

export function useSaaSMFAStatus() {
  return useQuery({
    queryKey: MFA_STATUS_KEY,
    queryFn: saasMfaApi.getStatus,
  });
}

export function useSaaSBeginMFASetup() {
  return useMutation({
    mutationFn: saasMfaApi.beginSetup,
  });
}

export function useSaaSConfirmMFASetup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => saasMfaApi.confirmSetup(code),
    onSuccess: () => qc.invalidateQueries({ queryKey: MFA_STATUS_KEY }),
  });
}

export function useSaaSDisableMFA() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ password, code }: { password: string; code: string }) =>
      saasMfaApi.disable(password, code),
    onSuccess: () => qc.invalidateQueries({ queryKey: MFA_STATUS_KEY }),
  });
}

export function useSaaSRegenerateBackupCodes() {
  return useMutation({
    mutationFn: (code: string) => saasMfaApi.regenerateBackupCodes(code),
  });
}
