'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MapControlsProps {
  filters: {
    activities: boolean;
    fuelStops: boolean;
    restStops: boolean;
  };
  onFilterChange: (filters: {
    activities: boolean;
    fuelStops: boolean;
    restStops: boolean;
  }) => void;
}

export function MapControls({ filters, onFilterChange }: MapControlsProps) {
  const toggleFilter = (key: keyof typeof filters) => {
    onFilterChange({ ...filters, [key]: !filters[key] });
  };

  return (
    <Card className="absolute top-4 right-4 p-2 shadow-lg z-10">
      <div className="flex flex-col gap-2">
        <Button
          variant={filters.activities ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleFilter('activities')}
        >
          Activities
        </Button>
        <Button
          variant={filters.fuelStops ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleFilter('fuelStops')}
        >
          Fuel Stops
        </Button>
        <Button
          variant={filters.restStops ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleFilter('restStops')}
        >
          Rest Stops
        </Button>
      </div>
    </Card>
  );
}

