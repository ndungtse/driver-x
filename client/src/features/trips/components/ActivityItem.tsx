'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity } from '@/types/models';
import { PencilIcon, TrashIcon } from 'lucide-react';
import { AddActivityDrawer } from './AddActivityDrawer';
import { useDeleteActivity } from '../hooks/useActivities';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trip } from '@/types/models';

interface ActivityItemProps {
  activity: Activity;
  dailyLogId: number;
  trip: Trip;
}

export function ActivityItem({ activity, dailyLogId, trip }: ActivityItemProps) {
  const deleteActivityMutation = useDeleteActivity(dailyLogId);

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

  const handleDelete = () => {
    deleteActivityMutation.mutate(activity.id);
  };

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
        <div className="mt-1 space-y-0.5">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Start:</span>{' '}
            {activity.location?.city || activity.location?.address || 'No location'}
          </p>
          {activity.end_location && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">End:</span>{' '}
              {activity.end_location.city || activity.end_location.address || 'No location'}
            </p>
          )}
        </div>
        {activity.remark && (
          <p className="text-sm mt-1">{activity.remark}</p>
        )}
        {activity.status === 'driving' && activity.miles_driven && (
          <p className="text-xs text-muted-foreground mt-1">
            {activity.miles_driven.toFixed(0)} miles
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <AddActivityDrawer
          dailyLogId={dailyLogId}
          trip={trip}
          initialData={activity}
        >
          <Button
            variant="ghost"
            size="icon"
            type="button"
          >
            <PencilIcon className="size-4" />
          </Button>
        </AddActivityDrawer>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <TrashIcon className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Activity</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this activity? This action cannot be undone
                and will adjust the timeline accordingly.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteActivityMutation.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
