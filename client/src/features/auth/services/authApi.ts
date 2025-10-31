import { apiClient } from '@/lib/api-client';
import { ApiResponse, AuthTokens, LoginCredentials, RegisterData } from '@/types/api';

export const authApi = {
  register: async (data: RegisterData): Promise<ApiResponse<AuthTokens>> => {
    const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/register/', data);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthTokens>> => {
    const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/login/', credentials);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<{ user: AuthTokens['user'] }>> => {
    const response = await apiClient.get<ApiResponse<{ user: AuthTokens['user'] }>>('/auth/profile/');
    return response.data;
  },

  refreshToken: async (refresh: string): Promise<ApiResponse<{ access: string }>> => {
    const response = await apiClient.post<ApiResponse<{ access: string }>>('/auth/refresh/', {
      refresh,
    });
    return response.data;
  },
};

