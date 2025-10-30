# Logbook Generation

## Purpose
Transform timeline data (Activity records) into visual logbook sheet matching FMCSA format.

Reference images:
- Blank format: `../resources/blank-paper-log.png`
- Filled example: `../resources/logbook-filled.png`
- Actions format: `../resources/logbook-actions-format.png`
- Totals format: `../resources/logbook-totals.png`

---

## Logbook Components

### 1. Header Section (Top of Sheet)

**Left Side - Driver Info**:
```
Date: MM/DD/YYYY
Driver's Signature: [Signature field]
Name of Co-Driver: [Text or N/A]
Home Operating Center: [City, State]
```

**Right Side - Mileage/Vehicle**:
```
Vehicle Numbers: [Tractor #] [Trailer #(s)]
Total Miles Driving Today: [####]
Total Truck Mileage Today: [####]  (= Total Miles if no co-driver)
Shipping Doc Numbers: [List]
Shipper: [Company Name]
Commodity: [Description]
```

**Data Source**:
- From `DailyLog` model (see [Data Models](./data-models.md))
- Carrier name and address from Trip/Driver profile

---

### 2. Graph Grid (Main Visual Element)

**Structure**:
- 24-hour timeline (midnight to midnight)
- 4 horizontal rows representing duty statuses:
  - **Line 1**: Off Duty
  - **Line 2**: Sleeper Berth  
  - **Line 3**: Driving
  - **Line 4**: On Duty (Not Driving)

**Time Markers**:
- Vertical lines every hour (bold)
- Small tick marks every 15 minutes
- Labels at top: Midnight, 1, 2, 3, ..., 11, Noon, 1, 2, ..., 11, Midnight

**Drawing Algorithm**:

For each Activity in DailyLog.activities (ordered by sequence):

1. **Calculate pixel positions**:
   ```
   x_start = (activity.start_time / 24 hours) * grid_width
   x_end = (activity.end_time / 24 hours) * grid_width
   ```

2. **Determine row (y-position)**:
   ```
   row_map = {
     'off_duty': 1,
     'sleeper_berth': 2,
     'driving': 3,
     'on_duty_not_driving': 4
   }
   y_position = row_map[activity.status] * row_height
   ```

3. **Draw horizontal line**:
   - From `(x_start, y_position)` to `(x_end, y_position)`
   - Line thickness: 2-3px
   - Color: Black

4. **Draw transition lines** (connecting status changes):
   - At each activity boundary, if status changes:
   - Draw vertical line from previous row to new row
   - Creates "staircase" pattern (see `../resources/logbook-filled.png`)

**Example Rendering**:
```
Time: 00:00              06:30     07:00          11:00
     ────────────────────┐                              Line 1 (Off Duty)
                         │                              
     ────────────────────┘                              Line 2 (Sleeper)
                                                        
                         ┌─────────────┐               Line 3 (Driving)
                         │             │               
     ────────────────────┴─────┘       └───────────    Line 4 (On Duty)
```

**Special Markings**:

**Brackets** (for stationary periods):
- When truck doesn't move (status changes but location same), draw bracket
- Bracket = vertical line on left + horizontal bottom edge
- Indicates "no movement" during on-duty time
- Example: Pre-trip inspection before driving

```
Line 4:  |─────|  ← bracket showing truck parked 06:30-07:00
```

**Status Change Dots** (optional enhancement):
- Small dot at each transition point
- Helps identify exact time of status change
- Shown in some logbook formats (see `../resources/logbook-drawed-lines.png`)

---

### 3. Remarks Section (Below Grid)

**Purpose**: List city/state and activity for each status change.

**Format**:
```
REMARKS:
  Green Bay, WI - Pre-trip/TIV
  Fond Du Lac, WI - Scale
  Paw Paw, IL - 30 min break
  Edwardsville, IL - Post-trip/TIV - 10 hour break
```

**Rules** (per FMCSA):
- Record city and state for every duty status change
- Include brief description of activity
- If not in city/town, use highway number + milepost or service plaza name
- Can add other notes (adverse conditions, state line crossings)

**Data Source**:
- Iterate through activities
- For each: `f"{activity.location.city}, {activity.location.state} - {activity.remark}"`
- Vertical bar with 45° angle marks (see `../resources/logbook-filled.png`) point to corresponding time on grid

**Visual Connection**:
- Draw angled lines from remark entries pointing to their position on grid timeline
- See `../resources/logbook-filled.png` for reference

---

### 4. Totals Section (Right Side)

**Layout** (per `../resources/logbook-totals.png`):
```
              HOURS    MINUTES
                      (00, 15, 30, 45)
Line 1:       08       30
Line 2:       05       00
Line 3:       09       30
Line 4:       01       00
           ─────────────────
TOTAL:        24       00
```

