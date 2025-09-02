# Deployment Guide

This guide provides step-by-step instructions for deploying the Network Dashboard in different environments.

## 🚀 Quick Deployment Options

### 1. Local Development
```bash
# Clone and setup
git clone <your-repo-url>
cd network-dashboard
npm install

# Start development server
npm run dev
```
Access at: `http://localhost:8080`

### 2. Docker Deployment
```bash
# Build and run
docker build -t network-dashboard .
docker run -p 8080:8080 network-dashboard
```
Access at: `http://localhost:8080`

### 3. Production Build
```bash
# Build for production
npm run build

# Serve with any static file server
npx serve -s dist -p 8080
```

## 🏗️ Production Deployment

### Prerequisites for Remote Data Mode
If using remote anomaly data, ensure these are deployed first:

1. **Deploy Anomaly Parser Manifests**
   - Deploy anomaly parser service to your target environment
   - Verify the service is accessible and returning properly formatted JSON
   - Configure the endpoint URL

2. **Environment Configuration**
   ```bash
   export VITE_ANOMALIES_URL=https://your-api.example.com/anomalies
   export VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here
   ```

### Environment Variables
```bash
# Required
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here

# Optional - Remote data sources
VITE_ANOMALIES_URL=https://api.example.com/anomalies
VITE_API_BASE_URL=https://api.example.com

# Optional - Application configuration
VITE_REFRESH_INTERVAL=30000
VITE_MAX_RETRIES=3
```

### Docker Production Deployment
```bash
# Build with environment variables
docker build --build-arg VITE_MAPBOX_TOKEN=pk.your_token_here -t network-dashboard .

# Run with port mapping and environment
docker run -d \
  --name network-dashboard \
  -p 8080:8080 \
  -e VITE_ANOMALIES_URL=https://your-api.com/anomalies \
  network-dashboard
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: network-dashboard
spec:
  replicas: 3
  selector:
    matchLabels:
      app: network-dashboard
  template:
    metadata:
      labels:
        app: network-dashboard
    spec:
      containers:
      - name: network-dashboard
        image: network-dashboard:latest
        ports:
        - containerPort: 8080
        env:
        - name: VITE_ANOMALIES_URL
          value: "https://anomaly-service.default.svc.cluster.local/anomalies"
---
apiVersion: v1
kind: Service
metadata:
  name: network-dashboard-service
spec:
  selector:
    app: network-dashboard
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
  type: LoadBalancer
```

## 🔧 Configuration

### Data Source Configuration
Edit `src/config/dbConfig.ts`:
```typescript
export const dbConfig = {
  useMock: false, // Set to true for demo mode
  anomaliesJsonUrl: process.env.VITE_ANOMALIES_URL || '/anomalies.json',
  refreshInterval: 30000,
  maxRetries: 3
};
```

### Nginx Configuration
For custom Nginx setup, use the included `nginx.conf` or customize:
```nginx
server {
    listen 8080;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /health {
        access_log off;
        return 200 "healthy\n";
    }
}
```

## 🛠️ Troubleshooting

### Common Deployment Issues

**Build Failures**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Docker Issues**
```bash
# Check container logs
docker logs network-dashboard

# Interactive debugging
docker run -it network-dashboard /bin/sh
```

**Environment Variables Not Working**
- Ensure variables are prefixed with `VITE_`
- For Docker builds, use `--build-arg` for build-time variables
- For runtime, verify environment variables are available in container

**Map Not Loading**
- Verify Mapbox token is valid and active
- Check browser console for CORS or network errors
- Ensure HTTPS is used in production

**Remote Data Not Loading**
- Verify anomaly parser manifests are deployed
- Check network connectivity to anomaly service
- Validate JSON response format matches expected schema
- Review fallback to local data behavior

## 📊 Monitoring

### Health Checks
The application provides several health check endpoints:

```bash
# Application health
curl http://localhost:8080/health

# Check if static assets are serving
curl http://localhost:8080/index.html
```

### Performance Monitoring
Monitor these key metrics:
- Initial page load time
- API response times
- Map rendering performance
- Memory usage over time
- Error rates

### Logging
Application logs include:
- Data source connection status
- Anomaly detection events
- User interaction metrics
- Error and warning messages

## 🔒 Security Considerations

### Production Security
- Use HTTPS in production environments
- Implement proper CORS policies
- Secure API endpoints with authentication
- Regular security updates for dependencies

### Content Security Policy
Add CSP headers to nginx configuration:
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://api.mapbox.com; img-src 'self' data: https:; connect-src 'self' https://api.mapbox.com https://*.tiles.mapbox.com;";
```

## 🔄 Updates and Maintenance

### Rolling Updates
For zero-downtime deployments:
1. Build new image with updated code
2. Deploy to staging environment for testing
3. Gradually roll out to production instances
4. Monitor application health during rollout

### Database Migrations
When updating data schemas:
1. Ensure backward compatibility during transition
2. Update data processing services first
3. Deploy application updates
4. Verify data integrity after deployment

### Backup and Recovery
- Regular backups of configuration files
- Document custom environment configurations
- Maintain rollback procedures for quick recovery
- Test disaster recovery procedures periodically

This deployment guide ensures reliable and secure deployment of the Network Dashboard across various environments.
