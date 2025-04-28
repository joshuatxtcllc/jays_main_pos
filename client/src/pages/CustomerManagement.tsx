import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertCircle, 
  Loader2, 
  User, 
  ShoppingBag, 
  Bell, 
  LayoutDashboard, 
  Settings, 
  CreditCard,
  FileClock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import CustomerDashboard from "@/components/customer/CustomerDashboard";
import CustomerInvoicesList from "@/components/customer/CustomerInvoicesList";
import { Separator } from "@/components/ui/separator";

interface CustomerInfo {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  stripeCustomerId?: string | null;
  createdAt: string;
}

export default function CustomerManagement() {
  const [location] = useLocation();
  const pathSegments = location.split('/');
  const idFromPath = pathSegments[pathSegments.length - 1];
  
  // Check if we're on the "new" customer route
  const isNewCustomerRoute = idFromPath === 'new';
  // If we're on the new route, there's no customerId
  const customerId = !isNewCustomerRoute && !isNaN(parseInt(idFromPath)) ? parseInt(idFromPath) : undefined;
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<CustomerInfo>>({});
  const [activeTab, setActiveTab] = useState("dashboard");

  // Initialize edit mode if we're on the "new" customer route
  useEffect(() => {
    if (isNewCustomerRoute) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
      });
      setEditMode(true);
    }
  }, [isNewCustomerRoute]);

  // Fetch customer data if we have a customerId
  const { 
    data: customer, 
    isLoading: isLoadingCustomer, 
    error: customerError 
  } = useQuery<CustomerInfo>({ 
    queryKey: ['/api/customers', customerId],
    queryFn: () => {
      // Skip API call if we're creating a new customer
      if (isNewCustomerRoute || !customerId) {
        return Promise.resolve(undefined);
      }
      return fetch(`/api/customers/${customerId}`).then(res => {
        if (!res.ok) throw new Error('Failed to fetch customer');
        return res.json();
      });
    },
    enabled: !isNewCustomerRoute && !!customerId, // Only run query if we have a valid customer ID
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
        description: "Customer information has been updated successfully.",
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
  
  // Mutation for creating a new customer
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: Partial<CustomerInfo>) => {
      const res = await apiRequest('POST', '/api/customers', customerData);
      return await res.json();
    },
    onSuccess: (newCustomer) => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      setEditMode(false);
      toast({
        title: "Customer created",
        description: "New customer has been created successfully.",
        variant: "default",
      });
      // Navigate to the new customer's page
      navigate(`/customers/${newCustomer.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
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
    
    // Determine if we're creating a new customer or updating an existing one
    const isNewCustomer = customerId === undefined || isNaN(customerId) || !customer;
    
    if (isNewCustomer) {
      // Create a new customer
      createCustomerMutation.mutate(formData);
    } else {
      // Update existing customer
      updateCustomerMutation.mutate(formData);
    }
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

  if (isLoadingCustomer) {
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

  // Handle new customer form or not found cases
  if (isNewCustomerRoute || (!customer && !isLoadingCustomer)) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {isNewCustomerRoute ? "Create New Customer" : "Customer Account"}
          </h1>
          <div className="flex gap-2">
            {!isNewCustomerRoute && (
              <Button variant="default" onClick={() => navigate("/customers/new")} className="text-white">
                New Customer
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate("/customers")}>
              Back to Customers
            </Button>
          </div>
        </div>
        
        {!isNewCustomerRoute && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Customer Not Found</AlertTitle>
            <AlertDescription>
              The requested customer information could not be found. You can create a new customer using the "New Customer" button above.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Show create form for new customers */}
        {isNewCustomerRoute && (
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>
                Enter the information for the new customer
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    onClick={() => navigate("/customers")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createCustomerMutation.isPending}
                    className="text-white"
                  >
                    {createCustomerMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Customer
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Customer Account</h1>
        <div className="flex gap-2">
          <Button variant="default" onClick={() => navigate("/customers/new")} className="text-white">
            New Customer
          </Button>
          <Button variant="outline" onClick={() => navigate("/customers")}>
            Back to Customers
          </Button>
        </div>
      </div>

      <div className="flex flex-col space-y-6">
        {/* Customer Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl flex items-center">
                  <User className="h-6 w-6 mr-2 text-primary" />
                  {customer?.name}
                </CardTitle>
                <CardDescription>
                  Manage customer information
                </CardDescription>
              </div>
              
              {!editMode && (
                <Button 
                  variant="outline" 
                  onClick={handleEditClick}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
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
                    className="text-white"
                  >
                    {updateCustomerMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground">Full Name</Label>
                  <div className="text-lg">{customer?.name}</div>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground">Email Address</Label>
                  <div className="text-lg">{customer?.email || 'Not provided'}</div>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground">Phone Number</Label>
                  <div className="text-lg">{customer?.phone || 'Not provided'}</div>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground">Address</Label>
                  <div className="text-lg">{customer?.address || 'Not provided'}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Tabs for different sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 grid grid-cols-4 md:w-auto md:grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center">
              <FileClock className="h-4 w-4 mr-2" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            {customer && customerId && <CustomerDashboard customerId={customerId} />}
          </TabsContent>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  View and manage customer orders and their production status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center py-10">
                  <div className="text-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Orders Tab Under Development</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-md">
                      This tab will show a detailed list of all orders with production status, due dates, and other important details.
                    </p>
                    <Button 
                      variant="default" 
                      className="mt-4 text-white"
                      onClick={() => {
                        if (customerId) {
                          navigate(`/pos?customerId=${customerId}`);
                        }
                      }}
                    >
                      Create New Order
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="invoices">
            {customer && customerId && <CustomerInvoicesList customerId={customerId} />}
          </TabsContent>
          
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Manage payment methods and billing information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center py-10">
                  <div className="text-center">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Payments Tab Under Development</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-md">
                      This tab will show saved payment methods, billing preferences, and payment history.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setActiveTab("dashboard")}
                    >
                      Return to Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}