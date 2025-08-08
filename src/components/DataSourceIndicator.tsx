import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Database, FileJson, Settings } from "lucide-react";
import { dbConfig } from "@/config/dbConfig";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function DataSourceIndicator() {
  const [isOpen, setIsOpen] = useState(false);
  const [useJson, setUseJson] = useState(() => {
    return localStorage.getItem('override-use-json') === 'true' || dbConfig.useTowersJson;
  });

  const currentSource = useJson ? 'JSON' : (dbConfig.useSupabase ? 'Supabase' : 'Mock');
  const sourceIcon = useJson ? FileJson : Database;
  const SourceIcon = sourceIcon;

  const handleToggle = (checked: boolean) => {
    setUseJson(checked);
    localStorage.setItem('override-use-json', checked.toString());
    // Trigger a page reload to apply changes
    window.location.reload();
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
      <PopoverContent className="glass-card border-white/20 w-80">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-white mb-2">Data Source</h4>
            <p className="text-sm text-white/70 mb-3">
              Currently using: <Badge variant="outline" className="ml-1">{currentSource}</Badge>
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="data-source-toggle"
              checked={useJson}
              onCheckedChange={handleToggle}
            />
            <Label htmlFor="data-source-toggle" className="text-sm text-white/90">
              Use JSON data source
            </Label>
          </div>
          
          <div className="text-xs text-white/60 space-y-1">
            <p>• JSON: Load towers from towers.json file</p>
            <p>• Supabase: Load from connected database</p>
            <p className="text-yellow-400">Note: Changes require page reload</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}