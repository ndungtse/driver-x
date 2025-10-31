'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi } from '../services/tripsApi';
import { TripCreateData } from '@/types/api';
import { toast } from 'sonner';
import { getResError } from '@/lib/fetcher';

export function useCreateTrip(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TripCreateData) => tripsApi.createTrip(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['trips'] });
        toast.success('Trip created successfully');
        onSuccess?.();
      } else {
        toast.error(response.message || 'Failed to create trip');
      }
    },
    onError: (error) => {
      const message = getResError(error) || 'Failed to create trip';
      toast.error(message);
    },
  });
}
