
import { CallRecord, Event } from '../types/network';
import { dbConfig } from '../config/dbConfig';
import supabaseService from './supabaseService';
import { getMockCallRecords } from './mockDataService';

// Check if Supabase is configured
const isSupabaseEnabled = dbConfig.useSupabase && dbConfig.supabaseUrl && dbConfig.supabaseAnonKey;

// Always use mock data in browser environments unless Supabase is configured
const isBrowser = typeof window !== 'undefined';
const shouldUseMock = (isBrowser && !isSupabaseEnabled) || dbConfig.useMock;

// Function to fetch call records
export async function fetchCallRecords(limit: number = 100): Promise<CallRecord[]> {
  if (shouldUseMock) {
    console.log('Using mock data for call records');
    const mockRecords = getMockCallRecords(500);
    return mockRecords.slice(0, limit);
  } else if (isSupabaseEnabled) {
    try {
      // Fetch from Supabase
      return await supabaseService.fetchCallRecords(limit);
    } catch (error) {
      console.error('Error fetching call records from Supabase:', error);
      // Fallback to mock data
      console.log('Falling back to mock data');
      const mockRecords = getMockCallRecords(500);
      return mockRecords.slice(0, limit);
    }
  } else {
    console.log('No database configured, using mock data');
    const mockRecords = getMockCallRecords(500);
    return mockRecords.slice(0, limit);
  }
}

// Function to fetch recent dropped calls
export async function fetchRecentDroppedCalls(minutes: number = 30): Promise<CallRecord[]> {
  if (shouldUseMock) {
    const records = getMockCallRecords(500);
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    
    return records.filter(record => 
      record.isDropped && record.timestamp > cutoffTime
    );
  } else if (isSupabaseEnabled) {
    try {
      // Fetch from Supabase
      return await supabaseService.fetchRecentDroppedCalls(minutes);
    } catch (error) {
      console.error('Error fetching recent dropped calls from Supabase:', error);
      // Fallback to mock data
      const records = getMockCallRecords(500);
      const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
      
      return records.filter(record => 
        record.isDropped && record.timestamp > cutoffTime
      );
    }
  } else {
    console.log('No database configured, using mock data');
    const records = getMockCallRecords(500);
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    
    return records.filter(record => 
      record.isDropped && record.timestamp > cutoffTime
    );
  }
}

// Convert call records to events for the LiveFeed
export function convertCallsToEvents(calls: CallRecord[]): Event[] {
  return calls.map((call) => {
    // Use cellId if available, otherwise fall back to a generated tower ID
    const cellId = call.cellId || `CELL_${Math.floor(Math.random() * 5) + 1}`;
    const towerId = Math.floor(Math.random() * 5) + 1; // Keep for backward compatibility
    
    // Ensure timestamp is a proper Date object
    const timestamp = call.timestamp instanceof Date ? call.timestamp : new Date(call.timestamp);
    
    return {
      type: call.isDropped ? "call-dropped" : "call-placed",
      timestamp: timestamp,
      message: "", // Empty message for both call types - we'll display details separately
      towerId,
      cellId,
      location: call.location,
      signalStrength: call.signalStrength
    };
  });
}
