import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Database, FileJson, Settings, AlertTriangle } from "lucide-react";
import { dbConfig } from "@/config/dbConfig";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { clearAnomalyCache } from "@/services/anomalyService";

export function DataSourceIndicator() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Towers configuration
  const [useJson, setUseJson] = useState(() => {
    return localStorage.getItem('override-use-json') === 'true' || dbConfig.useTowersJson;
  });
  const [jsonUrl, setJsonUrl] = useState(() => {
    return localStorage.getItem('custom-json-url') || dbConfig.towersJsonUrl || '/towers.json';
  });
  
  // Anomalies configuration
  const [useAnomaliesJson, setUseAnomaliesJson] = useState(() => {
    return localStorage.getItem('override-use-anomalies-json') === 'true' || dbConfig.useAnomaliesJson;
  });
  const [anomaliesUrl, setAnomaliesUrl] = useState(() => {
    return localStorage.getItem('custom-anomalies-url') || dbConfig.anomaliesJsonUrl || '/anomalies.json';
  });

  const currentSource = useJson ? 'JSON' : 'Mock';
  const sourceIcon = useJson ? FileJson : Database;
  const SourceIcon = sourceIcon;

  const handleToggle = (checked: boolean) => {
    setUseJson(checked);
    localStorage.setItem('override-use-json', checked.toString());
    // Trigger a page reload to apply changes
    window.location.reload();
  };

  const handleUrlChange = (url: string) => {
    setJsonUrl(url);
    localStorage.setItem('custom-json-url', url);
    // If JSON is currently enabled, reload to apply the new URL
    if (useJson) {
      window.location.reload();
    }
  };

  const handleAnomaliesToggle = (checked: boolean) => {
    setUseAnomaliesJson(checked);
    localStorage.setItem('override-use-anomalies-json', checked.toString());
    clearAnomalyCache(); // Clear cache to ensure fresh data
    // Trigger a page reload to apply changes
    window.location.reload();
  };

  const handleAnomaliesUrlChange = (url: string) => {
    setAnomaliesUrl(url);
    localStorage.setItem('custom-anomalies-url', url);
    clearAnomalyCache(); // Clear cache to ensure fresh data
    // If anomalies JSON is currently enabled, reload to apply the new URL
    if (useAnomaliesJson) {
      window.location.reload();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="glass h-8 gap-2 text-white/90 border-white/20 hover:bg-white/10"
        >
          <SourceIcon className="h-3 w-3" />
          <Badge variant="secondary" className="text-xs px-2 py-0.5">
            {currentSource}
          </Badge>
          <Settings className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-slate-900/95 backdrop-blur-lg border border-white/30 w-80 shadow-2xl">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-white mb-2">Data Sources Configuration</h4>
            <p className="text-sm text-white/70 mb-3">
              Towers: <Badge variant="outline" className="ml-1">{currentSource}</Badge>
            </p>
          </div>
          
          {/* Towers Configuration */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileJson className="h-4 w-4 text-blue-400" />
              <h5 className="text-sm font-medium text-white">Towers Data Source</h5>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="towers-json-toggle"
                checked={useJson}
                onCheckedChange={handleToggle}
              />
              <Label htmlFor="towers-json-toggle" className="text-sm text-white/90">
                Use custom towers JSON URL
              </Label>
            </div>
            
            {useJson && (
              <div className="space-y-2">
                <Label htmlFor="towers-json-url" className="text-sm text-white/90">
                  Towers JSON URL
                </Label>
                <Input
                  id="towers-json-url"
                  type="url"
                  value={jsonUrl}
                  onChange={(e) => setJsonUrl(e.target.value)}
                  onBlur={(e) => handleUrlChange(e.target.value)}
                  placeholder="Enter towers JSON URL"
                  className="text-sm bg-white/5 border-white/20 text-white placeholder:text-white/50"
                />
                <p className="text-xs text-white/60">
                  Current: {jsonUrl}
                </p>
              </div>
            )}
          </div>
          
          <Separator className="bg-white/20" />
          
          {/* Anomalies Configuration */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <h5 className="text-sm font-medium text-white">Anomalies Data Source</h5>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="anomalies-json-toggle"
                checked={useAnomaliesJson}
                onCheckedChange={handleAnomaliesToggle}
              />
              <Label htmlFor="anomalies-json-toggle" className="text-sm text-white/90">
                Use custom anomalies JSON URL
              </Label>
            </div>
            
            {useAnomaliesJson && (
              <div className="space-y-2">
                <Label htmlFor="anomalies-json-url" className="text-sm text-white/90">
                  Anomalies JSON URL
                </Label>
                <Input
                  id="anomalies-json-url"
                  type="url"
                  value={anomaliesUrl}
                  onChange={(e) => setAnomaliesUrl(e.target.value)}
                  onBlur={(e) => handleAnomaliesUrlChange(e.target.value)}
                  placeholder="Enter anomalies JSON URL"
                  className="text-sm bg-white/5 border-white/20 text-white placeholder:text-white/50"
                />
                <p className="text-xs text-white/60">
                  Current: {anomaliesUrl}
                </p>
              </div>
            )}
          </div>
          
          <div className="text-xs text-white/60 space-y-1 pt-2 border-t border-white/20">
            <p>• Configure external data sources for towers and anomalies</p>
            <p>• Local files: /towers.json, /anomalies.json</p>
            <p>• Remote APIs: https://api.example.com/data.json</p>
            <p className="text-yellow-400">Note: Changes require page reload</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}