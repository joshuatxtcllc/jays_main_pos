
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface KanbanHealth {
  status: string;
  connected: boolean;
  lastSync?: string;
}

export function ExternalKanbanStatus() {
  const [health, setHealth] = useState<KanbanHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/kanban/external/health');
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      setHealth({
        status: 'error',
        connected: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = () => {
    if (!health) return null;

    if (health.status === 'not_configured') {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Not Configured
        </Badge>
      );
    }

    if (health.connected) {
      return (
        <Badge variant="default" className="flex items-center gap-1 bg-green-600">
          <Wifi className="h-3 w-3" />
          External Kanban Connected
        </Badge>
      );
    }

    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <WifiOff className="h-3 w-3" />
        External Kanban Disconnected
      </Badge>
    );
  };

  return (
    <div className="flex items-center gap-2 mt-1">
      {getStatusBadge()}
      <Button
        variant="ghost"
        size="sm"
        onClick={checkHealth}
        disabled={isLoading}
        className="h-6 px-2"
      >
        <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
      {health?.lastSync && (
        <span className="text-xs text-muted-foreground">
          Last sync: {new Date(health.lastSync).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
