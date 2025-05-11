import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Printer, QrCode, Search } from 'lucide-react';
import QrCodeGenerator from '@/components/QrCodeGenerator';
import QrCodeScanner from '@/components/QrCodeScanner';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

const InventoryTrackingPage = () => {
  const [activeTab, setActiveTab] = useState('locations');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showQrGenerateDialog, setShowQrGenerateDialog] = useState(false);
  const [selectedEntityForQr, setSelectedEntityForQr] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load inventory locations
  const { data: locations, isLoading: locationsLoading, error: locationsError } = useQuery({
    queryKey: ['/api/inventory/locations'],
    queryFn: getQueryFn({ endpoint: '/api/inventory/locations' }),
  });

  // Load inventory items
  const { data: inventoryItems, isLoading: itemsLoading, error: itemsError } = useQuery({
    queryKey: ['/api/inventory/items'],
    queryFn: getQueryFn({ endpoint: '/api/inventory/items' }),
  });

  // Load suppliers
  const { data: suppliers, isLoading: suppliersLoading, error: suppliersError } = useQuery({
    queryKey: ['/api/inventory/suppliers'],
    queryFn: getQueryFn({ endpoint: '/api/inventory/suppliers' }),
  });

  // Load low stock items
  const { data: lowStockItems, isLoading: lowStockLoading, error: lowStockError } = useQuery({
    queryKey: ['/api/inventory/items/low-stock'],
    queryFn: getQueryFn({ endpoint: '/api/inventory/items/low-stock' }),
  });

  // Load QR codes
  const { data: qrCodes, isLoading: qrCodesLoading, error: qrCodesError } = useQuery({
    queryKey: ['/api/qr-codes'],
    queryFn: getQueryFn({ endpoint: '/api/qr-codes' }),
  });

  // Helper function for API queries
  function getQueryFn({ endpoint }) {
    return async () => {
      try {
        const response = await apiRequest('GET', endpoint);
        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.message || `Error fetching data from ${endpoint}: ${response.status} ${response.statusText}`;
          throw new Error(errorMessage);
        }
        return await response.json();
      } catch (error) {
        console.error(`Error loading data from ${endpoint}:`, error);
        toast({
          title: 'Error loading data',
          description: error.message,
          variant: 'destructive',
        });
        return []; // Return empty array on error
      }
    };
  }

  // Create new inventory location
  const createLocationMutation = useMutation({
    mutationFn: async (locationData) => {
      const response = await apiRequest('POST', '/api/inventory/locations', locationData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create location');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/locations'] });
      toast({
        title: 'Location Created',
        description: 'New inventory location has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation to create a QR code for an entity
  const createQrCodeMutation = useMutation({
    mutationFn: async (qrCodeData) => {
      const response = await apiRequest('POST', '/api/qr-codes', qrCodeData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create QR code');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qr-codes'] });
      toast({
        title: 'QR Code Created',
        description: 'New QR code has been generated successfully.',
      });
      setShowQrGenerateDialog(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle QR code scanning
  const handleQrScan = async (data) => {
    if (!data || !data.code) return;

    try {
      // Look up the entity based on QR code data
      const entityType = data.type;
      const entityId = data.entityId;

      // For example, if it's an inventory location QR code
      if (entityType === 'inventory_location') {
        toast({
          title: 'Location Found',
          description: `Scanned location: ${data.title}`,
        });
        // You would typically do something with this location data
        // such as navigating to its detail page or highlighting it in the list
      }
      // Similarly handle other entity types
    } catch (error) {
      console.error('Error processing scanned QR code:', error);
      toast({
        title: 'Error',
        description: 'Could not process the scanned QR code',
        variant: 'destructive',
      });
    }
  };

  // Generate QR code for an entity
  const handleGenerateQrCode = (entity, type) => {
    setSelectedEntityForQr({
      entity,
      type,
      title: entity.name || `${type} #${entity.id}`,
      entityId: entity.id.toString(),
    });
    setShowQrGenerateDialog(true);
  };

  // Filter items for the current view
  const getFilteredItems = () => {
    let items = [];

    switch (activeTab) {
      case 'locations':
        items = locations || [];
        break;
      case 'inventory':
        items = inventoryItems || [];
        break;
      case 'suppliers':
        items = suppliers || [];
        break;
      case 'qrcodes':
        items = qrCodes || [];
        break;
      default:
        items = [];
    }

    // Apply search filter if provided
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => {
        // Customize this based on the item fields for each tab
        const searchableFields = Object.values(item).map(val => 
          val ? String(val).toLowerCase() : ''
        );
        return searchableFields.some(field => field.includes(query));
      });
    }

    return items;
  };

  // Show loading indicator while fetching data
  const isLoading = locationsLoading || itemsLoading || suppliersLoading || qrCodesLoading;
  const apiError = locationsError || itemsError || suppliersError || qrCodesError;


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error loading data</p>
          <p>{apiError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Tracking System</h1>
          <p className="text-muted-foreground">
            Manage inventory locations, items, suppliers, and QR code tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <QrCode className="h-4 w-4 mr-2" />
                Generate QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Generate QR Code</DialogTitle>
                <DialogDescription>
                  Create a new QR code for inventory tracking.
                </DialogDescription>
              </DialogHeader>
              <QrCodeGenerator />
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <QrCode className="h-4 w-4 mr-2" />
                Scan QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Scan QR Code</DialogTitle>
                <DialogDescription>
                  Scan a QR code to look up inventory items or locations.
                </DialogDescription>
              </DialogHeader>
              <QrCodeScanner onScan={handleQrScan} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Inventory Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>QR Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qrCodes?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
          <CardDescription>
            Manage your inventory locations, items, suppliers, and QR codes
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {activeTab === 'locations' && (
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                  <SelectItem value="display">Display</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            )}
            {activeTab === 'qrcodes' && (
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="inventory_location">Locations</SelectItem>
                  <SelectItem value="inventory_item">Items</SelectItem>
                  <SelectItem value="material_order">Orders</SelectItem>
                  <SelectItem value="customer_order">Customer Orders</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="locations" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="locations">Locations</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
              <TabsTrigger value="qrcodes">QR Codes</TabsTrigger>
            </TabsList>

            <TabsContent value="locations">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>QR Code</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredItems().length > 0 ? (
                      getFilteredItems().map((location) => (
                        <TableRow key={location.id}>
                          <TableCell className="font-medium">{location.name}</TableCell>
                          <TableCell>{location.type}</TableCell>
                          <TableCell>{location.description}</TableCell>
                          <TableCell>
                            {location.qrCodeId ? (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <QrCode className="h-3 w-3" />
                                Assigned
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-muted">None</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleGenerateQrCode(location, 'inventory_location')}
                            >
                              <QrCode className="h-3 w-3 mr-1" />
                              Generate QR
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          No locations found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="inventory">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>QR Code</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredItems().length > 0 ? (
                      getFilteredItems().map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell>{item.categoryName}</TableCell>
                          <TableCell>
                            {item.currentStock} {item.unitOfMeasure}
                            {item.currentStock <= item.reorderPoint && (
                              <Badge variant="destructive" className="ml-2">Low Stock</Badge>
                            )}
                          </TableCell>
                          <TableCell>{item.locationName}</TableCell>
                          <TableCell>
                            {item.qrCodeId ? (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <QrCode className="h-3 w-3" />
                                Assigned
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-muted">None</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleGenerateQrCode(item, 'inventory_item')}
                            >
                              <QrCode className="h-3 w-3 mr-1" />
                              Generate QR
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                          No inventory items found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="suppliers">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Order</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredItems().length > 0 ? (
                      getFilteredItems().map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell className="font-medium">{supplier.name}</TableCell>
                          <TableCell>{supplier.contactName}</TableCell>
                          <TableCell>{supplier.email}</TableCell>
                          <TableCell>{supplier.phone}</TableCell>
                          <TableCell>
                            <Badge variant={supplier.active ? "success" : "secondary"}>
                              {supplier.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {supplier.lastOrderDate 
                              ? format(new Date(supplier.lastOrderDate), 'MMM d, yyyy')
                              : 'Never'
                            }
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                          No suppliers found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="qrcodes">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Scans</TableHead>
                      <TableHead>Last Scanned</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredItems().length > 0 ? (
                      getFilteredItems().map((qrCode) => (
                        <TableRow key={qrCode.id}>
                          <TableCell className="font-medium">{qrCode.title}</TableCell>
                          <TableCell>
                            <code className="bg-muted px-1 py-0.5 rounded text-sm">{qrCode.code}</code>
                          </TableCell>
                          <TableCell>{qrCode.type}</TableCell>
                          <TableCell>{qrCode.scanCount}</TableCell>
                          <TableCell>
                            {qrCode.lastScanned 
                              ? format(new Date(qrCode.lastScanned), 'MMM d, yyyy HH:mm') 
                              : 'Never'
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm">
                                <QrCode className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Printer className="h-3 w-3 mr-1" />
                                Print
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No QR codes found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog for QR code generation */}
      {selectedEntityForQr && (
        <Dialog open={showQrGenerateDialog} onOpenChange={setShowQrGenerateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate QR Code</DialogTitle>
              <DialogDescription>
                Create a QR code for {selectedEntityForQr.title}
              </DialogDescription>
            </DialogHeader>
            <QrCodeGenerator 
              type={selectedEntityForQr.type}
              entityId={selectedEntityForQr.entityId}
              title={selectedEntityForQr.title}
              onGenerate={(qrCode) => {
                toast({
                  title: 'QR Code Generated',
                  description: `QR code for ${selectedEntityForQr.title} has been created.`,
                });
                setShowQrGenerateDialog(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default InventoryTrackingPage;