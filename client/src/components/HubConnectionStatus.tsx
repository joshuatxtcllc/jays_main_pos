import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Globe, Server, AlertTriangle, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link } from 'wouter';

interface ConnectionStatusProps {
  refreshTrigger?: number;
}

export default function HubConnectionStatus({ refreshTrigger = 0 }: ConnectionStatusProps) {
  const { toast } = useToast();
  const [autoSync, setAutoSync] = useState(false);
  
  // Mock API endpoint to check hub connection status
  const { data: connectionStatus, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/hub/connection-status', refreshTrigger],
    queryFn: async () => {
      try {
        // This would be a real API call in production
        // return apiRequest('GET', '/api/hub/connection-status').then(res => res.json());
        
        // For demo purposes, simulate an API response
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (process.env.HUB_API_KEY) {
          return {
            connected: true,
            apiVersion: '1.2.3',
            lastChecked: new Date().toISOString(),
            hubName: 'Jays Frames Hub Production'
          };
        } else {
          return {
            connected: false,
            error: 'Missing HUB_API_KEY environment variable',
            lastChecked: new Date().toISOString()
          };
        }
      } catch (error) {
        throw new Error('Failed to check connection status');
      }
    },
    refetchInterval: autoSync ? 60000 : false, // Auto refresh every minute if enabled
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      // This would be a real API call in production
      // return apiRequest('POST', '/api/hub/test-connection').then(res => res.json());
      
      // For demo purposes, simulate an API test
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (process.env.HUB_API_KEY) {
        return { success: true, message: 'Connection successful' };
      } else {
        throw new Error('Connection failed: API key not found');
      }
    },
    onSuccess: () => {
      toast({
        title: 'Connection Test Successful',
        description: 'Successfully connected to Jays Frames Hub',
        variant: 'default',
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Connection Test Failed',
        description: error.message || 'Failed to connect to Jays Frames Hub',
        variant: 'destructive',
      });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="mr-2 h-5 w-5" />
          Hub Connection Status
        </CardTitle>
        <CardDescription>
          Connection information for Jays Frames Hub integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              Failed to check Hub connection status. Please try again.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Connection Status:</span>
              {connectionStatus?.connected ? (
                <Badge className="bg-green-500">Connected</Badge>
              ) : (
                <Badge className="bg-red-500">Disconnected</Badge>
              )}
            </div>
            
            {connectionStatus?.connected ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Hub Name:</span>
                  <span>{connectionStatus.hubName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">API Version:</span>
                  <span>{connectionStatus.apiVersion}</span>
                </div>
              </>
            ) : (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Connection Issue</AlertTitle>
                <AlertDescription>
                  {connectionStatus?.error || "Failed to connect to Jays Frames Hub. Please check your API credentials."}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Last Checked:</span>
              <span>
                {connectionStatus?.lastChecked 
                  ? new Date(connectionStatus.lastChecked).toLocaleString() 
                  : 'Never'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-sync"
                checked={autoSync}
                onCheckedChange={setAutoSync}
              />
              <Label htmlFor="auto-sync">Auto-refresh connection status</Label>
            </div>
            
            <div className="mt-4 p-3 bg-muted rounded-md">
              <h4 className="font-medium mb-1">System Integration Info</h4>
              <p className="text-sm text-muted-foreground mb-2">
                This POS system functions as part of the Hub ecosystem, handling customer orders and inventory management.
              </p>
              <div className="flex flex-col space-y-1">
                <div className="text-sm"><span className="font-medium">POS Role:</span> Primary point of sale and custom framing calculation engine</div>
                <div className="text-sm"><span className="font-medium">Production Link:</span> <Link to="/production" className="text-primary hover:underline">Production Kanban</Link> connects directly to Hub's production system</div>
                <div className="text-sm"><span className="font-medium">Materials Link:</span> <Link to="/materials" className="text-primary hover:underline">Materials Page</Link> syncs with Hub's inventory management</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => refetch()}>
          <Server className="mr-2 h-4 w-4" />
          Refresh Status
        </Button>
        <Button 
          onClick={() => testConnectionMutation.mutate()} 
          disabled={testConnectionMutation.isPending}
        >
          {testConnectionMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          Test Connection
        </Button>
      </CardFooter>
    </Card>
  );
}