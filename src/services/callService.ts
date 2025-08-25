import { CallRecord, Event } from '../types/network';
import { dbConfig } from '../config/dbConfig';
import { getMockCallRecords } from './mockDataService';

// Always use mock data now
const shouldUseMock = true;

// Function to fetch call records
export async function fetchCallRecords(limit: number = 100): Promise<CallRecord[]> {
  console.log('Using mock data for call records');
  const mockRecords = getMockCallRecords(500);
  return mockRecords.slice(0, limit);
}

// Function to fetch recent dropped calls
export async function fetchRecentDroppedCalls(minutes: number = 30): Promise<CallRecord[]> {
  const records = getMockCallRecords(500);
  const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
  
  return records.filter(record => 
    record.isDropped && record.timestamp > cutoffTime
  );
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