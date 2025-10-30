# Map Integration

## Purpose
Visualize trip route, driver activities, and required stops on an interactive map.

---

## Map Requirements

### Display Elements
1. **Route Polyline**: Full driving path from current location → pickup → dropoff
2. **Activity Markers**: Pins at each logged activity location
3. **Required Stops**: Suggested fuel/rest locations along route
4. **Current Position**: Real-time driver location (if tracking enabled)

### Map Provider Options
**Recommended**: Free tier API suitable for assessment

Options:
- **Mapbox** (free tier: 50K loads/month) ✅ Recommended
- **Leaflet + OpenStreetMap** (fully free) ✅ Good alternative
- **Google Maps** (requires billing setup)

**Decision**: Use **Mapbox** for modern features + free tier.

---

## Map Features by Tab

### Journey Map Tab (Main Map View)

**Map Container**:
```jsx
<MapContainer center={tripCenter} zoom={6} style={{ height: '600px' }}>
  {/* Route polyline */}
  <RoutePolyline coordinates={routePath} />
  
  {/* Activity markers */}
  {activities.map(activity => (
    <ActivityMarker 
      key={activity.id}
      position={activity.location.coordinates}
      activity={activity}
    />
  ))}
  
  {/* Suggested stops */}
  {suggestedStops.map(stop => (
    <StopMarker 
      key={stop.id}
      position={stop.location.coordinates}
      stop={stop}
    />
  ))}
</MapContainer>
```

---

## Marker Types & Icons

### 1. Activity Markers (Actual Logged Activities)

**Color-coded by status**:
- 🔴 **Driving**: Blue car icon
- 🟢 **On Duty Not Driving**: Green wrench icon
- 🟡 **Off Duty**: Yellow coffee cup icon
- 🟣 **Sleeper Berth**: Purple bed icon

**Marker Data**:
```javascript
{
  type: 'activity',
  status: 'driving',
  location: { lat: 44.5133, lng: -88.0133 },
  city: 'Green Bay, WI',
  time: '06:30',
  duration: '2h 30m',
  remark: 'Driving to pickup'
}
```

### 2. Special Location Markers

**Types**:
- 📍 **Start**: Home/current location (large green pin)
- 📦 **Pickup**: Shipper location (blue box icon)
- 🎯 **Dropoff**: Receiver location (red target icon)
- ⛽ **Fuel Stop**: Gas pump icon (suggested or actual)
- 🛑 **Rest Area**: Rest stop icon (suggested or actual)

### 3. Required Stop Markers (Suggested)

**Semi-transparent when not yet logged**:
- Show as "ghost" markers until driver logs activity
- Example: Suggested fuel stop at mile 1000 → translucent pump icon
- Once driver logs fueling → becomes solid green icon

---

## Popup/Info Windows

**On Marker Click**, display popup with details:

```jsx
<Popup>
  <PopupContent>
    <PopupTitle>{activity.status}</PopupTitle>
    <PopupDetail>
      <Icon>📍</Icon> {activity.location.city}, {activity.location.state}
    </PopupDetail>
    <PopupDetail>
      <Icon>🕒</Icon> {activity.start_time} - {activity.end_time}
    </PopupDetail>
    <PopupDetail>
      <Icon>⏱️</Icon> Duration: {activity.duration}
    </PopupDetail>
    {activity.miles_driven && (
      <PopupDetail>
        <Icon>🛣️</Icon> Miles: {activity.miles_driven}
      </PopupDetail>
    )}
    <PopupRemark>{activity.remark}</PopupRemark>
  </PopupContent>
</Popup>
```

---

## Route Calculation

### Input to Route API
From Trip model:
```javascript
{
  origin: { lat: 44.5133, lng: -88.0133 },       // Current location
  waypoints: [
    { lat: 41.8781, lng: -87.6298 }              // Pickup location
  ],
  destination: { lat: 40.7128, lng: -74.0060 }   // Dropoff location
}
```

### API Integration (Mapbox Directions API)

**Request**:
```javascript
const getRoute = async (origin, waypoints, destination) => {
  const coordinates = [
    [origin.lng, origin.lat],
    ...waypoints.map(w => [w.lng, w.lat]),
    [destination.lng, destination.lat]
  ].join(';');
  
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}`;
  
  const response = await fetch(url + '?geometries=geojson&access_token=' + MAPBOX_TOKEN);
  const data = await response.json();
  
  return {
    route: data.routes[0].geometry.coordinates,  // Array of [lng, lat] points
    distance: data.routes[0].distance,           // meters
    duration: data.routes[0].duration            // seconds
  };
};
```

**Response Processing**:
```javascript
// Convert distance to miles
const distanceMiles = route.distance * 0.000621371;

// Convert duration to hours
const durationHours = route.duration / 3600;

