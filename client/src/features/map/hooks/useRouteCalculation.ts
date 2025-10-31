'use client';

import { useQuery } from '@tanstack/react-query';
import { Trip } from '@/types/models';

interface RouteData {
  path: google.maps.LatLng[];
  distance: number; // miles
  duration: number; // hours
  bounds: google.maps.LatLngBounds | null;
}

export function useRouteCalculation(trip: Trip | undefined) {
  return useQuery<RouteData | null>({
    queryKey: ['route', trip?.id],
    queryFn: async () => {
      if (
        !trip ||
        !trip.current_location?.latitude ||
        !trip.dropoff_location?.latitude ||
        typeof window === 'undefined' ||
        !window.google?.maps?.DirectionsService
      ) {
        return null;
      }

      const directionsService = new google.maps.DirectionsService();

      const waypoints: google.maps.DirectionsWaypoint[] = [];
      if (trip.pickup_location?.latitude && trip.pickup_location?.longitude) {
        waypoints.push({
          location: new google.maps.LatLng(
            trip.pickup_location.latitude,
            trip.pickup_location.longitude
          ),
          stopover: true,
        });
      }

      const request: google.maps.DirectionsRequest = {
        origin: new google.maps.LatLng(
          trip.current_location.latitude,
          trip.current_location.longitude
        ),
        destination: new google.maps.LatLng(
          trip.dropoff_location.latitude,
          trip.dropoff_location.longitude
        ),
        waypoints: waypoints.length > 0 ? waypoints : undefined,
        travelMode: google.maps.TravelMode.DRIVING,
      };

      return new Promise<RouteData | null>((resolve) => {
        directionsService.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result && result.routes.length > 0) {
            const route = result.routes[0];
            const path: google.maps.LatLng[] = [];

            route.legs.forEach((leg) => {
              leg.steps.forEach((step) => {
                step.path.forEach((point) => {
                  path.push(point);
                });
              });
            });

            const distance = route.legs.reduce(
              (sum, leg) => sum + (leg.distance?.value || 0),
              0
            ) / 1609.34;

            const duration = route.legs.reduce(
              (sum, leg) => sum + (leg.duration?.value || 0),
              0
            ) / 3600;

            resolve({
              path,
              distance,
              duration,
              bounds: route.bounds || null,
            });
          } else {
            resolve(null);
          }
        });
      });
    },
    enabled:
      !!trip?.current_location?.latitude &&
      !!trip?.dropoff_location?.latitude &&
      typeof window !== 'undefined' &&
      !!window.google?.maps,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

