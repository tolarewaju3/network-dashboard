
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Tower } from '../types/network';

interface MapViewProps {
  towers: Tower[];
  mapboxToken: string;
}

const MapView: React.FC<MapViewProps> = ({ towers, mapboxToken }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: number]: mapboxgl.Marker }>({});

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-98.5795, 39.8283], // Center of the US
      zoom: 3,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add custom popup styles to the document
    if (!document.getElementById('mapbox-popup-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'mapbox-popup-styles';
      styleElement.textContent = `
        .mapboxgl-popup-content {
          background: rgba(31, 41, 55, 0.95);
          color: white;
          padding: 12px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .mapboxgl-popup-close-button {
          color: white;
          font-size: 16px;
        }
        .mapboxgl-popup-tip {
          border-top-color: rgba(31, 41, 55, 0.95);
        }
      `;
      document.head.appendChild(styleElement);
    }

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
      }
      // Remove custom styles when component unmounts
      const styleElement = document.getElementById('mapbox-popup-styles');
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    };
  }, [mapboxToken]);

  // Update markers when towers change
  useEffect(() => {
    if (!map.current) return;

    // Wait for map to load before adding markers
    const addMarkers = () => {
      // Create a set of tower IDs from current data for efficient lookup
      const currentTowerIds = new Set(towers.map(tower => tower.id));
      
      // Remove markers for towers that are no longer present in the data
      Object.keys(markersRef.current).forEach(idString => {
        const id = parseInt(idString, 10);
        if (!currentTowerIds.has(id)) {
          // Tower no longer exists in the data, remove its marker
          markersRef.current[id].remove();
          delete markersRef.current[id];
        }
      });

      // Add or update markers for current towers
      towers.forEach(tower => {
        // Determine marker color based on tower status and dropped calls
        let markerColor = '#4ade80'; // Default green for up status
        let shadowColor = 'rgba(74, 222, 128, 0.6)';
        
        if (tower.status === 'down') {
          markerColor = '#f87171'; // Red for down status
          shadowColor = 'rgba(248, 113, 113, 0.6)';
        } else if (tower.dropRate && tower.dropRate >= 2) {
          markerColor = '#facc15'; // Yellow for high drop rate but not down
          shadowColor = 'rgba(250, 204, 21, 0.6)';
        }

        // Check if we need to update or create a new marker
        if (markersRef.current[tower.id]) {
          // Update existing marker position
          markersRef.current[tower.id].setLngLat([tower.lng, tower.lat]);
          
          // We'll remove and recreate the marker element to update its appearance
          // This ensures that color changes are reflected
          markersRef.current[tower.id].remove();
        }

        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'tower-marker';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = markerColor;
        el.style.boxShadow = `0 0 10px 3px ${shadowColor}`;
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';

        // Create popup with tower information using inline styles instead of Tailwind classes
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div>
            <h3 style="font-weight: bold; margin-bottom: 4px;">${tower.name}</h3>
            <p style="margin: 4px 0;">Status: <span style="color: ${
              tower.status === 'up' ? '#4ade80' : '#f87171'
            };">${tower.status.toUpperCase()}</span></p>
            ${tower.dropRate !== undefined ? 
              `<p style="margin: 4px 0;">Drop Rate: <span style="${
                tower.dropRate >= 10 ? 'color: #f87171; font-weight: bold;' : 
                tower.dropRate >= 5 ? 'color: #facc15; font-weight: bold;' : ''
              }">${tower.dropRate.toFixed(1)}%</span></p>` : ''}
            ${tower.droppedCalls ? 
              `<p style="margin: 4px 0;">Dropped Calls: ${tower.droppedCalls}</p>` : ''}
            <p style="margin: 4px 0;">Location: ${tower.lat.toFixed(4)}, ${tower.lng.toFixed(4)}</p>
          </div>`
        );

        // Add marker to map
        const marker = new mapboxgl.Marker(el)
          .setLngLat([tower.lng, tower.lat])
          .setPopup(popup)
          .addTo(map.current!);

        // Store marker reference
        markersRef.current[tower.id] = marker;
      });
    };

    if (map.current.loaded()) {
      addMarkers();
    } else {
      map.current.on('load', addMarkers);
    }

  }, [towers, map.current]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default MapView;
