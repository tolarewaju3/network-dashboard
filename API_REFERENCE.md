# API Reference

This document provides comprehensive API documentation for the Network Dashboard, including data interfaces, service APIs, hooks, and configuration options.

## 📋 Table of Contents

- [Data Types](#-data-types)
- [Service APIs](#-service-apis)
- [Custom Hooks](#-custom-hooks)
- [Configuration](#-configuration)
- [Error Handling](#-error-handling)
- [Data Flow](#-data-flow)

## 📊 Data Types

### Core Network Types

#### Tower Interface
Represents a cellular network tower with its properties and status.

```typescript
interface Tower {
  id: number;                    // Unique tower identifier
  name: string;                  // Human-readable tower name
  lat: number;                   // Latitude coordinate
  lng: number;                   // Longitude coordinate
  status: TowerStatus;           // Current operational status
  downSince?: Date;             // Timestamp when tower went offline
  droppedCalls?: number;        // Total number of dropped calls
  dropRate?: number;            // Drop rate percentage
  bands?: string[];             // Supported frequency bands
  city?: string;                // City location
  areaType?: string;            // Area classification
  maxCapacity?: number;         // Maximum call capacity
  adjacentCells?: number[];     // Connected neighboring cells
}

type TowerStatus = "up" | "down";
```

#### Event Interface
Represents network events for real-time monitoring.

```typescript
interface Event {
  type: EventType;              // Event classification
  timestamp: Date;              // When the event occurred
  message: string;              // Human-readable description
  towerId: number;              // Associated tower ID
  cellId?: string;              // Associated cell ID
  recoveryTime?: number;        // Recovery time in minutes
  location?: {                  // Geographic location
    lat: number;
    lng: number;
  };
  signalStrength?: number;      // Signal strength in dBm
  anomalyType?: string;         // Type of detected anomaly
  band?: string;                // Frequency band
  sourceId?: string;            // Source system identifier
  recommendedFix?: string;      // Suggested remediation
}

type EventType = 
  | "call-placed" 
  | "call-dropped" 
  | "tower-up" 
  | "tower-down" 
  | "alert-triggered" 
  | "alert-resolved"
  | "remediation-started"
  | "remediation-completed"
  | "anomaly-detected";
```

#### Call Record Interface
Represents individual call records for analysis.

```typescript
interface CallRecord {
  timestamp: Date;              // Call timestamp
  location: {                   // Call location
    lat: number;
    lng: number;
  };
  signalStrength: number;       // Signal strength in dBm
  isDropped: boolean;           // Whether call was dropped
  cellId?: string;              // Associated cell ID
}
```

#### Anomaly Interface
Represents detected network anomalies.

```typescript
interface AnomalyRecord {
  cell_id: number;              // Affected cell ID
  band: string;                 // Frequency band
  anomaly_type: string;         // Classification of anomaly
  anomaly: string;              // Detailed anomaly description
  source_id: string;            // Detection source identifier
  creation_date: string;        // ISO timestamp
  recommended_fix?: string;     // Suggested resolution
}

interface ProcessedAnomaly {
  cellId: string;               // Cell identifier
  count: number;                // Number of anomalies
  types: string[];              // Unique anomaly types
  latestAnomaly: string;        // Most recent anomaly description
  latestDate: string;           // Most recent anomaly timestamp
}
```

### Helper Types

#### Tower Activity
Tracks tower performance metrics.

```typescript
interface TowerActivity {
  totalCalls: number;           // Total processed calls
  droppedCalls: number;         // Number of dropped calls
  lastActivity: Date;           // Last recorded activity
}
```

#### Chat Message
Represents chat interface messages.

```typescript
interface ChatMessage {
  id: string;                   // Unique message identifier
  type: 'user' | 'assistant';   // Message sender type
  content: string;              // Message content
  timestamp: Date;              // Message timestamp
}
```

## 🔧 Service APIs

### Anomaly Service

#### `fetchAnomalies(): Promise<AnomalyFetchResult>`
Fetches anomaly data from configured sources with fallback mechanism.

```typescript
interface AnomalyFetchResult {
  anomalies: AnomalyRecord[];   // Raw anomaly data
  isUsingFallback: boolean;     // Whether fallback was used
  dataSource: string;           // Actual data source URL
}

// Usage
const result = await fetchAnomalies();
if (result.isUsingFallback) {
  console.warn('Using fallback data source');
}
```

#### `processAnomalies(): Promise<Map<string, ProcessedAnomaly>>`
Processes raw anomaly data into aggregated format for efficient lookup.

```typescript
const anomalyMap = await processAnomalies();
const cellAnomaly = anomalyMap.get('123'); // Get anomalies for cell 123
```

#### `hasAnomaly(cellId: string, anomalyMap: Map<string, ProcessedAnomaly>): boolean`
Checks if a specific cell has any detected anomalies.

```typescript
const hasIssues = hasAnomaly('123', anomalyMap);
```

#### `getAnomalyInfo(cellId: string, anomalyMap: Map<string, ProcessedAnomaly>): ProcessedAnomaly | null`
Retrieves detailed anomaly information for a specific cell.

```typescript
const info = getAnomalyInfo('123', anomalyMap);
if (info) {
  console.log(`Cell has ${info.count} anomalies of types: ${info.types.join(', ')}`);
}
```

#### `convertAnomaliesToEvents(anomalies: AnomalyRecord[]): Event[]`
Converts anomaly records to event format for live feed display.

```typescript
const events = convertAnomaliesToEvents(rawAnomalies);
```

### Tower Service

#### `generateTowerData(): Tower[]`
Generates or fetches tower configuration data.

```typescript
const towers = generateTowerData();
```

#### `calculateTowerMetrics(towers: Tower[], callRecords: CallRecord[]): Tower[]`
Updates tower objects with calculated performance metrics.

```typescript
const updatedTowers = calculateTowerMetrics(towers, callRecords);
```

### Call Service

#### `generateCallRecords(count: number): CallRecord[]`
Generates realistic call records for testing and demonstration.

```typescript
const callRecords = generateCallRecords(100);
```

#### `calculateDropRate(callRecords: CallRecord[]): number`
Calculates overall network drop rate percentage.

```typescript
const dropRate = calculateDropRate(callRecords);
```

## 🎣 Custom Hooks

### useAnomalies
Manages anomaly data fetching and processing.

```typescript
const {
  anomalies,        // Map<string, ProcessedAnomaly>
  isLoading,        // boolean
  isError,          // boolean
  error,            // Error | null
  refetch           // () => void
} = useAnomalies();

// Usage in components
if (hasAnomaly(towerId.toString(), anomalies)) {
  const info = getAnomalyInfo(towerId.toString(), anomalies);
  // Display anomaly information
}
```

### useCallRecords
Manages tower data and call records.

```typescript
const {
  towers,           // Tower[]
  callEvents,       // Event[]
  avgRecoveryTime,  // number
  isLoading,        // boolean
  isError,          // boolean
  error             // Error | null
} = useCallRecords();

// Access tower information
towers.forEach(tower => {
  console.log(`${tower.name}: ${tower.status} (${tower.dropRate}% drop rate)`);
});
```

### useAnomalyEvents
Converts anomaly data to event format.

```typescript
const {
  events,           // Event[]
  isLoading,        // boolean
  isError           // boolean
} = useAnomalyEvents();

// Events ready for LiveFeed component
<LiveFeed events={events} />
```

### useRemediationEvents
Generates remediation workflow events.

```typescript
const {
  events,           // Event[]
  isLoading,        // boolean
  isError           // boolean
} = useRemediationEvents();
```

### useChatAPI
Manages chat interface state and interactions.

```typescript
const {
  messages,         // ChatMessage[]
  isLoading,        // boolean
  sendMessage,      // (message: string) => Promise<void>
  clearHistory      // () => void
} = useChatAPI();

// Send a message
await sendMessage("What's the status of tower 101?");

// Clear chat history
clearHistory();
```

### useToast
Provides application-wide toast notification system.

```typescript
const { toast } = useToast();

// Show success message
toast({
  title: "Success",
  description: "Data loaded successfully",
  variant: "default"
});

// Show error message
toast({
  title: "Error",
  description: "Failed to load data",
  variant: "destructive"
});
```

## ⚙️ Configuration

### Database Configuration
Located in `src/config/dbConfig.ts`

```typescript
interface DbConfig {
  useMock: boolean;                    // Use mock data instead of real sources
  anomaliesJsonUrl?: string;           // Remote anomalies endpoint
  refreshInterval: number;             // Data refresh interval (ms)
  maxRetries: number;                  // Maximum retry attempts
}

// Default configuration
export const dbConfig: DbConfig = {
  useMock: false,
  anomaliesJsonUrl: process.env.VITE_ANOMALIES_URL,
  refreshInterval: 30000,
  maxRetries: 3
};
```

### Environment Variables
Configure these environment variables for custom behavior:

```bash
# Mapbox configuration
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here

# Data source configuration
VITE_ANOMALIES_URL=https://api.example.com/anomalies
VITE_API_BASE_URL=https://api.example.com

# Application configuration
VITE_REFRESH_INTERVAL=30000
VITE_MAX_RETRIES=3
```

### React Query Configuration
Global React Query settings for data management:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      cacheTime: 10 * 60 * 1000,     // 10 minutes
      retry: 3,                       // Retry failed requests 3 times
      refetchOnWindowFocus: true,     // Refetch on window focus
    },
  },
});
```

## 🚨 Error Handling

### Error Types
The application defines several error types for consistent error handling:

```typescript
interface NetworkError extends Error {
  code: string;
  status?: number;
  source: 'network' | 'data' | 'service';
}

interface DataValidationError extends Error {
  field: string;
  value: any;
  expectedType: string;
}
```

### Error Boundaries
Components are wrapped in error boundaries to prevent application crashes:

```typescript
// Usage in components
if (isError) {
  return <ErrorFallback error={error} resetErrorBoundary={refetch} />;
}
```

### Toast Notifications
Errors are communicated to users through toast notifications:

```typescript
// In service layer
catch (error) {
  toast({
    title: "Data Loading Error",
    description: error.message,
    variant: "destructive"
  });
  throw error;
}
```

## 🔄 Data Flow

### Data Fetching Pattern
All data follows a consistent fetching pattern:

1. **Primary Source**: Attempt to fetch from configured primary source
2. **Fallback**: If primary fails, attempt fallback source
3. **Error Handling**: Show user-friendly error messages
4. **Caching**: Cache successful responses to reduce API calls
5. **Background Refresh**: Periodically refresh cached data

### Real-time Updates
Data updates follow a polling-based approach:

```typescript
// Hook implementation pattern
useEffect(() => {
  const interval = setInterval(() => {
    refetch();
  }, dbConfig.refreshInterval);

  return () => clearInterval(interval);
}, [refetch]);
```

### State Management Flow
```
Component → Hook → Service → Data Source
    ↑         ↑        ↑         ↓
    └─────────┴────────┴─── Response
```

## 📝 Usage Examples

### Complete Tower Status Check
```typescript
function TowerStatusChecker({ towerId }: { towerId: number }) {
  const { towers, isLoading } = useCallRecords();
  const { anomalies } = useAnomalies();
  const { toast } = useToast();

  const tower = towers.find(t => t.id === towerId);
  const hasAnomalies = tower && hasAnomaly(tower.id.toString(), anomalies);

  useEffect(() => {
    if (tower && hasAnomalies) {
      const anomalyInfo = getAnomalyInfo(tower.id.toString(), anomalies);
      toast({
        title: `Tower ${tower.name} Alert`,
        description: `${anomalyInfo?.count} anomalies detected`,
        variant: "destructive"
      });
    }
  }, [tower, hasAnomalies]);

  if (isLoading) return <div>Loading...</div>;
  if (!tower) return <div>Tower not found</div>;

  return (
    <div>
      <h3>{tower.name}</h3>
      <p>Status: {tower.status}</p>
      <p>Drop Rate: {tower.dropRate}%</p>
      {hasAnomalies && <p>⚠️ Anomalies detected</p>}
    </div>
  );
}
```

### Event Processing
```typescript
function EventProcessor() {
  const { events: callEvents } = useCallRecords();
  const { events: anomalyEvents } = useAnomalyEvents();
  const { events: remediationEvents } = useRemediationEvents();

  const allEvents = useMemo(() => {
    return [...callEvents, ...anomalyEvents, ...remediationEvents]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50); // Show latest 50 events
  }, [callEvents, anomalyEvents, remediationEvents]);

  return <LiveFeed events={allEvents} />;
}
```

This API reference provides the complete interface for interacting with the Network Dashboard's data and functionality. All types are fully typed with TypeScript for enhanced developer experience and compile-time safety.
