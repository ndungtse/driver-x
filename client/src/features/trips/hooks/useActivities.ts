'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesApi, ActivityUpdateData } from '../services/activitiesApi';
import { ActivityCreateData } from '@/types/api';
import { toast } from 'sonner';
import { getResError } from '@/lib/fetcher';

export function useActivities(dailyLogId: number) {
  return useQuery({
    queryKey: ['daily-logs', dailyLogId, 'activities'],
    queryFn: () => activitiesApi.getActivities(dailyLogId),
    enabled: !!dailyLogId,
  });
}

export function useActivity(activityId: number) {
  return useQuery({
    queryKey: ['activities', activityId],
    queryFn: () => activitiesApi.getActivity(activityId),
    enabled: !!activityId,
  });
}

export function useCreateActivity(dailyLogId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ActivityCreateData) => activitiesApi.createActivity(dailyLogId, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['daily-logs', dailyLogId, 'activities'] });
        queryClient.invalidateQueries({ queryKey: ['daily-logs', dailyLogId] });
        queryClient.invalidateQueries({ queryKey: ['trips'] });
        toast.success('Activity created successfully');
      } else {
        toast.error(response.message || 'Failed to create activity');
      }
    },
    onError: (error) => {
      const message = getResError(error) || 'Failed to create activity';
      toast.error(message);
    },
  });
}

export function useUpdateActivity(activityId: number, dailyLogId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ActivityUpdateData) => activitiesApi.updateActivity(activityId, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['daily-logs', dailyLogId, 'activities'] });
        queryClient.invalidateQueries({ queryKey: ['activities', activityId] });
        queryClient.invalidateQueries({ queryKey: ['daily-logs', dailyLogId] });
        queryClient.invalidateQueries({ queryKey: ['trips'] });
        toast.success('Activity updated successfully');
      } else {
        toast.error(response.message || 'Failed to update activity');
      }
    },
    onError: (error) => {
      const message = getResError(error) || 'Failed to update activity';
      toast.error(message);
    },
  });
}

export function useDeleteActivity(dailyLogId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: number) => activitiesApi.deleteActivity(activityId),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['daily-logs', dailyLogId, 'activities'] });
        queryClient.invalidateQueries({ queryKey: ['daily-logs', dailyLogId] });
        queryClient.invalidateQueries({ queryKey: ['trips'] });
        toast.success('Activity deleted successfully');
      } else {
        toast.error(response.message || 'Failed to delete activity');
      }
    },
    onError: (error) => {
      const message = getResError(error) || 'Failed to delete activity';
      toast.error(message);
    },
  });
}

