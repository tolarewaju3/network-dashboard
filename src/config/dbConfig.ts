
// Database configuration file
interface DbConfig {
  useMock: boolean; // Flag to indicate if we're using mock data
  // Supabase configuration
  useSupabase: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

// Check if running in browser
const isBrowser = typeof window !== 'undefined';

// Default development configuration - update these values for your environment
const defaultConfig: DbConfig = {
  useMock: false, // Default to using mock data
  useSupabase: false, // Default to not using Supabase
  supabaseUrl: '',
  supabaseAnonKey: ''
};

// In Vite, environment variables are exposed through import.meta.env instead of process.env
export const dbConfig: DbConfig = {
  ...defaultConfig,
  // Override with environment variables if available
  // Always use mock data in browser environments unless Supabase is configured
  useMock: (isBrowser && !import.meta.env.VITE_SUPABASE_URL) || (import.meta.env.VITE_USE_MOCK_DB !== 'false' && defaultConfig.useMock),
  // Supabase configuration
  useSupabase: Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || defaultConfig.supabaseUrl,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || defaultConfig.supabaseAnonKey
};

export default dbConfig;
