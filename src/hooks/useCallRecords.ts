
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { CallRecord, Event, Tower } from '../types/network';
import { 
  fetchCallRecords, 
  deriveTowersFromCalls, 
  convertCallsToEvents, 
  getAvgRecoveryTime,
  subscribeToCallRecords
} from '../services/dbService';
import { dbConfig } from '../config/dbConfig';

export function useCallRecords(limit: number = 100) {
  const queryClient = useQueryClient();

  // Fetch call records
  const callsQuery = useQuery({
    queryKey: ['callRecords', limit],
    queryFn: () => fetchCallRecords(limit),
    refetchInterval: dbConfig.useSupabase ? false : 5000, // Only poll if not using Supabase
  });

  // Derive towers from call patterns
  const towersQuery = useQuery({
    queryKey: ['towers'],
    queryFn: deriveTowersFromCalls,
    refetchInterval: dbConfig.useSupabase
      ? false
      : dbConfig.useTowersJson
        ? (dbConfig.towersJsonPollMs || 15000)
        : 10000, // Poll JSON at configured interval, otherwise default
  });
  
  // Get average recovery time
  const recoveryTimeQuery = useQuery({
    queryKey: ['recoveryTime'],
    queryFn: getAvgRecoveryTime,
    refetchInterval: dbConfig.useSupabase ? false : 30000, // Only poll if not using Supabase
  });

  // Set up Supabase real-time subscriptions if enabled
  useEffect(() => {
    if (!dbConfig.useSupabase) return;
    
    const subscription = subscribeToCallRecords((newRecords) => {
      // Update the call records in the cache
      queryClient.setQueryData<CallRecord[]>(['callRecords', limit], (oldData = []) => {
        const combined = [...newRecords, ...oldData];
        // Sort by timestamp (newest first) and limit to specified count
        return combined
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, limit);
      });
      
      // Invalidate related queries to trigger refetching
      queryClient.invalidateQueries({ queryKey: ['towers'] });
      queryClient.invalidateQueries({ queryKey: ['recoveryTime'] });
    });
    
    // Clean up subscription when component unmounts
    return () => {
      subscription?.unsubscribe();
    };
  }, [queryClient, limit]);

  // Convert call records to events for LiveFeed, ensuring we have valid timestamps
  const callEvents: Event[] = callsQuery.data ? convertCallsToEvents(callsQuery.data) : [];

  return {
    calls: callsQuery.data || [],
    towers: towersQuery.data || [],
    callEvents,
    avgRecoveryTime: recoveryTimeQuery.data || 0,
    isLoading: callsQuery.isLoading || towersQuery.isLoading,
    isError: callsQuery.isError || towersQuery.isError,
    error: callsQuery.error || towersQuery.error,
  };
}
