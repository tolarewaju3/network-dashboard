
import { fetchCallRecords, fetchRecentDroppedCalls, convertCallsToEvents } from './callService';
import { deriveTowersFromCalls, getAvgRecoveryTime } from './towerService';
import supabaseService from './supabaseService';
import { dbConfig } from '../config/dbConfig';

// Check if Supabase is configured
const isSupabaseEnabled = dbConfig.useSupabase && dbConfig.supabaseUrl && dbConfig.supabaseAnonKey;

// Always use mock data in browser environments unless Supabase is configured
const isBrowser = typeof window !== 'undefined';
const shouldUseMock = (isBrowser && !isSupabaseEnabled) || dbConfig.useMock;

// Add a test connection function to check if the database is available
export async function testDatabaseConnection(): Promise<boolean> {
  if (shouldUseMock) {
    console.log('Using mock data, database connection test skipped');
    return true; // Mock data is always available
  } else if (isSupabaseEnabled) {
    try {
      return await supabaseService.testConnection();
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
  } else {
    console.log('No database configured');
    return false;
  }
}

// Fetch remediation events
export async function fetchRemediationEvents(limit: number = 50) {
  if (shouldUseMock) {
    console.log('Using mock data for remediation events');
    return []; // Return empty array for mock
  } else if (isSupabaseEnabled) {
    try {
      return await supabaseService.fetchRemediationEvents(limit);
    } catch (error) {
      console.error('Error fetching remediation events:', error);
      return [];
    }
  } else {
    console.log('No database configured for remediation events');
    return [];
  }
}

// Re-export all the functions from our service modules
export {
  fetchCallRecords,
  fetchRecentDroppedCalls,
  deriveTowersFromCalls,
  convertCallsToEvents,
  getAvgRecoveryTime
};

// Export Supabase subscription function
export const { subscribeToCallRecords } = supabaseService;
