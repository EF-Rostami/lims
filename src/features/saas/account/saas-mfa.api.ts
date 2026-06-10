import { saasApi } from "@/lib/saas-api";

export interface SaaSMFAStatus {
  enabled: boolean;
}

export interface SaaSMFASetup {
  secret: string;
  uri: string;
}

export interface SaaSMFABackupCodes {
  backup_codes: string[];
}

export const saasMfaApi = {
  getStatus: async (): Promise<SaaSMFAStatus> => {
    const res = await saasApi.get<SaaSMFAStatus>("/saas/auth/mfa/status");
    return res.data;
  },

  beginSetup: async (): Promise<SaaSMFASetup> => {
    const res = await saasApi.get<SaaSMFASetup>("/saas/auth/mfa/setup");
    return res.data;
  },

  confirmSetup: async (code: string): Promise<SaaSMFABackupCodes> => {
    const res = await saasApi.post<SaaSMFABackupCodes>("/saas/auth/mfa/setup/confirm", { code });
    return res.data;
  },

  disable: async (password: string, code: string): Promise<void> => {
    await saasApi.post("/saas/auth/mfa/disable", { password, code });
  },

  regenerateBackupCodes: async (code: string): Promise<SaaSMFABackupCodes> => {
    const res = await saasApi.post<SaaSMFABackupCodes>("/saas/auth/mfa/backup-codes/regenerate", { code });
    return res.data;
  },
};
