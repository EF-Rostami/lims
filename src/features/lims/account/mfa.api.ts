import { limsApi } from "@/lib/lims-api";

export interface MFAStatus {
  mfa_enabled: boolean;
}

export interface MFASetup {
  secret: string;
  uri: string;
}

export interface MFAConfirm {
  backup_codes: string[];
  mfa_enabled: boolean;
}

export const mfaApi = {
  getStatus: async (): Promise<MFAStatus> => {
    const res = await limsApi.get<MFAStatus>("/auth/mfa/status");
    return res.data;
  },

  beginSetup: async (): Promise<MFASetup> => {
    const res = await limsApi.get<MFASetup>("/auth/mfa/setup");
    return res.data;
  },

  confirmSetup: async (code: string): Promise<MFAConfirm> => {
    const res = await limsApi.post<MFAConfirm>("/auth/mfa/setup/confirm", { code });
    return res.data;
  },

  disable: async (password: string, code: string): Promise<void> => {
    await limsApi.post("/auth/mfa/disable", { password, code });
  },

  regenerateBackupCodes: async (code: string): Promise<MFAConfirm> => {
    const res = await limsApi.post<MFAConfirm>("/auth/mfa/backup-codes/regenerate", { code });
    return res.data;
  },
};
