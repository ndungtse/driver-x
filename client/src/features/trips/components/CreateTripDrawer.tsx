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
import { PlacesAutocomplete } from "./PlacesAutocomplete";
import { useCreateTrip } from "../hooks/useCreateTrip";
import { Location } from "@/types/models";
import { ResponsiveModal } from "@/components/ResponsiveModal";

const tripCreateSchema = z.object({
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
  children: React.ReactNode;
}

export function CreateTripDrawer({ children }: CreateTripDrawerProps) {
  const [open, setOpen] = useState(false);
  const createTripMutation = useCreateTrip(() => setOpen(false));

  const form = useForm({
    resolver: zodResolver(tripCreateSchema),
    defaultValues: {
      current_location: {},
      pickup_location: {},
      dropoff_location: {},
      current_cycle_hours: 0,
    },
  });

  const onSubmit = (data: TripCreateFormData) => {
    const tripData = {
      current_location: data.current_location as Location,
      pickup_location: data.pickup_location as Location,
      dropoff_location: data.dropoff_location as Location,
      current_cycle_hours: data.current_cycle_hours,
    };
    createTripMutation.mutate(tripData);
  };

  return (
    <ResponsiveModal
      title="Create New Trip"
      description="Enter trip details including locations and current cycle hours."
      open={open}
      setOpen={setOpen}
      trigger={children}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
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
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                    disabled={createTripMutation.isPending}
                  />
                </FormControl>
                <FormDescription>
                  Hours already used in your current driving cycle
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <DrawerFooter>
            <Button
              type="submit"
              disabled={createTripMutation.isPending}
              className="w-full"
            >
              {createTripMutation.isPending ? "Creating..." : "Create Trip"}
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
