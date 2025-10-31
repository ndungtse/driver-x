'use client';

import { Activity, Trip } from '@/types/models';
import { Map } from '@vis.gl/react-google-maps';
import { useMemo, useState } from 'react';
import { useMapConfig } from '../configs/config';
import { useRequiredStops } from '../hooks/useRequiredStops';
import { useRouteCalculation } from '../hooks/useRouteCalculation';
import { calculateCenterFromLocations } from '../utils/mapHelpers';
import { ActivityMarker } from './ActivityMarker';
import { MapControls } from './MapControls';
import { MapInfoWindow } from './MapInfoWindow';
import { RequiredStopMarker } from './RequiredStopMarker';
import { RoutePolyline } from './RoutePolyline';
import { TripLocationMarker } from './TripLocationMarker';

interface JourneyMapProps {
  trip: Trip;
  activities: Activity[];
}


export function JourneyMap({ trip, activities }: JourneyMapProps) {
  const { mapConfig } = useMapConfig();
  const [selectedMarker, setSelectedMarker] = useState<{
    type: 'activity' | 'fuel' | 'rest';
    data: any;
  } | null>(null);

  const [filters, setFilters] = useState({
    activities: true,
    fuelStops: true,
    restStops: true,
  });

  const { data: route, isLoading: routeLoading } = useRouteCalculation(trip);
  const requiredStops = useRequiredStops(route);

  const center = useMemo(() => {
    const locations = [
      trip.current_location,
      trip.pickup_location,
      trip.dropoff_location,
    ].filter(Boolean);
    return calculateCenterFromLocations(locations);
  }, [trip]);

  const filteredActivities = useMemo(() => {
    return filters.activities ? activities : [];
  }, [activities, filters.activities]);

  return (
    <div className="relative h-[600px] w-full rounded-lg overflow-hidden border">
      {routeLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20">
          <p className="text-sm text-muted-foreground">Calculating route...</p>
        </div>
      )}
      
      <Map
        defaultCenter={center}
        defaultZoom={6}
        mapId={mapConfig.mapId}
        styles={mapConfig.styles}
        gestureHandling="greedy"
        disableDefaultUI={false}
        className="w-full h-full"
      >
        {route && <RoutePolyline route={route} />}

        <TripLocationMarker location={trip.current_location} type="start" />
        <TripLocationMarker location={trip.pickup_location} type="pickup" />
        <TripLocationMarker location={trip.dropoff_location} type="dropoff" />

        {filteredActivities.map((activity) => (
          <ActivityMarker
            key={activity.id}
            activity={activity}
            onClick={() =>
              setSelectedMarker({ type: 'activity', data: activity })
            }
          />
        ))}

        {filters.fuelStops &&
          requiredStops.fuel.map((stop, idx) => (
            <RequiredStopMarker
              key={`fuel-${idx}`}
              stop={stop}
              onClick={() => setSelectedMarker({ type: 'fuel', data: stop })}
            />
          ))}

        {filters.restStops &&
          requiredStops.rest.map((stop, idx) => (
            <RequiredStopMarker
              key={`rest-${idx}`}
              stop={stop}
              onClick={() => setSelectedMarker({ type: 'rest', data: stop })}
            />
          ))}

        {selectedMarker && (
          <MapInfoWindow
            marker={selectedMarker}
            onClose={() => setSelectedMarker(null)}
          />
        )}
      </Map>

      <MapControls filters={filters} onFilterChange={setFilters} />
    </div>
  );
}

