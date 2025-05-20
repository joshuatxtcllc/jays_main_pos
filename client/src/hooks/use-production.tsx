import { useToast } from '@/hooks/use-toast';
import { Order, ProductionStatus } from '@shared/schema';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Combined hook for production and notification functionality
export function useProduction({
  orderId,
  customerId,
}: {
  orderId?: number;
  customerId?: number;
}) {
  const { toast } = useToast();

  // Get all orders with their production statuses for the Kanban board
  const kanbanQuery = useQuery({
    queryKey: ['/api/production/kanban'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/production/kanban');
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch Kanban orders');
        }
        return res.json();
      } catch (error) {
        console.error('Kanban board fetch error:', error);
        // Return empty array instead of throwing to prevent breaking the UI
        return [];
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Get a specific order
  const orderQuery = useQuery({
    queryKey: ['/api/orders', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch order');
      }
      return res.json();
    },
    enabled: !!orderId,
  });

  // Get notifications for a specific customer
  const customerNotifications = useQuery({
    queryKey: ['/api/notifications/customer', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const res = await fetch(`/api/notifications/customer/${customerId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch customer notifications');
      }
      return res.json();
    },
    enabled: !!customerId,
  });

  // Get notifications for a specific order
  const orderNotifications = useQuery({
    queryKey: ['/api/notifications/order', orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const res = await fetch(`/api/notifications/order/${orderId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch order notifications');
      }
      return res.json();
    },
    enabled: !!orderId,
  });

  // Get orders by specific production status
  const getOrdersByStatus = (status: ProductionStatus) => {
    return useQuery({
      queryKey: ['/api/production/status', status],
      queryFn: async () => {
        const res = await fetch(`/api/production/status/${status}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch orders with status ${status}`);
        }
        return res.json();
      },
    });
  };

  // Update an order's production status
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: ProductionStatus }) => {
      const res = await apiRequest('PATCH', `/api/production/status/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Order status updated',
        description: 'The order status has been successfully updated',
      });
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/production/kanban'] });
      queryClient.invalidateQueries({ queryKey: ['/api/production/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/order'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update order status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Schedule an order for production with estimated days to completion
  const scheduleOrderMutation = useMutation({
    mutationFn: async ({ id, estimatedDays }: { id: number, estimatedDays: number }) => {
      const res = await apiRequest('POST', `/api/production/schedule/${id}`, { estimatedDays });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Order scheduled',
        description: 'The order has been scheduled for production',
      });
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/production/kanban'] });
      queryClient.invalidateQueries({ queryKey: ['/api/production/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/order'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to schedule order',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Toggle notifications for an order
  const toggleNotificationsMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: number, enabled: boolean }) => {
      const res = await apiRequest('PATCH', `/api/orders/${id}/notifications`, { enabled });
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Notification preferences updated',
        description: `Email notifications have been ${variables.enabled ? 'enabled' : 'disabled'} for this order`,
      });
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      if (orderId) {
        queryClient.invalidateQueries({ queryKey: ['/api/orders', orderId] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/production/kanban'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update notification preferences',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    // Kanban board data
    orders: kanbanQuery.data,
    isLoadingOrders: kanbanQuery.isLoading,
    ordersError: kanbanQuery.error,
    
    // Specific order data
    order: orderQuery.data,
    isLoadingOrder: orderQuery.isLoading,
    orderError: orderQuery.error,
    
    // Notifications data
    customerNotifications: customerNotifications.data || [],
    orderNotifications: orderNotifications.data || [],
    isLoadingCustomerNotifications: customerNotifications.isLoading,
    isLoadingOrderNotifications: orderNotifications.isLoading,
    
    // Helper functions
    getOrdersByStatus,
    
    // Mutations
    updateOrderStatus: updateOrderStatusMutation.mutate,
    scheduleOrder: scheduleOrderMutation.mutate,
    toggleNotificationsMutation,
    
    // Mutation states
    isUpdating: updateOrderStatusMutation.isPending,
    isScheduling: scheduleOrderMutation.isPending,
  };
}

// For backward compatibility
export function useProductionKanban() {
  const production = useProduction({});
  
  // Ensure that even if there's an error, we provide some default values
  // This prevents the component from breaking when data is missing
  return {
    orders: production.orders || [],
    isLoading: production.isLoadingOrders || false,
    error: production.ordersError || null,
    useOrdersByStatus: production.getOrdersByStatus,
    updateOrderStatus: production.updateOrderStatus || ((data: any) => console.warn("updateOrderStatus not available")),
    scheduleOrder: production.scheduleOrder || ((data: any) => console.warn("scheduleOrder not available")),
    isUpdating: production.isUpdating || false,
    isScheduling: production.isScheduling || false,
  };
}

// For backward compatibility
export function useCustomerNotifications(customerId?: number, orderId?: number) {
  const production = useProduction({ customerId, orderId });
  
  return {
    customerNotifications: production.customerNotifications,
    orderNotifications: production.orderNotifications,
    isLoadingCustomerNotifications: production.isLoadingCustomerNotifications,
    isLoadingOrderNotifications: production.isLoadingOrderNotifications,
    customerNotificationsError: production.ordersError,
    orderNotificationsError: production.orderError,
  };
}