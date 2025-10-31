'use client';

import { useTrips } from '@/features/trips/hooks/useTrips';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TripsPage() {
  const { data, isLoading, error } = useTrips();

  if (isLoading) {
    return <div>Loading trips...</div>;
  }

  if (error) {
    return <div>Error loading trips</div>;
  }

  const trips = data?.success && data.data ? 'results' in data.data ? data.data.results : data.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Trips</h1>
        <Button>New Trip</Button>
      </div>

      {trips.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No trips yet</p>
            <Button>Create Your First Trip</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Link key={trip.id} href={`/trips/${trip.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Trip #{trip.id}</CardTitle>
                  <CardDescription>
                    {trip.status} • {trip.total_distance.toFixed(0)} miles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">From:</span>{' '}
                      {trip.current_location?.city || 'N/A'}
                    </p>
                    <p>
                      <span className="font-medium">To:</span>{' '}
                      {trip.dropoff_location?.city || 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

