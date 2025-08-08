
// Database configuration file
interface DbConfig {
  useMock: boolean; // Flag to indicate if we're using mock data
  // Supabase configuration
  useSupabase: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
  // Towers JSON configuration
  useTowersJson: boolean;
  towersJsonUrl: string;
  towersJsonPollMs: number;
}

// Check if running in browser
const isBrowser = typeof window !== 'undefined';

// Default development configuration - update these values for your environment
const defaultConfig: DbConfig = {
  useMock: false, // Default to using mock data
  useSupabase: false, // Default to not using Supabase
  supabaseUrl: '',
  supabaseAnonKey: '',
  // Towers JSON defaults
  useTowersJson: true,
  towersJsonUrl: '',
  towersJsonPollMs: 15000,
};

// In Vite, environment variables are exposed through import.meta.env instead of process.env
export const dbConfig: DbConfig = {
  ...defaultConfig,
  // Override with environment variables if available
  // Always use mock data in browser environments unless Supabase is configured
  useMock:
    (isBrowser && !import.meta.env.VITE_SUPABASE_URL) ||
    (import.meta.env.VITE_USE_MOCK_DB !== 'false' && defaultConfig.useMock),
  // Supabase configuration
  useSupabase: Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || defaultConfig.supabaseUrl,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || defaultConfig.supabaseAnonKey,
  // Towers JSON configuration
  useTowersJson: Boolean(import.meta.env.VITE_TOWERS_JSON_URL || import.meta.env.VITE_USE_TOWERS_JSON === 'true'),
  towersJsonUrl: import.meta.env.VITE_TOWERS_JSON_URL || defaultConfig.towersJsonUrl,
  towersJsonPollMs: Number(import.meta.env.VITE_TOWERS_JSON_POLL_MS) || defaultConfig.towersJsonPollMs,
};

export default dbConfig;
