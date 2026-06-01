// @ts-nocheck — pending migration to features/lims/ pattern
import { useMutation, useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import type { components } from '@/types/api';

// type ResetPasswordRequest = components['schemas']['ResetPasswordRequest'];

/**
 * Hook to verify a password reset token.
 * @param token - The reset token received via email
 */
export const useVerifyResetToken = (token: string) => {
  return useQuery({
    queryKey: ['verifyResetToken', token],
    // queryFn: () => authService.verifyResetToken(token),
    enabled: !!token, // only run if token exists
    retry: false,
  });
};

/**
 * Hook to reset the password using a valid token.
 */
export const useResetPassword = () => {
  return useMutation({
    // mutationFn: (payload: ResetPasswordRequest) => authService.resetPassword(payload),
  });
};
