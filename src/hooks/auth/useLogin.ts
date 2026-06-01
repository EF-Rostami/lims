// @ts-nocheck — pending migration to features/lims/ pattern
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import type { components } from '@/types/api';

type UserLogin = components['schemas']['UserLogin'];

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: UserLogin) => authService.login(payload),

    onSuccess: () => {
      // redirect after successful login
      router.push('/dashboard');
    },

    onError: (error: any) => {
      console.error('Login failed:', error);
    },
  });
}
