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

