
import { Tower } from "../types/network";
import { Progress } from "@/components/ui/progress";

interface StatusHeaderProps {
  towers: Tower[];
  avgRecoveryTime: number;
}

const StatusHeader: React.FC<StatusHeaderProps> = ({ towers, avgRecoveryTime }) => {
  const totalTowers = towers.length;
  const activeTowers = towers.filter(tower => tower.status === "up").length;
  const downTowers = totalTowers - activeTowers;
  
  const healthPercentage = totalTowers > 0 
    ? Math.floor((activeTowers / totalTowers) * 100) 
    : 0;
  
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
  
  return (
    <header className="glass-dark border-b border-white/10 py-4 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4 text-white/95 drop-shadow-lg">Network Dashboard</h1>
        
        <div className="flex flex-wrap gap-6">
          <div className="stat-card">
            <div className="text-white/70 text-sm font-medium">Network Health</div>
            <div className="flex items-center mt-1">
              <div className={`text-2xl font-bold drop-shadow-md ${healthPercentage >= 90 ? 'text-green-400' : healthPercentage >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                {healthPercentage}%
              </div>
              <div className="w-32 h-2 bg-white/20 rounded-full ml-3 overflow-hidden backdrop-blur-sm">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${healthPercentage >= 90 ? 'bg-green-400 shadow-green-400/50' : healthPercentage >= 70 ? 'bg-yellow-400 shadow-yellow-400/50' : 'bg-red-400 shadow-red-400/50'} shadow-lg`}
                  style={{ width: `${healthPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="text-white/70 text-sm font-medium">Avg Recovery Time</div>
            <div className="text-2xl font-bold text-blue-400 drop-shadow-md">
              {formatRecoveryTime(avgRecoveryTime)}
            </div>
          </div>
          
          <div className="stat-card">
            <div className="text-white/70 text-sm font-medium">Total Towers</div>
            <div className="text-2xl font-bold text-white/95 drop-shadow-md">{totalTowers}</div>
          </div>
          
          <div className="stat-card">
            <div className="text-white/70 text-sm font-medium">Active Towers</div>
            <div className="text-2xl font-bold text-green-400 drop-shadow-md">{activeTowers}</div>
          </div>
          
          <div className="stat-card">
            <div className="text-white/70 text-sm font-medium">Down Towers</div>
            <div className="text-2xl font-bold text-red-400 drop-shadow-md">{downTowers}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StatusHeader;
