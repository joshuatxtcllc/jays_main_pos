import { useToast } from '@/hooks/use-toast';
import { Order, ProductionStatus } from '@shared/schema';
import { useQuery, useMutation, queryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function useProductionKanban() {
  const { toast } = useToast();

  // Get all orders with their production statuses for the Kanban board
  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/production/kanban'],
    queryFn: async () => {
      const res = await fetch('/api/production/kanban');
      if (!res.ok) {
        throw new Error('Failed to fetch Kanban orders');
      }
      return res.json();
    },
  });

  // Get orders by specific production status
  const useOrdersByStatus = (status: ProductionStatus) => {
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
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to schedule order',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    orders,
    isLoading,
    error,
    useOrdersByStatus,
    updateOrderStatus: updateOrderStatusMutation.mutate,
    scheduleOrder: scheduleOrderMutation.mutate,
    isUpdating: updateOrderStatusMutation.isPending,
    isScheduling: scheduleOrderMutation.isPending,
  };
}

export function useCustomerNotifications(customerId?: number, orderId?: number) {
  const { toast } = useToast();

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

  return {
    customerNotifications: customerNotifications.data || [],
    orderNotifications: orderNotifications.data || [],
    isLoadingCustomerNotifications: customerNotifications.isLoading,
    isLoadingOrderNotifications: orderNotifications.isLoading,
    customerNotificationsError: customerNotifications.error,
    orderNotificationsError: orderNotifications.error,
  };
}