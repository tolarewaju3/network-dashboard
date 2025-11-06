import { useQuery } from '@tanstack/react-query';
import { fetchEventsFromSupabase } from '../services/supabaseEventService';

interface ProcessedAnomaly {
  cellId: string;
  count: number;
  types: string[];
  latestAnomaly: string;
  latestDate: string;
}

async function processAnomaliesFromSupabase(): Promise<Map<string, ProcessedAnomaly>> {
  const events = await fetchEventsFromSupabase();
  const anomalyEvents = events.filter(e => e.type === 'anomaly-detected');
  
  const processedMap = new Map<string, ProcessedAnomaly>();

  anomalyEvents.forEach(event => {
    const cellId = event.cellId || event.towerId.toString();
    
    if (processedMap.has(cellId)) {
      const existing = processedMap.get(cellId)!;
      existing.count++;
      if (event.anomalyType && !existing.types.includes(event.anomalyType)) {
        existing.types.push(event.anomalyType);
      }
      // Update if this anomaly is more recent
      if (event.timestamp > new Date(existing.latestDate)) {
        existing.latestAnomaly = event.message;
        existing.latestDate = event.timestamp.toISOString();
      }
    } else {
      processedMap.set(cellId, {
        cellId,
        count: 1,
        types: event.anomalyType ? [event.anomalyType] : [],
        latestAnomaly: event.message,
        latestDate: event.timestamp.toISOString()
      });
    }
  });

  return processedMap;
}

export function useAnomalies() {
  const anomaliesQuery = useQuery({
    queryKey: ['anomalies'],
    queryFn: processAnomaliesFromSupabase,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5000,
  });

  return {
    anomalies: anomaliesQuery.data || new Map(),
    isLoading: anomaliesQuery.isLoading,
    isError: anomaliesQuery.isError,
    error: anomaliesQuery.error,
  };
}