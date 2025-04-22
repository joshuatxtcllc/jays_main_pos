import React, { useState } from "react";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryItemForm } from "@/components/inventory/InventoryItemForm";
import { InventoryDetailView } from "@/components/inventory/InventoryDetailView";
import InventoryDashboard from "@/components/inventory/InventoryDashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  useInventoryItems, 
  useCreateInventoryItem, 
  useUpdateInventoryItem, 
  useDeleteInventoryItem,
  useLowStockItems,
  useSuppliers,
  useInventoryLocations
} from "@/hooks/use-inventory";
import type { InventoryItem, InsertInventoryItem } from "@shared/schema";
import { Package, Plus, AlertCircle, Truck, MapPin, BarChart3 } from "lucide-react";

export default function InventoryPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [currentTab, setCurrentTab] = useState("inventory");
  
  // React Query hooks
  const { data: inventoryItems = [], isLoading: isLoadingItems } = useInventoryItems();
  const { data: lowStockItems = [], isLoading: isLoadingLowStock } = useLowStockItems();
  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useSuppliers();
  const { data: locations = [], isLoading: isLoadingLocations } = useInventoryLocations();
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem(selectedItem?.id || 0);
  const deleteItem = useDeleteInventoryItem();
  
  const { toast } = useToast();
  
  // Handle adding a new item
  const handleAddItem = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };
  
  // Handle editing an existing item
  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };
  
  // Handle viewing item details
  const handleViewItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDetailViewOpen(true);
  };
  
  // Handle closing the form
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };
  
  // Handle closing the detail view
  const handleCloseDetailView = () => {
    setIsDetailViewOpen(false);
  };
  
  // Handle form submission
  const handleFormSubmit = (data: any) => {
    if (selectedItem) {
      // Update existing item
      updateItem.mutate(data as Partial<InventoryItem>, {
        onSuccess: () => {
          setIsFormOpen(false);
          setSelectedItem(null);
          toast({
            title: "Item updated",
            description: "The inventory item has been successfully updated.",
          });
        }
      });
    } else {
      // Create new item
      createItem.mutate(data, {
        onSuccess: () => {
          setIsFormOpen(false);
          toast({
            title: "Item created",
            description: "The inventory item has been successfully created.",
          });
        }
      });
    }
  };
  
  // Handle item deletion
  const handleDeleteItem = () => {
    if (selectedItem) {
      deleteItem.mutate(selectedItem.id, {
        onSuccess: () => {
          setIsDetailViewOpen(false);
          setSelectedItem(null);
          toast({
            title: "Item deleted",
            description: "The inventory item has been permanently deleted.",
          });
        }
      });
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your inventory items, suppliers, and locations
          </p>
        </div>
        <Button onClick={handleAddItem}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Item
        </Button>
      </div>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center">
            <Package className="h-4 w-4 mr-2" />
            Inventory Items
          </TabsTrigger>
          <TabsTrigger value="low-stock" className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Low Stock ({lowStockItems.length})
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center">
            <Truck className="h-4 w-4 mr-2" />
            Suppliers ({suppliers.length})
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Storage Locations ({locations.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <InventoryDashboard />
        </TabsContent>
        
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>
                View and manage all inventory items in your database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryTable
                onAdd={handleAddItem}
                onEdit={handleEditItem}
                onView={handleViewItem}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="low-stock">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
              <CardDescription>
                Items that are at or below their reorder level
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLowStock ? (
                <div className="flex justify-center p-8">Loading low stock items...</div>
              ) : lowStockItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No items are currently at or below their reorder level.
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">SKU</th>
                      <th className="text-left py-2">Name</th>
                      <th className="text-right py-2">Current Stock</th>
                      <th className="text-right py-2">Reorder Level</th>
                      <th className="text-right py-2">Reorder Quantity</th>
                      <th className="text-right py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="py-2">{item.sku}</td>
                        <td className="py-2">{item.name}</td>
                        <td className="text-right py-2">{item.minimumStockLevel.toString()}</td>
                        <td className="text-right py-2">{item.reorderLevel.toString()}</td>
                        <td className="text-right py-2">{item.reorderQuantity?.toString() || "-"}</td>
                        <td className="text-right py-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewItem(item)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <CardTitle>Suppliers</CardTitle>
              <CardDescription>
                View and manage your suppliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSuppliers ? (
                <div className="flex justify-center p-8">Loading suppliers...</div>
              ) : suppliers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No suppliers found. Add suppliers to track inventory from different vendors.
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Contact Person</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Phone</th>
                      <th className="text-right py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((supplier) => (
                      <tr key={supplier.id} className="border-b hover:bg-muted/50">
                        <td className="py-2">{supplier.name}</td>
                        <td className="py-2">{supplier.contactName || "-"}</td>
                        <td className="py-2">{supplier.email || "-"}</td>
                        <td className="py-2">{supplier.phone || "-"}</td>
                        <td className="text-right py-2">
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="locations">
          <Card>
            <CardHeader>
              <CardTitle>Storage Locations</CardTitle>
              <CardDescription>
                Manage storage locations in your facility
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLocations ? (
                <div className="flex justify-center p-8">Loading storage locations...</div>
              ) : locations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No storage locations found. Define locations to better organize your inventory.
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Description</th>
                      <th className="text-center py-2">Status</th>
                      <th className="text-right py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.map((location) => (
                      <tr key={location.id} className="border-b hover:bg-muted/50">
                        <td className="py-2">{location.name}</td>
                        <td className="py-2">{location.type || "-"}</td>
                        <td className="py-2">{location.description || "-"}</td>
                        <td className="text-center py-2">
                          <span className={`inline-block h-2 w-2 rounded-full ${location.active ? "bg-green-500" : "bg-gray-300"}`}></span>
                        </td>
                        <td className="text-right py-2">
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Item Form Modal */}
      {isFormOpen && (
        <InventoryItemForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          editItem={selectedItem || undefined}
          categories={[]} // Pass actual categories when available
          isSubmitting={createItem.isPending || updateItem.isPending}
        />
      )}
      
      {/* Item Detail View Modal */}
      {isDetailViewOpen && selectedItem && (
        <InventoryDetailView
          item={selectedItem}
          isOpen={isDetailViewOpen}
          onClose={handleCloseDetailView}
          onEdit={() => {
            setIsDetailViewOpen(false);
            setIsFormOpen(true);
          }}
          onDelete={handleDeleteItem}
        />
      )}
    </div>
  );
}