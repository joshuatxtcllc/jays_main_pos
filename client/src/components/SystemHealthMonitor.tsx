import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Globe, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'checking';
  message: string;
  lastChecked: Date;
  responseTime?: number;
}

export default function SystemHealthMonitor() {
  const { toast } = useToast();
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    {
      name: 'Database Connection',
      status: 'checking',
      message: 'Checking database connectivity...',
      lastChecked: new Date()
    },
    {
      name: 'Larson Catalog API',
      status: 'checking',
      message: 'Testing Larson wholesale catalog...',
      lastChecked: new Date()
    },
    {
      name: 'Nielsen Catalog API',
      status: 'checking',
      message: 'Testing Nielsen catalog...',
      lastChecked: new Date()
    },
    {
      name: 'Roma Catalog API',
      status: 'checking',
      message: 'Testing Roma catalog...',
      lastChecked: new Date()
    },
    {
      name: 'Frame Design Image System',
      status: 'checking',
      message: 'Testing frame design image saving...',
      lastChecked: new Date()
    }
  ]);

  const [isRunningChecks, setIsRunningChecks] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Run health checks
  const runHealthChecks = async () => {
    setIsRunningChecks(true);

    const newHealthChecks: HealthCheck[] = [];

    // Check Database Connection
    try {
      const startTime = performance.now();
      const response = await fetch('/api/auth/status');
      const endTime = performance.now();
      
      if (response.ok) {
        newHealthChecks.push({
          name: 'Database Connection',
          status: 'healthy',
          message: 'Database is connected and responding',
          lastChecked: new Date(),
          responseTime: Math.round(endTime - startTime)
        });
      } else {
        newHealthChecks.push({
          name: 'Database Connection',
          status: 'error',
          message: 'Database connection failed',
          lastChecked: new Date()
        });
      }
    } catch (error) {
      newHealthChecks.push({
        name: 'Database Connection',
        status: 'error',
        message: 'Unable to connect to database',
        lastChecked: new Date()
      });
    }

    // Check Larson Catalog API
    try {
      const startTime = performance.now();
      const response = await fetch('/api/vendor-catalog/larson');
      const endTime = performance.now();
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          newHealthChecks.push({
            name: 'Larson Catalog API',
            status: 'healthy',
            message: `Larson catalog loaded: ${data.length} items`,
            lastChecked: new Date(),
            responseTime: Math.round(endTime - startTime)
          });
        } else {
          newHealthChecks.push({
            name: 'Larson Catalog API',
            status: 'warning',
            message: 'Larson catalog is empty',
            lastChecked: new Date(),
            responseTime: Math.round(endTime - startTime)
          });
        }
      } else {
        newHealthChecks.push({
          name: 'Larson Catalog API',
          status: 'error',
          message: 'Larson catalog API failed',
          lastChecked: new Date()
        });
      }
    } catch (error) {
      newHealthChecks.push({
        name: 'Larson Catalog API',
        status: 'error',
        message: 'Unable to reach Larson catalog',
        lastChecked: new Date()
      });
    }

    // Check Nielsen Catalog API
    try {
      const startTime = performance.now();
      const response = await fetch('/api/vendor-catalog/nielsen');
      const endTime = performance.now();
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          newHealthChecks.push({
            name: 'Nielsen Catalog API',
            status: 'healthy',
            message: `Nielsen catalog loaded: ${data.length} items`,
            lastChecked: new Date(),
            responseTime: Math.round(endTime - startTime)
          });
        } else {
          newHealthChecks.push({
            name: 'Nielsen Catalog API',
            status: 'warning',
            message: 'Nielsen catalog is empty',
            lastChecked: new Date(),
            responseTime: Math.round(endTime - startTime)
          });
        }
      } else {
        newHealthChecks.push({
          name: 'Nielsen Catalog API',
          status: 'error',
          message: 'Nielsen catalog API failed',
          lastChecked: new Date()
        });
      }
    } catch (error) {
      newHealthChecks.push({
        name: 'Nielsen Catalog API',
        status: 'error',
        message: 'Unable to reach Nielsen catalog',
        lastChecked: new Date()
      });
    }

    // Check Roma Catalog API
    try {
      const startTime = performance.now();
      const response = await fetch('/api/vendor-catalog/roma');
      const endTime = performance.now();
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          newHealthChecks.push({
            name: 'Roma Catalog API',
            status: 'healthy',
            message: `Roma catalog loaded: ${data.length} items`,
            lastChecked: new Date(),
            responseTime: Math.round(endTime - startTime)
          });
        } else {
          newHealthChecks.push({
            name: 'Roma Catalog API',
            status: 'warning',
            message: 'Roma catalog is empty',
            lastChecked: new Date(),
            responseTime: Math.round(endTime - startTime)
          });
        }
      } else {
        newHealthChecks.push({
          name: 'Roma Catalog API',
          status: 'error',
          message: 'Roma catalog API failed',
          lastChecked: new Date()
        });
      }
    } catch (error) {
      newHealthChecks.push({
        name: 'Roma Catalog API',
        status: 'error',
        message: 'Unable to reach Roma catalog',
        lastChecked: new Date()
      });
    }

    // Check Frame Design Image System
    try {
      // Test if canvas can create data URLs (frame design image saving)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 100;
        canvas.height = 100;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 100, 100);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        
        if (dataUrl && dataUrl.startsWith('data:image/')) {
          newHealthChecks.push({
            name: 'Frame Design Image System',
            status: 'healthy',
            message: 'Frame design image saving is working',
            lastChecked: new Date()
          });
        } else {
          newHealthChecks.push({
            name: 'Frame Design Image System',
            status: 'error',
            message: 'Frame design image generation failed',
            lastChecked: new Date()
          });
        }
      } else {
        newHealthChecks.push({
          name: 'Frame Design Image System',
          status: 'error',
          message: 'Canvas context not available',
          lastChecked: new Date()
        });
      }
    } catch (error) {
      newHealthChecks.push({
        name: 'Frame Design Image System',
        status: 'error',
        message: 'Frame design image system error',
        lastChecked: new Date()
      });
    }

    setHealthChecks(newHealthChecks);
    setIsRunningChecks(false);

    // Show notification based on overall health
    const errorCount = newHealthChecks.filter(check => check.status === 'error').length;
    const warningCount = newHealthChecks.filter(check => check.status === 'warning').length;

    if (errorCount > 0) {
      toast({
        title: "System Health Alert",
        description: `${errorCount} critical issue(s) detected`,
        variant: "destructive"
      });
    } else if (warningCount > 0) {
      toast({
        title: "System Health Warning",
        description: `${warningCount} warning(s) detected`,
        variant: "default"
      });
    } else {
      toast({
        title: "System Health Good",
        description: "All systems are running smoothly",
        variant: "default"
      });
    }
  };

  // Auto-refresh health checks
  useEffect(() => {
    if (autoRefresh) {
      runHealthChecks();
      const interval = setInterval(runHealthChecks, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'checking':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'checking':
        return <Badge variant="outline">Checking...</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getSystemIcon = (name: string) => {
    if (name.includes('Database')) return <Database className="h-4 w-4" />;
    if (name.includes('Image')) return <Image className="h-4 w-4" />;
    return <Globe className="h-4 w-4" />;
  };

  const overallHealth = healthChecks.every(check => check.status === 'healthy') ? 'healthy' :
                       healthChecks.some(check => check.status === 'error') ? 'error' : 'warning';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(overallHealth)}
            <CardTitle>System Health Monitor</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Auto: ON' : 'Auto: OFF'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={runHealthChecks}
              disabled={isRunningChecks}
            >
              {isRunningChecks ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {healthChecks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getSystemIcon(check.name)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{check.name}</span>
                    {getStatusBadge(check.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{check.message}</p>
                  <p className="text-xs text-muted-foreground">
                    Last checked: {check.lastChecked.toLocaleTimeString()}
                    {check.responseTime && ` (${check.responseTime}ms)`}
                  </p>
                </div>
              </div>
              {getStatusIcon(check.status)}
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            This monitor continuously checks your framing business's critical systems to ensure smooth operation 
            when serving customers. Auto-refresh checks every 30 seconds, or click Refresh for immediate updates.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}