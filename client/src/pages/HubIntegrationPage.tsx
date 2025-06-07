import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { MaterialOrder, MaterialOrderStatus } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, RefreshCw, ArrowUpDown, CheckCircle, XCircle, AlertCircle, Upload, Download, Database, Settings, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OrderStatusProgress from '@/components/OrderStatusProgress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import HubConnectionStatus from '@/components/HubConnectionStatus';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// Status badge colors
const getHubSyncStatusColor = (status: string) => {
  switch (status) {
    case 'synced': return 'bg-green-500';
    case 'failed': return 'bg-red-500';
    case 'not_synced': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};

export default function HubIntegrationPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<MaterialOrder | null>(null);
  const [isOrderStatusDialogOpen, setIsOrderStatusDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');

  // Kanban app configuration
  const [kanbanApiUrl, setKanbanApiUrl] = useState('');
  const [kanbanApiKey, setKanbanApiKey] = useState('');
  const [isConfiguringKanban, setIsConfiguringKanban] = useState(false);
  const [kanbanStatus, setKanbanStatus] = useState<string>('not_configured');

  // Fetch all material orders with Hub sync status
  const { data: materialOrders, isLoading, isError, error } = useQuery<MaterialOrder[]>({
    queryKey: ['/api/hub/material-orders'],
    queryFn: () => apiRequest('GET', '/api/hub/material-orders').then(res => res.json()),
  });

  // Sync a specific material order with the Hub
  const syncOrderMutation = useMutation({
    mutationFn: (orderId: number) => 
      apiRequest('POST', `/api/hub/material-orders/${orderId}/sync`).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hub/material-orders'] });
      toast({
        title: 'Order synced with Jays Frames Hub',
        description: 'The material order has been successfully synced with the Hub',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Sync failed',
        description: error.message || 'Failed to sync order with Jays Frames Hub',
        variant: 'destructive',
      });
    }
  });

  // Sync all pending material orders with the Hub
  const syncAllOrdersMutation = useMutation({
    mutationFn: () => 
      apiRequest('POST', '/api/hub/material-orders/sync-all').then(res => res.json()),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/hub/material-orders'] });
      toast({
        title: 'Bulk sync completed',
        description: `Successfully synced ${data.succeeded} out of ${data.total} orders with the Hub`,
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Bulk sync failed',
        description: error.message || 'Failed to sync orders with Jays Frames Hub',
        variant: 'destructive',
      });
    }
  });

  // Get the status of a specific material order from the Hub
  const getOrderStatusMutation = useMutation({
    mutationFn: (orderId: number) => 
      apiRequest('GET', `/api/hub/material-orders/${orderId}/status`).then(res => res.json()),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/hub/material-orders'] });
      if (data.order) {
        setSelectedOrder(data.order);
        setIsOrderStatusDialogOpen(true);
      }
      toast({
        title: 'Status updated',
        description: 'The latest status has been retrieved from Jays Frames Hub',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Status update failed',
        description: error.message || 'Failed to get order status from Jays Frames Hub',
        variant: 'destructive',
      });
    }
  });

  const generateHubApiKey = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/admin/generate-hub-key', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate API key');
      }

      const data = await response.json();
      if (data.success) {
        setApiKey(data.apiKey);
        toast({
          title: "API Key Generated",
          description: "Your Hub API key has been generated successfully.",
        });
      } else {
        throw new Error(data.error || 'Failed to generate API key');
      }
    } catch (error: any) {
      console.error('Error generating API key:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate API key",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const configureKanbanConnection = async () => {
    if (!kanbanApiUrl || !kanbanApiKey) {
      toast({
        title: "Configuration Error",
        description: "Please provide both Kanban API URL and API Key",
        variant: "destructive",
      });
      return;
    }

    setIsConfiguringKanban(true);
    try {
      const response = await fetch('/api/integration/configure-kanban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kanbanApiUrl,
          kanbanApiKey,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to configure Kanban connection');
      }

      const data = await response.json();
      if (data.success) {
        setKanbanStatus('connected');
        toast({
          title: "Kanban Connected",
          description: "Successfully connected to Kanban app for order fetching.",
        });
      } else {
        throw new Error(data.error || 'Failed to configure Kanban connection');
      }
    } catch (error: any) {
      console.error('Error configuring Kanban:', error);
      setKanbanStatus('error');
      toast({
        title: "Configuration Failed",
        description: error.message || "Failed to configure Kanban connection",
        variant: "destructive",
      });
    } finally {
      setIsConfiguringKanban(false);
    }
  };

  // Filter orders based on selected tab
  const getFilteredOrders = () => {
    if (!materialOrders) return [];

    switch (selectedTab) {
      case 'not_synced':
        return materialOrders.filter(order => !order.hubOrderId || order.hubSyncStatus === 'not_synced');
      case 'synced':
        return materialOrders.filter(order => order.hubSyncStatus === 'synced');
      case 'failed':
        return materialOrders.filter(order => order.hubSyncStatus === 'failed');
      case 'pending':
        return materialOrders.filter(order => order.status === 'pending');
      default:
        return materialOrders;
    }
  };

  const filteredOrders = getFilteredOrders();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading Hub integration data...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading data</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load material orders'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Jays Frames Hub Integration</h1>
          <p className="text-muted-foreground">
            Manage material orders integration with Jays Frames Hub. This POS system automatically synchronizes
            orders, inventory, and statuses with the Hub.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/hub/material-orders'] });
              setRefreshTrigger(prev => prev + 1);
            }}
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button 
            onClick={() => syncAllOrdersMutation.mutate()}
            disabled={syncAllOrdersMutation.isPending || !materialOrders?.some(order => !order.hubOrderId || order.hubSyncStatus === 'not_synced')}
          >
            {syncAllOrdersMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Sync All Pending Orders
          </Button>
        </div>
      </div>

      {/* Connection Status Card */}
      <div className="mb-6">
        <HubConnectionStatus refreshTrigger={refreshTrigger} />
      </div>

      <Tabs defaultValue="all" className="mb-6" onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-md mb-2">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="not_synced">Not Synced</TabsTrigger>
          <TabsTrigger value="synced">Synced</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab}>
          <Card>
            <CardHeader>
              <CardTitle>Material Orders {selectedTab !== 'all' && `- ${selectedTab.replace('_', ' ')}`}</CardTitle>
              <CardDescription>
                {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No material orders found with the selected filter.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Hub Status</TableHead>
                      <TableHead>Last Synced</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{order.materialName}</span>
                            <span className="text-xs text-muted-foreground">{order.materialType} - {order.materialId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`px-2 ${getStatusBadgeColor(order.status)}`}>
                            {formatStatus(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`px-2 ${getHubSyncStatusColor(order.hubSyncStatus || 'not_synced')}`}>
                            {order.hubSyncStatus ? order.hubSyncStatus.replace('_', ' ') : 'Not Synced'}
                          </Badge>
                          {order.hubOrderId && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Hub ID: {order.hubOrderId}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {order.hubLastSyncDate ? new Date(order.hubLastSyncDate).toLocaleString() : 'Never'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => getOrderStatusMutation.mutate(order.id)}
                              disabled={getOrderStatusMutation.isPending || !order.hubOrderId}
                              title={order.hubOrderId ? "Check status from Hub" : "Order not yet synced with Hub"}
                            >
                              {getOrderStatusMutation.isPending && getOrderStatusMutation.variables === order.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => syncOrderMutation.mutate(order.id)}
                              disabled={syncOrderMutation.isPending}
                            >
                              {syncOrderMutation.isPending && syncOrderMutation.variables === order.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Status Dialog */}
      <Dialog open={isOrderStatusDialogOpen} onOpenChange={setIsOrderStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Material Order Status</DialogTitle>
            <DialogDescription>
              Current status information from Jays Frames Hub
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="py-4">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Order ID:</span>
                <span>{selectedOrder.id}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Material:</span>
                <span>{selectedOrder.materialName}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Hub Order ID:</span>
                <span>{selectedOrder.hubOrderId || 'Not synced'}</span>
              </div>
              <Separator className="my-4" />

              <div className="mb-4">
                <OrderStatusProgress status={selectedOrder.status as MaterialOrderStatus} />
              </div>

              <div className="flex justify-between mb-2">
                <span className="font-medium">Status:</span>
                <Badge variant="outline" className={`px-2 ${getStatusBadgeColor(selectedOrder.status)}`}>
                  {formatStatus(selectedOrder.status)}
                </Badge>
              </div>
              {selectedOrder.expectedArrival && (
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Expected Arrival:</span>
                  <span>{new Date(selectedOrder.expectedArrival).toLocaleDateString()}</span>
                </div>
              )}
              {selectedOrder.hubTrackingInfo && (
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Tracking:</span>
                  <span>{selectedOrder.hubTrackingInfo}</span>
                </div>
              )}
              {selectedOrder.hubSupplierNotes && (
                <div className="mb-2">
                  <span className="font-medium">Supplier Notes:</span>
                  <p className="mt-1 text-sm bg-muted p-2 rounded">
                    {selectedOrder.hubSupplierNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

        {/* Kanban App Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Kanban App Integration
          </CardTitle>
          <CardDescription>
            Connect to your external Kanban app to fetch real-world orders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kanban-url">Kanban API URL</Label>
              <Input
                id="kanban-url"
                value={kanbanApiUrl}
                onChange={(e) => setKanbanApiUrl(e.target.value)}
                placeholder="https://your-kanban-app.replit.app"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kanban-key">Kanban API Key</Label>
              <Input
                id="kanban-key"
                type="password"
                value={kanbanApiKey}
                onChange={(e) => setKanbanApiKey(e.target.value)}
                placeholder="Enter Kanban API key"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={kanbanStatus === 'connected' ? 'default' : kanbanStatus === 'error' ? 'destructive' : 'secondary'}>
                {kanbanStatus === 'connected' ? 'Connected' : kanbanStatus === 'error' ? 'Error' : 'Not Configured'}
              </Badge>
              {kanbanStatus === 'connected' && (
                <span className="text-sm text-muted-foreground">Orders will be fetched from Kanban app</span>
              )}
            </div>

            <Button 
              onClick={configureKanbanConnection}
              disabled={isConfiguringKanban || !kanbanApiUrl || !kanbanApiKey}
            >
              {isConfiguringKanban ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Configuring...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Connection
                </>
              )}
            </Button>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Kanban Integration</AlertTitle>
            <AlertDescription>
              When configured, the system will automatically fetch orders from your Kanban app instead of using local storage. 
              This allows you to see real-world production orders in the system.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500';
    case 'processed':
      return 'bg-blue-500';
    case 'ordered':
      return 'bg-purple-500';
    case 'arrived':
      return 'bg-indigo-500';
    case 'frame_cut':
      return 'bg-teal-500';
    case 'mat_cut':
      return 'bg-cyan-500';
    case 'prepped':
      return 'bg-lime-500';
    case 'completed':
      return 'bg-green-500';
    case 'delayed':
      return 'bg-orange-500';
    case 'canceled':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

function formatStatus(status: string) {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}