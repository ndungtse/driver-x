"use client";

import { DailyLog, Trip } from "@/types/models";
import { useState, useMemo, useEffect } from "react";
import { useDailyLogs } from "@/features/trips/hooks/useDailyLogs";
import { useActivities } from "@/features/trips/hooks/useActivities";
import { LogbookHeader } from "./LogbookHeader";
import { LogbookGrid } from "./LogbookGrid";
import { LogbookRemarks } from "./LogbookRemarks";
import { LogbookTotals } from "./LogbookTotals";
import { DateSelector } from "./DateSelector";
import { ExportButtons } from "./ExportButtons";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { validateLogbook } from "../utils/logbookValidator";
import { ApiResponse } from "@/types/api";

interface LogbookViewProps {
  trip?: Trip;
  dailyLogsData: ApiResponse<DailyLog[]> | undefined;
  isLoading: boolean;
  setActiveDailyLog: (dailyLog: DailyLog) => void;
}

export function LogbookView({ dailyLogsData, isLoading, setActiveDailyLog }: LogbookViewProps) {
  // const { data: dailyLogsData, isLoading } = useDailyLogs(trip.id);

  const dailyLogs = useMemo(
    () =>
      dailyLogsData?.success && dailyLogsData.data
        ? Array.isArray(dailyLogsData.data)
          ? dailyLogsData.data
          : []
        : [],
    [dailyLogsData]
  );

  const firstDate = useMemo(() => {
    if (dailyLogs.length === 0) return null;
    const sorted = [...dailyLogs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sorted[0].date;
  }, [dailyLogs]);

  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    const updateSelectedDate = () => {
      if (firstDate && !selectedDate) {
        setSelectedDate(firstDate);
      }
    };
    updateSelectedDate();
  }, [firstDate, selectedDate]);

  const currentDailyLog = useMemo(() => {
    if (!selectedDate) return null;
    return dailyLogs.find((log) => log.date === selectedDate);
  }, [dailyLogs, selectedDate]);

  // setActive as current daily log changes
  useEffect(() => {
    if (currentDailyLog) {
      setActiveDailyLog(currentDailyLog);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDailyLog]);

  const { data: activitiesData } = useActivities(currentDailyLog?.id || 0);

  const logbookActivities = useMemo(() => {
    if (!activitiesData?.success || !activitiesData.data) return [];

    if (Array.isArray(activitiesData.data)) {
      return activitiesData.data;
    }

    if (
      "activities" in activitiesData.data &&
      Array.isArray(activitiesData.data.activities)
    ) {
      return activitiesData.data.activities;
    }

    return [];
  }, [activitiesData]);

  const dailyLogWithActivities = useMemo(() => {
    if (!currentDailyLog) return null;
    return { ...currentDailyLog, activities: logbookActivities };
  }, [currentDailyLog, logbookActivities]);

  const validation = useMemo(() => {
    if (!dailyLogWithActivities) return null;
    return validateLogbook(dailyLogWithActivities);
  }, [dailyLogWithActivities]);

  if (isLoading) {
    return (
      <Card>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Loading logbook...</p>
        </div>
      </Card>
    );
  }

  if (dailyLogs.length === 0) {
    return (
      <Card>
        <div className="p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No daily logs found for this trip
          </p>
          <p className="text-sm text-muted-foreground">
            Start the trip and add activities to generate a logbook
          </p>
        </div>
      </Card>
    );
  }

  if (!dailyLogWithActivities) {
    return (
      <Card>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Select a date to view logbook</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <DateSelector
          dailyLogs={dailyLogs}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
        <ExportButtons onPrint={() => window.print()} />
      </div>

      {validation &&
        (!validation.isValid || validation.warnings.length > 0) && (
          <Alert variant={validation.isValid ? "default" : "warning"}>
            <AlertCircleIcon className="size-4" />
            <AlertDescription>
              <div className="space-y-1">
                {validation.errors.length > 0 && (
                  <div>
                    <p className="font-medium">Warnings:</p>
                    <ul className="list-disc list-inside ml-2">
                      {validation.errors.map((error, idx) => (
                        <li key={idx} className="text-sm">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* {validation.warnings.length > 0 && (
                  <div>
                    <p className="font-medium">Warnings:</p>
                    <ul className="list-disc list-inside ml-2">
                      {validation.warnings.map((warning, idx) => (
                        <li key={idx} className="text-sm">
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )} */}
              </div>
            </AlertDescription>
          </Alert>
        )}

      <Card>
        <div className="print:shadow-none">
          <LogbookHeader dailyLog={dailyLogWithActivities} />

          <div className="p-4">
            <LogbookGrid activities={logbookActivities} />
          </div>

          <LogbookRemarks activities={logbookActivities} />
          <LogbookTotals dailyLog={dailyLogWithActivities} />
        </div>
      </Card>
    </div>
  );
}
