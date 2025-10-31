'use client';

import { InfoWindow } from '@vis.gl/react-google-maps';
import { Activity } from '@/types/models';

type StopData = {
  location?: { latitude?: number; longitude?: number };
  miles_from_start?: number;
  type?: string;
  duration_hours?: number;
};

interface MapInfoWindowProps {
  marker: {
    type: 'activity' | 'fuel' | 'rest';
    data: Activity | StopData;
  };
  onClose: () => void;
}

export function MapInfoWindow({ marker, onClose }: MapInfoWindowProps) {
  const { type, data } = marker;

  let position: { lat: number; lng: number } | null = null;
  
  if (type === 'activity' && 'location' in data && data.location) {
    if (data.location.latitude != null && data.location.longitude != null) {
      position = {
        lat: data.location.latitude,
        lng: data.location.longitude,
      };
    }
  } else if ((type === 'fuel' || type === 'rest') && 'location' in data && data.location) {
    if (data.location.latitude != null && data.location.longitude != null) {
      position = {
        lat: data.location.latitude,
        lng: data.location.longitude,
      };
    }
  }

  if (!position) return null;

  return (
    <InfoWindow position={position} onCloseClick={onClose}>
      <div className="p-2 max-w-xs">
        {type === 'activity' && <ActivityInfo activity={data as Activity} />}
        {(type === 'fuel' || type === 'rest') && <StopInfo stop={data as StopData} />}
      </div>
    </InfoWindow>
  );
}

function ActivityInfo({ activity }: { activity: Activity }) {
  const statusLabel = activity.status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="space-y-1">
      <h3 className="font-semibold text-sm">{statusLabel}</h3>
      <p className="text-xs">
        📍 {activity.location?.city || 'Unknown'}, {activity.location?.state || ''}
      </p>
      <p className="text-xs">
        🕒 {activity.start_time} - {activity.end_time}
      </p>
      <p className="text-xs">⏱️ {(activity.duration_minutes / 60).toFixed(1)}h</p>
      {activity.miles_driven && (
        <p className="text-xs">🛣️ {activity.miles_driven.toFixed(0)} miles</p>
      )}
      {activity.remark && (
        <p className="text-xs italic mt-2">{activity.remark}</p>
      )}
    </div>
  );
}

function StopInfo({
  stop,
}: {
  stop: StopData;
}) {
  const isFuel = stop.type === 'fuel';

  return (
    <div className="space-y-1">
      <h3 className="font-semibold text-sm">
        {isFuel ? 'Suggested Fuel Stop' : 'Suggested Rest Stop'}
      </h3>
      {stop.miles_from_start != null && (
        <p className="text-xs">📍 {stop.miles_from_start.toFixed(0)} miles from start</p>
      )}
      {stop.duration_hours && (
        <p className="text-xs">⏱️ {stop.duration_hours}h recommended</p>
      )}
    </div>
  );
}

