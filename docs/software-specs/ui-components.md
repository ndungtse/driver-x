# UI Components & Structure

## App Layout
```
┌─────────────────────────────────────┐
│  Header: Trip Details + Status      │
├─────────────────────────────────────┤
│  Tab Navigation                     │
│  [Timeline] [Logbook] [Journey Map] │
├─────────────────────────────────────┤
│                                     │
│  Active Tab Content                 │
│                                     │
└─────────────────────────────────────┘
```

## Three Main Tabs

### 1. Timeline Tab (Primary Input Interface)
**Purpose**: Add and manage activities in linear time sequence

**Layout**:
```
┌─────────────────────────────────────┐
│  Current Date: [Date Selector]      │
│  Current Status: [Status Badge]     │
│                                     │
│  ┌─ Timeline (Day View) ──────────┐│
│  │                                ││
│  │  [+ Add Activity]              ││
│  │                                ││
│  │  ╔════════════════════════════╗││
│  │  ║ 00:00 - 06:30             ║││
│  │  ║ Off Duty                  ║││
│  │  ║ Green Bay, WI             ║││
│  │  ║ 6h 30m                    ║││
│  │  ╚════════════════════════════╝││
│  │        [Edit] [Delete]         ││
│  │                                ││
│  │  ╔════════════════════════════╗││
│  │  ║ 06:30 - 07:00             ║││
│  │  ║ On Duty (Not Driving)     ║││
│  │  ║ Green Bay, WI             ║││
│  │  ║ Pre-trip/TIV              ║││
│  │  ║ 30m                       ║││
│  │  ╚════════════════════════════╝││
│  │        [Edit] [Delete]         ││
│  │                                ││
│  └─────────────────────────────────┘│
│                                     │
│  Daily Totals:                      │
│  Off Duty: 8h 30m                  │
│  Sleeper: 5h 0m                    │
│  Driving: 9h 30m                   │
│  On Duty: 1h 0m                    │
└─────────────────────────────────────┘
```

**Components**:
- **Date Selector**: Switch between days of trip
- **Add Activity Button**: Opens activity input modal
- **Activity Card**: Shows one timeline entry
- **Daily Totals Panel**: Auto-calculated hours per status

### 2. Logbook Tab (Visual Output)
**Purpose**: Display generated logbook sheet(s) matching FMCSA format

**Layout**:
```
┌─────────────────────────────────────┐
│  Date: [Date Selector]              │
│  [Download PDF] [Print]             │
│                                     │
│  ┌─ Logbook Sheet ─────────────────┐│
│  │                                 ││
│  │  [Header Section]               ││
│  │  Driver, Vehicle, Shipping Info ││
│  │                                 ││
│  │  [Graph Grid - 24hr Timeline]   ││
│  │  ┌───────────────────────────┐  ││
│  │  │ Line 1: Off Duty         │  ││
│  │  │ Line 2: Sleeper Berth    │  ││
│  │  │ Line 3: Driving          │  ││
│  │  │ Line 4: On Duty          │  ││
│  │  └───────────────────────────┘  ││
│  │                                 ││
│  │  [Remarks Section]              ││
│  │  Location/activity notes        ││
│  │                                 ││
│  │  [Totals Section]               ││
│  │  Hours per status               ││
│  │                                 ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

**Components**:
- **Logbook Header**: Driver/vehicle/shipping metadata
- **Graph Grid Canvas**: 24-hour timeline with 4 status lines (drawn per `../resources/logbook-filled.png`)
- **Remarks List**: City/state and activity for each status change
- **Totals Display**: Hours and minutes per status (format per `../resources/logbook-totals.png`)

### 3. Journey Map Tab
**Purpose**: Visualize route and activity locations

**Layout**:
```
┌─────────────────────────────────────┐
│  [Map Controls] [Legend]            │
│                                     │
│  ┌─ Interactive Map ───────────────┐│
│  │                                 ││
│  │    📍 Current Location          ││
│  │     │                           ││
│  │     ├──► 📦 Pickup             ││
│  │     │                           ││
│  │     ├──► ⛽ Fuel Stop           ││
│  │     │                           ││
│  │     ├──► 🛑 Rest Break         ││
│  │     │                           ││
│  │     └──► 📦 Dropoff            ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  Activity Timeline (below map):     │
│  [Filter: All | Fuel | Rest | etc] │
└─────────────────────────────────────┘
```

**Components**:
- **Map Container**: Full route polyline with markers
- **Activity Markers**: Different icons per activity type
- **Info Popups**: Click marker to see activity details
- **Activity Filter**: Toggle visibility of activity types

---

## Modals & Interactions

### Activity Input Modal
Opened when clicking "+ Add Activity" or "Edit" on activity card.

**Form Fields**:
```
┌─ Add/Edit Activity ────────────────┐
│                                    │
│  Status: [Dropdown]                │
│  ○ Off Duty                        │
│  ○ Sleeper Berth                   │
│  ○ Driving                         │
│  ○ On Duty (Not Driving)           │
│                                    │
│  Start Time: [Time Picker] HH:MM   │
│  Duration: [Input] hours + minutes │
│  (or End Time: [Time Picker])      │
│                                    │
│  Location: [Autocomplete Address]  │
│  City: [Input]                     │
│  State: [Dropdown]                 │
│                                    │
│  Remark/Activity: [Input]          │
│  (e.g., "Pre-trip inspection")     │
│                                    │
│  [If Driving Status]               │
│  Miles Driven: [Number Input]      │
│                                    │
│  [Cancel] [Save Activity]          │
└────────────────────────────────────┘
```

**Validation**:
- Start time must not overlap existing activities
- Duration must be > 0
- If inserting between activities, confirm time shift cascade (see [Timeline Input Flow](./timeline-input-flow.md))

### Trip Setup Modal
Initial trip planning interface.

```
┌─ Plan New Trip ────────────────────┐
│                                    │
│  Current Location:                 │
│  [Address Autocomplete]            │
│                                    │
│  Pickup Location:                  │
│  [Address Autocomplete]            │
│                                    │
│  Dropoff Location:                 │
│  [Address Autocomplete]            │
│                                    │
│  Current Cycle Hours Used:         │
│  [Number Input] / 70 hours         │
│                                    │
│  Start Date/Time:                  │
│  [DateTime Picker]                 │
│                                    │
│  [Cancel] [Calculate Route]        │
└────────────────────────────────────┘
```

After calculation, shows:
- Estimated duration
- Required stops (fuel, rest)
- Recommended activities
- [Confirm & Start Trip]

---

## Component Behavior Notes

### Linear Timeline Constraint
Activities are **always contiguous** - no gaps in 24-hour period.

**Rules**:
1. First activity of day starts at 00:00 (midnight)
2. Last activity of day ends at 24:00 (midnight next day)
3. Editing an activity's start/end automatically adjusts adjacent activities
4. See [Timeline Input Flow](./timeline-input-flow.md) for detailed logic

### Automatic Calculations
- **Daily totals**: Recalculated on any activity change
- **Miles**: Sum of all driving activities per day
- **HOS compliance**: Warnings if limits exceeded
- **Trip totals**: Aggregate across all days

### Responsive Design
- Mobile-first: Timeline cards stack vertically
- Tablet+: Side-by-side timeline and daily summary
- Desktop: Three-column layout option (timeline | logbook preview | map)

### Accessibility
- Keyboard navigation for timeline
- Screen reader labels for all form fields
- Color-blind friendly status indicators (icons + colors)
- ARIA labels on interactive map markers

