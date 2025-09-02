# Network Dashboard

A comprehensive real-time network monitoring dashboard for cellular tower networks, featuring interactive maps, live event feeds, anomaly detection, and AI-powered insights.

## 🌟 Features

### 📡 Interactive Network Map
- **Real-time Tower Visualization**: Interactive map displaying cell tower locations with status indicators
- **Multi-status Support**: Visual indicators for tower status (online/offline), anomalies, and performance metrics
- **Detailed Tower Information**: Click on any tower to view comprehensive details including:
  - Frequency bands supported
  - Signal strength and capacity
  - Drop rates and performance metrics
  - Adjacent cell information
  - Anomaly alerts and recommendations

### 📊 Live Event Monitoring
- **Real-time Event Feed**: Live stream of network events including:
  - Call placement and dropped calls
  - Tower status changes (up/down)
  - Alert triggers and resolutions
  - Remediation activities
  - Anomaly detections
- **Event Filtering**: Filter events by specific cells or view all network activity
- **Event Details**: Click any event for detailed information and context

### 🤖 RAN AI Chat Interface
- **Network Intelligence**: AI-powered chat interface for network insights and predictions
- **Usage Predictions**: Query future usage patterns and capacity planning
- **Performance Analytics**: Get insights on tower performance and optimization recommendations
- **Sample Queries**: Pre-built queries for common network analysis tasks

### 🚨 Anomaly Detection
- **Real-time Anomaly Monitoring**: Automatic detection and alerts for network anomalies
- **Multi-source Data**: Support for both local JSON files and remote data sources
- **Anomaly Classification**: Categorized anomaly types with recommended fixes
- **Visual Indicators**: Map markers and feed items highlight anomalies with severity levels

### 🎨 Modern UI/UX
- **Dark/Light Theme**: Automatic theme switching with system preference support
- **Responsive Design**: Full mobile and desktop compatibility
- **Glass Morphism**: Modern glass effect styling with smooth animations
- **Accessibility**: Full keyboard navigation and screen reader support

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: React Router v6
- **Mapping**: Mapbox GL JS for interactive maps
- **Themes**: Next.js themes for dark/light mode
- **Data Fetching**: Native fetch API with fallback mechanisms
- **Containerization**: Docker with Nginx for production deployment

### Project Structure
```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui base components
│   ├── MapView.tsx     # Interactive map component
│   ├── LiveFeed.tsx    # Real-time event feed
│   ├── RanChatBox.tsx  # AI chat interface
│   ├── StatusHeader.tsx # Network status overview
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useAnomalies.ts    # Anomaly data management
│   ├── useCallRecords.ts  # Call records and tower data
│   ├── useChatAPI.ts      # Chat interface logic
│   └── ...
├── services/           # Data services and APIs
│   ├── anomalyService.ts  # Anomaly detection logic
│   ├── callService.ts     # Call record processing
│   ├── towerService.ts    # Tower data management
│   └── ...
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── pages/              # Route components
```

### Data Flow
1. **Data Sources**: Multiple data sources including JSON files and external APIs
2. **Service Layer**: Dedicated services handle data fetching, processing, and caching
3. **Custom Hooks**: React hooks manage component state and data subscriptions
4. **Component Layer**: React components consume data through hooks
5. **UI Updates**: Real-time updates through polling and state management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- (Optional) Docker for containerized deployment
- (Optional) Mapbox account for enhanced map features

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-git-url>
   cd network-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - The application uses a Mapbox token for map functionality
   - Update the token in `src/pages/Index.tsx` or set up environment variables
   - Configure data source URLs in `src/config/dbConfig.ts` if needed

4. **Start development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:8080`

### Development Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint code analysis

## 🐳 Docker Deployment

### Build and Run with Docker
```bash
# Build the Docker image
docker build -t network-dashboard .

