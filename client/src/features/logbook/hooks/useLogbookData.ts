'use client';

import { useDailyLogs } from '@/features/trips/hooks/useDailyLogs';
import { useActivities } from '@/features/trips/hooks/useActivities';
import { DailyLog } from '@/types/models';
import { useMemo } from 'react';

export function useLogbookData(tripId: number, selectedDate: string) {
  const { data: dailyLogsData, isLoading } = useDailyLogs(tripId);

  const dailyLogs = dailyLogsData?.success && dailyLogsData.data
    ? Array.isArray(dailyLogsData.data)
      ? dailyLogsData.data
      : []
    : [];

  const selectedDailyLog = useMemo(() => {
    return dailyLogs.find((log) => log.date === selectedDate);
  }, [dailyLogs, selectedDate]);

  const { data: activitiesData } = useActivities(selectedDailyLog?.id || 0);

  const activities = useMemo(() => {
    if (!activitiesData?.success || !activitiesData.data) return [];

    if (Array.isArray(activitiesData.data)) {
      return activitiesData.data;
    }

    if ('activities' in activitiesData.data && Array.isArray(activitiesData.data.activities)) {
      return activitiesData.data.activities;
    }

    return [];
  }, [activitiesData]);

  const dailyLogWithActivities: DailyLog | null = useMemo(() => {
    if (!selectedDailyLog) return null;
    return {
      ...selectedDailyLog,
      activities,
    };
  }, [selectedDailyLog, activities]);

  return {
    dailyLogs,
    selectedDailyLog: dailyLogWithActivities,
    activities,
    isLoading,
  };
}

