import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Event } from '../types/network';
import { fetchEventsFromSupabase, subscribeToEvents } from '../services/supabaseEventService';

export function useRemediationEvents(limit: number = 50) {
  const queryClient = useQueryClient();

  const remediationEventsQuery = useQuery({
    queryKey: ['remediationEvents'],
    queryFn: async (): Promise<Event[]> => {
      const events = await fetchEventsFromSupabase();
      return events.filter(e => 
        e.type === 'remediation-proposed' || 
        e.type === 'remediation-executing' || 
        e.type === 'remediation-verified' || 
        e.type === 'remediation-completed'
      ).slice(0, limit);
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    const unsubscribe = subscribeToEvents((newEvent) => {
      if (newEvent.type === 'remediation-proposed' || 
          newEvent.type === 'remediation-executing' || 
          newEvent.type === 'remediation-verified' || 
          newEvent.type === 'remediation-completed') {
        queryClient.invalidateQueries({ queryKey: ['remediationEvents'] });
      }
    });

    return unsubscribe;
  }, [queryClient]);

  return {
    events: remediationEventsQuery.data || [],
    isLoading: remediationEventsQuery.isLoading,
    isError: remediationEventsQuery.isError,
    error: remediationEventsQuery.error,
  };
}