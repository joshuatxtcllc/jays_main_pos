
import React, { useState, useEffect } from 'react';
import { getIntegrationStatus, generateApiKey, testWebhook, getWebhookEndpoints, createWebhookEndpoint, deleteWebhookEndpoint, getIntegrationDocs } from '@/services/integrationService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Check, Copy, ExternalLink, Plus, RefreshCw, Trash2, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface WebhookEndpoint {
  id: number;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
  failCount?: number;
}

interface ApiKeyInfo {
  key: string;
  createdAt: string;
  lastUsed?: string;
}

export default function WebhookIntegrationPage() {
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState<ApiKeyInfo | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookName, setWebhookName] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['order.created']);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('webhooks');
  
  // Fetch integration status and API key
  const { data: integrationStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/admin/integration-status'],
    queryFn: getIntegrationStatus,
  });
  
  // Fetch webhook endpoints
  const { data: webhookEndpoints, isLoading: endpointsLoading } = useQuery({
    queryKey: ['/api/webhooks'],
    queryFn: getWebhookEndpoints,
  });
  
  // Fetch API documentation
  const { data: apiDocs, isLoading: docsLoading } = useQuery({
    queryKey: ['/api/admin/integration-docs'],
    queryFn: getIntegrationDocs,
  });
  
  // Generate new API Key
  const generateKeyMutation = useMutation({
    mutationFn: generateApiKey,
    onSuccess: (data) => {
      setApiKey(data);
      toast({
        title: "API Key Generated",
        description: "Your new API key has been created. Make sure to save it securely.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Generating API Key",
        description: error.message || "Failed to generate API key",
        variant: "destructive",
      });
    }
  });
  
  // Test webhook endpoint
  const testWebhookMutation = useMutation({
    mutationFn: (url: string) => testWebhook(url),
    onSuccess: () => {
      toast({
        title: "Webhook Test Success",
        description: "The webhook endpoint responded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Webhook Test Failed",
        description: error.message || "Failed to test webhook",
        variant: "destructive",
      });
    }
  });
  
  // Create webhook endpoint
  const createWebhookMutation = useMutation({
    mutationFn: (data: { name: string, url: string, events: string[] }) => createWebhookEndpoint(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
      toast({
        title: "Webhook Created",
        description: "Your webhook endpoint has been created successfully.",
      });
      setWebhookUrl('');
      setWebhookName('');
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Webhook",
        description: error.message || "Failed to create webhook endpoint",
        variant: "destructive",
      });
    }
  });
  
  // Delete webhook endpoint
  const deleteWebhookMutation = useMutation({
    mutationFn: (id: number) => deleteWebhookEndpoint(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
      toast({
        title: "Webhook Deleted",
        description: "The webhook endpoint has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Webhook",
        description: error.message || "Failed to delete webhook endpoint",
        variant: "destructive",
      });
    }
  });
  
  // Effect to load API key from integration status
  useEffect(() => {
    if (integrationStatus?.apiKey) {
      setApiKey(integrationStatus.apiKey);
    }
  }, [integrationStatus]);
  
  // Copy API key to clipboard
  const copyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // Handle webhook creation
  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl || !webhookName) {
      toast({
        title: "Missing Information",
        description: "Please provide both a name and URL for the webhook.",
        variant: "destructive",
      });
      return;
    }
    
    createWebhookMutation.mutate({
      name: webhookName,
      url: webhookUrl,
      events: selectedEvents
    });
  };
  
  // Toggle event selection
  const toggleEvent = (event: string) => {
    setSelectedEvents(prev => 
      prev.includes(event) 
        ? prev.filter(e => e !== event) 
        : [...prev, event]
    );
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">API & Webhook Integration</h1>
      <p className="text-gray-500 mb-8">
        Configure API access and webhook endpoints to integrate with external systems.
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>
        
        {/* Webhooks Tab */}
        <TabsContent value="webhooks">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Endpoints</CardTitle>
                <CardDescription>
                  Configure webhook endpoints to receive notifications from Jay's Frames.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {endpointsLoading ? (
                  <div className="py-4 text-center">Loading webhook endpoints...</div>
                ) : webhookEndpoints && webhookEndpoints.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {webhookEndpoints.map((endpoint: WebhookEndpoint) => (
                        <TableRow key={endpoint.id}>
                          <TableCell>
                            <div className="font-medium">{endpoint.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-[200px]">{endpoint.url}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={endpoint.active ? "success" : "secondary"}>
                              {endpoint.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => testWebhookMutation.mutate(endpoint.url)}
                            >
                              Test
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteWebhookMutation.mutate(endpoint.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-4 text-center">
                    No webhook endpoints configured. Add one below.
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <form onSubmit={handleCreateWebhook}>
                <CardHeader>
                  <CardTitle>Add New Webhook</CardTitle>
                  <CardDescription>
                    Create a new webhook endpoint to receive event notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhookName">Webhook Name</Label>
                    <Input
                      id="webhookName"
                      placeholder="My Application Webhook"
                      value={webhookName}
                      onChange={(e) => setWebhookName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      placeholder="https://example.com/webhook"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Events to Subscribe</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['order.created', 'order.updated', 'order.completed', 'payment.received', 'material.ordered', 'material.arrived'].map(event => (
                        <div key={event} className="flex items-center space-x-2">
                          <Switch
                            id={`event-${event}`}
                            checked={selectedEvents.includes(event)}
                            onCheckedChange={() => toggleEvent(event)}
                          />
                          <Label htmlFor={`event-${event}`}>{event}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={() => testWebhookMutation.mutate(webhookUrl)}>
                    Test Endpoint
                  </Button>
                  <Button type="submit">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Webhook
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </TabsContent>
        
        {/* API Keys Tab */}
        <TabsContent value="api-keys">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Generate and manage API keys for external applications to authenticate with Jay's Frames API.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiKey ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">Your API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="apiKey"
                        value={apiKey.key}
                        readOnly
                        type="password"
                      />
                      <Button variant="outline" onClick={copyApiKey}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(apiKey.createdAt).toLocaleString()}
                      {apiKey.lastUsed && ` • Last used: ${new Date(apiKey.lastUsed).toLocaleString()}`}
                    </p>
                  </div>
                  <div className="pt-2 pb-2">
                    <p className="text-sm text-gray-500">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      For security reasons, the API key is only shown once when generated. Store it securely.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">No API key has been generated yet.</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => generateKeyMutation.mutate()} className="w-full">
                {apiKey ? "Regenerate API Key" : "Generate New API Key"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Documentation Tab */}
        <TabsContent value="documentation">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                Reference documentation for the Jay's Frames API and webhook events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {docsLoading ? (
                <div className="py-4 text-center">Loading documentation...</div>
              ) : (
                <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">Authentication</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        All API requests require authentication using an API key in the request header.
                      </p>
                      <div className="mt-2 p-3 bg-gray-100 rounded-md">
                        <code className="text-sm">Authorization: Bearer YOUR_API_KEY</code>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Endpoints</h3>
                      <div className="mt-2 space-y-4">
                        <div>
                          <h4 className="font-medium">Orders</h4>
                          <div className="mt-1 space-y-2">
                            <div className="p-2 bg-gray-100 rounded-md">
                              <div className="font-medium">GET /api/integration/orders</div>
                              <div className="text-sm text-gray-500">Get all orders with QR codes</div>
                            </div>
                            <div className="p-2 bg-gray-100 rounded-md">
                              <div className="font-medium">GET /api/integration/orders/:id</div>
                              <div className="text-sm text-gray-500">Get order information with QR code</div>
                            </div>
                            <div className="p-2 bg-gray-100 rounded-md">
                              <div className="font-medium">PATCH /api/integration/orders/:id/status</div>
                              <div className="text-sm text-gray-500">Update order status from external system</div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium">Webhooks</h4>
                          <div className="mt-1 space-y-2">
                            <div className="p-2 bg-gray-100 rounded-md">
                              <div className="font-medium">POST /api/integration/webhook</div>
                              <div className="text-sm text-gray-500">Receive webhook notifications from external systems</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Webhook Events</h3>
                      <div className="mt-2 space-y-2">
                        <div className="p-2 bg-gray-100 rounded-md">
                          <div className="font-medium">order.created</div>
                          <div className="text-sm text-gray-500">Triggered when a new order is created</div>
                        </div>
                        <div className="p-2 bg-gray-100 rounded-md">
                          <div className="font-medium">order.updated</div>
                          <div className="text-sm text-gray-500">Triggered when an order is updated</div>
                        </div>
                        <div className="p-2 bg-gray-100 rounded-md">
                          <div className="font-medium">order.completed</div>
                          <div className="text-sm text-gray-500">Triggered when an order is marked as completed</div>
                        </div>
                        <div className="p-2 bg-gray-100 rounded-md">
                          <div className="font-medium">payment.received</div>
                          <div className="text-sm text-gray-500">Triggered when a payment is received</div>
                        </div>
                        <div className="p-2 bg-gray-100 rounded-md">
                          <div className="font-medium">material.ordered</div>
                          <div className="text-sm text-gray-500">Triggered when materials are ordered</div>
                        </div>
                        <div className="p-2 bg-gray-100 rounded-md">
                          <div className="font-medium">material.arrived</div>
                          <div className="text-sm text-gray-500">Triggered when ordered materials arrive</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
            <CardFooter>
              <a 
                href="https://docs.jaysframes.com/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant="outline" className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Full API Documentation
                </Button>
              </a>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
