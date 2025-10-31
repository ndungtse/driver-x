'use client';

import { DailyLog } from '@/types/models';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { format } from 'date-fns';

interface DateSelectorProps {
  dailyLogs: DailyLog[];
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function DateSelector({ dailyLogs, selectedDate, onDateChange }: DateSelectorProps) {
  const sortedDates = [...dailyLogs]
    .map((log) => log.date)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const currentIndex = sortedDates.indexOf(selectedDate);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < sortedDates.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      onDateChange(sortedDates[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onDateChange(sortedDates[currentIndex + 1]);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={!hasPrevious}
        >
          <ChevronLeftIcon className="size-4" />
        </Button>

        <div className="min-w-[200px] text-center">
          <p className="text-sm font-medium">
            {selectedDate ? format(new Date(selectedDate), 'EEEE, MMMM d, yyyy') : 'No date'}
          </p>
          {currentIndex >= 0 && (
            <p className="text-xs text-muted-foreground">
              Day {currentIndex + 1} of {sortedDates.length}
            </p>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={!hasNext}
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      <div className="flex-1" />

      {sortedDates.length > 1 && (
        <div className="flex gap-1">
          {sortedDates.map((date) => (
            <button
              key={date}
              onClick={() => onDateChange(date)}
              className={`px-2 py-1 text-xs rounded ${
                date === selectedDate
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {format(new Date(date), 'MMM d')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

