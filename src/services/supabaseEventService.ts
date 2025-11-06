import { supabase } from '@/integrations/supabase/client';
import { Event } from '../types/network';

export async function fetchEventsFromSupabase(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching events from Supabase:', error);
    throw error;
  }

  return (data || []).map(event => ({
    type: event.event_type as any,
    timestamp: new Date(event.created_at || Date.now()),
    message: event.message || '',
    towerId: event.cell_id ? parseInt(event.cell_id) : 0,
    cellId: event.cell_id || undefined,
    anomalyType: event.anomaly_type || undefined,
    band: event.band || undefined,
    sourceId: event.source || undefined,
    recommendedFix: event.recommended_fix || undefined,
  }));
}

export function subscribeToEvents(callback: (event: Event) => void) {
  const channel = supabase
    .channel('events-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'events'
      },
      (payload) => {
        const newEvent = payload.new as any;
        const event: Event = {
          type: newEvent.event_type as any,
          timestamp: new Date(newEvent.created_at || Date.now()),
          message: newEvent.message || '',
          towerId: newEvent.cell_id ? parseInt(newEvent.cell_id) : 0,
          cellId: newEvent.cell_id || undefined,
          anomalyType: newEvent.anomaly_type || undefined,
          band: newEvent.band || undefined,
          sourceId: newEvent.source || undefined,
          recommendedFix: newEvent.recommended_fix || undefined,
        };
        callback(event);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
