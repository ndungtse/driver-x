import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';
import { DailyLog } from '@/types/models';

export interface DailyLogCreateData {
  date: string;
  co_driver_name?: string;
  tractor_number?: string;
  trailer_numbers?: string[];
  shipper?: string;
  commodity?: string;
  shipping_doc_numbers?: string[];
}

export interface DailyLogUpdateData {
  co_driver_name?: string;
  tractor_number?: string;
  trailer_numbers?: string[];
  shipper?: string;
  commodity?: string;
  shipping_doc_numbers?: string[];
  driver_signature?: string;
}

export const dailyLogsApi = {
  getDailyLogs: async (tripId: number): Promise<ApiResponse<DailyLog[]>> => {
    const response = await apiClient.get<ApiResponse<DailyLog[]>>(
      `/trips/${tripId}/daily-logs/`
    );
    return response.data;
  },

  getDailyLog: async (
    tripId: number,
    logId: number
  ): Promise<ApiResponse<DailyLog>> => {
    const response = await apiClient.get<ApiResponse<DailyLog>>(
      `/trips/${tripId}/daily-logs/${logId}/`
    );
    return response.data;
  },

  createDailyLog: async (
    tripId: number,
    data: DailyLogCreateData
  ): Promise<ApiResponse<DailyLog>> => {
    const response = await apiClient.post<ApiResponse<DailyLog>>(
      `/trips/${tripId}/daily-logs/`,
      data
    );
    return response.data;
  },

  updateDailyLog: async (
    tripId: number,
    logId: number,
    data: DailyLogUpdateData
  ): Promise<ApiResponse<DailyLog>> => {
    const response = await apiClient.patch<ApiResponse<DailyLog>>(
      `/trips/${tripId}/daily-logs/${logId}/`,
      data
    );
    return response.data;
  },

  deleteDailyLog: async (
    tripId: number,
    logId: number
  ): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/trips/${tripId}/daily-logs/${logId}/`
    );
    return response.data;
  },
};
