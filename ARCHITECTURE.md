# System Architecture

This document provides a detailed overview of the Network Dashboard's architecture, component interactions, and design decisions.

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Network Dashboard                         │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript)                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌────────────────┐ │
│  │   Components    │ │     Hooks       │ │    Services    │ │
│  │   ├─MapView     │ │  ├─useAnomalies │ │ ├─anomalyService│ │
│  │   ├─LiveFeed    │ │  ├─useCallRecords│ │ ├─callService  │ │
│  │   ├─RanChatBox  │ │  ├─useChatAPI   │ │ ├─towerService │ │
│  │   └─StatusHeader│ │  └─use-toast    │ │ └─dbService    │ │
│  └─────────────────┘ └─────────────────┘ └────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌────────────────┐ │
│  │  Local JSON     │ │  External APIs  │ │  Mock Data     │ │
│  │  ├─towers.json  │ │  ├─Anomalies API│ │ ├─Generated    │ │
│  │  └─anomalies.json│ │  └─Tower Data  │ │ └─Realistic    │ │
│  └─────────────────┘ └─────────────────┘ └────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Component Architecture

### Component Hierarchy

```
App
├── ThemeProvider
├── QueryClientProvider
├── TooltipProvider
├── BrowserRouter
└── Routes
    ├── Index (Main Dashboard)
    │   ├── StatusHeader
    │   ├── MapView
    │   ├── LiveFeed
    │   │   └── EventDetailsDialog
    │   └── RanChatBox
    │       └── ChatMessage
    └── NotFound
```

### Component Responsibilities

#### **App.tsx** - Root Application
- Provides global contexts (Theme, Query, Tooltip)
- Sets up routing with React Router
- Manages global toast notifications

#### **Index.tsx** - Main Dashboard Page
- Orchestrates all major components
- Manages shared state between components
- Handles global loading and error states
- Combines data from multiple hooks

#### **MapView.tsx** - Interactive Map Component
- Renders Mapbox GL JS map with tower markers
- Manages map state and interactions
- Handles theme-aware styling
- Shows tower popups with detailed information
- Integrates anomaly data with visual indicators

#### **LiveFeed.tsx** - Real-time Event Stream
- Displays chronologically sorted network events
- Provides event filtering capabilities
- Handles event detail modal triggers
- Manages scrollable container with custom styling

#### **RanChatBox.tsx** - AI Chat Interface
- Collapsible chat interface
- Manages chat history and state
- Provides sample queries for user guidance
- Handles message sending and response display

#### **StatusHeader.tsx** - Network Overview
- Displays key performance indicators (KPIs)
- Shows tower status summary
- Provides theme toggle functionality
- Presents high-level network health metrics

## 🔄 Data Flow Architecture

### Data Fetching Strategy

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components    │───▶│  Custom Hooks   │───▶│    Services     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       │
         │                       │                       ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         └──────────────│  React Query    │    │  Data Sources   │
                        └─────────────────┘    └─────────────────┘
