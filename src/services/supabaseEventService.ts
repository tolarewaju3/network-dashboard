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

  return (data || []).map(event => {
    // Map database event types to app event types
    let eventType = event.event_type;
    if (eventType === 'anomaly') {
      eventType = 'anomaly-detected';
    } else if (eventType === 'remediation_proposed') {
      eventType = 'remediation-proposed';
    } else if (eventType === 'remediation_completed') {
      eventType = 'remediation-completed';
    }
    
    // Generate message if not present
    let message = event.message;
    if (!message && event.anomaly_type) {
      message = `${event.anomaly_type} detected on Band ${event.band}`;
    }
    
    return {
      type: eventType as any,
      timestamp: new Date(event.created_at || Date.now()),
      message: message || 'Network event',
      towerId: event.cell_id ? parseInt(event.cell_id) : 0,
      cellId: event.cell_id || undefined,
      anomalyType: event.anomaly_type || undefined,
      band: event.band || undefined,
      sourceId: event.source || undefined,
      recommendedFix: event.recommended_fix || undefined,
    };
  });
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
        
        // Map database event types to app event types
        let eventType = newEvent.event_type;
        if (eventType === 'anomaly') {
          eventType = 'anomaly-detected';
        } else if (eventType === 'remediation_proposed') {
          eventType = 'remediation-proposed';
        } else if (eventType === 'remediation_completed') {
          eventType = 'remediation-completed';
        }
        
        // Generate message if not present
        let message = newEvent.message;
        if (!message && newEvent.anomaly_type) {
          message = `${newEvent.anomaly_type} detected on Band ${newEvent.band}`;
        }
        
        const event: Event = {
          type: eventType as any,
          timestamp: new Date(newEvent.created_at || Date.now()),
          message: message || 'Network event',
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
