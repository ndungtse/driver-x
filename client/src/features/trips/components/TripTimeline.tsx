'use client';

import { useDailyLogs } from '../hooks/useDailyLogs';
import { useActivities } from '../hooks/useActivities';
import { useStartTrip } from '../hooks/useStartTrip';
import { Trip } from '@/types/models';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { AddActivityDrawer } from './AddActivityDrawer';
import { PlusIcon, PlayIcon } from 'lucide-react';

interface TripTimelineProps {
  trip: Trip;
}

export function TripTimeline({ trip }: TripTimelineProps) {
  const { data: dailyLogsData, isLoading } = useDailyLogs(trip.id);
  const startTripMutation = useStartTrip(trip.id);

  const dailyLogs = dailyLogsData?.success && dailyLogsData.data
    ? Array.isArray(dailyLogsData.data)
      ? dailyLogsData.data
      : []
    : [];

  if (isLoading) {
    return <div>Loading timeline...</div>;
  }

  const canStartTrip = trip.status === 'planning';

  if (dailyLogs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">
            {canStartTrip
              ? 'Start the trip to begin logging activities'
              : 'No daily logs yet'}
          </p>
          {canStartTrip && (
            <Button
              onClick={() => startTripMutation.mutate()}
              disabled={startTripMutation.isPending}
            >
              <PlayIcon className="mr-2 size-4" />
              Start Trip
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {canStartTrip && (
        <Card>
          <CardContent className="p-4">
            <Button
              onClick={() => startTripMutation.mutate()}
              disabled={startTripMutation.isPending}
              className="w-full"
            >
              <PlayIcon className="mr-2 size-4" />
              {startTripMutation.isPending ? 'Starting...' : 'Start Trip'}
            </Button>
          </CardContent>
        </Card>
      )}

      {dailyLogs.map((dailyLog) => (
        <DailyLogSection key={dailyLog.id} dailyLog={dailyLog} trip={trip} />
      ))}
    </div>
  );
}

interface DailyLogSectionProps {
  dailyLog: any;
  trip: Trip;
}

function DailyLogSection({ dailyLog, trip }: DailyLogSectionProps) {
  const { data: activitiesData } = useActivities(dailyLog.id);

  const activities =
    activitiesData?.success && activitiesData.data
      ? Array.isArray(activitiesData.data)
        ? activitiesData.data
        : 'activities' in activitiesData.data
          ? activitiesData.data.activities
          : []
      : [];

  const logDate = new Date(dailyLog.date);
  const isToday = format(logDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {format(logDate, 'EEEE, MMMM d, yyyy')}
              {isToday && <Badge variant="default">Today</Badge>}
            </CardTitle>
            <CardDescription>
              {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
            </CardDescription>
          </div>
          <AddActivityDrawer dailyLogId={dailyLog.id} trip={trip}>
            <Button size="sm">
              <PlusIcon className="mr-2 size-4" />
              Add Activity
            </Button>
          </AddActivityDrawer>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Driving</p>
              <p className="font-semibold">{dailyLog.driving_hours.toFixed(1)}h</p>
            </div>
            <div>
              <p className="text-muted-foreground">On Duty</p>
              <p className="font-semibold">{dailyLog.on_duty_not_driving_hours.toFixed(1)}h</p>
            </div>
            <div>
              <p className="text-muted-foreground">Off Duty</p>
              <p className="font-semibold">{dailyLog.off_duty_hours.toFixed(1)}h</p>
            </div>
            <div>
              <p className="text-muted-foreground">Sleeper</p>
              <p className="font-semibold">{dailyLog.sleeper_berth_hours.toFixed(1)}h</p>
            </div>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No activities logged for this day</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activities.map((activity: any) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ActivityItemProps {
  activity: any;
}

function ActivityItem({ activity }: ActivityItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'driving':
        return 'default';
      case 'on_duty_not_driving':
        return 'secondary';
      case 'off_duty':
        return 'outline';
      case 'sleeper_berth':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const startTime = activity.start_time;
  const endTime = activity.end_time;
  const durationHours = (activity.duration_minutes / 60).toFixed(1);

  return (
    <div className="flex items-start gap-4 p-3 border rounded-lg">
      <Badge variant={getStatusColor(activity.status)}>
        {formatStatus(activity.status)}
      </Badge>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{startTime}</span>
          <span>-</span>
          <span className="font-medium">{endTime}</span>
          <span className="text-muted-foreground">({durationHours}h)</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {activity.location?.city || activity.location?.address || 'No location'}
        </p>
        {activity.remark && (
          <p className="text-sm mt-1">{activity.remark}</p>
        )}
        {activity.status === 'driving' && activity.miles_driven && (
          <p className="text-xs text-muted-foreground mt-1">
            {activity.miles_driven.toFixed(0)} miles
          </p>
        )}
      </div>
    </div>
  );
}
