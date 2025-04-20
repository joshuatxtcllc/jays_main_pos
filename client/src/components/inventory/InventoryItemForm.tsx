import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { 
  InventoryItem, 
  InsertInventoryItem, 
  MeasurementUnit,
  InventoryCategory,
  Supplier,
  InventoryLocation 
} from "@shared/schema";
import { useSuppliers, useInventoryLocations } from "@/hooks/use-inventory";

// Create schema for form validation
const inventoryItemSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  categoryId: z.number().optional().nullable(),
  supplierId: z.number().optional().nullable(),
  supplierSku: z.string().optional(),
  unitOfMeasure: z.enum(["each", "inch", "foot", "united_inch", "square_inch", "sheet", "roll", "pound", "liter", "gallon"]),
  costPerUnit: z.string().min(1, "Cost per unit is required"),
  retailPrice: z.string().optional(),
  minimumStockLevel: z.string().min(1, "Minimum stock level is required"),
  reorderLevel: z.string().min(1, "Reorder level is required"),
  reorderQuantity: z.string().optional(),
  locationId: z.number().optional().nullable(),
  barcode: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  autoBatchReorder: z.boolean().default(false),
  materialType: z.string().optional(),
  materialId: z.string().optional(),
});

type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>;

interface InventoryItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InsertInventoryItem) => void;
  editItem?: InventoryItem;
  categories: InventoryCategory[];
  isSubmitting: boolean;
}

export function InventoryItemForm({
  isOpen,
  onClose,
  onSubmit,
  editItem,
  categories,
  isSubmitting
}: InventoryItemFormProps) {
  // Get suppliers and locations data
  const { data: suppliers = [] } = useSuppliers();
  const { data: locations = [] } = useInventoryLocations();
  
  // Initialize form with default values or the item being edited
  const form = useForm<InventoryItemFormValues>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: editItem
      ? {
          ...editItem as any,
          costPerUnit: editItem.costPerUnit.toString(),
          retailPrice: editItem.retailPrice?.toString() || "",
          minimumStockLevel: editItem.minimumStockLevel.toString(),
          reorderLevel: editItem.reorderLevel.toString(),
          reorderQuantity: editItem.reorderQuantity?.toString() || "",
          tags: editItem.tags || [],
        }
      : {
          sku: "",
          name: "",
          description: "",
          categoryId: null,
          supplierId: null,
          supplierSku: "",
          unitOfMeasure: "each",
          costPerUnit: "0",
          retailPrice: "",
          minimumStockLevel: "0",
          reorderLevel: "5",
          reorderQuantity: "10",
          locationId: null,
          barcode: "",
          notes: "",
          tags: [],
          isActive: true,
          autoBatchReorder: false,
          materialType: "",
          materialId: "",
        },
  });
  
  // Handle form submission
  const handleFormSubmit = (values: InventoryItemFormValues) => {
    // Convert string values to numeric
    const formattedValues = {
      ...values,
      costPerUnit: parseFloat(values.costPerUnit),
      retailPrice: values.retailPrice ? parseFloat(values.retailPrice) : null,
      minimumStockLevel: parseFloat(values.minimumStockLevel),
      reorderLevel: parseFloat(values.reorderLevel),
      reorderQuantity: values.reorderQuantity ? parseFloat(values.reorderQuantity) : null,
    };
    
    onSubmit(formattedValues as any);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto text-foreground bg-background light-form-text">
        <DialogHeader>
          <DialogTitle className="text-foreground">{editItem ? "Edit Inventory Item" : "Add New Inventory Item"}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {editItem 
              ? "Update the details of this inventory item." 
              : "Fill in the details for the new inventory item."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-2 text-foreground form-labels">
            <div className="grid grid-cols-2 gap-4">
              {/* SKU Field */}
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter SKU" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter description" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              {/* Category Field */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "none" ? null : value ? parseInt(value, 10) : null)}
                      value={field.value?.toString() || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Unit of Measure Field */}
              <FormField
                control={form.control}
                name="unitOfMeasure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit of Measure*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="each">Each</SelectItem>
                        <SelectItem value="inch">Inch</SelectItem>
                        <SelectItem value="foot">Foot</SelectItem>
                        <SelectItem value="united_inch">United Inch</SelectItem>
                        <SelectItem value="square_inch">Square Inch</SelectItem>
                        <SelectItem value="sheet">Sheet</SelectItem>
                        <SelectItem value="roll">Roll</SelectItem>
                        <SelectItem value="pound">Pound</SelectItem>
                        <SelectItem value="liter">Liter</SelectItem>
                        <SelectItem value="gallon">Gallon</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Supplier Field */}
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === "none" ? null : value ? parseInt(value, 10) : null)}
                      value={field.value?.toString() || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Supplier SKU Field */}
              <FormField
                control={form.control}
                name="supplierSku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter supplier SKU" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Cost Per Unit Field */}
              <FormField
                control={form.control}
                name="costPerUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Per Unit*</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Retail Price Field */}
              <FormField
                control={form.control}
                name="retailPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retail Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field} 
                        value={field.value || ""} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Barcode Field */}
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter barcode" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Minimum Stock Level Field */}
              <FormField
                control={form.control}
                name="minimumStockLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Stock*</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Reorder Level Field */}
              <FormField
                control={form.control}
                name="reorderLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder Level*</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Reorder Quantity Field */}
              <FormField
                control={form.control}
                name="reorderQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="1" 
                        placeholder="10" 
                        {...field} 
                        value={field.value || ""} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Location Field */}
            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Storage Location</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value === "none" ? null : value ? parseInt(value, 10) : null)}
                    value={field.value?.toString() || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id.toString()}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Notes Field */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter notes" 
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Material Type and ID Fields (used for linking to existing materials) */}
            {form.watch('materialType') && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="materialType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Type</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === "none" ? null : value)} value={field.value || "none"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select material type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="frame">Frame</SelectItem>
                          <SelectItem value="matboard">Matboard</SelectItem>
                          <SelectItem value="glass">Glass</SelectItem>
                          <SelectItem value="backing_board">Backing Board</SelectItem>
                          <SelectItem value="hardware">Hardware</SelectItem>
                          <SelectItem value="specialty_materials">Specialty Materials</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="materialId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter material ID" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              {/* Is Active Checkbox */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Active</FormLabel>
                  </FormItem>
                )}
              />
              
              {/* Auto Batch Reorder Checkbox */}
              <FormField
                control={form.control}
                name="autoBatchReorder"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Add to batch reorders</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editItem ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}