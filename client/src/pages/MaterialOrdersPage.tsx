import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FormField, Form, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiRequest } from '@/lib/queryClient';
import { MaterialType, MaterialOrderStatus } from "../types";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, AlertCircle, RotateCw, CheckCircle2, Trash2, RefreshCw, Package, Filter, PlusCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Define material types and order statuses
const materialTypes: MaterialType[] = [
  "frame", "matboard", "glass", "backing_board", "hardware", "specialty_materials"
];

const materialOrderStatuses: MaterialOrderStatus[] = [
  "pending", "ordered", "back_ordered", "shipped", "delivered", "cancelled"
];

// Define form schema for creating/editing material orders
const materialOrderSchema = z.object({
  quantity: z.string().min(1, "Quantity is required"),
  materialType: z.enum(["frame", "matboard", "glass", "backing_board", "hardware", "specialty_materials"]),
  materialId: z.string().optional(),
  materialName: z.string().min(1, "Material name is required"),
  status: z.enum(["pending", "ordered", "back_ordered", "shipped", "delivered", "cancelled"]).default("pending"),
  notes: z.string().optional(),
  sourceOrderId: z.number().optional().nullable(),
  vendor: z.string().optional(),
  unitPrice: z.string().optional(),
  totalPrice: z.string().optional(),
  expectedDeliveryDate: z.date().optional(),
  priority: z.enum(["low", "normal", "high", "critical"]).default("normal"),
});

type MaterialOrderFormValues = z.infer<typeof materialOrderSchema>;

interface MaterialOrder {
  id: number;
  quantity: string;
  materialType: MaterialType;
  materialId: string;
  materialName: string;
  status: MaterialOrderStatus;
  notes: string | null;
  sourceOrderId: number | null;
  vendor: string | null;
  unitPrice: string | null;
  totalPrice: string | null;
  expectedDeliveryDate: string | null;
  createdAt: string;
  priority: string;
}

const MaterialOrdersPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<MaterialOrderStatus | "all">("all");
  const [selectedType, setSelectedType] = useState<MaterialType | "all">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<MaterialOrder | null>(null);

  // Get all material orders
  const { data: materialOrders, isLoading, isError } = useQuery({
    queryKey: ['/api/material-orders'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Create material order mutation
  const createMaterialOrderMutation = useMutation({
    mutationFn: async (materialOrder: MaterialOrderFormValues) => {
      const response = await apiRequest('POST', '/api/material-orders', materialOrder);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Material order created",
        description: "The material order has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/material-orders'] });
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to create material order",
        description: error.message || "An error occurred while creating the material order",
        variant: "destructive",
      });
    }
  });

  // Update material order mutation
  const updateMaterialOrderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<MaterialOrderFormValues> }) => {
      const response = await apiRequest('PATCH', `/api/material-orders/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Material order updated",
        description: "The material order has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/material-orders'] });
      setIsEditDialogOpen(false);
      setSelectedOrder(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update material order",
        description: error.message || "An error occurred while updating the material order",
        variant: "destructive",
      });
    }
  });

  // Delete material order mutation
  const deleteMaterialOrderMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/material-orders/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Material order deleted",
        description: "The material order has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/material-orders'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete material order",
        description: error.message || "An error occurred while deleting the material order",
        variant: "destructive",
      });
    }
  });

  const createForm = useForm<MaterialOrderFormValues>({
    resolver: zodResolver(materialOrderSchema),
    defaultValues: {
      quantity: "1",
      materialType: "frame",
      materialName: "",
      status: "pending",
      notes: "",
      priority: "normal",
    },
  });

  const editForm = useForm<MaterialOrderFormValues>({
    resolver: zodResolver(materialOrderSchema),
    defaultValues: {
      quantity: "1",
      materialType: "frame",
      materialName: "",
      status: "pending",
      notes: "",
      priority: "normal",
    },
  });

  // Reset form on dialog close
  const handleCreateDialogOpenChange = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      createForm.reset();
    }
  };

  const handleEditDialogOpenChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      editForm.reset();
      setSelectedOrder(null);
    }
  };

  // Edit material order
  const handleEditOrder = (order: MaterialOrder) => {
    setSelectedOrder(order);
    
    // Set default values for the edit form
    editForm.reset({
      quantity: order.quantity,
      materialType: order.materialType,
      materialId: order.materialId,
      materialName: order.materialName,
      status: order.status,
      notes: order.notes || undefined,
      sourceOrderId: order.sourceOrderId || undefined,
      vendor: order.vendor || undefined,
      unitPrice: order.unitPrice || undefined,
      totalPrice: order.totalPrice || undefined,
      expectedDeliveryDate: order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate) : undefined,
      priority: order.priority as any,
    });
    
    setIsEditDialogOpen(true);
  };

  // Filter material orders by status and type
  const filteredOrders = Array.isArray(materialOrders) 
    ? materialOrders.filter((order: MaterialOrder) => {
        if (activeTab !== "all" && order.status !== activeTab) {
          return false;
        }
        if (selectedType !== "all" && order.materialType !== selectedType) {
          return false;
        }
        return true;
      })
    : [];

  // Create a new material order
  const onCreateSubmit = (data: MaterialOrderFormValues) => {
    createMaterialOrderMutation.mutate(data);
  };

  // Update an existing material order
  const onEditSubmit = (data: MaterialOrderFormValues) => {
    if (selectedOrder) {
      updateMaterialOrderMutation.mutate({
        id: selectedOrder.id,
        data
      });
    }
  };

  // Delete material order with confirmation
  const handleDeleteOrder = (id: number) => {
    if (confirm("Are you sure you want to delete this material order?")) {
      deleteMaterialOrderMutation.mutate(id);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: MaterialOrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "ordered":
        return "bg-blue-500";
      case "back_ordered":
        return "bg-orange-500";
      case "shipped":
        return "bg-purple-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-slate-500";
      case "normal":
        return "bg-blue-500";
      case "high":
        return "bg-orange-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RotateCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-2xl font-semibold">Failed to load material orders</h2>
        <Button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/material-orders'] })}
          variant="outline"
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Material Orders</h1>
          <p className="text-muted-foreground">Manage materials ordering for the frame shop</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> New Material Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Material Order</DialogTitle>
              <DialogDescription>
                Add a new material order to the system
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="materialType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Material Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select material type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {materialTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={createForm.control}
                  name="materialName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="materialId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Material ID (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="vendor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="unitPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Price (Optional)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="totalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Price (Optional)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {materialOrderStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={createForm.control}
                  name="expectedDeliveryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expected Delivery Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={createMaterialOrderMutation.isPending}>
                    {createMaterialOrderMutation.isPending && (
                      <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Material Order
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex justify-between items-center mb-6">
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as MaterialOrderStatus | "all")}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            {materialOrderStatuses.map(status => (
              <TabsTrigger key={status} value={status}>
                {status.replace('_', ' ')}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center mb-4 gap-2">
        <Label htmlFor="type-filter" className="mr-2">Filter by type:</Label>
        <Select
          value={selectedType} 
          onValueChange={(value) => setSelectedType(value as MaterialType | "all")}
        >
          <SelectTrigger id="type-filter" className="w-[200px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {materialTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders?.length > 0 ? (
                filteredOrders.map((order: MaterialOrder) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">{order.materialName}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.materialType.replace('_', ' ')}
                        {order.materialId && ` (ID: ${order.materialId})`}
                      </div>
                    </TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{order.vendor || "N/A"}</TableCell>
                    <TableCell>
                      <Badge className={cn("capitalize", getStatusBadgeColor(order.status))}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("capitalize", getPriorityBadgeColor(order.priority))}>
                        {order.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.expectedDeliveryDate 
                        ? format(new Date(order.expectedDeliveryDate), "MMM d, yyyy")
                        : "Not set"
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditOrder(order)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => handleDeleteOrder(order.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-2" />
                    <p className="text-muted-foreground">No material orders found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Material Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Material Order</DialogTitle>
            <DialogDescription>
              Update the material order details
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              {/* Same form fields as create dialog but for editing */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="materialType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select material type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {materialTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="materialName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="materialId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material ID (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="totalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Price (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {materialOrderStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="expectedDeliveryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expected Delivery Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={updateMaterialOrderMutation.isPending}>
                  {updateMaterialOrderMutation.isPending && (
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Material Order
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaterialOrdersPage;