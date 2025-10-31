import { ActivityStatus } from '@/types/models';

export const GRID_CONFIG = {
  width: 1200,
  height: 400,
  rowHeight: 100,
  pixelsPerHour: 50,
};

export function timeToXPosition(time: string): number {
  const [hours, minutes, seconds] = time.split(':').map(Number);
  const totalHours = hours + (minutes || 0) / 60 + (seconds || 0) / 3600;
  return (totalHours / 24) * GRID_CONFIG.width;
}

export function statusToYPosition(status: ActivityStatus): number {
  const rowMap: Record<ActivityStatus, number> = {
    off_duty: 0,
    sleeper_berth: 1,
    driving: 2,
    on_duty_not_driving: 3,
  };
  return rowMap[status] * GRID_CONFIG.rowHeight + 50;
}

export function getStatusLabel(status: ActivityStatus): string {
  const labels: Record<ActivityStatus, string> = {
    off_duty: 'Off Duty',
    sleeper_berth: 'Sleeper Berth',
    driving: 'Driving',
    on_duty_not_driving: 'On Duty (Not Driving)',
  };
  return labels[status];
}

