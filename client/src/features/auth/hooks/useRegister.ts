'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '../services/authApi';
import { RegisterData, AuthTokens } from '@/types/api';
import { setAuthTokens } from '@/lib/auth-utils';
import { toast } from 'sonner';

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await authApi.register(data);
      return response;
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Extract tokens from response
        const tokens: AuthTokens = {
          access: response.data.access,
          refresh: response.data.refresh,
          user: response.data.user,
        };
        
        setAuthTokens(tokens);
        queryClient.setQueryData(['auth', 'profile'], tokens.user);
        
        toast.success('Registration successful');
        router.push('/trips');
      } else {
        const errorMessage = response.error
          ? typeof response.error === 'string'
            ? response.error
            : Object.values(response.error).flat().join(', ')
          : response.message || 'Registration failed';
        toast.error(errorMessage);
      }
    },
    onError: (error: any) => {
      const message = error?.data?.message || error?.message || 'Registration failed';
      toast.error(message);
    },
  });
}

