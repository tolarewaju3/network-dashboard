# Network Dashboard

A comprehensive real-time network monitoring dashboard for cellular tower networks, featuring interactive maps, live event feeds, anomaly detection, and AI-powered insights.

## 🌟 Features

### 📡 Interactive Network Map
- **Real-time Tower Visualization**: Interactive map displaying cell tower locations with status indicators
- **Multi-status Support**: Visual indicators for tower status (online/offline), anomalies, and performance metrics
- **Detailed Tower Information**: Click on any tower to view comprehensive details including:
  - Anomaly alerts and recommendations
  - Frequency bands supported
  - Adjacent cell information

### 📊 Live Event Monitoring
- **Real-time Event Feed**: Live stream of network events including:
  - Tower status changes (up/down)
  - Remediation activities
  - Anomaly detections
- **Event Filtering**: Filter events by specific cells or view all network activity
- **Event Details**: Click any event for detailed information and context

### 🤖 RAN AI Chat Interface
- **Network Intelligence**: AI-powered chat interface for network insights and predictions
- **Usage Predictions**: Query future usage patterns and capacity planning
- **Performance Analytics**: Get insights on tower performance and optimization recommendations

### 🚨 Anomaly Detection
- **Real-time Anomaly Monitoring**: Automatic detection and alerts for network anomalies
- **Multi-source Data**: Support for both local JSON files and remote data sources
- **Anomaly Classification**: Categorized anomaly types with recommended fixes


## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query (TanStack Query) for server state
- **Maps**: Mapbox GL JS for interactive maps
- **Data Fetching**: Native fetch API with fallback mechanisms

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

## 🚀 Deployment on OpenShift

### 1. Deploy the Anomaly Parser
The anomaly parser must be deployed first, as it provides the real-time anomaly data consumed by the dashboard.  

Apply the parser manifests:
```bash
oc apply -f anomaly-parser/manifests/
```

This will expose the anomaly service through an OpenShift route. To view the newly created route, run this command:

```
oc get route anomaly-parser
```

### 2. Configure Environment Variables
Before deploying the dashboard, configure the following variables in your OpenShift environment or DeploymentConfig:

- **`VITE_MAPBOX_TOKEN`** – Your Mapbox access token (required for the interactive map).
- **`VITE_ANOMALIES_URL`** – The URL of your anomaly parser service (from the route you deployed in step 1).
- **`VITE_API_BASE_URL`** – (Optional) Base URL for any additional APIs.

### 3. Build and Deploy the Dashboard
Build and push the dashboard image:
```bash
# Build and tag the image
docker build -t <registry-url>/network-dashboard:latest .

# Push to your registry
docker push <registry-url>/network-dashboard:latest
```
Or, if you'd like to use my image, it's here:

```
quay.io/tolarewa/network-dashboard-ui
```

Deploy the image to OpenShift:
```bash
oc new-app <registry-url>/network-dashboard:latest \
  -e VITE_MAPBOX_TOKEN=<your-mapbox-token> \
  -e VITE_ANOMALIES_URL=<your-anomalies-service-url> \
  --port=8080
```

### 4. Expose the Dashboard
Create a route so the dashboard is accessible externally:
```bash
oc expose svc/network-dashboard
```

### 5. View the Dashboard
Navigate to the url of route. It should look something like this:

```
https://network-dashboard-ui-ai-cloud-ran-genai.apps.ocphub.user154/
```

Your dashboard will now be available via the OpenShift route.  

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
- **Remote Data Mode**: Requires anomaly parser manifests to be deployed first

### Environment Variables
Set these environment variables for custom configurations:
- `VITE_MAPBOX_TOKEN` - Mapbox access token
- `VITE_ANOMALIES_URL` - Custom anomalies data source URL
- `VITE_API_BASE_URL` - Base URL for API endpoints


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
- For remote data mode: Ensure anomaly parser manifests are deployed and accessible

**Build Failures**
- Ensure all dependencies are installed: `npm install`
- Clear node_modules and reinstall if needed
- Check TypeScript errors: `npm run lint`

**Docker Issues**
- Ensure Docker daemon is running
- Check port conflicts (default: 8080)
- Verify file permissions for volume mounts

---

*Built with ❤️ using React, TypeScript, and modern web technologies*