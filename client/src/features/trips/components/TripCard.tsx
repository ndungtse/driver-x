'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Trip #{trip.id}</CardTitle>
          <Badge variant={getStatusColor(trip.status)}>{formatStatus(trip.status)}</Badge>
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
