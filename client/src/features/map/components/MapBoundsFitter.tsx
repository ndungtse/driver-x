'use client';

import { Activity, Trip } from '@/types/models';
import { useMap } from '@vis.gl/react-google-maps';
import { useEffect } from 'react';
import { calculateBoundsFromLocations, extendBoundsWithLatLngs } from '../utils/mapHelpers';

export function MapBoundsFitter({
    trip,
    activities,
    route,
    requiredStops,
    filters,
  }: {
    trip: Trip;
    activities: Activity[];
    route: { path: google.maps.LatLng[]; bounds: google.maps.LatLngBounds | null } | null | undefined;
    requiredStops: { fuel: any[]; rest: any[] };
    filters: { activities: boolean; fuelStops: boolean; restStops: boolean };
  }) {
    const map = useMap();
  
    useEffect(() => {
      if (!map || typeof window === 'undefined' || !window.google?.maps) {
        return;
      }
  
      let bounds: google.maps.LatLngBounds | null = null;
  
      if (route?.bounds) {
        bounds = route.bounds;
      } else if (route?.path && route.path.length > 0) {
        bounds = extendBoundsWithLatLngs(null, route.path);
      }
  
      const locations: Array<{ latitude?: number; longitude?: number }> = [
        trip.current_location,
        trip.pickup_location,
        trip.dropoff_location,
      ].filter(Boolean) as Array<{ latitude?: number; longitude?: number }>;
  
      const tripLocationsBounds = calculateBoundsFromLocations(locations);
      if (tripLocationsBounds) {
        if (bounds) {
          const ne = tripLocationsBounds.getNorthEast();
          const sw = tripLocationsBounds.getSouthWest();
          bounds.extend(ne);
          bounds.extend(sw);
        } else {
          bounds = tripLocationsBounds;
        }
      }
  
      const activityLocations = filters.activities
        ? activities
            .filter((a) => a.location?.latitude && a.location?.longitude)
            .map((a) => a.location!)
        : [];
  
      const activityBounds = calculateBoundsFromLocations(activityLocations);
      if (activityBounds) {
        if (bounds) {
          const ne = activityBounds.getNorthEast();
          const sw = activityBounds.getSouthWest();
          bounds.extend(ne);
          bounds.extend(sw);
        } else {
          bounds = activityBounds;
        }
      }
  
      const requiredStopLocations: Array<{ latitude?: number; longitude?: number }> = [];
  
      if (filters.fuelStops) {
        requiredStops.fuel.forEach((stop) => {
          if (stop.location?.latitude && stop.location?.longitude) {
            requiredStopLocations.push(stop.location);
          }
        });
      }
  
      if (filters.restStops) {
        requiredStops.rest.forEach((stop) => {
          if (stop.location?.latitude && stop.location?.longitude) {
            requiredStopLocations.push(stop.location);
          }
        });
      }
  
      const stopsBounds = calculateBoundsFromLocations(requiredStopLocations);
      if (stopsBounds) {
        if (bounds) {
          const ne = stopsBounds.getNorthEast();
          const sw = stopsBounds.getSouthWest();
          bounds.extend(ne);
          bounds.extend(sw);
        } else {
          bounds = stopsBounds;
        }
      }
  
      if (bounds && !bounds.isEmpty()) {
        map.fitBounds(bounds, {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50,
        });
      }
    }, [map, trip, activities, route, requiredStops, filters]);
  
    return null;
  }