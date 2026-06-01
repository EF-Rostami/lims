// @ts-nocheck — pending migration to features/lims/ pattern
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import{authService} from '@/services/auth.service'
import type { components } from '@/types/api';
type UserCreate = components['schemas']['UserCreate'];


export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: UserCreate) => authService.register(payload),
    onSuccess: () => {
      router.push('/login?registered=true');
    },
  });
};
