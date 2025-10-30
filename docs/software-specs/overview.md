# ELD Truck Logbook App - System Overview

## Purpose
Digital ELD (Electronic Logging Device) system for truck drivers to track Hours of Service (HOS) and generate compliant logbook sheets.

## Core Functionality
1. **Trip Planning**: Calculate routes with required stops and rest periods
2. **Timeline Tracking**: Record driver activities in linear time sequence
3. **Logbook Generation**: Auto-generate compliant daily log sheets
4. **Route Visualization**: Display journey on map with activity markers

## Technology Stack
- **Backend**: Django (Python)
- **Frontend**: React
- **Deployment**: Vercel (or similar)

## Input Requirements (from assessment)
- Current location
- Pickup location  
- Dropoff location
- Current cycle used (hours)

## Output Requirements
- Route map with stops and rest recommendations
- Daily log sheets with grid filled per FMCSA regulations
- Multiple log sheets for multi-day trips

## Key Assumptions (Property-Carrying Driver)
- 70-hour/8-day cycle limit
- 11-hour driving limit per shift
- 14-hour on-duty window
- 30-minute break after 8 hours driving
- Fueling at least once per 1,000 miles
- 1 hour for pickup and drop-off activities
- No adverse driving conditions

## Reference Documents
- HOS Regulations: `../resources/fmcsa-hos-395-drivers-guide-to-hos-2022-04-28-0.md`
- Logbook Format: `../resources/logbook-filled.png`, `../resources/logbook-actions-format.png`
- Filling Guide: `../resources/How to fill out a log book for truck drivers Complete guide and walkthrough.txt`
- Totals Format: `../resources/logbook-totals.png`

## Related Specs
- [Data Models](./data-models.md)
- [UI Components](./ui-components.md)
- [Timeline Input Flow](./timeline-input-flow.md)
- [Logbook Generation](./logbook-generation.md)
- [HOS Rules](./hos-rules.md)
- [Map Integration](./map-integration.md)

