# Hours of Service (HOS) Rules Implementation

## Purpose
Implement FMCSA Hours of Service regulations for property-carrying drivers to ensure compliance and provide warnings.

Reference: `../resources/fmcsa-hos-395-drivers-guide-to-hos-2022-04-28-0.md`

---

## Property-Carrying Driver Limits

### 1. 11-Hour Driving Limit
**Rule**: Cannot drive more than 11 hours total after coming on duty following 10+ consecutive hours off duty.

**Implementation**:
```python
def check_11_hour_limit(daily_log):
    total_driving = sum(
        a.duration_minutes for a in daily_log.activities 
        if a.status == 'driving'
    )
    
    max_driving_minutes = 11 * 60  # 660 minutes
    
    if total_driving > max_driving_minutes:
        return {
            'violated': True,
            'message': f'Driving time ({total_driving/60:.1f}h) exceeds 11-hour limit',
            'severity': 'error'
        }
    elif total_driving > max_driving_minutes - 30:  # Within 30 min of limit
        return {
            'violated': False,
            'message': f'Approaching 11-hour limit ({(max_driving_minutes - total_driving)/60:.1f}h remaining)',
            'severity': 'warning'
        }
    
    return None  # No violation
```

### 2. 14-Hour Driving Window
**Rule**: Cannot drive beyond 14th consecutive hour after coming on duty, following 10+ consecutive hours off duty.

**Key**: 14-hour window includes all on-duty time, not just driving.

**Implementation**:
```python
def check_14_hour_window(daily_log):
    # Find start of duty period (first non-off-duty activity after 10+ hr off)
    duty_start = find_duty_period_start(daily_log)
    
    # Find last driving activity
    last_driving = get_last_activity_by_status(daily_log, 'driving')
    
    if last_driving:
        time_since_duty_start = calculate_duration(duty_start, last_driving.end_time)
        
        if time_since_duty_start > 14 * 60:  # 840 minutes
            return {
                'violated': True,
                'message': f'Driving after 14-hour window ({time_since_duty_start/60:.1f}h since starting duty)',
                'severity': 'error'
            }
    
    return None
```

**Note**: Driver CAN continue on-duty work (loading, paperwork) after 14 hours, just cannot drive.

### 3. 30-Minute Rest Break
**Rule**: Must take 30+ minute break (off-duty, sleeper berth, or on-duty not driving) if more than 8 hours have passed since last break.

**Implementation**:
```python
def check_30_minute_break(daily_log):
    driving_time_since_break = 0
    last_qualifying_break = None
    
    for activity in daily_log.activities:
        if activity.status == 'driving':
            driving_time_since_break += activity.duration_minutes
            
            if driving_time_since_break > 8 * 60:  # 480 minutes
                return {
                    'violated': True,
                    'message': 'Drove more than 8 hours without 30-minute break',
                    'severity': 'error',
                    'suggestion': 'Log a 30-minute off-duty or sleeper berth break'
                }
        
        # Break qualifies if 30+ consecutive minutes not driving
        elif activity.duration_minutes >= 30:
            driving_time_since_break = 0  # Reset counter
            last_qualifying_break = activity
    
    return None
```

### 4. 70-Hour / 8-Day Limit
**Rule**: Cannot drive after accumulating 70 on-duty hours in any 8 consecutive days.

**Note**: Requires looking at previous 7 days + current day.

**Implementation**:
```python
def check_70_hour_limit(trip, current_date):
    # Get last 8 days of logs
    eight_days_logs = get_daily_logs_for_date_range(
        trip, 
        start_date=current_date - timedelta(days=7),
        end_date=current_date
    )
    
    total_on_duty_minutes = 0
    
    for daily_log in eight_days_logs:
        for activity in daily_log.activities:
            if activity.status in ['driving', 'on_duty_not_driving']:
                total_on_duty_minutes += activity.duration_minutes
    
    max_minutes = 70 * 60  # 4200 minutes
    
    if total_on_duty_minutes > max_minutes:
        return {
            'violated': True,
            'message': f'Exceeded 70-hour limit in 8-day period ({total_on_duty_minutes/60:.1f}h)',
            'severity': 'error'
        }
    elif total_on_duty_minutes > max_minutes - 60:  # Within 1 hour
        return {
            'violated': False,
            'message': f'Approaching 70-hour limit ({(max_minutes - total_on_duty_minutes)/60:.1f}h remaining)',
            'severity': 'warning'
        }
    
    return None
```

