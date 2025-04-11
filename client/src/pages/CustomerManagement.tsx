import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, PackageOpen, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface CustomerInfo {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  stripeCustomerId?: string | null;
  createdAt: string;
}

interface Order {
  id: number;
  customerId: number;
  orderGroupId: number;
  frameId: string;
  matColorId: string;
  glassOptionId: string;
  artworkWidth: string;
  artworkHeight: string;
  matWidth: string;
  artworkDescription?: string | null;
  artworkType?: string | null;
  subtotal: string;
  tax: string;
  total: string;
  status: string;
  createdAt: string;
  dueDate?: string | null;
  artworkImage?: string | null;
}

interface OrderGroup {
  id: number;
  customerId: number;
  subtotal?: string | null;
  tax?: string | null;
  total?: string | null;
  status: string;
  paymentMethod?: string | null;
  notes?: string | null;
  createdAt: string;
  stripePaymentIntentId?: string | null;
  stripePaymentStatus?: string | null;
  paymentDate?: string | null;
}

interface OrderHistory {
  orderGroup: OrderGroup;
  orders: Order[];
  orderDate: string;
  paymentDate?: string | null;
  paymentStatus?: string | null;
  total?: string | null;
}

export default function CustomerManagement() {
  const [location] = useLocation();
  const pathSegments = location.split('/');
  const idFromPath = pathSegments[pathSegments.length - 1];
  const customerId = !isNaN(parseInt(idFromPath)) ? parseInt(idFromPath) : 1;
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<CustomerInfo>>({});

  // Fetch customer data
  const { 
    data: customer, 
    isLoading: isLoadingCustomer, 
    error: customerError 
  } = useQuery<CustomerInfo>({ 
    queryKey: ['/api/customers', customerId],
    queryFn: () => fetch(`/api/customers/${customerId}`).then(res => {
      if (!res.ok) throw new Error('Failed to fetch customer');
      return res.json();
    }),
  });

  // Fetch customer order history
  const { 
    data: orderHistory, 
    isLoading: isLoadingHistory, 
    error: historyError 
  } = useQuery<OrderHistory[]>({ 
    queryKey: ['/api/customers', customerId, 'orders'],
    queryFn: () => fetch(`/api/customers/${customerId}/orders`).then(res => {
      if (!res.ok) throw new Error('Failed to fetch order history');
      return res.json();
    }),
  });

  // Mutation for updating customer information
  const updateCustomerMutation = useMutation({
    mutationFn: async (customerData: Partial<CustomerInfo>) => {
      const res = await apiRequest('PATCH', `/api/customers/${customerId}`, customerData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers', customerId] });
      setEditMode(false);
      toast({
        title: "Customer updated",
        description: "Your information has been updated successfully.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerMutation.mutate(formData);
  };

  // Enable edit mode and populate form with current data
  const handleEditClick = () => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
      });
      setEditMode(true);
    }
  };

  // Format date helper function
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'succeeded':
      case 'paid':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case 'pending':
      case 'in_progress':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case 'cancelled':
      case 'failed':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  // View an individual order
  const viewOrder = (orderId: number) => {
    // Navigate to order details page
    navigate(`/orders/${orderId}`);
  };

  // View order group (checkout)
  const viewOrderGroup = (orderGroupId: number) => {
    // Navigate to checkout page if the order is still open
    navigate(`/checkout/${orderGroupId}`);
  };

  if (isLoadingCustomer || isLoadingHistory) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (customerError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {customerError instanceof Error ? customerError.message : "Failed to load customer information"}
        </AlertDescription>
      </Alert>
    );
  }

  if (!customer) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Customer Not Found</AlertTitle>
        <AlertDescription>
          The requested customer information could not be found.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Customer Account</h1>
        <Button variant="outline" onClick={() => navigate("/")}>
          Back to POS
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>
                View and manage your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone"
                        name="phone"
                        value={formData.phone || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address"
                        name="address"
                        value={formData.address || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={updateCustomerMutation.isPending}
                    >
                      {updateCustomerMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                      <p className="mt-1">{customer.name}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Email Address</h3>
                      <p className="mt-1">{customer.email || "Not provided"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Phone Number</h3>
                      <p className="mt-1">{customer.phone || "Not provided"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                      <p className="mt-1">{customer.address || "Not provided"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Customer Since</h3>
                      <p className="mt-1">{formatDate(customer.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleEditClick}>
                      Edit Information
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                View your past and current orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyError ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {historyError instanceof Error ? historyError.message : "Failed to load order history"}
                  </AlertDescription>
                </Alert>
              ) : orderHistory && orderHistory.length > 0 ? (
                <div className="space-y-6">
                  {orderHistory.map((history) => (
                    <div key={history.orderGroup.id} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row justify-between mb-4 gap-2">
                        <div>
                          <h3 className="text-lg font-medium">Order #{history.orderGroup.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            Placed on {formatDate(history.orderDate)}
                          </p>
                        </div>
                        
                        <div className="flex flex-col md:items-end">
                          <div className="flex items-center">
                            <span className="mr-2">Status:</span>
                            <Badge className={getStatusColor(history.orderGroup.status)}>
                              {history.orderGroup.status.charAt(0).toUpperCase() + history.orderGroup.status.slice(1)}
                            </Badge>
                          </div>
                          
                          {history.paymentStatus && (
                            <div className="flex items-center mt-1">
                              <span className="mr-2">Payment:</span>
                              <Badge className={getStatusColor(history.paymentStatus)}>
                                {history.paymentStatus.charAt(0).toUpperCase() + history.paymentStatus.slice(1)}
                              </Badge>
                            </div>
                          )}
                          
                          {history.total && (
                            <p className="text-sm font-medium mt-1">
                              Total: ${parseFloat(history.total).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Items ({history.orders.length})</h4>
                        <div className="space-y-2">
                          {history.orders.map((order) => (
                            <div key={order.id} className="flex justify-between items-center py-2 border-b last:border-0">
                              <div className="flex items-center">
                                <PackageOpen className="h-5 w-5 mr-2 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">Frame #{order.id}</p>
                                  <div className="grid grid-cols-1 text-sm text-muted-foreground gap-1">
                                    <p>
                                      <span className="font-medium">Image Size:</span> {order.artworkWidth}" x {order.artworkHeight}"
                                    </p>
                                    <p>
                                      <span className="font-medium">Mat Width:</span> {order.matWidth}"
                                    </p>
                                    {/* Calculate finished size (image + mat on all sides) */}
                                    <p>
                                      <span className="font-medium">Finished Size:</span> {(parseFloat(order.artworkWidth) + parseFloat(order.matWidth) * 2).toFixed(1)}" x {(parseFloat(order.artworkHeight) + parseFloat(order.matWidth) * 2).toFixed(1)}"
                                    </p>
                                    {order.artworkDescription && 
                                      <p><span className="font-medium">Description:</span> {order.artworkDescription}</p>
                                    }
                                  </div>
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => viewOrder(order.id)}
                              >
                                View
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-4">
                        {history.orderGroup.status === 'open' && (
                          <Button 
                            className="ml-2"
                            onClick={() => viewOrderGroup(history.orderGroup.id)}
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Continue to Payment
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <PackageOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Orders Yet</h3>
                  <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                  <Button 
                    className="mt-4"
                    onClick={() => navigate("/")}
                  >
                    Start Shopping
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}