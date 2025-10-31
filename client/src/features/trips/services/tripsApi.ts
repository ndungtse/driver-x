import { apiClient } from '@/lib/api-client';
import { ApiResponse, TripCreateData } from '@/types/api';
import { Trip, HOSCompliance } from '@/types/models';

export const tripsApi = {
  getTrips: async (): Promise<ApiResponse<{ results: Trip[] } | Trip[]>> => {
    const response = await apiClient.get<ApiResponse<{ results: Trip[] } | Trip[]>>('/trips/');
    return response.data;
  },

  getTrip: async (id: number): Promise<ApiResponse<Trip>> => {
    const response = await apiClient.get<ApiResponse<Trip>>(`/trips/${id}/`);
    return response.data;
  },

  createTrip: async (data: TripCreateData): Promise<ApiResponse<Trip>> => {
    const response = await apiClient.post<ApiResponse<Trip>>('/trips/', data);
    return response.data;
  },

  updateTrip: async (id: number, data: Partial<TripCreateData>): Promise<ApiResponse<Trip>> => {
    const response = await apiClient.patch<ApiResponse<Trip>>(`/trips/${id}/`, data);
    return response.data;
  },

  deleteTrip: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/trips/${id}/`);
    return response.data;
  },

  calculateRoute: async (id: number): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(`/trips/${id}/calculate-route/`);
    return response.data;
  },

  getHOSStatus: async (id: number): Promise<ApiResponse<HOSCompliance>> => {
    const response = await apiClient.get<ApiResponse<HOSCompliance>>(`/trips/${id}/hos-status/`);
    return response.data;
  },

  startTrip: async (id: number): Promise<ApiResponse<Trip>> => {
    const response = await apiClient.post<ApiResponse<Trip>>(`/trips/${id}/start/`);
    return response.data;
  },

  completeTrip: async (id: number): Promise<ApiResponse<Trip>> => {
    const response = await apiClient.post<ApiResponse<Trip>>(`/trips/${id}/complete/`);
    return response.data;
  },
};

