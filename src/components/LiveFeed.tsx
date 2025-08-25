
import React, { useState } from 'react';
import { Event } from '../types/network';
import { Bell, BellOff, Phone, TowerControl, ArrowUp, ArrowDown, Database, Settings, CheckCircle, MapPin, Signal, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { dbConfig } from '../config/dbConfig';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface LiveFeedProps {
  events: Event[];
}

const LiveFeed: React.FC<LiveFeedProps> = ({ events }) => {
  const [selectedCell, setSelectedCell] = useState<string>('all');
  
  // Get unique cell IDs from events for filter options
  const uniqueCellIds = Array.from(new Set(events.map(event => event.cellId).filter(Boolean))).sort();
  
  // Filter events based on selected cell
  const filteredEvents = selectedCell === 'all' 
    ? events 
    : events.filter(event => event.cellId === selectedCell);
  const getEventIcon = (eventType: Event['type']) => {
    switch (eventType) {
      case 'call-placed':
        return <Phone size={20} className="text-blue-400" />;
      case 'call-dropped':
        return <Phone size={20} className="text-yellow-400" />;
      case 'tower-up':
        return <ArrowUp size={20} className="text-green-400" />;
      case 'tower-down':
        return <ArrowDown size={20} className="text-red-400" />;
      case 'alert-triggered':
        return <Bell size={20} className="text-amber-400" />;
      case 'alert-resolved':
        return <BellOff size={20} className="text-blue-400" />;
      case 'remediation-started':
        return <Settings size={20} className="text-orange-400" />;
      case 'remediation-completed':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'anomaly-detected':
        return <AlertTriangle size={20} className="text-red-400" />;
      default:
        return <TowerControl size={20} className="text-gray-400" />;
    }
  };

  const getEventClassNames = (eventType: Event['type']) => {
    const baseClasses = "flex items-start space-x-3 p-3 rounded-md mb-2 transition-all duration-300 glass hover:glass-hover backdrop-blur-sm";
    
    switch (eventType) {
      case 'tower-down':
        return `${baseClasses} bg-red-500/10 border border-red-400/30 hover:bg-red-500/20`;
      case 'tower-up':
        return `${baseClasses} bg-green-500/10 border border-green-400/30 hover:bg-green-500/20`;
      case 'call-dropped':
        return `${baseClasses} bg-yellow-500/10 border border-yellow-400/30 hover:bg-yellow-500/20`;
      case 'call-placed':
        return `${baseClasses} bg-blue-500/10 border border-blue-400/30 hover:bg-blue-500/20`;
      case 'alert-triggered':
        return `${baseClasses} bg-amber-500/10 border border-amber-400/30 hover:bg-amber-500/20`;
      case 'remediation-started':
        return `${baseClasses} bg-orange-500/10 border border-orange-400/30 hover:bg-orange-500/20`;
      case 'remediation-completed':
        return `${baseClasses} bg-green-500/10 border border-green-400/30 hover:bg-green-500/20`;
      case 'anomaly-detected':
        return `${baseClasses} bg-red-500/10 border border-red-400/30 hover:bg-red-500/20`;
      default:
        return `${baseClasses} bg-white/5 border border-white/20 hover:bg-white/10`;
    }
  };

  const getEventTitle = (event: Event) => {
    switch (event.type) {
      case 'call-placed':
        return `Call Placed`;
      case 'call-dropped':
        return `Call Dropped`;
      case 'tower-up':
        return `Tower Online`;
      case 'tower-down':
        return `Tower Offline`;
      case 'alert-triggered':
        return `Alert Triggered`;
      case 'alert-resolved':
        return `Alert Resolved`;
      case 'remediation-started':
        return `Remediation Started`;
      case 'remediation-completed':
        return `Remediation Completed`;
      case 'anomaly-detected':
        return `Anomaly Detected`;
      default:
        return `Unknown Event`;
    }
  };

  // Determine data source display text
  const getDataSourceText = () => {
    if (dbConfig.useMock) {
      return 'Mock DB';
    } else {
      return 'JSON';
    }
  };

  // Format date properly, ensuring we're using the actual timestamp
  const formatEventTime = (date: Date) => {
    // Make sure we're working with a valid Date object
    const eventDate = new Date(date);
    
    // Use formatDistanceToNow which handles the relative time conversion
    return formatDistanceToNow(eventDate, { addSuffix: true });
  };

  return (
    <div className="glass-card p-4 glass-glow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white/95 drop-shadow-lg">Live Network Events</h2>
        <div className="flex items-center gap-2">
          <Select value={selectedCell} onValueChange={setSelectedCell}>
            <SelectTrigger className="w-40 glass border-white/20 text-white/90 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all">
              <SelectValue placeholder="All Cells" />
            </SelectTrigger>
            <SelectContent className="glass-strong border-white/30 backdrop-blur-lg">
              <SelectItem value="all" className="text-white/90 hover:bg-white/20">All Towers</SelectItem>
              {uniqueCellIds.map(cellId => (
                <SelectItem key={cellId} value={cellId} className="text-white/90 hover:bg-white/20">
                  {cellId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto pr-2 glass-scrollbar">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <TowerControl size={40} className="mx-auto mb-3 text-white/40" />
            <p>{selectedCell === 'all' ? 'No events recorded yet' : `No events for ${selectedCell}`}</p>
          </div>
        ) : (
          filteredEvents.map((event, index) => (
            <div key={index} className={getEventClassNames(event.type)}>
              <div className="p-2 glass rounded-md backdrop-blur-sm">
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-medium text-white/95 drop-shadow-sm">{getEventTitle(event)}</h3>
                  <span className="text-xs text-white/60">
                    {formatEventTime(event.timestamp)}
                  </span>
                </div>
{event.message && (
                  <p className="text-sm text-white/80 mt-1">{event.message}</p>
                )}
                {(event.type === 'call-placed' || event.type === 'call-dropped') && event.location && event.signalStrength && (
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <MapPin size={14} className="text-blue-400 drop-shadow-sm" />
                      <span>Location: {event.location.lat.toFixed(4)}, {event.location.lng.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Signal size={14} className="text-green-400 drop-shadow-sm" />
                      <span>Signal: {event.signalStrength} dBm</span>
                    </div>
                  </div>
                 )}
                 {event.type === 'anomaly-detected' && (event.anomalyType || event.band) && (
                   <div className="space-y-1 mt-2">
                     {event.anomalyType && (
                       <div className="flex items-center gap-2 text-sm text-white/80">
                         <AlertTriangle size={14} className="text-red-400 drop-shadow-sm" />
                         <span>Type: {event.anomalyType}</span>
                       </div>
                     )}
                     {event.band && (
                       <div className="flex items-center gap-2 text-sm text-white/80">
                         <Signal size={14} className="text-orange-400 drop-shadow-sm" />
                         <span>Band: {event.band}</span>
                       </div>
                     )}
                   </div>
                 )}
                 <div className="flex flex-wrap gap-2 mt-2">
                  {event.cellId && (
                    <div className="text-xs glass-dark px-2 py-1 rounded-sm text-white/80 backdrop-blur-sm">
                      Tower: {event.cellId}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveFeed;
