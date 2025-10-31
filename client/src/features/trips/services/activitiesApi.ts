import { apiClient } from '@/lib/api-client';
import { ApiResponse, ActivityCreateData } from '@/types/api';
import { Activity } from '@/types/models';

export interface ActivityUpdateData {
  status?: ActivityCreateData['status'];
  start_time?: string;
  end_time?: string;
  location?: ActivityCreateData['location'];
  remark?: string;
  miles_driven?: number;
}

export const activitiesApi = {
  getActivities: async (
    dailyLogId: number
  ): Promise<ApiResponse<Activity[] | { activities: Activity[]; hos_compliance: any }>> => {
    const response = await apiClient.get<
      ApiResponse<Activity[] | { activities: Activity[]; hos_compliance: any }>
    >(`/daily-logs/${dailyLogId}/activities/`);
    return response.data;
  },

  getActivity: async (
    activityId: number
  ): Promise<ApiResponse<Activity>> => {
    const response = await apiClient.get<ApiResponse<Activity>>(
      `/activities/${activityId}/`
    );
    return response.data;
  },

  createActivity: async (
    dailyLogId: number,
    data: ActivityCreateData
  ): Promise<ApiResponse<Activity | { activity: Activity; hos_compliance: any }>> => {
    const response = await apiClient.post<
      ApiResponse<Activity | { activity: Activity; hos_compliance: any }>
    >(`/daily-logs/${dailyLogId}/activities/`, data);
    return response.data;
  },

  updateActivity: async (
    activityId: number,
    data: ActivityUpdateData
  ): Promise<ApiResponse<Activity | { activity: Activity; hos_compliance: any }>> => {
    const response = await apiClient.patch<
      ApiResponse<Activity | { activity: Activity; hos_compliance: any }>
    >(`/activities/${activityId}/`, data);
    return response.data;
  },

  deleteActivity: async (
    activityId: number
  ): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/activities/${activityId}/`
    );
    return response.data;
  },
};
