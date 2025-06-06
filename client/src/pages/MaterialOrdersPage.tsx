import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Package, Plus } from 'lucide-react';
import { useMaterialsPickList, useMaterialTypes, useMaterialSuppliers } from '@/hooks/use-materials';

// Material order statuses
const materialOrderStatuses = ['pending', 'ordered', 'received', 'backorder', 'cancelled'] as const;
type MaterialOrderStatus = typeof materialOrderStatuses[number];

const MaterialOrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MaterialOrderStatus | "all">("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: materials = [], isLoading, error } = useMaterialsPickList();
  const { data: materialTypes = [] } = useMaterialTypes();
  const { data: suppliers = [] } = useMaterialSuppliers();

  // Filter materials based on active tab, type, and search
  const filteredMaterials = materials.filter(material => {
    const tabMatch = activeTab === "all" || material.status === activeTab;
    const typeMatch = selectedType === "all" || material.type === selectedType;
    const searchMatch = searchQuery === "" || 
      material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    return tabMatch && typeMatch && searchMatch;
  });

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      ordered: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      received: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      backorder: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors: Record<string, string> = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };

    return (
      <Badge variant="outline" className={priorityColors[priority] || ''}>
        {priority}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Material Orders</h1>
            <p className="text-muted-foreground">
              Manage and track material orders for your framing business
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as MaterialOrderStatus | "all")}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            {materialOrderStatuses.map(status => (
              <TabsTrigger key={status} value={status}>
                {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search materials, SKUs, or suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="type-filter" className="whitespace-nowrap">Filter by type:</Label>
          <Select
            value={selectedType} 
            onValueChange={setSelectedType}
          >
            <SelectTrigger id="type-filter" className="w-[180px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {materialTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error loading materials</h3>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : 'Unable to load material orders. Please try again.'}
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredMaterials.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No materials found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || selectedType !== "all" || activeTab !== "all" 
                    ? "Try adjusting your filters to see more results."
                    : "No material orders have been created yet."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredMaterials.map(material => (
              <Card key={material.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{material.name}</CardTitle>
                      <CardDescription>
                        SKU: {material.sku} | Supplier: {material.supplier}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(material.status)}
                      <Badge variant="outline">{material.type}</Badge>
                      {getPriorityBadge(material.priority)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Quantity</Label>
                      <p className="text-2xl font-bold">{material.quantity}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Related Orders</Label>
                      <p className="text-sm">{material.orderIds.length} order{material.orderIds.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Order Date</Label>
                      <p className="text-sm">{material.orderDate ? new Date(material.orderDate).toLocaleDateString() : 'Not ordered'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Receive Date</Label>
                      <p className="text-sm">{material.receiveDate ? new Date(material.receiveDate).toLocaleDateString() : 'Not received'}</p>
                    </div>
                  </div>
                  {material.notes && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium">Notes</Label>
                      <p className="text-sm text-muted-foreground">{material.notes}</p>
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit Order
                    </Button>
                    <Button variant="outline" size="sm">
                      Update Status
                    </Button>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MaterialOrdersPage;