// Store in Trip model
trip.total_distance = distanceMiles;
trip.estimated_duration = durationHours;
```

---

## Calculating Stop Locations

### Fuel Stops (Every 1000 Miles)

**Strategy**: Find actual fuel stations near 1000-mile marks along route.

**Implementation**:
1. Calculate point on route at 1000 miles from start
2. Query nearby fuel stations (use Mapbox POI search or separate API)
3. Suggest closest station

```javascript
const findFuelStops = async (routePolyline, totalDistance) => {
  const stops = [];
  
  for (let miles = 1000; miles < totalDistance; miles += 1000) {
    // Get lat/lng at this distance along route
    const point = getPointAlongRoute(routePolyline, miles);
    
    // Search for gas stations within 10-mile radius
    const stations = await searchNearbyPOIs(point, 'gas_station', radiusMiles: 10);
    
    if (stations.length > 0) {
      stops.push({
        type: 'fuel',
        location: stations[0].location,  // Closest station
        miles_from_start: miles,
        name: stations[0].name
      });
    }
  }
  
  return stops;
};
```

### Rest Stops (After 11 Hours Driving)

**Strategy**: Find rest areas or truck stops after ~11 hours of driving.

**Calculation**:
- Assume average speed 55 mph
- 11 hours = ~605 miles
- 14-hour window = ~770 miles (accounting for breaks)

```javascript
const findRestStops = async (routePolyline, totalDistance) => {
  const stops = [];
  let drivingMiles = 0;
  
  while (drivingMiles < totalDistance) {
    drivingMiles += 605;  // 11 hours at 55 mph
    
    if (drivingMiles < totalDistance) {
      const point = getPointAlongRoute(routePolyline, drivingMiles);
      
      // Search for rest areas or truck stops
      const restAreas = await searchNearbyPOIs(point, 'rest_area,truck_stop', radiusMiles: 20);
      
      if (restAreas.length > 0) {
        stops.push({
          type: '10hr_rest',
          location: restAreas[0].location,
          miles_from_start: drivingMiles,
          name: restAreas[0].name,
          duration_hours: 10
        });
      }
    }
  }
  
  return stops;
};
```

**POI Search** (Mapbox example):
```javascript
const searchNearbyPOIs = async (point, category, radiusMiles) => {
  const radiusMeters = radiusMiles * 1609.34;
  
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${category}.json`;
  const params = new URLSearchParams({
    proximity: `${point.lng},${point.lat}`,
    types: 'poi',
    limit: 5,
    access_token: MAPBOX_TOKEN
  });
  
  const response = await fetch(url + '?' + params);
  const data = await response.json();
  
  return data.features.map(f => ({
    name: f.text,
    location: {
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0]
    }
  }));
};
```

---

## Map Interactions

### Filtering Markers

**UI Controls**:
```jsx
<MapControls>
  <FilterButton active={filters.activities} onClick={() => toggleFilter('activities')}>
    Activities
  </FilterButton>
  <FilterButton active={filters.fuelStops} onClick={() => toggleFilter('fuelStops')}>
    Fuel Stops
  </FilterButton>
  <FilterButton active={filters.restStops} onClick={() => toggleFilter('restStops')}>
    Rest Stops
  </FilterButton>
</MapControls>
```

**Behavior**:
- Toggle marker visibility based on filter state
- Update legend to show only active marker types

### Clicking Marker → Timeline Connection

**When user clicks activity marker on map**:
1. Highlight corresponding activity in Timeline tab
2. Optionally: Auto-scroll timeline to that activity
3. Show popup with activity details

**Implementation**:
```javascript
const handleMarkerClick = (activityId) => {
  // Update app state
  setSelectedActivityId(activityId);
  
  // If Timeline tab not active, optionally switch to it
  // Or: Keep map tab active and show details in sidebar
};
```

### Live Tracking (Optional Enhancement)

If driver enables GPS tracking:
1. Show blue pulsing dot for current position
2. Update position every 30 seconds
3. Auto-log driving activities based on movement
4. Detect stops and prompt: "Did you stop for fuel/rest?"

---

## Responsive Map Design

### Desktop (>1200px)
- Full-height map (600px+)
- Sidebar with activity list (can filter map by clicking list items)

### Tablet (768-1200px)
- Map height: 400px
- Activity list below map (vertical scroll)

### Mobile (<768px)
- Map height: 300px (or full-screen on tap)
- Simplified markers (smaller icons)
- Swipe-up panel for activity list
- Consider: Map as separate full-screen view

---

## Export Map View

### Screenshot Feature
**Button**: "Save Map Image"

**Implementation**:
```javascript
const exportMapImage = async () => {
  // Use map library's built-in export (Mapbox: map.getCanvas().toDataURL())
  const canvas = mapRef.current.getCanvas();
  const imageData = canvas.toDataURL('image/png');
  
  // Download
  const link = document.createElement('a');
  link.href = imageData;
  link.download = `trip-map-${tripId}.png`;
  link.click();
};
```

**Use case**: Include map in PDF report or share with dispatcher.

---

## Map in PDF Logbook (Optional)

When generating PDF logbook, include static map image on summary page:

**Implementation**:
1. Generate static map image (Mapbox Static Images API)
2. Embed in PDF header/footer

```python
# Django backend
from mapbox import StaticStyle

def generate_trip_map_image(trip):
    # Create static map with route + markers
    url = f"https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/"
    url += f"path-5+f44({encode_polyline(trip.route)})"  # Route polyline
    url += f"/auto/600x400@2x?access_token={MAPBOX_TOKEN}"
    
    response = requests.get(url)
    return response.content  # PNG image
```

---

## Testing Map Features

**Test Cases**:
1. Route calculation for 500-mile trip → Should show 1 fuel stop, 0 rest stops
2. Route calculation for 1500-mile trip → Should show 2 fuel stops, 1 rest stop
3. Click activity marker → Should show popup with correct details
4. Filter markers → Should hide/show correct marker types
5. Mobile view → Map should be responsive and functional

**Mock data**: Use static GeoJSON for testing without API calls.

---

## API Rate Limits & Optimization

**Mapbox Free Tier**:
- 50,000 map loads/month
- 100,000 API requests/month

**Optimization strategies**:
1. **Cache routes**: Store calculated routes in DB (don't recalculate on every page load)
2. **Lazy load map**: Only initialize when Journey Map tab is active
3. **Static images for PDF**: Use Static Images API (cheaper than interactive maps)
4. **Combine requests**: Batch POI searches

---

## Related Specs
- [Data Models](./data-models.md) - Location and Route models
- [HOS Rules](./hos-rules.md) - Required stop calculations
- [UI Components](./ui-components.md) - Journey Map tab layout

