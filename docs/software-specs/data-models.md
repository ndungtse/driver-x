# Data Models

## Entity Hierarchy
```
Trip (parent)
  ├── TripDetails (metadata)
  ├── DailyLog[] (one per day)
  │     └── Activity[] (timeline entries)
  └── Route (calculated path)
```

## Trip Model
Primary container for entire journey.

```python
Trip {
  id: UUID
  driver_id: String
  status: Enum['planning', 'in_progress', 'completed']
  
  # Input fields
  current_location: Location
  pickup_location: Location
  dropoff_location: Location
  current_cycle_hours: Float  # Hours already used in 8-day cycle
  
  # Calculated fields
  total_distance: Float  # miles
  estimated_duration: Float  # hours
  start_datetime: DateTime
  end_datetime: DateTime (estimated)
  
  created_at: DateTime
  updated_at: DateTime
}
```

## Location Model
```python
Location {
  address: String
  city: String
  state: String
  coordinates: {
    lat: Float
    lng: Float
  }
}
```

## DailyLog Model
One record per calendar day. Logbook sheet generated from this.

```python
DailyLog {
  id: UUID
  trip_id: UUID (foreign key)
  date: Date
  
  # Metadata (for logbook header)
  driver_name: String
  driver_signature: String
  co_driver_name: String (nullable)
  home_terminal: String
  carrier_name: String
  
  # Vehicle info
  tractor_number: String
  trailer_numbers: String[]
  
  # Shipping info
  shipper: String
  commodity: String
  shipping_doc_numbers: String[]
  
  # Calculated totals (see totals calculation)
  total_miles_driven: Float
  total_truck_mileage: Float
  off_duty_hours: Float
  sleeper_berth_hours: Float
  driving_hours: Float
  on_duty_not_driving_hours: Float
  
  # Timeline reference
  activities: Activity[] (ordered by start_time)
}
```

## Activity Model
Single timeline entry representing a duty status period.

```python
Activity {
  id: UUID
  daily_log_id: UUID (foreign key)
  
  # Core fields
  status: Enum['off_duty', 'sleeper_berth', 'driving', 'on_duty_not_driving']
  start_time: Time  # HH:MM (24-hour, relative to log date)
  end_time: Time    # HH:MM
  duration_minutes: Integer (calculated)
  
  # Location tracking
  location: Location
  
  # Details for remarks section
  remark: String  # e.g., "Green Bay, WI - Pre-trip/TIV"
  
  # For driving activities
  miles_driven: Float (nullable)
  
  # Ordering
  sequence: Integer  # Position in daily timeline
  
  created_at: DateTime
  updated_at: DateTime
}
```

## Route Model
Calculated route with waypoints and required stops.

```python
Route {
  id: UUID
  trip_id: UUID (foreign key)
  
  # Calculated path
  waypoints: Waypoint[]  # Ordered points along route
  
  # Required stops (auto-calculated)
  fuel_stops: Stop[]     # Every ~1000 miles
  rest_breaks: Stop[]    # HOS compliance breaks
  
  total_distance: Float
  estimated_time: Float
}
```

## Waypoint Model
```python
Waypoint {
  sequence: Integer
  location: Location
  activity_type: Enum['start', 'pickup', 'dropoff', 'fuel', 'rest', 'end']
  estimated_arrival: DateTime
  miles_from_start: Float
}
```

## Stop Model
```python
Stop {
  type: Enum['fuel', '30min_break', '10hr_rest', 'pickup', 'dropoff']
  location: Location (suggested/actual)
  duration_minutes: Integer
  miles_from_start: Float
  reason: String  # e.g., "30-minute break required after 8hr driving"
}
```

## Activity Status Types
Reference FMCSA definitions (see `../resources/fmcsa-hos-395-drivers-guide-to-hos-2022-04-28-0.md`):

1. **Off Duty (Line 1)**: Not working, relieved of all duties
2. **Sleeper Berth (Line 2)**: Resting in truck's sleeper compartment
3. **Driving (Line 3)**: Operating CMV / at the controls
4. **On Duty Not Driving (Line 4)**: Working but not driving (loading, fueling, pre-trip inspection, etc.)

## Data Flow
1. User inputs trip details → Creates Trip
2. System calculates route → Creates Route with Waypoints/Stops
3. Driver starts trip → Creates first DailyLog
4. Driver logs activities → Creates Activity records (linear timeline)
5. System generates logbook sheets → Renders DailyLog with Activities
6. New day starts → Creates new DailyLog (same Trip)

