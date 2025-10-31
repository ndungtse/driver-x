'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dailyLogsApi, DailyLogCreateData, DailyLogUpdateData } from '../services/dailyLogsApi';
import { toast } from 'sonner';
import { getResError } from '@/lib/fetcher';

export function useDailyLogs(tripId: number) {
  return useQuery({
    queryKey: ['trips', tripId, 'daily-logs'],
    queryFn: () => dailyLogsApi.getDailyLogs(tripId),
    enabled: !!tripId,
  });
}

export function useDailyLog(tripId: number, logId: number) {
  return useQuery({
    queryKey: ['trips', tripId, 'daily-logs', logId],
    queryFn: () => dailyLogsApi.getDailyLog(tripId, logId),
    enabled: !!tripId && !!logId,
  });
}

export function useCreateDailyLog(tripId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DailyLogCreateData) => dailyLogsApi.createDailyLog(tripId, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'daily-logs'] });
        queryClient.invalidateQueries({ queryKey: ['trips', tripId] });
        toast.success('Daily log created successfully');
      } else {
        toast.error(response.message || 'Failed to create daily log');
      }
    },
    onError: (error) => {
      const message = getResError(error) || 'Failed to create daily log';
      toast.error(message);
    },
  });
}

export function useUpdateDailyLog(tripId: number, logId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DailyLogUpdateData) =>
      dailyLogsApi.updateDailyLog(tripId, logId, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'daily-logs'] });
        queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'daily-logs', logId] });
        toast.success('Daily log updated successfully');
      } else {
        toast.error(response.message || 'Failed to update daily log');
      }
    },
    onError: (error) => {
      const message = getResError(error) || 'Failed to update daily log';
      toast.error(message);
    },
  });
}

export function useDeleteDailyLog(tripId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logId: number) => dailyLogsApi.deleteDailyLog(tripId, logId),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'daily-logs'] });
        queryClient.invalidateQueries({ queryKey: ['trips', tripId] });
        toast.success('Daily log deleted successfully');
      } else {
        toast.error(response.message || 'Failed to delete daily log');
      }
    },
    onError: (error) => {
      const message = getResError(error) || 'Failed to delete daily log';
      toast.error(message);
    },
  });
}
