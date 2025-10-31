'use client';

import { Activity } from '@/types/models';

interface LogbookRemarksProps {
  activities: Activity[];
}

export function LogbookRemarks({ activities }: LogbookRemarksProps) {
  const sortedActivities = [...activities].sort((a, b) => {
    if (a.start_time < b.start_time) return -1;
    if (a.start_time > b.start_time) return 1;
    return 0;
  });

  return (
    <div className="p-4 border-t">
      <h3 className="text-sm font-semibold mb-3">REMARKS</h3>
      <div className="space-y-2">
        {sortedActivities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activities recorded</p>
        ) : (
          sortedActivities.map((activity) => {
            const location =
              activity.location?.city && activity.location?.state
                ? `${activity.location.city}, ${activity.location.state}`
                : activity.location?.address || 'No location';

            const remarkText = activity.remark ? ` - ${activity.remark}` : '';

            return (
              <div key={activity.id} className="text-sm">
                <span className="font-medium">{location}</span>
                {remarkText}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

