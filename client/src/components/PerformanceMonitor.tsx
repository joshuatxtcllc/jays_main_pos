import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Clock, 
  Cpu, 
  Database, 
  Globe, 
  MemoryStick, 
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Monitor,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface PerformanceMetrics {
  // Core Web Vitals
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  
  // JavaScript Performance
  jsHeapUsed: number;
  jsHeapTotal: number;
  jsHeapLimit: number;
  
  // Network Performance
  connectionType: string;
  downlink: number;
  effectiveType: string;
  
  // Custom App Metrics
  renderTime: number;
  apiResponseTime: number;
  databaseConnectivity: 'good' | 'slow' | 'poor';
  frameRate: number;
  
  // Resource Loading
  resourceCount: number;
  totalResourceSize: number;
  
  // User Experience
  timeToInteractive: number;
  pageLoadTime: number;
}

interface PerformanceMonitorProps {
  isMinimized?: boolean;
  onToggle?: () => void;
}

export function PerformanceMonitor({ isMinimized = false, onToggle }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [history, setHistory] = useState<PerformanceMetrics[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();
  const renderStartTime = useRef(performance.now());

  // Collect performance metrics
  const collectMetrics = async (): Promise<PerformanceMetrics> => {
    const startTime = performance.now();
    
    // Core Web Vitals
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    const fidEntries = performance.getEntriesByType('first-input');
    const clsEntries = performance.getEntriesByType('layout-shift');
    
    // JavaScript Memory
    const memoryInfo = (performance as any).memory || {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0
    };

    // Network Information
    const connection = (navigator as any).connection || {
      effectiveType: '4g',
      downlink: 10,
      type: 'unknown'
    };

    // Test API Response Time
    let apiResponseTime = 0;
    try {
      const apiStart = performance.now();
      await fetch('/api/health');
      apiResponseTime = performance.now() - apiStart;
    } catch (error) {
      apiResponseTime = -1; // Error state
    }

    // Calculate render time
    const renderTime = performance.now() - renderStartTime.current;

    // Resource Performance
    const resources = performance.getEntriesByType('resource');
    const totalResourceSize = resources.reduce((sum, resource: any) => {
      return sum + (resource.transferSize || 0);
    }, 0);

    // Frame Rate Calculation (approximate)
    let frameRate = 60; // Default assumption
    if ('requestIdleCallback' in window) {
      const frameStart = performance.now();
      requestAnimationFrame(() => {
        const frameDuration = performance.now() - frameStart;
        frameRate = Math.round(1000 / frameDuration);
      });
    }

    return {
      largestContentfulPaint: lcpEntries.length > 0 ? (lcpEntries[lcpEntries.length - 1] as any).startTime : 0,
      firstInputDelay: fidEntries.length > 0 ? (fidEntries[0] as any).processingStart - (fidEntries[0] as any).startTime : 0,
      cumulativeLayoutShift: clsEntries.reduce((sum, entry: any) => sum + entry.value, 0),
      
      jsHeapUsed: memoryInfo.usedJSHeapSize / 1024 / 1024, // MB
      jsHeapTotal: memoryInfo.totalJSHeapSize / 1024 / 1024, // MB
      jsHeapLimit: memoryInfo.jsHeapSizeLimit / 1024 / 1024, // MB
      
      connectionType: connection.type || 'unknown',
      downlink: connection.downlink || 0,
      effectiveType: connection.effectiveType || '4g',
      
      renderTime,
      apiResponseTime,
      databaseConnectivity: apiResponseTime < 100 ? 'good' : apiResponseTime < 500 ? 'slow' : 'poor',
      frameRate,
      
      resourceCount: resources.length,
      totalResourceSize: totalResourceSize / 1024 / 1024, // MB
      
      timeToInteractive: performance.now(),
      pageLoadTime: performance.timing ? performance.timing.loadEventEnd - performance.timing.navigationStart : 0
    };
  };

  // Start monitoring
  const startMonitoring = () => {
    setIsCollecting(true);
    
    const collect = async () => {
      try {
        const newMetrics = await collectMetrics();
        setMetrics(newMetrics);
        setHistory(prev => [...prev.slice(-19), newMetrics]); // Keep last 20 readings
      } catch (error) {
        console.error('Performance monitoring error:', error);
      }
    };

    collect(); // Initial collection
    intervalRef.current = setInterval(collect, 2000); // Update every 2 seconds
  };

  // Stop monitoring
  const stopMonitoring = () => {
    setIsCollecting(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Auto-start monitoring
  useEffect(() => {
    startMonitoring();
    return stopMonitoring;
  }, []);

  // Performance status helpers
  const getPerformanceStatus = (metric: string, value: number) => {
    const thresholds = {
      largestContentfulPaint: { good: 2500, poor: 4000 },
      firstInputDelay: { good: 100, poor: 300 },
      cumulativeLayoutShift: { good: 0.1, poor: 0.25 },
      apiResponseTime: { good: 200, poor: 1000 },
      jsHeapUsed: { good: 50, poor: 100 }, // MB
      frameRate: { good: 55, poor: 30 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'unknown';

    if (metric === 'frameRate') {
      return value >= threshold.good ? 'good' : value >= threshold.poor ? 'warning' : 'poor';
    }
    
    return value <= threshold.good ? 'good' : value <= threshold.poor ? 'warning' : 'poor';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'poor': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatMetric = (value: number, unit: string = '') => {
    if (value < 0) return 'Error';
    if (value < 1) return `${value.toFixed(2)}${unit}`;
    if (value < 100) return `${value.toFixed(1)}${unit}`;
    return `${Math.round(value)}${unit}`;
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggle}
          variant="outline"
          size="sm"
          className="bg-background/95 backdrop-blur-sm border shadow-lg"
        >
          <Monitor className="h-4 w-4 mr-2" />
          Performance
          {metrics && (
            <Badge variant="outline" className="ml-2">
              {formatMetric(metrics.apiResponseTime)}ms
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card className="fixed bottom-4 right-4 w-96 z-50 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Performance Monitor
            </span>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <Minimize2 className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-sm text-muted-foreground">Collecting metrics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-[80vh] overflow-y-auto z-50 bg-background/95 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Performance Monitor
            <Badge variant={isCollecting ? "default" : "secondary"} className="ml-2">
              {isCollecting ? "Live" : "Paused"}
            </Badge>
          </span>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={isCollecting ? stopMonitoring : startMonitoring}
            >
              {isCollecting ? "Pause" : "Start"}
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Core Web Vitals */}
        <div>
          <h4 className="text-xs font-semibold mb-2 flex items-center">
            <Zap className="h-3 w-3 mr-1" />
            Core Web Vitals
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center">
                {getStatusIcon(getPerformanceStatus('largestContentfulPaint', metrics.largestContentfulPaint))}
                <span className="ml-1">LCP</span>
              </span>
              <span>{formatMetric(metrics.largestContentfulPaint)}ms</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center">
                {getStatusIcon(getPerformanceStatus('firstInputDelay', metrics.firstInputDelay))}
                <span className="ml-1">FID</span>
              </span>
              <span>{formatMetric(metrics.firstInputDelay)}ms</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center">
                {getStatusIcon(getPerformanceStatus('cumulativeLayoutShift', metrics.cumulativeLayoutShift))}
                <span className="ml-1">CLS</span>
              </span>
              <span>{formatMetric(metrics.cumulativeLayoutShift)}</span>
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        <div>
          <h4 className="text-xs font-semibold mb-2 flex items-center">
            <MemoryStick className="h-3 w-3 mr-1" />
            Memory Usage
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>Heap Used</span>
              <span>{formatMetric(metrics.jsHeapUsed)}MB</span>
            </div>
            <Progress 
              value={(metrics.jsHeapUsed / metrics.jsHeapTotal) * 100} 
              className="h-1"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total: {formatMetric(metrics.jsHeapTotal)}MB</span>
              <span>Limit: {formatMetric(metrics.jsHeapLimit)}MB</span>
            </div>
          </div>
        </div>

        {/* Network & API */}
        <div>
          <h4 className="text-xs font-semibold mb-2 flex items-center">
            <Globe className="h-3 w-3 mr-1" />
            Network & API
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center">
                {getStatusIcon(getPerformanceStatus('apiResponseTime', metrics.apiResponseTime))}
                <span className="ml-1">API Response</span>
              </span>
              <span>{formatMetric(metrics.apiResponseTime)}ms</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span>Connection</span>
              <Badge variant="outline" className="text-xs">
                {metrics.effectiveType.toUpperCase()}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span>Downlink</span>
              <span>{formatMetric(metrics.downlink)} Mbps</span>
            </div>
          </div>
        </div>

        {/* App Performance */}
        <div>
          <h4 className="text-xs font-semibold mb-2 flex items-center">
            <Cpu className="h-3 w-3 mr-1" />
            App Performance
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center">
                {getStatusIcon(getPerformanceStatus('frameRate', metrics.frameRate))}
                <span className="ml-1">Frame Rate</span>
              </span>
              <span>{formatMetric(metrics.frameRate)} FPS</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span>Render Time</span>
              <span>{formatMetric(metrics.renderTime)}ms</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span>Resources</span>
              <span>{metrics.resourceCount} ({formatMetric(metrics.totalResourceSize)}MB)</span>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div>
          <h4 className="text-xs font-semibold mb-2 flex items-center">
            <Database className="h-3 w-3 mr-1" />
            Database
          </h4>
          <div className="flex items-center justify-between text-xs">
            <span>Connectivity</span>
            <Badge 
              variant={
                metrics.databaseConnectivity === 'good' ? 'default' : 
                metrics.databaseConnectivity === 'slow' ? 'secondary' : 'destructive'
              }
            >
              {metrics.databaseConnectivity.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={() => {
              // Clear performance entries
              performance.clearResourceTimings();
              performance.clearMeasures();
              performance.clearMarks();
            }}
          >
            Clear Cache
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={() => {
              // Force garbage collection if available
              if ((window as any).gc) {
                (window as any).gc();
              }
            }}
          >
            Force GC
          </Button>
        </div>
        
        {/* Performance Trend */}
        {history.length > 1 && (
          <div>
            <h4 className="text-xs font-semibold mb-2 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Trend
            </h4>
            <div className="text-xs text-muted-foreground">
              {history.length} readings collected
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}