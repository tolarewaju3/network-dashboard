import { Event } from '../types/network';
import { dbConfig } from '../config/dbConfig';
import { toast } from '@/hooks/use-toast';

interface AnomalyRecord {
  cell_id: number;
  band: string;
  anomaly_type: string;
  anomaly: string;
  source_id: string;
  creation_date: string;
}

interface ProcessedAnomaly {
  cellId: string;
  count: number;
  types: string[];
  latestAnomaly: string;
  latestDate: string;
}

let anomalyCache: Map<string, ProcessedAnomaly> | null = null;

export async function fetchAnomalies(): Promise<AnomalyRecord[]> {
  try {
    // Check for custom URL in localStorage first, then config, then default
    const customUrl = typeof window !== 'undefined' ? localStorage.getItem('custom-anomalies-url') : null;
    const url = customUrl || dbConfig.anomaliesJsonUrl || '/anomalies.json';
    
    console.log('Fetching anomalies from:', url);
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch anomalies: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching anomalies:', error);
    toast({
      title: "Anomalies Loading Error",
      description: "Failed to load anomalies from JSON file. Check console for details.",
      variant: "destructive",
    });
    return [];
  }
}

export async function processAnomalies(): Promise<Map<string, ProcessedAnomaly>> {
  if (anomalyCache) {
    return anomalyCache;
  }

  const anomalies = await fetchAnomalies();
  const processedMap = new Map<string, ProcessedAnomaly>();

  anomalies.forEach(anomaly => {
    const cellId = anomaly.cell_id.toString();
    
    if (processedMap.has(cellId)) {
      const existing = processedMap.get(cellId)!;
      existing.count++;
      if (!existing.types.includes(anomaly.anomaly_type)) {
        existing.types.push(anomaly.anomaly_type);
      }
      // Update if this anomaly is more recent
      if (new Date(anomaly.creation_date) > new Date(existing.latestDate)) {
        existing.latestAnomaly = anomaly.anomaly;
        existing.latestDate = anomaly.creation_date;
      }
    } else {
      processedMap.set(cellId, {
        cellId,
        count: 1,
        types: [anomaly.anomaly_type],
        latestAnomaly: anomaly.anomaly,
        latestDate: anomaly.creation_date
      });
    }
  });

  anomalyCache = processedMap;
  return processedMap;
}

export function hasAnomaly(cellId: string, anomalyMap: Map<string, ProcessedAnomaly>): boolean {
  return anomalyMap.has(cellId);
}

export function getAnomalyInfo(cellId: string, anomalyMap: Map<string, ProcessedAnomaly>): ProcessedAnomaly | null {
  return anomalyMap.get(cellId) || null;
}

// Convert anomaly records to events for LiveFeed
export function convertAnomaliesToEvents(anomalies: AnomalyRecord[]): Event[] {
  return anomalies.map(anomaly => ({
    type: "anomaly-detected" as const,
    timestamp: new Date(anomaly.creation_date),
    message: `${anomaly.anomaly_type}: ${anomaly.anomaly}`,
    towerId: anomaly.cell_id,
    cellId: anomaly.cell_id.toString(),
    // Add anomaly-specific data
    anomalyType: anomaly.anomaly_type,
    band: anomaly.band,
    sourceId: anomaly.source_id
  }));
}

// Clear cache when needed
export function clearAnomalyCache(): void {
  anomalyCache = null;
}