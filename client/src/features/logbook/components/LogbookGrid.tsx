'use client';

import { Activity } from '@/types/models';
import { GRID_CONFIG, timeToXPosition, statusToYPosition } from '../utils/gridCalculations';

interface LogbookGridProps {
  activities: Activity[];
}

export function LogbookGrid({ activities }: LogbookGridProps) {
  const sortedActivities = [...activities].sort((a, b) => {
    if (a.start_time < b.start_time) return -1;
    if (a.start_time > b.start_time) return 1;
    return 0;
  });

  const renderGridLines = () => {
    const lines = [];

    for (let hour = 0; hour <= 24; hour++) {
      const x = (hour / 24) * GRID_CONFIG.width;
      lines.push(
        <line
          key={`hour-${hour}`}
          x1={x}
          y1={0}
          x2={x}
          y2={GRID_CONFIG.height}
          stroke="currentColor"
          strokeWidth={hour % 6 === 0 ? 2 : 1}
          className="text-border"
        />
      );
    }

    for (let row = 0; row <= 4; row++) {
      const y = row * GRID_CONFIG.rowHeight;
      lines.push(
        <line
          key={`row-${row}`}
          x1={0}
          y1={y}
          x2={GRID_CONFIG.width}
          y2={y}
          stroke="currentColor"
          strokeWidth={row === 0 || row === 4 ? 2 : 1}
          className="text-border"
        />
      );
    }

    for (let hour = 0; hour < 24; hour++) {
      for (let quarter = 1; quarter < 4; quarter++) {
        const x = ((hour + quarter / 4) / 24) * GRID_CONFIG.width;
        lines.push(
          <line
            key={`tick-${hour}-${quarter}`}
            x1={x}
            y1={0}
            x2={x}
            y2={GRID_CONFIG.height}
            stroke="currentColor"
            strokeWidth={0.5}
            className="text-border opacity-30"
          />
        );
      }
    }

    return lines;
  };

  const renderTimeLabels = () => {
    const labels = [];
    const hourLabels = [
      '00',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      'Noon',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '00',
    ];

    for (let hour = 0; hour <= 24; hour++) {
      const x = (hour / 24) * GRID_CONFIG.width;
      labels.push(
        <text
          key={`label-${hour}`}
          x={x}
          y={20}
          textAnchor={hour === 0 ? 'start' : hour === 24 ? 'end' : 'middle'}
          className="text-sm fill-foreground"
        >
          {hourLabels[hour]}
        </text>
      );
    }

    return labels;
  };

  const renderStatusLabels = () => {
    const statusLabels = ['Off Duty', 'Sleeper Berth', 'Driving', 'On Duty (Not Driving)'];

    return statusLabels.map((label, index) => {
      const y = index * GRID_CONFIG.rowHeight + GRID_CONFIG.rowHeight / 2;
      return (
        <text
          key={`status-${index}`}
          x={10}
          y={y}
          className="text-xs fill-foreground font-medium"
        >
          {label}
        </text>
      );
    });
  };

  const renderActivityLines = () => {
    if (sortedActivities.length === 0) return null;

    const elements = [];

    for (let i = 0; i < sortedActivities.length; i++) {
      const activity = sortedActivities[i];
      const xStart = timeToXPosition(activity.start_time);
      const xEnd = timeToXPosition(activity.end_time);
      const y = statusToYPosition(activity.status);

      elements.push(
        <line
          key={`activity-${activity.id}-line`}
          x1={xStart}
          y1={y}
          x2={xEnd}
          y2={y}
          stroke="currentColor"
          strokeWidth={3}
          className="text-foreground"
        />
      );

      elements.push(
        <circle
          key={`activity-${activity.id}-start`}
          cx={xStart}
          cy={y}
          r={4}
          fill="currentColor"
          className="text-foreground"
        />
      );

      if (i < sortedActivities.length - 1) {
        const nextActivity = sortedActivities[i + 1];
        if (activity.status !== nextActivity.status) {
          const transitionY = statusToYPosition(nextActivity.status);
          elements.push(
            <line
              key={`transition-${activity.id}`}
              x1={xEnd}
              y1={y}
              x2={xEnd}
              y2={transitionY}
              stroke="currentColor"
              strokeWidth={3}
              className="text-foreground"
            />
          );
        }

        const isStationary =
          activity.location?.city === nextActivity.location?.city &&
          activity.location?.state === nextActivity.location?.state &&
          activity.end_time === nextActivity.start_time;

        if (isStationary && activity.status === 'on_duty_not_driving') {
          const bracketHeight = 10;
          elements.push(
            <g key={`bracket-${activity.id}`}>
              <line
                x1={xEnd}
                y1={y}
                x2={xEnd - 15}
                y2={y}
                stroke="currentColor"
                strokeWidth={2}
                className="text-foreground"
              />
              <line
                x1={xEnd - 15}
                y1={y}
                x2={xEnd - 15}
                y2={y + bracketHeight}
                stroke="currentColor"
                strokeWidth={2}
                className="text-foreground"
              />
            </g>
          );
        }
      }
    }

    return elements;
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${GRID_CONFIG.width} ${GRID_CONFIG.height}`}
        className="w-full h-auto border rounded-md bg-background"
        style={{ minHeight: `${GRID_CONFIG.height}px` }}
      >
        <g id="grid-lines">{renderGridLines()}</g>
        <g id="time-labels">{renderTimeLabels()}</g>
        <g id="status-labels">{renderStatusLabels()}</g>
        <g id="activities">{renderActivityLines()}</g>
      </svg>
    </div>
  );
}

