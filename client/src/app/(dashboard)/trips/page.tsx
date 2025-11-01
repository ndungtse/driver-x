"use client";

import { useTrips } from "@/features/trips/hooks/useTrips";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TripCard } from "@/features/trips/components/TripCard";
import { CreateTripDrawer } from "@/features/trips/components/CreateTripDrawer";
import { useState } from "react";
import { Trip } from "@/types/models";
import { PencilIcon } from "lucide-react";

export default function TripsPage() {
  const { data, isLoading, error } = useTrips();
  const [createTripDrawer, setCreateTripDrawer] = useState({
    open: false,
    data: null as Trip | null,
  });

  if (isLoading) {
    return <div>Loading trips...</div>;
  }

  if (error) {
    return <div>Error loading trips</div>;
  }

  const trips =
    data?.success && data.data
      ? "results" in data.data
        ? data.data.results
        : data.data
      : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Trips</h1>
        <Button onClick={() => setCreateTripDrawer({ open: true, data: null })}>
          New Trip
        </Button>
      </div>

      {trips.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No trips yet</p>
            <Button
              onClick={() => setCreateTripDrawer({ open: true, data: null })}
            >
              Create Your First Trip
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <div key={trip.id} className="relative">
              <Link href={`/trips/${trip.id}`}>
                <TripCard trip={trip} />
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 absolute bottom-2 right-2 z-10"
                onClick={() => setCreateTripDrawer({ open: true, data: trip })}
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <CreateTripDrawer
        initialData={createTripDrawer.data}
        open={createTripDrawer.open}
        setOpen={(open) => setCreateTripDrawer({ ...createTripDrawer, open })}
        onClose={() => setCreateTripDrawer({ open: false, data: null })}
      />
    </div>
  );
}
