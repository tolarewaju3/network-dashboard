
export type TowerStatus = "up" | "down";

export interface Tower {
  id: number;
  name: string;
  lat: number;
  lng: number;
  status: TowerStatus;
  downSince?: Date; // Add timestamp for when tower went down
  droppedCalls?: number; // Track number of dropped calls
  dropRate?: number; // Add drop rate as a percentage
}

export type EventType = 
  | "call-placed" 
  | "call-dropped" 
  | "tower-up" 
  | "tower-down" 
  | "alert-triggered" 
  | "alert-resolved"
  | "remediation-started"
  | "remediation-completed";

export interface Event {
  type: EventType;
  timestamp: Date;
  message: string;
  towerId: number;
  cellId?: string;
  recoveryTime?: number; // Add recovery time in minutes (for tower-up events)
  location?: { lat: number; lng: number }; // Add location for call events
  signalStrength?: number; // Add signal strength for call events
}

export interface CallRecord {
  timestamp: Date;
  location: {
    lat: number;
    lng: number;
  };
  signalStrength: number;
  isDropped: boolean;
  cellId?: string;
}

// Helper interface to track tower activity based on call records
export interface TowerActivity {
  totalCalls: number;
  droppedCalls: number;
  lastActivity: Date;
}
