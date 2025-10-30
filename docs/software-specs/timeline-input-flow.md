# Timeline Input Flow

## Core Concept: Linear Timeline
Activities form a **continuous chain** with no gaps. Each day is exactly 24 hours (00:00 to 24:00), fully accounted for.

```
Day Timeline (example):
|----Off Duty----|--On Duty--|------Driving------|--Rest--|--Driving--|
00:00          06:30      07:00              12:30    13:00      17:00 ...
```

## Input Modes

### Mode 1: Appending Activity (Most Common)
Adding activity to end of current day's timeline.

**User Action**: Click "+ Add Activity"

**System Behavior**:
1. Pre-fill start time = current last activity's end time
2. User selects status, duration, location
3. Calculate end time = start + duration
4. If end time > 24:00 → activity spans into next day (split or warn)

**Example**:
```
Current state: Last activity ends at 17:00
User adds: "Driving" for 2h 30m
Result: New activity 17:00 - 19:30
```

### Mode 2: Inserting Activity (Middle of Day)
Inserting activity between existing ones.

**User Action**: Click "Insert" between two activities (or edit start time to earlier)

**System Behavior - Cascade Forward**:
1. User specifies new start time and duration
2. New activity inserted at that time
3. **All following activities shift forward** by new activity's duration
4. Show confirmation: "This will shift 3 activities forward by 1h 30m. Continue?"

**Example**:
```
Before:
|--Off Duty 00:00-06:00--|--Driving 06:00-11:00--|--Rest 11:00-13:00--|

User inserts: "On Duty" at 06:00 for 30 minutes

After:
|--Off Duty 00:00-06:00--|--On Duty 06:00-06:30--|--Driving 06:30-11:30--|--Rest 11:30-13:30--|
                          [NEW]                    [shifted +30m]         [shifted +30m]
```

**Validation**:
- If cascade pushes last activity past 24:00 → warn/error
- Option: "Compress following activities" or "Extend into next day"

### Mode 3: Editing Existing Activity
Modifying an already-logged activity.

**User Action**: Click "Edit" on activity card

**System Behavior**:
Three edit types:

#### 3a. Change Duration (Not Start Time)
- New end time = start + new duration
- If end time moves later → cascade forward (as Mode 2)
- If end time moves earlier → extend next activity backward to fill gap

**Example (extend duration)**:
```
Before:
|--Driving 06:00-11:00--|--Rest 11:00-13:00--|

Edit driving to 6 hours (was 5):
|--Driving 06:00-12:00--|--Rest 12:00-13:00--|
                        [next shifted +1h]
```

**Example (reduce duration)**:
```
Before:
|--Driving 06:00-11:00--|--Rest 11:00-13:00--|

Edit driving to 4 hours (was 5):
|--Driving 06:00-10:00--|--Rest 10:00-13:00--|
                        [next extended backward -1h]
```

#### 3b. Change Start Time (But Not Duration)
- Activity moves to new position
- Previous activity extends/shrinks to fill gap
- Following activities cascade as needed

**Example**:
```
Before:
|--Off Duty 00:00-06:00--|--Driving 06:00-11:00--|--Rest 11:00-13:00--|

Change driving start to 07:00 (keep 5h duration):
|--Off Duty 00:00-07:00--|--Driving 07:00-12:00--|--Rest 12:00-13:00--|
 [extended +1h]            [moved +1h]             [shifted +1h]
```

#### 3c. Change Status or Location
- No timeline shift
- Just update metadata

### Mode 4: Deleting Activity
**User Action**: Click "Delete" on activity card

**System Behavior**:
1. Show confirmation: "Delete this activity?"
2. Remove activity from timeline
3. **Previous activity extends** to fill gap (end time moves forward)

**Example**:
```
Before:
|--Off Duty 00:00-06:00--|--On Duty 06:00-07:00--|--Driving 07:00-11:00--|

Delete "On Duty":
|--Off Duty 00:00-07:00--|--Driving 07:00-11:00--|
 [extended +1h to fill gap]
```

**Special Case**: Cannot delete if only 1 activity in day (must have at least one)

---

## Day Boundaries

### Starting a New Day
When driver begins logging a new calendar day:

