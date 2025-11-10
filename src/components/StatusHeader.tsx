import { Tower, Event } from "../types/network";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "./ThemeToggle";
import { AutoZoomToggle } from "./AutoZoomToggle";
import { hasAnomaly } from "../services/anomalyService";
interface ProcessedAnomaly {
  cellId: string;
  count: number;
  types: string[];
  latestAnomaly: string;
  latestDate: string;
}
interface StatusHeaderProps {
  towers: Tower[];
  avgRecoveryTime: number;
  anomalies: Map<string, ProcessedAnomaly>;
  remediationEvents: Event[];
  autoZoomEnabled: boolean;
  onAutoZoomToggle: (enabled: boolean) => void;
}
const StatusHeader: React.FC<StatusHeaderProps> = ({
  towers,
  avgRecoveryTime,
  anomalies,
  remediationEvents,
  autoZoomEnabled,
  onAutoZoomToggle
}) => {
  // Helper function to check if there are anomalies after the most recent remediation
  const hasUnresolvedAnomalies = (cellId: string): boolean => {
    // Find the most recent remediation_verified event for this cell
    const cellRemediationEvents = remediationEvents.filter(event => event.type === 'remediation-verified' && (event.cellId === cellId || event.towerId.toString() === cellId));
    if (cellRemediationEvents.length === 0) {
      // No remediation, so any anomaly counts as unresolved
      return hasAnomaly(cellId, anomalies);
    }

    // Get the most recent remediation timestamp
    const latestRemediation = cellRemediationEvents.reduce((latest, event) => {
      return event.timestamp > latest.timestamp ? event : latest;
    });

    // Check if there are any anomalies for this cell
    const cellAnomalies = anomalies.get(cellId);
    if (!cellAnomalies) {
      return false;
    }

    // Check if the latest anomaly is after the remediation
    const latestAnomalyDate = new Date(cellAnomalies.latestDate);
    return latestAnomalyDate > latestRemediation.timestamp;
  };
  const totalTowers = towers.length;
  const activeTowers = towers.filter(tower => tower.status === "up").length;
  const towersWithAnomalies = towers.filter(tower => hasUnresolvedAnomalies(tower.id.toString())).length;
  const healthyTowers = towers.filter(tower => tower.status === "up" && !hasUnresolvedAnomalies(tower.id.toString())).length;
  const healthPercentage = totalTowers > 0 ? Math.floor(healthyTowers / totalTowers * 100) : 0;

  // Format recovery time in a human-readable way (input is now in seconds)
  const formatRecoveryTime = (seconds: number): string => {
    if (seconds === 0) return "N/A";
    if (seconds < 60) {
      return `${Math.round(seconds)} seconds`;
    }
    const minutes = seconds / 60;
    if (minutes < 60) {
      const wholeMinutes = Math.floor(minutes);
      const remainingSeconds = Math.round(seconds % 60);
      if (remainingSeconds === 0) {
        return wholeMinutes === 1 ? "1 minute" : `${wholeMinutes} minutes`;
      }
      return `${wholeMinutes}m ${remainingSeconds}s`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    if (remainingMinutes === 0) {
      return hours === 1 ? "1 hour" : `${hours} hours`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };
  return <header className="bg-card/50 border-b border-border py-4 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground drop-shadow-lg">AI RAN Dashboard</h1>
          <div className="flex items-center gap-2">
            <AutoZoomToggle autoZoomEnabled={autoZoomEnabled} onToggle={onAutoZoomToggle} />
            <ThemeToggle />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-6">
          <div className="stat-card">
            <div className="text-muted-foreground text-sm font-medium">Network Health</div>
            <div className="flex items-center mt-1">
              <div className={`text-2xl font-bold drop-shadow-md ${healthPercentage >= 90 ? 'text-green-400' : healthPercentage >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                {healthPercentage}%
              </div>
              <div className="w-32 h-2 bg-muted rounded-full ml-3 overflow-hidden backdrop-blur-sm">
                <div className={`h-full rounded-full transition-all duration-500 ${healthPercentage >= 90 ? 'bg-green-400 shadow-green-400/50' : healthPercentage >= 70 ? 'bg-yellow-400 shadow-yellow-400/50' : 'bg-red-400 shadow-red-400/50'} shadow-lg`} style={{
                width: `${healthPercentage}%`
              }}></div>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="text-muted-foreground text-sm font-medium">Avg Recovery Time</div>
            <div className="text-2xl font-bold text-blue-400 drop-shadow-md">
              {formatRecoveryTime(avgRecoveryTime)}
            </div>
          </div>
          
          <div className="stat-card">
            <div className="text-muted-foreground text-sm font-medium">Total Towers</div>
            <div className="text-2xl font-bold text-foreground drop-shadow-md">{totalTowers}</div>
          </div>
          
          <div className="stat-card">
            <div className="text-muted-foreground text-sm font-medium">Healthy Towers</div>
            <div className="text-2xl font-bold text-green-400 drop-shadow-md">{healthyTowers}</div>
          </div>
          
          <div className="stat-card">
            <div className="text-muted-foreground text-sm font-medium">w/ Anomalies</div>
            <div className="text-2xl font-bold text-red-400 drop-shadow-md">{towersWithAnomalies}</div>
          </div>
        </div>
      </div>
    </header>;
};
export default StatusHeader;
