"use client";

import { useState, useEffect } from "react";
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
import { PlacesAutocomplete } from "./PlacesAutocomplete";
import { useCreateTrip } from "../hooks/useCreateTrip";
import { useUpdateTrip } from "../hooks/useUpdateTrip";
import { Location, Trip } from "@/types/models";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { TripCreateData } from "@/types/api";

const tripCreateSchema = z.object({
  name: z.string().optional().nullable(),
  current_location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  pickup_location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  dropoff_location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  current_cycle_hours: z.number().min(0).default(0),
});

type TripCreateFormData = z.infer<typeof tripCreateSchema>;

interface CreateTripDrawerProps {
  children?: React.ReactNode;
  initialData?: Trip | null;
  onClose?: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function CreateTripDrawer({ children, initialData, onClose, open, setOpen }: CreateTripDrawerProps) {
  const isEditMode = !!initialData;
  const createTripMutation = useCreateTrip(() => {
    setOpen(false);
    onClose?.();
  });
  const updateTripMutation = useUpdateTrip(initialData?.id || 0, () => {
    setOpen(false);
    onClose?.();
  });

  const onOpenChange = (open: boolean) => {
    setOpen(open);
    // setOpenProp?.(open);
  };

  const form = useForm({
    resolver: zodResolver(tripCreateSchema),
    defaultValues: {
      name: "",
      current_location: {},
      pickup_location: {},
      dropoff_location: {},
      current_cycle_hours: 0,
    },
  });

  useEffect(() => {
    if (initialData && open) {
      console.log("initialData", initialData);
      form.reset({
        name: initialData.name || "",
        current_location: initialData.current_location || {},
        pickup_location: initialData.pickup_location || {},
        dropoff_location: initialData.dropoff_location || {},
        current_cycle_hours: initialData.current_cycle_hours || 0,
      });
    } else if (!initialData && open) {
      form.reset({
        name: "",
        current_location: {},
        pickup_location: {},
        dropoff_location: {},
        current_cycle_hours: 0,
      });
    }
  }, [initialData, open, form]);

  const onSubmit = (data: TripCreateFormData) => {
    const tripData: TripCreateData = {
      name: data.name || null,
      current_location: data.current_location as Location,
      pickup_location: data.pickup_location as Location,
      dropoff_location: data.dropoff_location as Location,
      current_cycle_hours: isEditMode ? 0 : data.current_cycle_hours,
    };

    if (isEditMode && initialData) {
      updateTripMutation.mutate(tripData);
    } else {
      createTripMutation.mutate(tripData);
    }
  };

  const isPending = createTripMutation.isPending || updateTripMutation.isPending;

  return (
    <ResponsiveModal
      title={isEditMode ? "Edit Trip" : "Create New Trip"}
      description={
        isEditMode
          ? "Update trip details. Changing locations will recalculate the total distance. Current cycle hours are auto-calculated from activities."
          : "Enter trip details including locations and current cycle hours."
      }
      open={open}
      setOpen={onOpenChange}
      trigger={children}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trip Name (Optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="e.g., Trip to Chicago"
                    value={field.value || ""}
                    disabled={isPending}
                  />
                </FormControl>
                <FormDescription>
                  Optional name for this trip. If left empty, will default to "Trip #id"
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="current_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Location</FormLabel>
                <FormControl>
                  <PlacesAutocomplete
                    value={field.value || null}
                    onChange={field.onChange}
                    placeholder="Search for current location..."
                    disabled={createTripMutation.isPending}
                  />
                </FormControl>
                <FormDescription>
                  Your current starting location
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pickup_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pickup Location</FormLabel>
                <FormControl>
                  <PlacesAutocomplete
                    value={field.value || null}
                    onChange={field.onChange}
                    placeholder="Search for pickup location..."
                    disabled={createTripMutation.isPending}
                  />
                </FormControl>
                <FormDescription>
                  Where you will pick up the load
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dropoff_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dropoff Location</FormLabel>
                <FormControl>
                  <PlacesAutocomplete
                    value={field.value || null}
                    onChange={field.onChange}
                    placeholder="Search for dropoff location..."
                    disabled={createTripMutation.isPending}
                  />
                </FormControl>
                <FormDescription>
                  Where you will deliver the load
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="current_cycle_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Cycle Hours</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0"
                    {...field}
                    value={field.value || 0}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                    disabled={isEditMode || isPending}
                    readOnly={isEditMode}
                  />
                </FormControl>
                <FormDescription>
                  {isEditMode
                    ? "Automatically calculated from activities. Cannot be manually edited."
                    : "Hours already used in your current driving cycle"}
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
                  ? "Update Trip"
                  : "Create Trip"}
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
