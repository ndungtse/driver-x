'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi } from '../services/tripsApi';
import { TripCreateData } from '@/types/api';
import { toast } from 'sonner';
import { getResError } from '@/lib/fetcher';

export function useUpdateTrip(tripId: number, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<TripCreateData>) => tripsApi.updateTrip(tripId, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['trips', tripId] });
        queryClient.invalidateQueries({ queryKey: ['trips'] });
        toast.success('Trip updated successfully');
        onSuccessCallback?.();
      } else {
        toast.error(response.message || 'Failed to update trip');
      }
    },
    onError: (error) => {
      const message = getResError(error) || 'Failed to update trip';
      toast.error(message);
    },
  });
}

