import { ApiResponse } from '@/types/api';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { clearTokens, getAccessToken, getRefreshToken } from './auth-utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  async (error: AxiosError<ApiResponse<any>>) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(`${API_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          
          // Update tokens if refresh succeeds
          if (refreshResponse.data?.data?.access) {
            const newAccess = refreshResponse.data.data.access;
            // Note: In production, refresh would update both tokens
            // For now, just update access token
            document.cookie = `access_token=${newAccess}; path=/; max-age=3600`;
            
            // Retry original request
            const originalRequest = error.config;
            if (originalRequest) {
              originalRequest.headers.Authorization = `Bearer ${newAccess}`;
              return apiClient(originalRequest);
            }
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      } else {
        // No refresh token, clear and redirect
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    
    // Return error response
    return Promise.reject(error.response?.data || error);
  }
);
