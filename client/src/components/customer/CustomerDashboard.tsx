import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ShoppingBag, CreditCard, FileText, Clock, DollarSign, TrendingUp, History, CalendarClock, AlertCircle, ChevronRight, Loader2 } from "lucide-react";
import { format, subMonths, isAfter } from "date-fns";
import CustomerInvoicesList from "./CustomerInvoicesList";
import { CustomerStatusHistory } from '@/components/OrderStatusHistory'; // Added import


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
  status: string;
  productionStatus: string;
  createdAt: string;
  dueDate: string | null;
  total: string;
}

interface OrderGroup {
  id: number;
  status: string;
  total: string | null;
  createdAt: string;
  paymentMethod: string | null;
}

interface Metrics {
  totalSpent: number;
  orderCount: number;
  averageOrderValue: number;
  recentOrderDate: string | null;
  upcomingOrders: number;
  inProgressOrders: number;
  paymentMethods: Record<string, number>;
  ordersByMonth: Record<string, number>;
}

export default function CustomerDashboard({ customerId }: { customerId: number }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [timeRange, setTimeRange] = useState<'all' | '6months' | '12months'>('all');

  // Fetch customer data
  const { data: customer, isLoading: isLoadingCustomer } = useQuery<CustomerInfo>({
    queryKey: ['/api/customers', customerId],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${customerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer data');
      }
      return response.json();
    },
  });

  // Fetch customer order history
  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ['/api/orders', { customerId }],
    queryFn: async () => {
      const response = await fetch(`/api/orders?customerId=${customerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order history');
      }
      return response.json();
    },
  });

  // Fetch customer order groups
  const { data: orderGroups, isLoading: isLoadingOrderGroups } = useQuery<OrderGroup[]>({
    queryKey: ['/api/order-groups', { customerId }],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${customerId}/orders`);
      if (!response.ok) {
        throw new Error('Failed to fetch order groups');
      }
      // Extract order groups from the response
      const orderHistory = await response.json();
      return orderHistory.map((item: any) => item.orderGroup);
    },
  });

  // Format date helper function
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Calculate customer metrics based on order history
  const calculateMetrics = (): Metrics => {
    if (!orders || !orderGroups) {
      return {
        totalSpent: 0,
        orderCount: 0,
        averageOrderValue: 0,
        recentOrderDate: null,
        upcomingOrders: 0,
        inProgressOrders: 0,
        paymentMethods: {},
        ordersByMonth: {},
      };
    }

    // Filter based on selected time range
    const filteredOrders = orders.filter(order => {
      if (timeRange === 'all') return true;

      const orderDate = new Date(order.createdAt);
      const cutoffDate = timeRange === '6months' 
        ? subMonths(new Date(), 6) 
        : subMonths(new Date(), 12);

      return isAfter(orderDate, cutoffDate);
    });

    const filteredOrderGroups = orderGroups.filter(group => {
      if (timeRange === 'all') return true;

      const orderDate = new Date(group.createdAt);
      const cutoffDate = timeRange === '6months' 
        ? subMonths(new Date(), 6) 
        : subMonths(new Date(), 12);

      return isAfter(orderDate, cutoffDate);
    });

    // Calculate metrics
    const totalSpent = filteredOrderGroups.reduce((sum, group) => 
      sum + (group.total ? parseFloat(group.total) : 0), 0);

    const orderCount = filteredOrderGroups.length;
    const averageOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;

    // Find most recent order date
    const orderDates = filteredOrders
      .map(order => new Date(order.createdAt).getTime())
      .sort((a, b) => b - a);
    const recentOrderDate = orderDates.length > 0 
      ? new Date(orderDates[0]).toISOString() 
      : null;

    // Count upcoming and in-progress orders
    const upcomingOrders = filteredOrders.filter(
      order => order.dueDate && new Date(order.dueDate) > new Date()
    ).length;

    const inProgressOrders = filteredOrders.filter(
      order => 
        order.productionStatus !== 'completed' && 
        order.productionStatus !== 'order_processed'
    ).length;

    // Count payment methods
    const paymentMethods: Record<string, number> = {};
    filteredOrderGroups.forEach(group => {
      const method = group.paymentMethod || 'unknown';
      paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    });

    // Orders by month
    const ordersByMonth: Record<string, number> = {};
    filteredOrders.forEach(order => {
      const monthYear = format(new Date(order.createdAt), 'MMM yyyy');
      ordersByMonth[monthYear] = (ordersByMonth[monthYear] || 0) + 1;
    });

    return {
      totalSpent,
      orderCount,
      averageOrderValue,
      recentOrderDate,
      upcomingOrders,
      inProgressOrders,
      paymentMethods,
      ordersByMonth,
    };
  };

  const metrics = calculateMetrics();

  // Status badge helper
  const getStatusBadge = (status: string) => {
    let color = "";
    switch (status.toLowerCase()) {
      case 'active':
        color = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
        break;
      case 'inactive':
        color = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
        break;
      default:
        color = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
    }
    return <Badge className={color}>{status}</Badge>;
  };

  if (isLoadingCustomer || isLoadingOrders || isLoadingOrderGroups) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Not Found</CardTitle>
          <CardDescription>Could not find customer information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span>The requested customer information could not be found.</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => navigate("/customers")}>
            Back to Customers
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer Overview */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">{customer.name}</CardTitle>
              <CardDescription>
                Customer since {formatDate(customer.createdAt)}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:items-end">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-muted-foreground">Status:</span>
                {getStatusBadge('Active')}
              </div>
              {customer.stripeCustomerId && (
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-sm text-green-600">Stripe Customer</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Total Spent</span>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-2xl font-bold">${metrics.totalSpent.toFixed(2)}</span>
              <div className="mt-auto pt-2 text-xs text-muted-foreground">
                Lifetime value
              </div>
            </div>
            <div className="flex flex-col p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Orders</span>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-2xl font-bold">{metrics.orderCount}</span>
              <div className="mt-auto pt-2 text-xs text-muted-foreground">
                Total orders placed
              </div>
            </div>
            <div className="flex flex-col p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Average Order</span>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-2xl font-bold">
                ${metrics.averageOrderValue.toFixed(2)}
              </span>
              <div className="mt-auto pt-2 text-xs text-muted-foreground">
                Average order value
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm font-medium mb-3">Contact Information</h3>
              <div className="space-y-2">
                {customer.email && (
                  <div className="flex items-start">
                    <span className="w-20 text-sm text-muted-foreground">Email:</span>
                    <span className="flex-1 text-sm">{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-start">
                    <span className="w-20 text-sm text-muted-foreground">Phone:</span>
                    <span className="flex-1 text-sm">{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start">
                    <span className="w-20 text-sm text-muted-foreground">Address:</span>
                    <span className="flex-1 text-sm">{customer.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="text-sm font-medium mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Recent Order</span>
                  </div>
                  <span className="text-sm font-medium">
                    {metrics.recentOrderDate ? formatDate(metrics.recentOrderDate) : 'No orders'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Upcoming Orders</span>
                  </div>
                  <span className="text-sm font-medium">{metrics.upcomingOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <History className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">In Progress</span>
                  </div>
                  <span className="text-sm font-medium">{metrics.inProgressOrders}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <div className="flex space-x-2">
            <Button 
              variant={timeRange === 'all' ? "default" : "outline"} 
              size="sm"
              onClick={() => setTimeRange('all')}
              className={timeRange === 'all' ? "text-white" : ""}
            >
              All Time
            </Button>
            <Button 
              variant={timeRange === '12months' ? "default" : "outline"} 
              size="sm"
              onClick={() => setTimeRange('12months')}
              className={timeRange === '12months' ? "text-white" : ""}
            >
              Last 12 Months
            </Button>
            <Button 
              variant={timeRange === '6months' ? "default" : "outline"} 
              size="sm"
              onClick={() => setTimeRange('6months')}
              className={timeRange === '6months' ? "text-white" : ""}
            >
              Last 6 Months
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/?customerId=${customer.id}`)}
          >
            Create Order
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* Customer Invoices Section */}
      <CustomerInvoicesList customerId={customerId} />

      {/* Customer Activity Timeline */}
      <div className="mt-8">
        <CustomerActivityTimeline customerId={customerId} />
      </div>
    </div>
  );
}