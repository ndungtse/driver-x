'use client';

import { useTrips } from '@/features/trips/hooks/useTrips';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TripCard } from '@/features/trips/components/TripCard';
import { CreateTripDrawer } from '@/features/trips/components/CreateTripDrawer';

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
        <CreateTripDrawer>
          <Button>New Trip</Button>
        </CreateTripDrawer>
      </div>

      {trips.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No trips yet</p>
            <CreateTripDrawer>
              <Button>Create Your First Trip</Button>
            </CreateTripDrawer>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Link key={trip.id} href={`/trips/${trip.id}`}>
              <TripCard trip={trip} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

