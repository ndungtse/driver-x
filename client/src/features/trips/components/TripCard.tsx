'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trip } from '@/types/models';

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'secondary';
      case 'in_progress':
        return 'default';
      case 'completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const tripName = trip.name || `Trip #${trip.id}`;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{tripName}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(trip.status)}>{formatStatus(trip.status)}</Badge>
          </div>
        </div>
        <CardDescription>
          {trip.total_distance.toFixed(0)} miles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">From:</span>{' '}
            {trip.current_location?.city || trip.pickup_location?.city || 'N/A'}
          </p>
          <p>
            <span className="font-medium">To:</span>{' '}
            {trip.dropoff_location?.city || 'N/A'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