1. System creates new DailyLog record for date
2. Pre-fills first activity:
   - Status: Last status from previous day (likely "Off Duty" or "Sleeper Berth")
   - Start: 00:00
   - Prompt user: "Continue from previous day's status?"

### Multi-Day Activities
If activity spans midnight (e.g., 10-hour sleeper berth from 22:00 to 08:00):

**Option A: Auto-split** (Recommended)
- Activity 1: 22:00 - 24:00 (2h) on Day 1
- Activity 2: 00:00 - 08:00 (8h) on Day 2 (same status, location)
- Both linked by `continuation_of_activity_id`

**Option B: User confirmation**
- Warn: "This activity extends into next day. Split into 2 entries?"
- User confirms or adjusts duration

---

## Validation Rules

### Time Constraints
✅ **Valid**:
- Start time >= 00:00 and < 24:00
- End time > start time and <= 24:00
- Duration > 0 minutes
- No overlapping activities (handled by cascade)

❌ **Invalid**:
- Negative duration
- Start time >= end time (same day)
- Gap between activities

### HOS Compliance Warnings
Show **warnings** (not blocking) if:
- Driving > 11 hours in one shift
- On-duty window > 14 hours without 10-hour break
- Driving after 8 hours without 30-minute break
- Weekly cycle > 70 hours

See [HOS Rules](./hos-rules.md) for full validation logic.

---

## User Interface Feedback

### Visual Indicators During Edit

**Timeline Preview** (real-time):
```
Editing Activity...
┌────────────────────────────────────┐
│ Current state:                     │
│ 06:00 - 11:00  Driving (5h)        │
│                                    │
│ New duration: [6] hours            │
│                                    │
│ Preview:                           │
│ 06:00 - 12:00  Driving (6h)  ← YOU │
│ 12:00 - 13:00  Rest (1h)    ↓ +1h │
│ 13:00 - 17:00  Driving (4h) ↓ +1h │
│                                    │
│ 2 activities will shift forward    │
└────────────────────────────────────┘
[Cancel] [Apply Changes]
```

### Bulk Operations
For advanced users: "Compress timeline" tool
- Select multiple activities
- Proportionally reduce durations to fit target timespan
- Use case: Over-logged day needs compression

---

## Implementation Notes

### Data Structure for Cascade
Each Activity has:
- `sequence`: Integer (0-indexed position in day)
- `start_time`: Time (HH:MM)
- `duration_minutes`: Integer

**On insert/edit**:
1. Recalculate `sequence` for all activities in day
2. Iterate from changed activity forward
3. Update `start_time` = previous `end_time`
4. Maintain `duration_minutes` unless compressing

### Frontend State Management
- Timeline state = ordered array of activities
- Edit mode maintains "draft" state until user confirms
- Show diff preview before applying cascade changes
- Optimistic updates for better UX (rollback on API error)

### Backend Validation
Django view/serializer must:
1. Verify no gaps in timeline
2. Verify activities sum to 24 hours (or justify partial day)
3. Recalculate daily totals after any activity change
4. Return updated full day timeline (frontend replaces state)

---

## Example User Flows

### Flow 1: Driver Starting Shift
1. Open app → Timeline tab (today's date)
2. Current state: "Off Duty 00:00-06:30" (pre-filled from night rest)
3. Click "+ Add Activity"
4. Select: "On Duty (Not Driving)", 30 minutes
5. Location auto-filled: Current GPS
6. Remark: "Pre-trip inspection"
7. Save → Activity added 06:30-07:00
8. Click "+ Add Activity" again
9. Select: "Driving", 4 hours
10. Save → Activity added 07:00-11:00

### Flow 2: Correcting Mistake
1. Driver realizes they started driving at 07:15, not 07:00
2. Click "Edit" on "Driving 07:00-11:00" activity
3. Change start time to 07:15
4. System shows: "On Duty will extend from 06:30-07:00 to 06:30-07:15"
5. Confirm → Previous activity auto-extended

### Flow 3: Taking Rest Break
1. Driver has been driving for 8 hours (needs 30-min break)
2. Click "+ Add Activity"
3. Select: "Off Duty", 30 minutes
4. Location: Auto-detected (rest area)
5. Save → Rest break logged
6. HOS warning clears (8-hour rule satisfied)

