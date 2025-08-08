
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Event } from '../types/network';
import { fetchRemediationEvents } from '../services/dbService';
import { dbConfig } from '../config/dbConfig';
import { supabase } from '@/integrations/supabase/client';

export function useRemediationEvents(limit: number = 50) {
  const queryClient = useQueryClient();

  // Fetch remediation events
  const remediationQuery = useQuery({
    queryKey: ['remediationEvents'],
    queryFn: () => fetchRemediationEvents(limit),
    refetchInterval: dbConfig.useSupabase ? false : 10000, // Only poll if not using Supabase
  });

  // Set up Supabase real-time subscription for remediation events if enabled
  useEffect(() => {
    if (!dbConfig.useSupabase) return;
    
    const channel = supabase
      .channel('remediation_events_channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'remediation_events' }, 
        (payload) => {
          const newEvent = payload.new;
          console.log('New remediation event received:', newEvent);
          
          // Update the remediation events in the cache
          queryClient.setQueryData(['remediationEvents'], (oldData: any[] = []) => {
            const newRemediationEvent = {
              event_type: newEvent.event_type,
              event_time: newEvent.event_time,
              tower_id: newEvent.tower_id
            };
            const combined = [newRemediationEvent, ...oldData];
            // Sort by timestamp (newest first) and limit to specified count
            return combined
              .sort((a, b) => new Date(b.event_time).getTime() - new Date(a.event_time).getTime())
              .slice(0, limit);
          });
        })
      .subscribe();
    
    // Clean up subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, limit]);

  // Convert remediation events to Event format
  const remediationEvents: Event[] = remediationQuery.data ? remediationQuery.data.map((event: any) => ({
    type: event.event_type === 'started' ? 'remediation-started' : 'remediation-completed',
    timestamp: new Date(event.event_time),
    message: event.event_type === 'started' 
      ? 'Network remediation process started' 
      : 'Network remediation process completed',
    towerId: Math.floor(Math.random() * 5) + 1, // Random tower ID for now
    cellId: event.tower_id // Use tower_id from remediation_events table
  })) : [];

  return {
    events: remediationEvents,
    isLoading: remediationQuery.isLoading,
    isError: remediationQuery.isError,
    error: remediationQuery.error,
  };
}