```

### Hook Architecture

#### **useAnomalies**
- Fetches and processes anomaly data
- Implements caching with Map data structure
- Handles fallback between remote and local sources
- Provides processed anomaly information

#### **useCallRecords**
- Manages tower data and call event generation
- Calculates performance metrics (drop rates, recovery times)
- Generates realistic mock data when needed
- Combines multiple data sources into cohesive state

#### **useAnomalyEvents**
- Converts anomaly records into event format
- Handles timestamp processing and validation
- Filters and formats events for LiveFeed consumption

#### **useRemediationEvents**
- Generates remediation workflow events
- Simulates network repair and maintenance activities
- Provides realistic recovery scenarios

#### **useChatAPI**
- Manages chat message history
- Implements mock AI responses with realistic delays
- Handles message state and loading indicators
- Provides chat history management

### State Management Strategy

#### **React Query (TanStack Query)**
- Server state management and caching
- Automatic background refetching
- Error boundary integration
- Request deduplication and optimization

#### **Local State (useState/useReducer)**
- Component-specific UI state
- Form inputs and user interactions
- Modal and dialog state management
- Theme and preferences

#### **Context API**
- Theme provider for dark/light mode
- Toast notification system
- Global UI component contexts (Tooltip, Dialog)

## 🔧 Service Layer Architecture

### Service Pattern
Each service follows a consistent pattern:
1. **Data Fetching**: Primary and fallback data sources
2. **Error Handling**: Graceful degradation and user notification
3. **Caching**: Intelligent caching strategies to reduce API calls
4. **Processing**: Data transformation and normalization
5. **Type Safety**: Full TypeScript integration

#### **anomalyService.ts**
```typescript
// Service responsibilities:
- fetchAnomalies(): Promise<AnomalyFetchResult>
- processAnomalies(): Promise<Map<string, ProcessedAnomaly>>
- convertAnomaliesToEvents(): Event[]
- hasAnomaly() / getAnomalyInfo() - utility functions
- Cache management and invalidation
```

#### **callService.ts**
```typescript
// Service responsibilities:
- generateCallRecords(): CallRecord[]
- calculateTowerActivity(): TowerActivity
- simulateNetworkTraffic() - realistic call patterns
- processCallEvents() - event generation
```

#### **towerService.ts**
```typescript
// Service responsibilities:
- fetchTowerData(): Promise<Tower[]>
- processTowerStatus() - status calculations
- updateTowerMetrics() - performance indicators
- generateTowerEvents() - status change events
```

## 🎨 UI/UX Architecture

### Design System Structure

#### **Theme Architecture**
```
Theme System
├── CSS Variables (Tailwind config)
├── Color Schemes (Light/Dark variants)
├── Component Variants (CVA - Class Variance Authority)
└── Global Styles (Glass effects, animations)
```

#### **Component Composition**
- **Base Components**: shadcn/ui foundation
- **Composite Components**: Application-specific combinations
- **Layout Components**: Structure and positioning
- **Interactive Components**: User input and feedback

#### **Styling Strategy**
- **Tailwind CSS**: Utility-first CSS framework
- **CSS-in-JS**: Minimal inline styles for dynamic values
- **Custom CSS**: Glass morphism and complex animations
- **Responsive Design**: Mobile-first approach with breakpoints

### Accessibility Architecture
- **ARIA Labels**: Comprehensive screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG compliance for all themes
- **Focus Management**: Proper focus handling for modals/dialogs

## 🔐 Security Architecture

### Client-Side Security
- **Input Validation**: All user inputs validated and sanitized
- **XSS Prevention**: React's built-in XSS protection + manual validation
- **Content Security Policy**: Configured in Nginx for production
- **Secure Headers**: HTTPS enforcement and security headers

### Data Security
- **API Token Management**: Secure token handling for Mapbox
- **Local Storage**: Minimal sensitive data storage
- **Data Validation**: All external data validated before processing
- **Error Boundaries**: Prevent information leakage in error states

## 🚀 Performance Architecture

### Optimization Strategies

#### **Bundle Optimization**
- **Code Splitting**: Route-based and component-based splitting
- **Tree Shaking**: Elimination of unused code
- **Dynamic Imports**: Lazy loading of non-critical components
- **Asset Optimization**: Image and font optimization

#### **Runtime Optimization**
- **React.memo**: Selective component memoization
- **useMemo/useCallback**: Expensive computation caching
- **Virtual Scrolling**: For large data sets (future enhancement)
- **Intersection Observer**: Lazy loading and visibility detection

#### **Caching Strategy**
- **Service Worker**: Future PWA implementation
- **Browser Caching**: Appropriate cache headers
- **Memory Caching**: In-memory data caching with invalidation
- **Query Caching**: React Query intelligent caching

### Monitoring and Metrics
- **Performance Metrics**: Core Web Vitals monitoring
- **Error Tracking**: Comprehensive error boundaries
- **Usage Analytics**: User interaction tracking (future)
- **Real User Monitoring**: Performance in production environments

## 🐳 Deployment Architecture

### Container Strategy
```
Multi-Stage Docker Build
├── Stage 1: Node.js Builder
│   ├── Dependency Installation
│   ├── TypeScript Compilation
│   └── Production Build
├── Stage 2: Nginx Runtime
│   ├── Static File Serving
│   ├── SPA Routing Configuration
│   └── Security Headers
```

### Production Configuration
- **Nginx**: Optimized for SPA serving with gzip compression
- **Security**: Non-root user, minimal attack surface
- **Performance**: Efficient static file serving with proper caching
- **Health Checks**: Container health monitoring endpoints

## 🔄 Development Workflow

### Build Process
1. **Type Checking**: TypeScript compilation and validation
2. **Linting**: ESLint code quality checks
3. **Testing**: Component and integration testing
4. **Building**: Vite production optimization
5. **Containerization**: Docker image creation

### Development Tools
- **Hot Module Replacement**: Vite fast refresh
- **DevTools**: React DevTools and browser debugging
- **Type Safety**: Strict TypeScript configuration
- **Code Quality**: ESLint + Prettier integration

## 📊 Scalability Considerations

### Current Limitations
- **Data Volume**: In-memory processing suitable for moderate data sets
- **Real-time Updates**: Polling-based, not WebSocket-based
- **State Management**: Client-side only, no server state persistence

### Future Enhancements
- **WebSocket Integration**: Real-time bidirectional communication
- **Server-Side Rendering**: Next.js migration for better performance
- **Progressive Web App**: Offline capability and improved performance
- **Micro-frontend Architecture**: Component federation for larger teams

## 🧪 Testing Architecture

### Testing Strategy
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: Component interaction testing
- **E2E Tests**: Full user journey testing
- **Visual Regression**: UI consistency validation

### Test Structure (Future Implementation)
```
tests/
├── unit/
│   ├── components/
│   ├── hooks/
│   └── services/
├── integration/
│   ├── data-flow/
│   └── component-interactions/
└── e2e/
    ├── user-journeys/
    └── accessibility/
```

This architecture provides a solid foundation for the current requirements while maintaining flexibility for future enhancements and scaling needs.
