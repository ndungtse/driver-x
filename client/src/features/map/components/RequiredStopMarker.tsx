'use client';

import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { FuelIcon, BedIcon } from 'lucide-react';

interface RequiredStopMarkerProps {
  stop: {
    location: {
      latitude: number;
      longitude: number;
    };
    type: 'fuel' | '10hr_rest';
  };
  onClick: () => void;
}

export function RequiredStopMarker({ stop, onClick }: RequiredStopMarkerProps) {
  if (!stop.location?.latitude || !stop.location?.longitude) return null;

  const position = {
    lat: stop.location.latitude,
    lng: stop.location.longitude,
  };

  const Icon = stop.type === 'fuel' ? FuelIcon : BedIcon;
  const color = stop.type === 'fuel' ? '#f59e0b' : '#8b5cf6';

  return (
    <AdvancedMarker position={position} onClick={onClick}>
      <div
        className="flex items-center justify-center p-2 rounded-full shadow-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        style={{ backgroundColor: color }}
      >
        <Icon className="size-4 text-white" />
      </div>
    </AdvancedMarker>
  );
}

