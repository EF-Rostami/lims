
// src/features/audit-trails/hooks/useAuditedMutation.ts

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import apiClient from "@/lib/api-client";
import { useAuditStore } from "../audit-store";

export function useAuditedMutation() {
  const promptForReason = useAuditStore((s) => s.promptForReason);

  /**
   * A wrapper that ensures an RFC is collected before the API call
   */
/**
   * T is the expected return type of your API call (e.g., ActionItem)
   */
  const auditedRequest = async <T>(requestFn: (reason: string) => Promise<T>): Promise<T> => {
    const reason = await promptForReason();
    
    if (!reason || reason.length < 5) {
      throw new Error("A valid Reason for Change is required for compliance.");
    }

    // Set the header for the specific request
    return await requestFn(reason);
  };

  return { auditedRequest };
}