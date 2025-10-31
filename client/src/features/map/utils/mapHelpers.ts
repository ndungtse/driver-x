export function calculateCenterFromLocations(locations: Array<{ latitude?: number; longitude?: number }>) {
  const validLocations = locations.filter(
    (loc) => loc.latitude != null && loc.longitude != null
  );

  if (validLocations.length === 0) {
    return { lat: 39.8283, lng: -98.5795 }; // US center
  }

  const sumLat = validLocations.reduce((sum, loc) => sum + (loc.latitude || 0), 0);
  const sumLng = validLocations.reduce((sum, loc) => sum + (loc.longitude || 0), 0);

  return {
    lat: sumLat / validLocations.length,
    lng: sumLng / validLocations.length,
  };
}

export function calculateBoundsFromLocations(
  locations: Array<{ latitude?: number; longitude?: number }>
): google.maps.LatLngBounds | null {
  if (typeof window === 'undefined' || !window.google?.maps) {
    return null;
  }

  const validLocations = locations.filter(
    (loc) => loc.latitude != null && loc.longitude != null
  );

  if (validLocations.length === 0) {
    return null;
  }

  const bounds = new google.maps.LatLngBounds();

  validLocations.forEach((loc) => {
    bounds.extend(
      new google.maps.LatLng(loc.latitude!, loc.longitude!)
    );
  });

  return bounds;
}

export function extendBoundsWithLatLngs(
  bounds: google.maps.LatLngBounds | null,
  latLngs: google.maps.LatLng[]
): google.maps.LatLngBounds | null {
  if (typeof window === 'undefined' || !window.google?.maps) {
    return null;
  }

  if (!bounds) {
    bounds = new google.maps.LatLngBounds();
  }

  latLngs.forEach((latLng) => {
    bounds!.extend(latLng);
  });

  return bounds;
}

