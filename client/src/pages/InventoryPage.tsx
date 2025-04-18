import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from '@/components/ui/tabs';
import { useFrameInventory, useMatInventory, useGlassInventory, useStockLevelMutation } from '@/hooks/use-inventory';
import FrameDesigner from '@/components/inventory/FrameDesigner';
import { InventoryItem } from '@shared/inventory-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Package, 
  Search, 
  Filter, 
  PlusCircle, 
  RefreshCw, 
  AlertTriangle,
  Edit,
  Trash2,
  ShoppingCart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Convert inventory items to frame options for the designer
const convertToFrameOptions = (items: (InventoryItem & { currentStock: number })[] = []) => {
  return items.map(item => ({
    id: item.id,
    name: item.name,
    color: item.metadata?.color || '#8B4513', // Default brown if no color specified
    width: item.metadata?.width || 1.5, // Default width if not specified
    price: parseFloat(item.unitPrice.toString()),
    inStock: item.currentStock > 0
  }));
};

// Convert inventory items to mat options for the designer
const convertToMatOptions = (items: (InventoryItem & { currentStock: number })[] = []) => {
  return items.map(item => ({
    id: item.id,
    name: item.name,
    color: item.metadata?.color || '#FFFFF0', // Default off-white if no color specified
    price: parseFloat(item.unitPrice.toString()),
    inStock: item.currentStock > 0
  }));
};

