
import { Tower } from '../types/network';
import { dbConfig } from '../config/dbConfig';
import supabaseService from './supabaseService';
import { getMockCallRecords } from './mockDataService';

// Check if Supabase is configured
const isSupabaseEnabled = dbConfig.useSupabase && dbConfig.supabaseUrl && dbConfig.supabaseAnonKey;

// Always use mock data in browser environments unless Supabase is configured
const isBrowser = typeof window !== 'undefined';
const shouldUseMock = (isBrowser && !isSupabaseEnabled) || dbConfig.useMock;

// Get towers based on call clustering
export async function deriveTowersFromCalls(): Promise<Tower[]> {
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
        const status = dropRate > 10 ? "down" : "up"; // More than 10% drop rate means tower is down
        const downSince = status === "down" ? new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000) : undefined;
        
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
