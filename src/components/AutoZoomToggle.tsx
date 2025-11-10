import { Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AutoZoomToggleProps {
  autoZoomEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function AutoZoomToggle({ autoZoomEnabled, onToggle }: AutoZoomToggleProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => onToggle(!autoZoomEnabled)}
      className="relative"
      title={autoZoomEnabled ? "Disable auto-zoom to anomalies" : "Enable auto-zoom to anomalies"}
    >
      <Crosshair className={`h-[1.2rem] w-[1.2rem] transition-all ${autoZoomEnabled ? 'text-green-500' : 'text-muted-foreground'}`} />
      {!autoZoomEnabled && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-[2px] w-[1.5rem] bg-red-500 rotate-45 rounded-full" />
        </div>
      )}
    </Button>
  );
}
