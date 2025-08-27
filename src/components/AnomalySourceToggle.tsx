import React, { useState, useEffect } from 'react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { HardDrive, Globe } from 'lucide-react';
import { clearAnomalyCache } from '../services/anomalyService';
import { toast } from '@/hooks/use-toast';

const AnomalySourceToggle: React.FC = () => {
  const [useLocalFile, setUseLocalFile] = useState(false);

  useEffect(() => {
    // Check current setting from localStorage
    const customUrl = localStorage.getItem('custom-anomalies-url');
    setUseLocalFile(!customUrl || customUrl === '/anomalies.json');
  }, []);

  const handleToggle = (checked: boolean) => {
    setUseLocalFile(checked);
    
    if (checked) {
      // Use local file
      localStorage.setItem('custom-anomalies-url', '/anomalies.json');
      toast({
        title: "Data Source Updated",
        description: "Now reading anomalies from local file",
      });
    } else {
      // Remove custom URL to use default/remote
      localStorage.removeItem('custom-anomalies-url');
      toast({
        title: "Data Source Updated", 
        description: "Now reading anomalies from remote source",
      });
    }
    
    // Clear cache to force refresh with new source
    clearAnomalyCache();
  };

  return (
    <div className="stat-card">
      <div className="text-white/70 text-sm font-medium mb-2">Anomaly Source</div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-400" />
          <Label htmlFor="anomaly-source" className="text-xs text-white/60">
            Remote
          </Label>
        </div>
        <Switch
          id="anomaly-source"
          checked={useLocalFile}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-green-500"
        />
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-green-400" />
          <Label htmlFor="anomaly-source" className="text-xs text-white/60">
            Local
          </Label>
        </div>
      </div>
      <div className="text-xs text-white/50 mt-1">
        {useLocalFile ? 'Reading from /anomalies.json' : 'Reading from remote API'}
      </div>
    </div>
  );
};

export default AnomalySourceToggle;