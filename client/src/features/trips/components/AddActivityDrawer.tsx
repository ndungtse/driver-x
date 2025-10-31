'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlacesAutocomplete } from './PlacesAutocomplete';
import { useCreateActivity } from '../hooks/useActivities';
import { Trip, ActivityStatus } from '@/types/models';
import { ActivityCreateData } from '@/types/api';

const activityCreateSchema = z
  .object({
    status: z.enum(['off_duty', 'sleeper_berth', 'driving', 'on_duty_not_driving']),
    start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    location: z.object({
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }),
    remark: z.string().optional(),
    miles_driven: z.number().optional(),
  })
  .refine((data) => {
    const [startHour, startMin] = data.start_time.split(':').map(Number);
    const [endHour, endMin] = data.end_time.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes > startMinutes;
  }, {
    message: 'End time must be after start time',
    path: ['end_time'],
  });

type ActivityCreateFormData = z.infer<typeof activityCreateSchema>;

interface AddActivityDrawerProps {
  dailyLogId: number;
  trip: Trip;
  children: React.ReactNode;
}

export function AddActivityDrawer({
  dailyLogId,
  trip,
  children,
}: AddActivityDrawerProps) {
  const [open, setOpen] = useState(false);
  const createActivityMutation = useCreateActivity(dailyLogId);

  const form = useForm<ActivityCreateFormData>({
    resolver: zodResolver(activityCreateSchema),
    defaultValues: {
      status: 'driving',
      start_time: '',
      end_time: '',
      location: trip.current_location || {},
      remark: '',
      miles_driven: undefined,
    },
  });

  const status = form.watch('status');
  const showMilesDriven = status === 'driving';

  const onSubmit = (data: ActivityCreateFormData) => {
    const activityData: ActivityCreateData = {
      status: data.status as ActivityStatus,
      start_time: data.start_time,
      end_time: data.end_time,
      location: data.location,
      remark: data.remark || '',
      miles_driven: showMilesDriven ? data.miles_driven : undefined,
    };
    createActivityMutation.mutate(activityData, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add Activity</DrawerTitle>
          <DrawerDescription>
            Log a new activity for this day. Activities are automatically ordered by time.
          </DrawerDescription>
        </DrawerHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="driving">Driving</SelectItem>
                      <SelectItem value="on_duty_not_driving">On Duty Not Driving</SelectItem>
                      <SelectItem value="off_duty">Off Duty</SelectItem>
                      <SelectItem value="sleeper_berth">Sleeper Berth</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        disabled={createActivityMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        disabled={createActivityMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <PlacesAutocomplete
                      value={field.value || null}
                      onChange={field.onChange}
                      placeholder="Search for location..."
                      disabled={createActivityMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Location where this activity took place
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showMilesDriven && (
              <FormField
                control={form.control}
                name="miles_driven"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Miles Driven</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || undefined)
                        }
                        disabled={createActivityMutation.isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      Total miles driven during this activity
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="remark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remark</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Optional remark..."
                      {...field}
                      disabled={createActivityMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Additional notes about this activity
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DrawerFooter>
              <Button
                type="submit"
                disabled={createActivityMutation.isPending}
                className="w-full"
              >
                {createActivityMutation.isPending ? 'Creating...' : 'Create Activity'}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}
