
import { CallRecord, Tower } from '../types/network';

// Mock data generator for call records (simulating database data)
export const generateMockCallRecords = (count: number = 100): CallRecord[] => {
  const records: CallRecord[] = [];
  
  // Generate records for the past 24 hours
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  for (let i = 0; i < count; i++) {
    // Random time in the last 24 hours
    const timestamp = new Date(
      dayAgo.getTime() + Math.random() * (now.getTime() - dayAgo.getTime())
    );
    
    // Random location focusing on continental US
    const lat = 37 + (Math.random() * 10) - 5;
    const lng = -100 + (Math.random() * 30) - 15;
    
    // Random signal strength (0-100)
    const signalStrength = Math.floor(Math.random() * 101);
    
    // 15% chance of dropped call
    const isDropped = Math.random() < 0.15;
    
    // Generate a cell ID (simulate tower naming)
    const cellIds = ['CELL_A', 'CELL_B', 'CELL_C', 'CELL_D', 'CELL_E'];
    const cellId = cellIds[Math.floor(Math.random() * cellIds.length)];

    records.push({
      timestamp,
      location: { lat, lng },
      signalStrength,
      isDropped,
      cellId
    });
  }
  
  // Sort by timestamp (newest first)
  return records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Cache for mock records to maintain consistency between calls
let mockCallRecordsCache: CallRecord[] | null = null;

// Function to get mock call records (with caching)
export const getMockCallRecords = (count: number = 500): CallRecord[] => {
  if (!mockCallRecordsCache) {
    mockCallRecordsCache = generateMockCallRecords(count);
  }
  return mockCallRecordsCache;
};
