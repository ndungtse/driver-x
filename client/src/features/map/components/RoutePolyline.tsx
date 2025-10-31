'use client';

import { Polyline } from "./Polyline";

interface RoutePolylineProps {
  route: {
    path: google.maps.LatLng[];
  } | null;
}

export function RoutePolyline({ route }: RoutePolylineProps) {
  if (!route || !route.path || route.path.length === 0) return null;

  return (
    <Polyline
      path={route.path}
      strokeColor="#2563eb"
      strokeWeight={4}
      strokeOpacity={0.8}
    />
  );
}

