'use client';

import { useMemo } from 'react';

interface StopData {
  location: {
    latitude: number;
    longitude: number;
  };
  miles_from_start: number;
  type: 'fuel' | '10hr_rest';
  duration_hours?: number;
}

interface RouteData {
  path: google.maps.LatLng[];
  distance: number;
}

export function useRequiredStops(route: RouteData | null | undefined) {
  return useMemo<{ fuel: StopData[]; rest: StopData[] }>(() => {
    if (!route || !route.distance || !route.path || route.path.length === 0) {
      return { fuel: [], rest: [] };
    }

    const fuelStops: StopData[] = [];
    const restStops: StopData[] = [];

    const totalMiles = route.distance;
    const pathLength = route.path.length;

    for (let miles = 1000; miles < totalMiles; miles += 1000) {
      const ratio = miles / totalMiles;
      const index = Math.floor(ratio * pathLength);
      
      if (index < pathLength) {
        const point = route.path[index];
        fuelStops.push({
          location: {
            latitude: point.lat(),
            longitude: point.lng(),
          },
          miles_from_start: miles,
          type: 'fuel',
        });
      }
    }

    let drivingMiles = 605;
    while (drivingMiles < totalMiles) {
      const ratio = drivingMiles / totalMiles;
      const index = Math.floor(ratio * pathLength);
      
      if (index < pathLength) {
        const point = route.path[index];
        restStops.push({
          location: {
            latitude: point.lat(),
            longitude: point.lng(),
          },
          miles_from_start: drivingMiles,
          type: '10hr_rest',
          duration_hours: 10,
        });
      }
      drivingMiles += 605;
    }

    return { fuel: fuelStops, rest: restStops };
  }, [route]);
}

