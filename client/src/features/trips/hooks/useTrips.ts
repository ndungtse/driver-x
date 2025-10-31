'use client';

import { useQuery } from '@tanstack/react-query';
import { tripsApi } from '../services/tripsApi';

export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: () => tripsApi.getTrips(),
  });
}

export function useTrip(id: number) {
  return useQuery({
    queryKey: ['trips', id],
    queryFn: () => tripsApi.getTrip(id),
    enabled: !!id,
  });
}

export { useCreateTrip } from './useCreateTrip';

