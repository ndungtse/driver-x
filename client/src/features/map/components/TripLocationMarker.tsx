'use client';

import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { Location } from '@/types/models';
import { getTripLocationIcon, getTripLocationColor } from '../utils/markerIcons';

interface TripLocationMarkerProps {
  location: Location | null | undefined;
  type: 'start' | 'pickup' | 'dropoff';
}

export function TripLocationMarker({ location, type }: TripLocationMarkerProps) {
  if (!location?.latitude || !location?.longitude) return null;

  const position = {
    lat: location.latitude,
    lng: location.longitude,
  };

  const color = getTripLocationColor(type);

  const labels = {
    start: 'Start',
    pickup: 'Pickup',
    dropoff: 'Dropoff',
  };

  const renderIcon = () => {
    const IconComponent = getTripLocationIcon(type);
    return <IconComponent className="size-6 text-white" />;
  };

  return (
    <AdvancedMarker position={position}>
      <div className="flex flex-col items-center">
        <div
          className="flex items-center justify-center p-3 rounded-full shadow-xl border-2 border-white"
          style={{ backgroundColor: color }}
        >
          {renderIcon()}
        </div>
        <span className="text-xs font-medium mt-1 bg-white px-2 py-0.5 rounded shadow">
          {labels[type]}
        </span>
      </div>
    </AdvancedMarker>
  );
}