const InventoryPage: React.FC = () => {
  const { toast } = useToast();
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);
  
  // State for dialogs
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDesignerDialog, setShowDesignerDialog] = useState(false);
  
  // Stock adjustment dialog
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<(InventoryItem & { currentStock: number }) | null>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<number>(0);
  const [adjustmentType, setAdjustmentType] = useState<string>('adjustment');
  const [adjustmentLocation, setAdjustmentLocation] = useState<string>('main_storage');
  const [adjustmentNotes, setAdjustmentNotes] = useState<string>('');
  
  // Stock mutation
  const stockMutation = useStockLevelMutation();
  
  // Inventory queries
  const frameQuery = useFrameInventory();
  const matQuery = useMatInventory();
  const glassQuery = useGlassInventory();
  
  // Handle inventory filters
  const getFilteredItems = (items: (InventoryItem & { currentStock: number })[] = []) => {
    return items.filter(item => {
      // Apply search filter
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Apply type filter
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      
      // Apply low stock filter
      const matchesLowStock = !showLowStock || (item.currentStock <= item.reorderThreshold);
      
      return matchesSearch && matchesType && matchesLowStock;
    });
  };
  
  // Filtered items
  const frames = frameQuery.data || [];
  const mats = matQuery.data || [];
  const glasses = glassQuery.data || [];
  
  const filteredFrames = getFilteredItems(frames);
  const filteredMats = getFilteredItems(mats);
  const filteredGlasses = getFilteredItems(glasses);
  
  // Handle stock adjustment
  const handleStockAdjustment = async () => {
    if (!selectedItem) return;
    
    try {
      await stockMutation.mutateAsync({
        id: selectedItem.id,
        quantity: adjustmentQuantity,
        location: adjustmentLocation,
        transactionType: adjustmentType,
        notes: adjustmentNotes
      });
      
      toast({
        title: 'Stock Updated',
        description: `Successfully updated stock for ${selectedItem.name}`,
      });
      
      setShowStockDialog(false);
      resetStockDialog();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update stock',
        variant: 'destructive',
      });
    }
  };
  
  // Reset stock dialog
  const resetStockDialog = () => {
    setSelectedItem(null);
    setAdjustmentQuantity(0);
    setAdjustmentType('adjustment');
    setAdjustmentLocation('main_storage');
    setAdjustmentNotes('');
  };
  
  // Open stock adjustment dialog
  const openStockDialog = (item: (InventoryItem & { currentStock: number })) => {
    setSelectedItem(item);
    setShowStockDialog(true);
  };
  
  // Handle frame designer cart submission
  const handleDesignSubmit = (designData: any) => {
    toast({
      title: 'Design Added to Cart',
      description: 'Your custom frame design has been added to the cart',
    });
    
    setShowDesignerDialog(false);
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Manage frames, mats, glass, and other inventory items</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDesignerDialog(true)}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Frame Designer
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>
      
      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="type-filter" className="min-w-[80px]">Type:</Label>
              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
              >
                <SelectTrigger id="type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="frame">Frames</SelectItem>
                  <SelectItem value="mat">Mats</SelectItem>
                  <SelectItem value="glass">Glass</SelectItem>
                  <SelectItem value="backing">Backing</SelectItem>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="tool">Tools</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="low-stock"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
                className="checkbox"
              />
              <Label htmlFor="low-stock" className="flex items-center gap-1 cursor-pointer">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Low Stock Only
              </Label>
            </div>
            
            <div className="flex justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  setShowLowStock(false);
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Inventory Tabs */}
      <Tabs defaultValue="frames">
        <TabList className="mb-4">
          <Tab value="frames">Frames</Tab>
          <Tab value="mats">Mats</Tab>
          <Tab value="glass">Glass</Tab>
          <Tab value="all">All Items</Tab>
        </TabList>
        
        {/* Frames Tab */}
        <TabPanel value="frames">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Frame Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              {frameQuery.isLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredFrames.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No frames found matching your filters.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFrames.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>${parseFloat(item.unitPrice.toString()).toFixed(2)}</TableCell>
                        <TableCell>{item.currentStock.toFixed(1)} {item.unit}</TableCell>
                        <TableCell>
                          {item.currentStock <= 0 ? (
                            <span className="text-red-500 font-medium flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              Out of Stock
                            </span>
                          ) : item.currentStock <= item.reorderThreshold ? (
                            <span className="text-amber-500 font-medium flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="text-green-500 font-medium">In Stock</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openStockDialog(item)}
                          >
                            <Package className="h-4 w-4 mr-1" />
                            Adjust Stock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabPanel>
        
        {/* Mats Tab */}
        <TabPanel value="mats">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Mat Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              {matQuery.isLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredMats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No mats found matching your filters.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMats.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>${parseFloat(item.unitPrice.toString()).toFixed(2)}</TableCell>
                        <TableCell>{item.currentStock.toFixed(1)} {item.unit}</TableCell>
                        <TableCell>
                          {item.currentStock <= 0 ? (
                            <span className="text-red-500 font-medium flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              Out of Stock
                            </span>
                          ) : item.currentStock <= item.reorderThreshold ? (
                            <span className="text-amber-500 font-medium flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="text-green-500 font-medium">In Stock</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openStockDialog(item)}
                          >
                            <Package className="h-4 w-4 mr-1" />
                            Adjust Stock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabPanel>
        
        {/* Glass Tab */}
        <TabPanel value="glass">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Glass Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              {glassQuery.isLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredGlasses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No glass items found matching your filters.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGlasses.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>${parseFloat(item.unitPrice.toString()).toFixed(2)}</TableCell>
                        <TableCell>{item.currentStock.toFixed(1)} {item.unit}</TableCell>
                        <TableCell>
                          {item.currentStock <= 0 ? (
                            <span className="text-red-500 font-medium flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              Out of Stock
                            </span>
                          ) : item.currentStock <= item.reorderThreshold ? (
                            <span className="text-amber-500 font-medium flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="text-green-500 font-medium">In Stock</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openStockDialog(item)}
                          >
                            <Package className="h-4 w-4 mr-1" />
                            Adjust Stock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabPanel>
        
        {/* All Items Tab */}
        <TabPanel value="all">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">All Inventory Items</CardTitle>
            </CardHeader>
            <CardContent>
              {frameQuery.isLoading || matQuery.isLoading || glassQuery.isLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : [...filteredFrames, ...filteredMats, ...filteredGlasses].length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No items found matching your filters.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...filteredFrames, ...filteredMats, ...filteredGlasses].map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="capitalize">{item.type}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>${parseFloat(item.unitPrice.toString()).toFixed(2)}</TableCell>
                        <TableCell>{item.currentStock.toFixed(1)} {item.unit}</TableCell>
                        <TableCell>
                          {item.currentStock <= 0 ? (
                            <span className="text-red-500 font-medium flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              Out of Stock
                            </span>
                          ) : item.currentStock <= item.reorderThreshold ? (
                            <span className="text-amber-500 font-medium flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="text-green-500 font-medium">In Stock</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openStockDialog(item)}
                          >
                            <Package className="h-4 w-4 mr-1" />
                            Adjust Stock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </Tabs>
      
      {/* Stock Adjustment Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock Level</DialogTitle>
            <DialogDescription>
              {selectedItem ? `Update stock for ${selectedItem.name} (SKU: ${selectedItem.sku})` : 'Update inventory stock level'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="adjustment-type">Adjustment Type</Label>
                <Select value={adjustmentType} onValueChange={setAdjustmentType}>
                  <SelectTrigger id="adjustment-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adjustment">Manual Adjustment</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="sale">Sale</SelectItem>
                    <SelectItem value="return">Return</SelectItem>
                    <SelectItem value="damage">Damage/Loss</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="adjustment-location">Location</Label>
                <Select value={adjustmentLocation} onValueChange={setAdjustmentLocation}>
                  <SelectTrigger id="adjustment-location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main_storage">Main Storage</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="display_area">Display Area</SelectItem>
                    <SelectItem value="offsite_storage">Offsite Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="adjustment-quantity">
                Quantity ({adjustmentType === 'sale' || adjustmentType === 'damage' ? 'negative for removal' : 'positive for addition'})
              </Label>
              <Input
                id="adjustment-quantity"
                type="number"
                value={adjustmentQuantity}
                onChange={(e) => setAdjustmentQuantity(Number(e.target.value))}
                step="0.5"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="adjustment-notes">Notes</Label>
              <Input
                id="adjustment-notes"
                value={adjustmentNotes}
                onChange={(e) => setAdjustmentNotes(e.target.value)}
                placeholder="Optional notes about this adjustment"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStockDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleStockAdjustment} 
              disabled={stockMutation.isPending}
            >
              {stockMutation.isPending ? 'Updating...' : 'Update Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Frame Designer Dialog */}
      <Dialog open={showDesignerDialog} onOpenChange={setShowDesignerDialog}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Custom Frame Designer</DialogTitle>
            <DialogDescription>
              Design a custom frame with available inventory items
            </DialogDescription>
          </DialogHeader>
          
          <FrameDesigner 
            frameOptions={convertToFrameOptions(frames)}
            matOptions={convertToMatOptions(mats)}
            onAddToCart={handleDesignSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;