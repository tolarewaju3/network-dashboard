
import { Tower } from '../types/network';
import { dbConfig } from '../config/dbConfig';
import supabaseService from './supabaseService';
import { getMockCallRecords } from './mockDataService';
import { toast } from '@/hooks/use-toast';

// Check if Supabase is configured
const isSupabaseEnabled = dbConfig.useSupabase && dbConfig.supabaseUrl && dbConfig.supabaseAnonKey;

// Always use mock data in browser environments unless Supabase is configured
const isBrowser = typeof window !== 'undefined';
const shouldUseMock = (isBrowser && !isSupabaseEnabled) || dbConfig.useMock;

// Load towers from JSON (local or remote)
async function loadTowersFromJson(): Promise<Tower[]> {
  try {
    // Check for custom URL in localStorage first, then config, then default
    const customUrl = typeof window !== 'undefined' ? localStorage.getItem('custom-json-url') : null;
    const url = customUrl || dbConfig.towersJsonUrl || '/towers.json';
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch towers JSON: ${res.status}`);
    const json = await res.json();
    const cells = Array.isArray(json) ? json : json.cells || [];
    return cells
      .map((c: any) => ({
        id: c.cell_id ?? c.id,
        name: c.name ?? `Cell ${c.cell_id ?? c.id}`,
        lat: Number(c.lat),
        lng: Number(c.lon ?? c.lng),
        status: (c.status === 'down' || c.max_capacity === 0) ? 'down' as const : 'up' as const,
        bands: c.bands || [],
        city: c.city,
        areaType: c.area_type,
        maxCapacity: c.max_capacity,
        adjacentCells: c.adjacent_cells || [],
      }))
      .filter((t: Tower) => Number.isFinite(t.lat) && Number.isFinite(t.lng));
  } catch (error) {
    console.error('Error loading towers from JSON:', error);
    toast({
      title: "JSON Loading Error",
      description: "Failed to load towers from JSON file. Check console for details.",
      variant: "destructive",
    });
    return [];
  }
}

// Get towers based on call clustering or JSON source
export async function deriveTowersFromCalls(): Promise<Tower[]> {
  // Check for localStorage override first
  const useJsonOverride = typeof window !== 'undefined' && localStorage.getItem('override-use-json') === 'true';
  const shouldUseJson = useJsonOverride || dbConfig.useTowersJson || dbConfig.towersJsonUrl;
  
  if (shouldUseJson) {
    console.log('Loading towers from JSON source');
    return await loadTowersFromJson();
  }
  if (shouldUseMock) {
    console.log('Using mock data for tower derivation');
    const records = getMockCallRecords(500);
    
    // Simple clustering algorithm - round coordinates to 2 decimal places
    const clusters: { [key: string]: { lat: number, lng: number, calls: number, dropped: number } } = {};
    
    records.forEach(record => {
      const lat = Math.round(record.location.lat * 100) / 100;
      const lng = Math.round(record.location.lng * 100) / 100;
      const key = `${lat},${lng}`;
      
      if (!clusters[key]) {
        clusters[key] = {
          lat,
          lng,
          calls: 0,
          dropped: 0
        };
      }
      
      clusters[key].calls++;
      if (record.isDropped) {
        clusters[key].dropped++;
      }
    });
    
    // Convert clusters to towers
    return Object.values(clusters)
      .filter(cluster => cluster.calls >= 5) // Only include locations with at least 5 calls
      .sort((a, b) => b.calls - a.calls) // Sort by number of calls
      .slice(0, 10) // Take top 10 clusters
      .map((cluster, index) => {
        // Calculate drop rate as a percentage
        const dropRate = cluster.calls > 0 ? (cluster.dropped / cluster.calls) * 100 : 0;
        const status = dropRate > 10 ? 'down' as const : 'up' as const; // More than 10% drop rate means tower is down
        const downSince = status === 'down' ? new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000) : undefined;
        
        return {
          id: index + 1,
          name: `Tower ${String.fromCharCode(65 + index)}`, // Tower A, B, C, etc.
          lat: cluster.lat,
          lng: cluster.lng,
          status,
          downSince,
          droppedCalls: cluster.dropped,
          dropRate: dropRate
        };
      });
  } else if (isSupabaseEnabled) {
    try {
      // Fetch from Supabase
      return await supabaseService.deriveTowersFromCalls();
    } catch (error) {
      console.error('Error deriving towers from Supabase data:', error);
      // Fallback to mock data
      return deriveTowersFromCalls();
    }
  } else {
    console.log('No database configured, using mock data');
    return deriveTowersFromCalls();
  }
}

// Get recovery time statistics (now returns seconds instead of minutes)
export async function getAvgRecoveryTime(): Promise<number> {
  if (shouldUseMock) {
    // For mock data, return a realistic average recovery time (in seconds)
    return (18 + Math.random() * 12) * 60; // Between 18 and 30 minutes converted to seconds
  } else if (isSupabaseEnabled) {
    try {
      // Fetch from Supabase (now returns seconds)
      return await supabaseService.getAvgRecoveryTime();
    } catch (error) {
      console.error('Error getting average recovery time from Supabase:', error);
      // Fallback to mock data (in seconds)
      return (18 + Math.random() * 12) * 60;
    }
  } else {
    console.log('No database configured, using mock data');
    return (18 + Math.random() * 12) * 60;
  }
}
