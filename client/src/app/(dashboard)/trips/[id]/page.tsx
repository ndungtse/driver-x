"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogbookView } from "@/features/logbook/components/LogbookView";
import { AddActivityDrawer } from "@/features/trips/components/AddActivityDrawer";
import { TripTimeline } from "@/features/trips/components/TripTimeline";
import { useDailyLogs } from "@/features/trips/hooks/useDailyLogs";
import { useTrip } from "@/features/trips/hooks/useTrips";
import { activeDailyLogAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import { PlusIcon } from "lucide-react";
import { use, useState } from "react";

export default function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const tripId = parseInt(id, 10);
  const { data, isLoading } = useTrip(tripId);
  const { data: dailyLogsData, isLoading: dailyLogsLoading } =
    useDailyLogs(tripId);
  const [activeDailyLog, setActiveDailyLog] = useAtom(activeDailyLogAtom);
  const [activeTab, setActiveTab] = useState("timeline");

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="logbook">Logbook</TabsTrigger>
            <TabsTrigger value="map">Journey Map</TabsTrigger>
          </TabsList>
          {activeDailyLog && activeTab === "logbook" && (
            <AddActivityDrawer dailyLogId={activeDailyLog.id} trip={trip}>
              <Button size="sm">
                <PlusIcon className="mr-2 size-4" />
                Add Activity
              </Button>
            </AddActivityDrawer>
          )}
        </div>

        <TabsContent value="timeline" className="mt-6">
          <TripTimeline
            trip={trip}
            dailyLogsData={dailyLogsData}
            isLoading={dailyLogsLoading}
          />
        </TabsContent>

        <TabsContent value="logbook" className="mt-6">
          <LogbookView
            trip={trip}
            dailyLogsData={dailyLogsData}
            isLoading={dailyLogsLoading}
            setActiveDailyLog={setActiveDailyLog}
          />
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
