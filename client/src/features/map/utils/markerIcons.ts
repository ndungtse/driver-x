import {
  CarIcon,
  WrenchIcon,
  CoffeeIcon,
  BedIcon,
  MapPinIcon,
  PackageIcon,
  TargetIcon,
  FuelIcon,
} from 'lucide-react';
import { ActivityStatus } from '@/types/models';

export function getActivityIcon(status: ActivityStatus) {
  const iconMap: Record<ActivityStatus, typeof CarIcon> = {
    driving: CarIcon,
    on_duty_not_driving: WrenchIcon,
    off_duty: CoffeeIcon,
    sleeper_berth: BedIcon,
  };
  return iconMap[status] || MapPinIcon;
}

export function getActivityColor(status: ActivityStatus): string {
  const colorMap: Record<ActivityStatus, string> = {
    driving: '#3b82f6', // blue
    on_duty_not_driving: '#10b981', // green
    off_duty: '#f59e0b', // yellow/orange
    sleeper_berth: '#8b5cf6', // purple
  };
  return colorMap[status] || '#6b7280';
}

export function getTripLocationIcon(type: 'start' | 'pickup' | 'dropoff') {
  const iconMap = {
    start: MapPinIcon,
    pickup: PackageIcon,
    dropoff: TargetIcon,
  };
  return iconMap[type];
}

export function getTripLocationColor(type: 'start' | 'pickup' | 'dropoff'): string {
  const colorMap = {
    start: '#10b981', // green
    pickup: '#3b82f6', // blue
    dropoff: '#ef4444', // red
  };
  return colorMap[type];
}

