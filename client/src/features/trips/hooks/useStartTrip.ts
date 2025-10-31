'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi } from '../services/tripsApi';
import { useCreateDailyLog } from './useDailyLogs';
import { toast } from 'sonner';
import { getResError } from '@/lib/fetcher';
import { format } from 'date-fns';

export function useStartTrip(tripId: number) {
  const queryClient = useQueryClient();
  const createDailyLogMutation = useCreateDailyLog(tripId);

  return useMutation({
    mutationFn: () => tripsApi.startTrip(tripId),
    onSuccess: async (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['trips'] });
        queryClient.invalidateQueries({ queryKey: ['trips', tripId] });

        const today = format(new Date(), 'yyyy-MM-dd');

        try {
          const dailyLogsResponse = await queryClient.fetchQuery({
            queryKey: ['trips', tripId, 'daily-logs'],
            queryFn: async () => {
              const { dailyLogsApi } = await import('../services/dailyLogsApi');
              return dailyLogsApi.getDailyLogs(tripId);
            },
          });

          const existingLogs = dailyLogsResponse?.success && dailyLogsResponse.data
            ? Array.isArray(dailyLogsResponse.data)
              ? dailyLogsResponse.data
              : []
            : [];

          const hasTodayLog = existingLogs.some(
            (log: any) => format(new Date(log.date), 'yyyy-MM-dd') === today
          );

          if (!hasTodayLog) {
            createDailyLogMutation.mutate({
              date: today,
            });
          }
        } catch (error) {
          console.error('Error checking for existing daily log:', error);
        }

        toast.success('Trip started successfully');
      } else {
        toast.error(response.message || 'Failed to start trip');
      }
    },
    onError: (error) => {
      const message = getResError(error) || 'Failed to start trip';
      toast.error(message);
    },
  });
}