### 5. 10-Hour Off-Duty Requirement
**Rule**: Must have 10+ consecutive hours off-duty (or sleeper berth) before starting new driving shift.

**Implementation**:
```python
def check_10_hour_rest(daily_logs):
    # Look at activities spanning current and previous day
    combined_activities = get_activities_spanning_days(daily_logs)
    
    last_rest_duration = 0
    
    for activity in reversed(combined_activities):  # Go backwards from current time
        if activity.status in ['off_duty', 'sleeper_berth']:
            last_rest_duration += activity.duration_minutes
            
            if last_rest_duration >= 10 * 60:
                return None  # Satisfied
        else:
            # Hit on-duty activity before getting 10 hours rest
            if last_rest_duration < 10 * 60:
                return {
                    'violated': True,
                    'message': f'Only {last_rest_duration/60:.1f} hours rest before driving (need 10)',
                    'severity': 'error'
                }
    
    return None
```

---

## 34-Hour Restart (Optional)

**Rule**: Taking 34+ consecutive hours off-duty resets the 70-hour/8-day cycle.

**Implementation**:
```python
def check_for_restart(trip, current_date):
    recent_logs = get_daily_logs_for_date_range(
        trip,
        start_date=current_date - timedelta(days=2),  # Look back 2 days
        end_date=current_date
    )
    
    consecutive_off_duty = 0
    
    for activity in get_all_activities(recent_logs):
        if activity.status in ['off_duty', 'sleeper_berth']:
            consecutive_off_duty += activity.duration_minutes
            
            if consecutive_off_duty >= 34 * 60:
                # Reset detected
                return {
                    'restart_detected': True,
                    'restart_end_time': activity.end_time,
                    'message': '34-hour restart completed - cycle reset to 0 hours'
                }
        else:
            consecutive_off_duty = 0  # Break in off-duty time
    
    return None
```

---

## Trip Planning: Required Stops

When calculating route, system must insert required stops for HOS compliance.

### Fuel Stops
**Assumption**: Fueling required every 1,000 miles.

```python
def calculate_fuel_stops(route_distance, start_location):
    stops = []
    distance_covered = 0
    
    while distance_covered + 1000 < route_distance:
        distance_covered += 1000
        stops.append({
            'type': 'fuel',
            'miles_from_start': distance_covered,
            'duration_minutes': 15,  # Typical fuel stop
            'activity_status': 'on_duty_not_driving'
        })
    
    return stops
```

### 30-Minute Break Stops
**Rule**: After 8 hours of driving, require 30-minute break.

**Assumption**: Driver drives at average 55 mph (so ~440 miles = 8 hours).

```python
def calculate_break_stops(route_distance):
    stops = []
    driving_hours = 0
    distance_covered = 0
    
    avg_speed = 55  # mph
    
    while distance_covered < route_distance:
        # Drive for up to 8 hours
        segment_distance = min(8 * avg_speed, route_distance - distance_covered)
        distance_covered += segment_distance
        driving_hours += segment_distance / avg_speed
        
        if driving_hours >= 8 and distance_covered < route_distance:
            stops.append({
                'type': '30min_break',
                'miles_from_start': distance_covered,
                'duration_minutes': 30,
                'activity_status': 'off_duty',
                'reason': '30-minute break after 8 hours driving'
            })
            driving_hours = 0  # Reset
    
    return stops
```

### 10-Hour Rest Stops
**Rule**: After 11 hours driving OR 14-hour window, require 10-hour rest.

