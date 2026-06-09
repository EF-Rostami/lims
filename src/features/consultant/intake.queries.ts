import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { intakeApi, type ImportResult, type IntakeStagedData } from "./intake.api";

export const intakeKeys = {
  all: ["consultant", "intake"] as const,
  sessions: () => [...intakeKeys.all, "sessions"] as const,
};

export function useIntakeSessions() {
  return useQuery({
    queryKey: intakeKeys.sessions(),
    queryFn: intakeApi.listSessions,
  });
}

export function useCreateIntakeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ label, expiresHours }: { label: string | null; expiresHours?: number }) =>
      intakeApi.createSession(label, expiresHours),
    onSuccess: () => qc.invalidateQueries({ queryKey: intakeKeys.sessions() }),
  });
}

export function useConfirmIntake() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ token, tempPassword }: { token: string; tempPassword: string }): Promise<ImportResult> =>
      intakeApi.confirmImport(token, tempPassword),
    onSuccess: () => qc.invalidateQueries({ queryKey: intakeKeys.sessions() }),
  });
}

export function useDeleteIntakeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => intakeApi.deleteSession(token),
    onSuccess: () => qc.invalidateQueries({ queryKey: intakeKeys.sessions() }),
  });
}
