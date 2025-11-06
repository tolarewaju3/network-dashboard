import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchEventsFromSupabase, subscribeToEvents } from '../services/supabaseEventService';
import { Event } from '../types/network';

export function useAnomalyEvents() {
  const queryClient = useQueryClient();

  const anomalyEventsQuery = useQuery({
    queryKey: ['anomalyEvents'],
    queryFn: async (): Promise<Event[]> => {
      const events = await fetchEventsFromSupabase();
      return events.filter(e => e.type === 'anomaly-detected');
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5000,
  });

  useEffect(() => {
    const unsubscribe = subscribeToEvents((newEvent) => {
      if (newEvent.type === 'anomaly-detected') {
        queryClient.invalidateQueries({ queryKey: ['anomalyEvents'] });
      }
    });

    return unsubscribe;
  }, [queryClient]);

  return {
    events: anomalyEventsQuery.data || [],
    isLoading: anomalyEventsQuery.isLoading,
    isError: anomalyEventsQuery.isError,
    error: anomalyEventsQuery.error,
  };
}