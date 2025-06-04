import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Cpu, 
  Database, 
  Globe, 
  Monitor, 
  Zap,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface PerformanceMetrics {
  memoryUsage: number;
  memoryLimit: number;
  apiResponseTime: number;
  databaseConnected: boolean;
  frameRate: number;
  networkLatency: number;
  lastUpdated: string;
  cpuUsage: number;
  activeConnections: number;
}

interface IntuitivePerformanceMonitorProps {
  updateInterval?: number;
  compact?: boolean;
}

export function IntuitivePerformanceMonitor({ 
  updateInterval = 5000,
  compact = false 
}: IntuitivePerformanceMonitorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    memoryLimit: 512,
    apiResponseTime: 0,
    databaseConnected: false,
    frameRate: 60,
    networkLatency: 0,
    lastUpdated: new Date().toLocaleTimeString(),
    cpuUsage: 0,
    activeConnections: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());

  // Optimized performance data collection
  const collectPerformanceData = useCallback(async () => {
    if (isLoading) return; // Prevent overlapping requests
    
    setIsLoading(true);
    
    try {
      // Memory usage
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0;
      
      // Frame rate calculation (simplified)
      const now = performance.now();
      const deltaTime = now - lastFrameTimeRef.current;
      const currentFPS = deltaTime > 0 ? Math.min(60, Math.round(1000 / deltaTime)) : 60;
      lastFrameTimeRef.current = now;

      // API health check with timeout
      const startTime = performance.now();
      let apiResponseTime = 0;
      let databaseConnected = false;
      
      try {
        const response = await fetch('/api/health', {
          method: 'GET',
          signal: AbortSignal.timeout(3000) // 3 second timeout
        });
        apiResponseTime = Math.round(performance.now() - startTime);
        databaseConnected = response.ok;
      } catch (error) {
        console.warn('Health check failed:', error);
        apiResponseTime = 3000; // Timeout value
        databaseConnected = false;
      }

      // Network latency estimation
      const networkStart = performance.now();
      try {
        await fetch('/api/kanban/status', { 
          method: 'HEAD',
          signal: AbortSignal.timeout(2000)
        });
        const networkLatency = Math.round(performance.now() - networkStart);
        
        setMetrics(prev => ({
          ...prev,
          memoryUsage,
          apiResponseTime,
          databaseConnected,
          frameRate: currentFPS,
          networkLatency,
          lastUpdated: new Date().toLocaleTimeString(),
          cpuUsage: Math.min(100, Math.round(memoryUsage / 4)), // Estimated CPU based on memory
          activeConnections: databaseConnected ? 1 : 0
        }));
      } catch (error) {
        // Fallback for network latency
        setMetrics(prev => ({
          ...prev,
          memoryUsage,
          apiResponseTime,
          databaseConnected,
          frameRate: currentFPS,
          networkLatency: 2000,
          lastUpdated: new Date().toLocaleTimeString(),
          cpuUsage: Math.min(100, Math.round(memoryUsage / 4)),
          activeConnections: databaseConnected ? 1 : 0
        }));
      }
    } catch (error) {
      console.error('Performance monitoring error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Throttled update cycle
  useEffect(() => {
    if (!isExpanded) return;
    
    // Initial collection
    collectPerformanceData();
    
    // Set up interval
    const interval = setInterval(collectPerformanceData, updateInterval);
    
    return () => clearInterval(interval);
  }, [isExpanded, updateInterval, collectPerformanceData]);

  // Performance status indicators
  const getMemoryStatus = () => {
    const percentage = (metrics.memoryUsage / metrics.memoryLimit) * 100;
    if (percentage > 80) return { color: 'destructive', label: 'High' };
    if (percentage > 60) return { color: 'warning', label: 'Medium' };
    return { color: 'success', label: 'Good' };
  };

  const getApiStatus = () => {
    if (!metrics.databaseConnected) return { color: 'destructive', label: 'Offline' };
    if (metrics.apiResponseTime > 1000) return { color: 'warning', label: 'Slow' };
    return { color: 'success', label: 'Fast' };
  };

  const getNetworkStatus = () => {
    if (metrics.networkLatency > 1000) return { color: 'destructive', label: 'Poor' };
    if (metrics.networkLatency > 500) return { color: 'warning', label: 'Fair' };
    return { color: 'success', label: 'Good' };
  };

  if (compact && !isExpanded) {
    return (
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="bg-white/95 backdrop-blur-sm border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200 text-gray-800"
        >
          <Activity className="h-4 w-4 mr-2 text-blue-600" />
          <span className="text-xs font-medium text-gray-800">Performance</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <Card className="w-80 bg-white/95 backdrop-blur-sm border-gray-300 shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-sm text-gray-800">Performance Monitor</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>

          {isExpanded && (
            <div className="space-y-3">
              {/* Memory Usage */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Cpu className="h-3 w-3 text-gray-700" />
                    <span className="text-gray-800 font-medium">Memory</span>
                  </div>
                  <Badge variant={getMemoryStatus().color === 'success' ? 'default' : 'destructive'} className="text-xs">
                    {getMemoryStatus().label}
                  </Badge>
                </div>
                <Progress 
                  value={(metrics.memoryUsage / metrics.memoryLimit) * 100} 
                  className="h-2"
                />
                <div className="text-xs text-gray-700 font-medium">
                  {metrics.memoryUsage}MB / {metrics.memoryLimit}MB
                </div>
              </div>

              {/* API Response Time */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Database className="h-3 w-3 text-gray-700" />
                    <span className="text-gray-800 font-medium">API Response</span>
                  </div>
                  <Badge variant={getApiStatus().color === 'success' ? 'default' : 'destructive'} className="text-xs">
                    {getApiStatus().label}
                  </Badge>
                </div>
                <div className="text-xs text-gray-700 font-medium">
                  {metrics.apiResponseTime}ms {metrics.databaseConnected ? '✓' : '✗'}
                </div>
              </div>

              {/* Network Performance */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3 text-gray-700" />
                    <span className="text-gray-800 font-medium">Network</span>
                  </div>
                  <Badge variant={getNetworkStatus().color === 'success' ? 'default' : 'destructive'} className="text-xs">
                    {getNetworkStatus().label}
                  </Badge>
                </div>
                <div className="text-xs text-gray-700 font-medium">
                  Latency: {metrics.networkLatency}ms
                </div>
              </div>

              {/* Frame Rate */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Monitor className="h-3 w-3 text-gray-700" />
                    <span className="text-gray-800 font-medium">Frame Rate</span>
                  </div>
                  <Badge variant={metrics.frameRate >= 45 ? 'default' : 'destructive'} className="text-xs">
                    {metrics.frameRate >= 45 ? 'Smooth' : 'Choppy'}
                  </Badge>
                </div>
                <div className="text-xs text-gray-700 font-medium">
                  {metrics.frameRate} FPS
                </div>
              </div>

              {/* Last Updated */}
              <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-200">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-600" />
                  <span className="font-medium">Updated: {metrics.lastUpdated}</span>
                </div>
                {isLoading && (
                  <div className="flex items-center gap-1">
                    <div className="animate-spin h-2 w-2 border border-blue-600 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isExpanded && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${metrics.databaseConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{metrics.memoryUsage}MB</span>
                <span>{metrics.apiResponseTime}ms</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}