```python
def calculate_rest_stops(route_distance):
    stops = []
    driving_hours = 0
    on_duty_hours = 0
    distance_covered = 0
    
    avg_speed = 55  # mph
    
    while distance_covered < route_distance:
        # Drive until hitting 11hr limit or 14hr window
        max_drive_distance = min(
            (11 - driving_hours) * avg_speed,  # 11-hour limit
            route_distance - distance_covered
        )
        
        distance_covered += max_drive_distance
        driving_hours += max_drive_distance / avg_speed
        on_duty_hours += max_drive_distance / avg_speed
        
        # Check if rest needed
        if driving_hours >= 11 or on_duty_hours >= 14:
            if distance_covered < route_distance:
                stops.append({
                    'type': '10hr_rest',
                    'miles_from_start': distance_covered,
                    'duration_minutes': 10 * 60,
                    'activity_status': 'sleeper_berth',
                    'reason': '10-hour rest break required'
                })
                driving_hours = 0
                on_duty_hours = 0
    
    return stops
```

### Combine All Required Stops
```python
def plan_trip_stops(route_distance, pickup_location, dropoff_location):
    stops = []
    
    # Add pickup/dropoff (1 hour each per assessment)
    stops.append({
        'type': 'pickup',
        'location': pickup_location,
        'duration_minutes': 60,
        'activity_status': 'on_duty_not_driving'
    })
    
    # Calculate and merge fuel, break, and rest stops
    fuel_stops = calculate_fuel_stops(route_distance, pickup_location)
    break_stops = calculate_break_stops(route_distance)
    rest_stops = calculate_rest_stops(route_distance)
    
    # Merge and sort by miles_from_start
    all_stops = merge_stops(fuel_stops, break_stops, rest_stops)
    stops.extend(all_stops)
    
    stops.append({
        'type': 'dropoff',
        'location': dropoff_location,
        'duration_minutes': 60,
        'activity_status': 'on_duty_not_driving'
    })
    
    return stops
```

---

## Real-Time Compliance Monitoring

As driver logs activities, run validations and show warnings/errors in UI.

### Validation Levels

**🔴 ERROR (Blocking)**:
- Exceeded 11-hour driving limit
- Drove after 14-hour window
- Drove 8+ hours without break
- Exceeded 70-hour cycle

**🟡 WARNING (Advisory)**:
- Approaching limits (within 30 min of violation)
- Non-optimal rest periods
- Missing location data

**🟢 INFO (Helpful)**:
- Upcoming required break
- Recommended stop location
- Remaining available hours

### UI Display
```jsx
<CompliancePanel>
  {violations.map(v => (
    <Alert severity={v.severity} key={v.rule}>
      <AlertIcon />
      <AlertMessage>{v.message}</AlertMessage>
      {v.suggestion && <Suggestion>{v.suggestion}</Suggestion>}
    </Alert>
  ))}
  
  <AvailableHours>
    <Stat label="Driving remaining today" value="2h 30m" />
    <Stat label="On-duty remaining" value="4h 15m" />
    <Stat label="Hours in 8-day cycle" value="52/70" />
  </AvailableHours>
</CompliancePanel>
```

---

## Exceptions & Special Cases

### Adverse Driving Conditions
**Rule**: Can drive up to 2 extra hours (13 total) if unexpected conditions occur.

**Implementation**: 
- Driver flags activity as "adverse conditions"
- System allows 13-hour driving limit for that day
- Must annotate in remarks

### Short-Haul Exception
Not applicable per assessment (property-carrying, long-haul trips).

### Sleeper Berth Split Provision
**Rule**: Can split 10-hour rest into 7+3 hour periods (advanced).

**Future Enhancement**: Allow non-consecutive rest periods that sum to 10 hours.

---

## Testing Compliance Logic

**Test Cases**:
1. Normal day: 10h driving, 1h on-duty, 13h off-duty → ✅ Pass
2. Exceed 11h: 12h driving → ❌ Error
3. Exceed 14h window: Drive at hour 15 → ❌ Error
4. Missing 30min break: 9h continuous driving → ❌ Error
5. 70h limit: Sum previous 7 days + today > 70h → ❌ Error
6. 34h restart: 34h consecutive off-duty → ✅ Cycle reset

**Unit tests should validate each rule independently.**

---

## Additional Resources
- Full regulations: `../resources/fmcsa-hos-395-drivers-guide-to-hos-2022-04-28-0.md`
- Visual examples: Reference filled logbook showing compliant daily schedule

