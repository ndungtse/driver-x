'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '../services/authApi';
import { LoginCredentials, AuthTokens } from '@/types/api';
import { setAuthTokens } from '@/lib/auth-utils';
import { toast } from 'sonner';
import { getResError } from '@/lib/fetcher';

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authApi.login(credentials);
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
        
        toast.success('Login successful');
        router.push('/trips');
      } else {
        toast.error(response.message || 'Login failed');
      }
    },
    onError: (error) => {
      console.log('error', error);
      const message = getResError(error) || 'Login failed';
      toast.error(message);
    },
  });
}

