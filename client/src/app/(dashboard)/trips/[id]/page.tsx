'use client';

import { use } from 'react';
import { useTrip } from '@/features/trips/hooks/useTrips';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { TripTimeline } from '@/features/trips/components/TripTimeline';
import { LogbookView } from '@/features/logbook/components/LogbookView';

export default function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const tripId = parseInt(id, 10);
  const { data, isLoading } = useTrip(tripId);

  if (isLoading) {
    return <div>Loading trip...</div>;
  }

  if (!data?.success || !data.data) {
    return <div>Trip not found</div>;
  }

  const trip = data.data;

  return (
    <div className="space-y-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trip #{trip.id}</h1>
          <p className="text-muted-foreground">
            {trip.status} • {trip.total_distance.toFixed(0)} miles
          </p>
        </div>
      </div>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="logbook">Logbook</TabsTrigger>
          <TabsTrigger value="map">Journey Map</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-6">
          <TripTimeline trip={trip} />
        </TabsContent>

        <TabsContent value="logbook" className="mt-6">
          <LogbookView trip={trip} />
        </TabsContent>

        <TabsContent value="map" className="mt-6">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Journey Map</h2>
              <p className="text-muted-foreground">Map view coming soon...</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

