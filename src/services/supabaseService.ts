
import { createClient } from '@supabase/supabase-js';
import { CallRecord, Tower } from '../types/network';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase credentials are available
export const isSupabaseConfigured = () => {
  return supabaseUrl !== '' && supabaseAnonKey !== '';
};

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection to Supabase
export async function testConnection(): Promise<boolean> {
  try {
    // Simple query to test connection
    const { error } = await supabase.from('call_records').select('count', { count: 'exact', head: true });
    return !error;
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
    return false;
  }
}

// Fetch remediation events from Supabase
export async function fetchRemediationEvents(limit: number = 50): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('remediation_events')
      .select('event_type, event_time')
      .order('event_time', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching remediation events from Supabase:', error);
    throw error;
  }
}

// Fetch call records from Supabase
export async function fetchCallRecords(limit: number = 100): Promise<CallRecord[]> {
  try {
    const { data, error } = await supabase
      .from('call_records')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data.map(row => ({
      timestamp: new Date(row.timestamp),
      location: {
        lat: parseFloat(row.lat || 0),
        lng: parseFloat(row.lng || 0)
      },
      signalStrength: parseInt(row.signal_strength || 0),
      isDropped: row.is_dropped,
      cellId: row.cell_id
    }));
  } catch (error) {
    console.error('Error fetching call records from Supabase:', error);
    throw error;
  }
}

// Fetch recent dropped calls from Supabase
export async function fetchRecentDroppedCalls(minutes: number = 30): Promise<CallRecord[]> {
  try {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('call_records')
      .select('*')
      .eq('is_dropped', true)
      .gte('timestamp', cutoffTime)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    return data.map(row => ({
      timestamp: new Date(row.timestamp),
      location: {
        lat: parseFloat(row.lat || 0),
        lng: parseFloat(row.lng || 0)
      },
      signalStrength: parseInt(row.signal_strength || 0),
      isDropped: true,
      cellId: row.cell_id
    }));
  } catch (error) {
    console.error('Error fetching recent dropped calls from Supabase:', error);
    throw error;
  }
}

// Get towers based on call clustering from Supabase
export async function deriveTowersFromCalls(): Promise<Tower[]> {
  try {
    // Using Supabase's PostgreSQL functions for clustering
    // This assumes you have a stored procedure or a view in Supabase
    const { data, error } = await supabase.rpc('get_tower_clusters');
    
    if (error) throw error;
    
    return data.map((tower: any, index: number) => {
      // Use drop_rate directly from database if available, otherwise calculate it
      const dropRate = tower.drop_rate !== undefined 
        ? tower.drop_rate * 100 
        : tower.total_calls > 0 ? (tower.dropped_calls / tower.total_calls) * 100 : 0;
      
      // Mark tower as down if drop rate exceeds 5%
      const status = dropRate > 5 ? "down" : "up";
      const downSince = status === "down" ? new Date(tower.last_down) : undefined;
      
      return {
        id: index + 1,
        name: tower.name || `Tower ${String.fromCharCode(65 + index)}`,
        lat: parseFloat(tower.lat),
        lng: parseFloat(tower.lng),
        status,
        downSince,
        droppedCalls: tower.dropped_calls,
        dropRate: dropRate
      };
    });
  } catch (error) {
    console.error('Error deriving towers from Supabase:', error);
    throw error;
  }
}

// Get recovery time statistics from Supabase (now returns seconds)
export async function getAvgRecoveryTime(): Promise<number> {
  try {
    // Call the RPC function with an empty object as parameters (to fix TypeScript error)
    const { data, error } = await supabase.rpc('get_avg_recovery_time', {});
    
    if (error) throw error;
    
    // Convert the returned value to a number (now in seconds)
    return data !== null ? Number(data) : 0; // Default fallback value
  } catch (error) {
    console.error('Error getting average recovery time from Supabase:', error);
    throw error;
  }
}

// Subscribe to call_records table changes
export function subscribeToCallRecords(callback: (records: CallRecord[]) => void) {
  return supabase
    .channel('call_records_channel')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'call_records' }, 
      payload => {
        const record = payload.new;
        const callRecord: CallRecord = {
          timestamp: new Date(record.timestamp),
          location: {
            lat: parseFloat(record.lat || 0),
            lng: parseFloat(record.lng || 0)
          },
          signalStrength: parseInt(String(record.signal_strength || 0)),
          isDropped: record.is_dropped,
          cellId: record.cell_id
        };
        callback([callRecord]);
      })
    .subscribe();
}

export default {
  testConnection,
  fetchCallRecords,
  fetchRecentDroppedCalls,
  deriveTowersFromCalls,
  getAvgRecoveryTime,
  subscribeToCallRecords,
  fetchRemediationEvents,
  supabase,
  isSupabaseConfigured
};
