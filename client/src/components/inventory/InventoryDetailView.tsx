import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, Package, Trash2, Truck, MapPin, History, Tag, Barcode, DollarSign } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { InventoryItem, Supplier, InventoryLocation } from "@shared/schema";
import { useSupplier, useInventoryLocation } from "@/hooks/use-inventory";

interface InventoryDetailViewProps {
  item: InventoryItem;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function InventoryDetailView({
  item,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: InventoryDetailViewProps) {
  // Fetch related data
  const { data: supplier } = useSupplier(item.supplierId || 0);
  const { data: location } = useInventoryLocation(item.locationId || 0);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            {item.name}
          </DialogTitle>
          <DialogDescription>
            Item details and inventory information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <span className="text-sm font-medium">SKU:</span>
                <span className="text-sm ml-2">{item.sku}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Status:</span>
                <Badge className="ml-2" variant={item.isActive ? "default" : "secondary"}>
                  {item.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {item.barcode && (
                <div className="col-span-2 flex items-center">
                  <Barcode className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium">Barcode:</span>
                  <span className="text-sm ml-2">{item.barcode}</span>
                </div>
              )}
              <div className="col-span-2">
                <span className="text-sm font-medium">Description:</span>
                <p className="text-sm mt-1">{item.description || "No description provided."}</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Pricing Information */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Pricing Information</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Cost Per Unit:</span>
                <span className="text-sm ml-2">${parseFloat(item.costPerUnit.toString()).toFixed(2)}</span>
              </div>
              {item.retailPrice && (
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium">Retail Price:</span>
                  <span className="text-sm ml-2">${parseFloat(item.retailPrice.toString()).toFixed(2)}</span>
                </div>
              )}
              <div>
                <span className="text-sm font-medium">Unit of Measure:</span>
                <span className="text-sm ml-2">{formatUnitOfMeasure(item.unitOfMeasure)}</span>
              </div>
              {/* Add margin calculation if both cost and retail price are available */}
              {item.retailPrice && (
                <div>
                  <span className="text-sm font-medium">Margin:</span>
                  <span className="text-sm ml-2">
                    {calculateMargin(item.costPerUnit.toString(), item.retailPrice.toString())}%
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Stock Information */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Stock Information</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <span className="text-sm font-medium">Minimum Stock Level:</span>
                <span className="text-sm ml-2">{item.minimumStockLevel.toString()}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Reorder Level:</span>
                <span className="text-sm ml-2">{item.reorderLevel.toString()}</span>
              </div>
              {item.reorderQuantity && (
                <div>
                  <span className="text-sm font-medium">Reorder Quantity:</span>
                  <span className="text-sm ml-2">{item.reorderQuantity.toString()}</span>
                </div>
              )}
              <div>
                <span className="text-sm font-medium">Auto Batch Reorder:</span>
                <span className="text-sm ml-2">{item.autoBatchReorder ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
          
          {/* Show supplier information if available */}
          {supplier && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                  <Truck className="h-4 w-4 mr-2" />
                  Supplier Information
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <span className="text-sm font-medium">Supplier:</span>
                    <span className="text-sm ml-2">{supplier.name}</span>
                  </div>
                  {item.supplierSku && (
                    <div>
                      <span className="text-sm font-medium">Supplier SKU:</span>
                      <span className="text-sm ml-2">{item.supplierSku}</span>
                    </div>
                  )}
                  {supplier.email && (
                    <div>
                      <span className="text-sm font-medium">Email:</span>
                      <span className="text-sm ml-2">{supplier.email}</span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div>
                      <span className="text-sm font-medium">Phone:</span>
                      <span className="text-sm ml-2">{supplier.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          {/* Show location information if available */}
          {location && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Storage Location
                </h3>
                <div className="grid grid-cols-1 gap-y-2">
                  <div>
                    <span className="text-sm font-medium">Location:</span>
                    <span className="text-sm ml-2">{location.name}</span>
                  </div>
                  {location.description && (
                    <div>
                      <span className="text-sm font-medium">Details:</span>
                      <span className="text-sm ml-2">{location.description}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          {/* Additional Information */}
          {(item.notes || (item.tags && item.tags.length > 0) || item.lastCountDate) && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Additional Information</h3>
                <div className="space-y-2">
                  {item.notes && (
                    <div>
                      <span className="text-sm font-medium">Notes:</span>
                      <p className="text-sm mt-1">{item.notes}</p>
                    </div>
                  )}
                  {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Tags:</span>
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  )}
                  {item.lastCountDate && (
                    <div className="flex items-center">
                      <History className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm font-medium">Last Counted:</span>
                      <span className="text-sm ml-2">
                        {new Date(item.lastCountDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <div className="flex gap-2">
            <Button onClick={onEdit} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the inventory item
                    "{item.name}" and remove its data from the server.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={onDelete}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions
function formatUnitOfMeasure(unit: string): string {
  const formattedUnits: Record<string, string> = {
    each: "Each",
    inch: "Inch",
    foot: "Foot",
    united_inch: "United Inch",
    square_inch: "Square Inch",
    sheet: "Sheet",
    roll: "Roll",
    pound: "Pound",
    liter: "Liter",
    gallon: "Gallon",
  };
  
  return formattedUnits[unit] || unit;
}

function calculateMargin(cost: string, retail: string): string {
  const costValue = parseFloat(cost);
  const retailValue = parseFloat(retail);
  
  if (!costValue || !retailValue || costValue === 0) return "0";
  
  const margin = ((retailValue - costValue) / retailValue) * 100;
  return margin.toFixed(2);
}