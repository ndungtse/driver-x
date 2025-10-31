'use client';

import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { Activity } from '@/types/models';
import { getActivityIcon, getActivityColor } from '../utils/markerIcons';

interface ActivityMarkerProps {
  activity: Activity;
  onClick: () => void;
}

export function ActivityMarker({ activity, onClick }: ActivityMarkerProps) {
  if (!activity.location?.latitude || !activity.location?.longitude) {
    return null;
  }

  const position = {
    lat: activity.location.latitude,
    lng: activity.location.longitude,
  };

  const color = getActivityColor(activity.status);

  const renderIcon = () => {
    const IconComponent = getActivityIcon(activity.status);
    return <IconComponent className="size-5 text-white" />;
  };

  return (
    <AdvancedMarker position={position} onClick={onClick}>
      <div
        className="flex items-center justify-center p-2 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform"
        style={{ backgroundColor: color }}
      >
        {renderIcon()}
      </div>
    </AdvancedMarker>
  );
}

