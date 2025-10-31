"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlacesAutocomplete } from "./PlacesAutocomplete";
import { useCreateActivity, useUpdateActivity } from "../hooks/useActivities";
import { Trip, ActivityStatus, Activity } from "@/types/models";
import { ActivityCreateData } from "@/types/api";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { useEffect } from "react";

const activityCreateSchema = z
  .object({
    status: z.enum([
      "off_duty",
      "sleeper_berth",
      "driving",
      "on_duty_not_driving",
    ]),
    start_time: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/,
        "Invalid time format (HH:MM or HH:MM:SS)"
      ),
    end_time: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/,
        "Invalid time format (HH:MM or HH:MM:SS)"
      ),
      location: z.object({
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }),
    end_location: z.object({
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }).optional(),
    remark: z.string().optional(),
    miles_driven: z.number().optional(),
  })
  .refine(
    (data) => {
      const [startHour, startMin] = data.start_time.split(":").map(Number);
      const [endHour, endMin] = data.end_time.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      return endMinutes > startMinutes;
    },
    {
      message: "End time must be after start time",
      path: ["end_time"],
    }
  );

type ActivityCreateFormData = z.infer<typeof activityCreateSchema>;

interface AddActivityDrawerProps {
  dailyLogId: number;
  trip: Trip;
  children: React.ReactNode;
  initialData?: Activity;
  onClose?: () => void;
}

export function AddActivityDrawer({
  dailyLogId,
  trip,
  children,
  initialData,
  onClose,
}: AddActivityDrawerProps) {
  const [open, setOpen] = useState(false);
  const isEditMode = !!initialData;
  const createActivityMutation = useCreateActivity(dailyLogId);
  const updateActivityMutation = useUpdateActivity(initialData?.id || 0, dailyLogId);

  const form = useForm<ActivityCreateFormData>({
    resolver: zodResolver(activityCreateSchema),
    defaultValues: {
      status: "driving",
      start_time: "",
      end_time: "",
      location: trip.current_location || {},
      end_location: undefined,
      remark: "",
      miles_driven: undefined,
    },
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        status: initialData.status as ActivityCreateFormData['status'],
        start_time: initialData.start_time,
        end_time: initialData.end_time,
        location: initialData.location || {},
        end_location: initialData.end_location || undefined,
        remark: initialData.remark || "",
        miles_driven: initialData.miles_driven || undefined,
      });
    } else if (!initialData && open) {
      form.reset({
        status: "driving",
        start_time: "",
        end_time: "",
        location: trip.current_location || {},
        end_location: undefined,
        remark: "",
        miles_driven: undefined,
      });
    }
  }, [initialData, open, form, trip.current_location]);

  const status = form.watch("status");
  const showMilesDriven = status === "driving";

  const onSubmit = (data: ActivityCreateFormData) => {
    const activityData: ActivityCreateData = {
      status: data.status as ActivityStatus,
      start_time: data.start_time,
      end_time: data.end_time,
      location: data.location,
      end_location: data.end_location,
      remark: data.remark || "",
      miles_driven: showMilesDriven ? data.miles_driven : undefined,
    };

    if (isEditMode && initialData) {
      updateActivityMutation.mutate(activityData, {
        onSuccess: () => {
          setOpen(false);
          form.reset();
          onClose?.();
        },
      });
    } else {
      createActivityMutation.mutate(activityData, {
        onSuccess: () => {
          setOpen(false);
          form.reset();
          onClose?.();
        },
      });
    }
  };

  const isPending =updateActivityMutation.isPending || createActivityMutation.isPending;

  return (
    <ResponsiveModal
      title={isEditMode ? "Edit Activity" : "Add Activity"}
      description={
        isEditMode
          ? "Update this activity. Changes will automatically adjust the timeline."
          : "Log a new activity for this day. Activities are automatically ordered by time."
      }
      trigger={children}
      open={open}
      setOpen={setOpen}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log("form.getValues()", form.getValues());
          console.log("errors in form", errors);
        })} className="space-y-4 p-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl className="w-full sm:w-1/2">
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="driving">Driving</SelectItem>
                    <SelectItem value="on_duty_not_driving">
                      On Duty Not Driving
                    </SelectItem>
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
                      disabled={isPending}
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
                      disabled={isPending}
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
                <FormLabel>Start Location</FormLabel>
                <FormControl>
                  <PlacesAutocomplete
                    value={field.value || null}
                    onChange={field.onChange}
                    placeholder="Search for start location..."
                    disabled={isPending}
                  />
                </FormControl>
                <FormDescription>
                  Location where this activity starts
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Location (Optional)</FormLabel>
                <FormControl>
                  <PlacesAutocomplete
                    value={field.value || null}
                    onChange={field.onChange}
                    placeholder="Search for end location..."
                    disabled={isPending}
                  />
                </FormControl>
                <FormDescription>
                  Location where this activity ends (useful for map plotting)
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
                      disabled={isPending}
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
                    disabled={isPending}
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
              disabled={isPending}
              className="w-full"
            >
              {isPending
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update Activity"
                  : "Create Activity"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </Form>
    </ResponsiveModal>
  );
}