**Calculation**:
```python
def calculate_daily_totals(activities):
    totals = {
        'off_duty': 0,
        'sleeper_berth': 0,
        'driving': 0,
        'on_duty_not_driving': 0
    }
    
    for activity in activities:
        totals[activity.status] += activity.duration_minutes
    
    # Convert to hours and minutes
    for status in totals:
        minutes = totals[status]
        hours = minutes // 60
        mins = minutes % 60
        # Round minutes to nearest 15-min increment (FMCSA allows)
        mins = round(mins / 15) * 15
        totals[status] = {'hours': hours, 'minutes': mins}
    
    return totals
```

**Validation**:
- Total must equal 24 hours 00 minutes
- If doesn't sum to 24h, flag error in data

**Display Format**:
- Two-column grid (HOURS | MINUTES)
- Minutes only in 15-minute increments (00, 15, 30, 45)
- Bold TOTAL row at bottom

---

## Rendering Technologies

### Option 1: HTML Canvas (Recommended for Web)
**Pros**: 
- Precise pixel control
- Easy to export to image/PDF
- Good performance

**Implementation**:
```javascript
// Pseudo-code
const canvas = document.getElementById('logbook-grid');
const ctx = canvas.getContext('2d');

function drawLogbookGrid(activities) {
  // Draw grid lines (hours, 15-min marks)
  drawGridLines(ctx);
  
  // Draw time labels
  drawTimeLabels(ctx);
  
  // Draw activity lines
  activities.forEach(activity => {
    drawActivityLine(ctx, activity);
  });
  
  // Draw status change connectors
  drawTransitions(ctx, activities);
}
```

### Option 2: SVG (Alternative)
**Pros**: 
- Scalable for any resolution
- Easy to style with CSS
- Accessible (can add ARIA labels)

**Implementation**:
```jsx
// React component
<svg width="1200" height="400" viewBox="0 0 1200 400">
  <g id="grid-lines">
    {/* Hour and minute markers */}
  </g>
  <g id="activities">
    {activities.map(activity => (
      <ActivityLine key={activity.id} data={activity} />
    ))}
  </g>
</svg>
```

### Option 3: PDF Generation (Backend)
For printable output, use Django PDF library:
- **ReportLab** (Python): Generate PDF directly
- **WeasyPrint**: Convert HTML/CSS to PDF
- **Playwright/Puppeteer**: Render Canvas to PDF

---

## Multi-Day Trips

**Scenario**: Trip spans 3 days

**Output**: 3 separate logbook sheets
- DailyLog 1 → Logbook Sheet for Day 1
- DailyLog 2 → Logbook Sheet for Day 2
- DailyLog 3 → Logbook Sheet for Day 3

**Navigation**:
- Date selector above logbook
- "Previous Day" / "Next Day" buttons
- Or: Scrollable continuous view (all sheets stacked vertically)

**Sheet Continuity**:
- Each sheet shows full 24 hours (midnight to midnight)
- If activity spans midnight, it's split across two sheets (see [Timeline Input Flow](./timeline-input-flow.md))

---

## Export Options

### PDF Download
- Button: "Download PDF"
- Generate PDF with all sheets for trip
- Format: One page per day
- Include trip summary page (optional)

### Print View
- Button: "Print"
- Open print-friendly HTML view
- CSS: Hide navigation, optimize for paper size (8.5" x 11")
- Ensure grid fits on one page

### Image Export
- Button: "Save as Image"
- Export Canvas as PNG
- Use case: Quick sharing via text/email

---

## Responsive Considerations

**Desktop**: 
- Full-size grid (e.g., 1200px wide x 400px tall)
- All labels and lines clearly visible

**Tablet**:
- Scale grid proportionally
- Maintain aspect ratio
- May require horizontal scroll

**Mobile**:
- Consider vertical layout (not traditional horizontal grid)
- Alternative: Simplified timeline view (list-based)
- Full grid view available via "View Logbook" action (pinch to zoom)

---

## Validation & Compliance

Before generating logbook, verify:

✅ **Required Fields Present**:
- Driver name and signature
- Vehicle numbers
- Date
- At least one activity

✅ **Timeline Completeness**:
- Activities cover full 24 hours
- No gaps or overlaps
- Valid status types

✅ **Calculations Accurate**:
- Totals sum to 24 hours
- Miles driven matches sum of driving activities
- HOS rules not violated (show warnings)

❌ **Common Errors**:
- Missing location for status change
- Invalid time format
- Negative duration

Show validation errors before allowing export/submission.

---

## Reference Implementation

See `../resources/How to fill out a log book for truck drivers Complete guide and walkthrough.txt` for step-by-step filling process (video transcript).

Key steps from video:
1. Fill header info (driver, date, vehicle)
2. Mark starting point (dot on appropriate line)
3. Draw horizontal line during each status period
4. Draw vertical connectors when changing status
5. Add brackets for stationary periods
6. Record locations in Remarks
7. Calculate and enter totals
8. Sign and certify

Our digital version automates steps 2-7 based on Activity data.

