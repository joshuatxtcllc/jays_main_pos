import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Clock,
  BarChart3,
  Wifi,
  HardDrive,
  Settings,
  X,
  TrendingUp,
  TrendingDown,
  Minus
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
  diskUsage: number;
  bundleSize: number;
  errorCount: number;
  requestsPerMinute: number;
  responseTime: number[];
  memoryHistory: number[];
  cpuHistory: number[];
  networkHistory: number[];
  alerts: PerformanceAlert[];
  uptime: number;
  loadTime: number;
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
  metric: string;
  value: number;
  threshold: number;
}

interface IntuitivePerformanceMonitorProps {
  updateInterval?: number;
  compact?: boolean;
}

export function IntuitivePerformanceMonitor({ 
  updateInterval = 10000,
  compact = false 
}: IntuitivePerformanceMonitorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'alerts'>('overview');
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    memoryLimit: 512,
    apiResponseTime: 0,
    databaseConnected: false,
    frameRate: 60,
    networkLatency: 0,
    lastUpdated: new Date().toLocaleTimeString(),
    cpuUsage: 0,
    activeConnections: 0,
    diskUsage: 0,
    bundleSize: 0,
    errorCount: 0,
    requestsPerMinute: 0,
    responseTime: [],
    memoryHistory: [],
    cpuHistory: [],
    networkHistory: [],
    alerts: [],
    uptime: Date.now(),
    loadTime: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const startTimeRef = useRef(Date.now());
  const requestCountRef = useRef(0);
  const errorCountRef = useRef(0);

  // Alert generation function
  const generateAlert = useCallback((metric: string, value: number, threshold: number, type: 'warning' | 'error' | 'info', message: string): PerformanceAlert => {
    return {
      id: `${metric}-${Date.now()}`,
      type,
      message,
      timestamp: Date.now(),
      metric,
      value,
      threshold
    };
  }, []);

  // Advanced performance data collection
  const collectPerformanceData = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const collectionStart = performance.now();
    
    try {
      // Memory metrics with historical tracking
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0;
      const memoryLimit = memoryInfo ? Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024) : 512;
      
      // Frame rate calculation with smoothing
      const now = performance.now();
      const deltaTime = now - lastFrameTimeRef.current;
      const currentFPS = deltaTime > 0 ? Math.min(60, Math.round(1000 / deltaTime)) : 60;
      lastFrameTimeRef.current = now;

      // Bundle size estimation
      const bundleSize = Math.round(document.documentElement.outerHTML.length / 1024);
      
      // Load time calculation
      const loadTime = Math.round(now - startTimeRef.current);
      
      // Uptime calculation
      const uptime = Math.round((Date.now() - startTimeRef.current) / 1000);

      // API health check with comprehensive metrics
      const apiStart = performance.now();
      let apiResponseTime = 0;
      let databaseConnected = false;
      
      try {
        requestCountRef.current++;
        const response = await fetch('/api/kanban/status', {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        apiResponseTime = Math.round(performance.now() - apiStart);
        databaseConnected = response.ok;
        
        if (!response.ok) {
          errorCountRef.current++;
        }
      } catch (error) {
        errorCountRef.current++;
        apiResponseTime = 5000;
        databaseConnected = false;
      }

      // Network latency with multiple endpoint testing
      const networkTests = [
        { endpoint: '/api/frames', timeout: 2000 },
        { endpoint: '/api/auth/status', timeout: 2000 }
      ];
      
      const networkResults = await Promise.allSettled(
        networkTests.map(async (test) => {
          const start = performance.now();
          try {
            await fetch(test.endpoint, { 
              method: 'HEAD',
              signal: AbortSignal.timeout(test.timeout)
            });
            return performance.now() - start;
          } catch {
            return test.timeout;
          }
        })
      );
      
      const networkLatency = Math.round(
        networkResults.reduce((sum, result) => 
          sum + (result.status === 'fulfilled' ? result.value : 2000), 0
        ) / networkResults.length
      );

      // Calculate requests per minute
      const requestsPerMinute = Math.round((requestCountRef.current / uptime) * 60);
      
      // CPU usage estimation based on memory and processing time
      const processingTime = performance.now() - collectionStart;
      const cpuUsage = Math.min(100, Math.round(
        (memoryUsage / memoryLimit * 50) + (processingTime > 100 ? 25 : processingTime / 4)
      ));

      // Disk usage estimation (based on bundle size and memory)
      const diskUsage = Math.min(100, Math.round((bundleSize + memoryUsage) / 10));

      setMetrics(prev => {
        // Update historical data (keep last 20 data points)
        const newMemoryHistory = [...prev.memoryHistory, memoryUsage].slice(-20);
        const newCpuHistory = [...prev.cpuHistory, cpuUsage].slice(-20);
        const newNetworkHistory = [...prev.networkHistory, networkLatency].slice(-20);
        const newResponseTime = [...prev.responseTime, apiResponseTime].slice(-20);

        // Generate alerts based on thresholds
        const newAlerts: PerformanceAlert[] = [...prev.alerts];
        
        // Memory alert
        if (memoryUsage > memoryLimit * 0.8) {
          newAlerts.push(generateAlert(
            'memory',
            memoryUsage,
            memoryLimit * 0.8,
            memoryUsage > memoryLimit * 0.9 ? 'error' : 'warning',
            `High memory usage: ${memoryUsage}MB (${Math.round(memoryUsage/memoryLimit*100)}%)`
          ));
        }
        
        // API response time alert
        if (apiResponseTime > 2000) {
          newAlerts.push(generateAlert(
            'api',
            apiResponseTime,
            2000,
            apiResponseTime > 5000 ? 'error' : 'warning',
            `Slow API response: ${apiResponseTime}ms`
          ));
        }
        
        // Network latency alert
        if (networkLatency > 1000) {
          newAlerts.push(generateAlert(
            'network',
            networkLatency,
            1000,
            'warning',
            `High network latency: ${networkLatency}ms`
          ));
        }
        
        // Database connection alert
        if (!databaseConnected) {
          newAlerts.push(generateAlert(
            'database',
            0,
            1,
            'error',
            'Database connection lost'
          ));
        }
        
        // Frame rate alert
        if (currentFPS < 30) {
          newAlerts.push(generateAlert(
            'framerate',
            currentFPS,
            30,
            'warning',
            `Low frame rate: ${currentFPS} FPS`
          ));
        }

        // Keep only recent alerts (last 10)
        const recentAlerts = newAlerts.slice(-10);

        return {
          ...prev,
          memoryUsage,
          memoryLimit,
          apiResponseTime,
          databaseConnected,
          frameRate: currentFPS,
          networkLatency,
          lastUpdated: new Date().toLocaleTimeString(),
          cpuUsage,
          activeConnections: databaseConnected ? 1 : 0,
          diskUsage,
          bundleSize,
          errorCount: errorCountRef.current,
          requestsPerMinute,
          responseTime: newResponseTime,
          memoryHistory: newMemoryHistory,
          cpuHistory: newCpuHistory,
          networkHistory: newNetworkHistory,
          alerts: recentAlerts,
          uptime,
          loadTime
        };
      });
    } catch (error) {
      console.error('Performance monitoring error:', error);
      errorCountRef.current++;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, generateAlert]);

  // Throttled update cycle
  useEffect(() => {
    if (!isExpanded) return;
    
    // Initial collection
    collectPerformanceData();
    
    // Set up interval
    const interval = setInterval(collectPerformanceData, updateInterval);
    
    return () => clearInterval(interval);
  }, [isExpanded, updateInterval, collectPerformanceData]);

  // Enhanced status indicators with trend analysis
  const getMemoryStatus = () => {
    const percentage = (metrics.memoryUsage / metrics.memoryLimit) * 100;
    const trend = getTrend(metrics.memoryHistory);
    if (percentage > 80) return { color: 'destructive', label: 'Critical', trend };
    if (percentage > 60) return { color: 'warning', label: 'High', trend };
    return { color: 'success', label: 'Good', trend };
  };

  const getApiStatus = () => {
    const trend = getTrend(metrics.responseTime);
    if (!metrics.databaseConnected) return { color: 'destructive', label: 'Offline', trend };
    if (metrics.apiResponseTime > 2000) return { color: 'destructive', label: 'Very Slow', trend };
    if (metrics.apiResponseTime > 1000) return { color: 'warning', label: 'Slow', trend };
    return { color: 'success', label: 'Fast', trend };
  };

  const getNetworkStatus = () => {
    const trend = getTrend(metrics.networkHistory);
    if (metrics.networkLatency > 1500) return { color: 'destructive', label: 'Poor', trend };
    if (metrics.networkLatency > 800) return { color: 'warning', label: 'Fair', trend };
    return { color: 'success', label: 'Good', trend };
  };

  const getCpuStatus = () => {
    const trend = getTrend(metrics.cpuHistory);
    if (metrics.cpuUsage > 80) return { color: 'destructive', label: 'High', trend };
    if (metrics.cpuUsage > 60) return { color: 'warning', label: 'Medium', trend };
    return { color: 'success', label: 'Good', trend };
  };

  // Trend analysis helper
  const getTrend = (data: number[]) => {
    if (data.length < 3) return 'stable';
    const recent = data.slice(-3);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const older = data.slice(-6, -3);
    if (older.length === 0) return 'stable';
    const oldAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    if (avg > oldAvg * 1.1) return 'up';
    if (avg < oldAvg * 0.9) return 'down';
    return 'stable';
  };

  // Format uptime display
  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  // Simple chart component for performance history
  const MiniChart = ({ data, color = "#3b82f6" }: { data: number[], color?: string }) => {
    if (data.length < 2) return <div className="h-8 bg-gray-100 rounded"></div>;
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    return (
      <div className="h-8 flex items-end space-x-0.5">
        {data.map((value, index) => {
          const height = ((value - min) / range) * 100;
          return (
            <div
              key={index}
              className="flex-1 rounded-t"
              style={{
                height: `${Math.max(height, 10)}%`,
                backgroundColor: color,
                opacity: 0.7
              }}
            />
          );
        })}
      </div>
    );
  };

  if (compact && !isExpanded) {
    const alertCount = metrics.alerts.filter(alert => alert.type === 'error' || alert.type === 'warning').length;
    
    return (
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="bg-white/95 backdrop-blur-sm border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200 text-gray-800 relative"
        >
          <Activity className="h-4 w-4 mr-2 text-blue-600" />
          <span className="text-xs font-medium text-gray-800">Performance</span>
          {alertCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500 text-white">
              {alertCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <Card className="w-96 bg-white/95 backdrop-blur-sm border-gray-300 shadow-xl max-h-[600px] overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-sm text-gray-800">Performance Monitor</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {metrics.alerts.filter(a => a.type === 'error' || a.type === 'warning').length > 0 && (
                <Badge className="bg-red-500 text-white text-xs">
                  {metrics.alerts.filter(a => a.type === 'error' || a.type === 'warning').length}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mx-4 mb-4">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="detailed" className="text-xs">Detailed</TabsTrigger>
              <TabsTrigger value="alerts" className="text-xs">
                Alerts {metrics.alerts.length > 0 && `(${metrics.alerts.length})`}
              </TabsTrigger>
            </TabsList>

            <div className="px-4 pb-4 max-h-[500px] overflow-y-auto">
              <TabsContent value="overview" className="mt-0 space-y-4">
                {/* System Status Overview */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <Cpu className="h-3 w-3 text-gray-700" />
                        <span className="text-xs font-medium">Memory</span>
                      </div>
                      <Badge variant={getMemoryStatus().color === 'success' ? 'default' : 'destructive'} className="text-xs">
                        {getMemoryStatus().label}
                      </Badge>
                    </div>
                    <Progress value={(metrics.memoryUsage / metrics.memoryLimit) * 100} className="h-2 mb-1" />
                    <div className="text-xs text-gray-600">
                      {metrics.memoryUsage}MB / {metrics.memoryLimit}MB
                    </div>
                    <MiniChart data={metrics.memoryHistory} color="#3b82f6" />
                  </Card>

                  <Card className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-gray-700" />
                        <span className="text-xs font-medium">CPU</span>
                      </div>
                      <Badge variant={getCpuStatus().color === 'success' ? 'default' : 'destructive'} className="text-xs">
                        {getCpuStatus().label}
                      </Badge>
                    </div>
                    <Progress value={metrics.cpuUsage} className="h-2 mb-1" />
                    <div className="text-xs text-gray-600">{metrics.cpuUsage}%</div>
                    <MiniChart data={metrics.cpuHistory} color="#10b981" />
                  </Card>

                  <Card className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <Database className="h-3 w-3 text-gray-700" />
                        <span className="text-xs font-medium">API</span>
                      </div>
                      <Badge variant={getApiStatus().color === 'success' ? 'default' : 'destructive'} className="text-xs">
                        {getApiStatus().label}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      {metrics.apiResponseTime}ms {metrics.databaseConnected ? '✓' : '✗'}
                    </div>
                    <MiniChart data={metrics.responseTime} color="#f59e0b" />
                  </Card>

                  <Card className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <Wifi className="h-3 w-3 text-gray-700" />
                        <span className="text-xs font-medium">Network</span>
                      </div>
                      <Badge variant={getNetworkStatus().color === 'success' ? 'default' : 'destructive'} className="text-xs">
                        {getNetworkStatus().label}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">{metrics.networkLatency}ms</div>
                    <MiniChart data={metrics.networkHistory} color="#8b5cf6" />
                  </Card>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-medium text-gray-800">{formatUptime(metrics.uptime)}</div>
                    <div className="text-gray-600">Uptime</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-medium text-gray-800">{metrics.requestsPerMinute}/min</div>
                    <div className="text-gray-600">Requests</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-medium text-gray-800">{metrics.errorCount}</div>
                    <div className="text-gray-600">Errors</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="detailed" className="mt-0 space-y-4">
                {/* Detailed Metrics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-gray-700" />
                      <span className="text-sm font-medium">Disk Usage</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{metrics.diskUsage}%</div>
                      <Progress value={metrics.diskUsage} className="h-1 w-16" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-gray-700" />
                      <span className="text-sm font-medium">Bundle Size</span>
                    </div>
                    <div className="text-sm font-medium">{metrics.bundleSize}KB</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-gray-700" />
                      <span className="text-sm font-medium">Frame Rate</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{metrics.frameRate} FPS</div>
                      <Badge variant={metrics.frameRate >= 45 ? 'default' : 'destructive'} className="text-xs">
                        {metrics.frameRate >= 45 ? 'Smooth' : 'Choppy'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-700" />
                      <span className="text-sm font-medium">Load Time</span>
                    </div>
                    <div className="text-sm font-medium">{metrics.loadTime}ms</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-700" />
                      <span className="text-sm font-medium">Connections</span>
                    </div>
                    <div className="text-sm font-medium">{metrics.activeConnections}</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="alerts" className="mt-0">
                {metrics.alerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="text-sm">No performance alerts</div>
                    <div className="text-xs">System running smoothly</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {metrics.alerts.slice().reverse().map((alert) => (
                      <div 
                        key={alert.id}
                        className={`p-3 rounded border-l-4 ${
                          alert.type === 'error' ? 'bg-red-50 border-red-400' :
                          alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                          'bg-blue-50 border-blue-400'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {alert.type === 'error' ? 
                              <AlertCircle className="h-4 w-4 text-red-600" /> :
                              alert.type === 'warning' ?
                              <AlertCircle className="h-4 w-4 text-yellow-600" /> :
                              <CheckCircle className="h-4 w-4 text-blue-600" />
                            }
                            <div>
                              <div className="text-sm font-medium">{alert.message}</div>
                              <div className="text-xs text-gray-600">
                                {new Date(alert.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {alert.metric}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>

          {/* Footer */}
          <div className="px-4 py-2 border-t bg-gray-50/50 flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Updated: {metrics.lastUpdated}</span>
            </div>
            {isLoading && (
              <div className="flex items-center gap-1">
                <div className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full"></div>
                <span>Refreshing...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}