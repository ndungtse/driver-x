'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getUser, clearTokens, setAuthTokens } from '@/lib/auth-utils';
import { authApi } from '../services/authApi';
import { AuthTokens } from '@/types/api';

export function useAuth() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthTokens['user'] | null>(() => getUser());

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: async () => {
      const response = await authApi.getProfile();
      if (response.success && response.data) {
        const userData = response.data.user;
        setUser(userData);
        return userData;
      }
      return null;
    },
    enabled: !!user, // Only fetch if we have a user from cookies
    retry: false,
  });

  const logout = () => {
    clearTokens();
    setUser(null);
    queryClient.clear();
    window.location.href = '/login';
  };

  const updateUser = (newUser: AuthTokens['user']) => {
    setUser(newUser);
    queryClient.setQueryData(['auth', 'profile'], newUser);
  };

  return {
    user: profileData || user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    updateUser,
  };
}