# Run the container
docker run -p 8080:8080 network-dashboard
```

### Docker Configuration
- **Base Images**: Multi-stage build using Node.js 18 and Nginx Alpine
- **Security**: Runs as non-root user (UID 1001)
- **Port**: Exposes port 8080
- **Nginx**: Custom configuration for SPA routing and performance

## ⚙️ Configuration

### Data Sources
The application supports multiple data source configurations:

**Tower Data**: Configured in `src/services/towerService.ts`
- Local JSON files in `public/` directory
- External API endpoints
- Mock data generation for development

**Anomaly Data**: Configured in `src/services/anomalyService.ts`
- Primary URL from environment or configuration
- Fallback to local `public/anomalies.json`
- Custom URL support via localStorage

**Database Configuration**: `src/config/dbConfig.ts`
- Toggle between mock and real data sources
- Configure API endpoints and data refresh intervals

### Environment Variables
Set these environment variables for custom configurations:
- `VITE_MAPBOX_TOKEN` - Mapbox access token
- `VITE_ANOMALIES_URL` - Custom anomalies data source URL
- `VITE_API_BASE_URL` - Base URL for API endpoints

### Theme Configuration
- **Automatic**: Respects system dark/light preference
- **Manual**: Theme toggle available in the UI
- **Customization**: Modify theme colors in `tailwind.config.ts`

## 🔧 API Reference

### Data Types

**Tower Interface**
```typescript
interface Tower {
  id: number;
  name: string;
  lat: number;
  lng: number;
  status: "up" | "down";
  downSince?: Date;
  droppedCalls?: number;
  dropRate?: number;
  bands?: string[];
  city?: string;
  areaType?: string;
  maxCapacity?: number;
  adjacentCells?: number[];
}
```

**Event Interface**
```typescript
interface Event {
  type: EventType;
  timestamp: Date;
  message: string;
  towerId: number;
  cellId?: string;
  recoveryTime?: number;
  location?: { lat: number; lng: number };
  signalStrength?: number;
  anomalyType?: string;
  band?: string;
  sourceId?: string;
  recommendedFix?: string;
}
```

### Custom Hooks

**useAnomalies()**
```typescript
const { anomalies, isLoading, isError } = useAnomalies();
```
Returns: Processed anomaly data with caching and error handling

**useCallRecords()**
```typescript
const { towers, callEvents, avgRecoveryTime, isLoading, isError } = useCallRecords();
```
Returns: Tower data, call events, and performance metrics

**useChatAPI()**
```typescript
const { messages, isLoading, sendMessage, clearHistory } = useChatAPI();
```
Returns: Chat interface state and functions

## 🎨 Styling and Themes

### Design System
- **Glass Morphism**: Modern glass-effect components with backdrop blur
- **Gradient Backgrounds**: Subtle animated gradients for visual depth
- **Color Scheme**: Carefully chosen colors for accessibility and aesthetics
- **Typography**: Clear hierarchy with appropriate font weights and sizes

### Custom CSS Classes
- `.glass` - Glass morphism effect
- `.glass-glow` - Glowing glass effect with hover states
- `.glass-scrollbar` - Styled scrollbars matching the theme
- `.theme-bg` - Dynamic background that adapts to theme

### Component Variations
All components support multiple variants and sizes through the class-variance-authority system, ensuring consistent styling across the application.

## 🔍 Troubleshooting

### Common Issues

**Map Not Loading**
- Verify Mapbox token is correct and active
- Check browser console for network errors
- Ensure HTTPS is used for production deployments

**Data Not Loading**
- Check data source URLs in service configurations
- Verify JSON file formats match expected interfaces
- Check browser network tab for failed requests

**Build Failures**
- Ensure all dependencies are installed: `npm install`
- Clear node_modules and reinstall if needed
- Check TypeScript errors: `npm run lint`

**Docker Issues**
- Ensure Docker daemon is running
- Check port conflicts (default: 8080)
- Verify file permissions for volume mounts

### Performance Optimization
- Enable browser caching for static assets
- Use production builds for deployment
- Configure CDN for better global performance
- Monitor bundle size and code splitting opportunities

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make changes and test thoroughly
4. Commit with conventional commit messages
5. Push to your fork and create a pull request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured for React and TypeScript best practices
- **Prettier**: Code formatting on save
- **Conventional Commits**: Use conventional commit format

### Testing
- Test all components in both light and dark themes
- Verify responsive design on multiple screen sizes
- Test data loading and error states
- Ensure accessibility compliance

## 📄 License

This project is part of a Lovable project and follows the associated terms and conditions.

## 🔗 Links

- **Lovable Project**: https://lovable.dev/projects/84dc9ab1-82cd-4cf1-942c-ffbebe0e25b6
- **Documentation**: This README
- **Issues**: Use the project's issue tracker for bug reports and feature requests

---

*Built with ❤️ using React, TypeScript, and modern web technologies*