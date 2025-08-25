// Database configuration file
interface DbConfig {
  useMock: boolean; // Flag to indicate if we're using mock data
  // Towers JSON configuration
  useTowersJson: boolean;
  towersJsonUrl: string;
  towersJsonPollMs: number;
}

// Check if running in browser
const isBrowser = typeof window !== 'undefined';

// Default development configuration - update these values for your environment
const defaultConfig: DbConfig = {
  useMock: true, // Always use mock data now
  // Towers JSON defaults
  useTowersJson: true,
  towersJsonUrl: '',
  towersJsonPollMs: 15000,
};

// In Vite, environment variables are exposed through import.meta.env instead of process.env
export const dbConfig: DbConfig = {
  ...defaultConfig,
  // Override with environment variables if available
  useMock: import.meta.env.VITE_USE_MOCK_DB !== 'false',
  // Towers JSON configuration
  useTowersJson: Boolean(import.meta.env.VITE_TOWERS_JSON_URL || import.meta.env.VITE_USE_TOWERS_JSON === 'true'),
  towersJsonUrl: import.meta.env.VITE_TOWERS_JSON_URL || defaultConfig.towersJsonUrl,
  towersJsonPollMs: Number(import.meta.env.VITE_TOWERS_JSON_POLL_MS) || defaultConfig.towersJsonPollMs,
};

export default dbConfig;