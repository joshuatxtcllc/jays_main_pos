import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { InventoryItem, Vendor, PurchaseOrder } from '@shared/inventory-schema';

/**
 * Hook for working with inventory items
 */
export function useInventoryItems(filters?: {
  type?: string;
  location?: string;
  lowStock?: boolean;
  search?: string;
}) {
  const queryParams = new URLSearchParams();
  
  if (filters?.type) queryParams.append('type', filters.type);
  if (filters?.location) queryParams.append('location', filters.location);
  if (filters?.lowStock) queryParams.append('lowStock', 'true');
  if (filters?.search) queryParams.append('search', filters.search);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  return useQuery({
    queryKey: ['/api/inventory/items', filters],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/inventory/items${queryString}`);
      const data = await response.json();
      return data as (InventoryItem & { currentStock: number; stockDetails: any[] })[];
    }
  });
}

/**
 * Hook for frame inventory items
 */
export function useFrameInventory() {
  return useInventoryItems({ type: 'frame' });
}

/**
 * Hook for mat inventory items
 */
export function useMatInventory() {
  return useInventoryItems({ type: 'mat' });
}

/**
 * Hook for glass inventory items
 */
export function useGlassInventory() {
  return useInventoryItems({ type: 'glass' });
}

/**
 * Hook for working with a single inventory item
 */
export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: ['/api/inventory/items', id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/inventory/items/${id}`);
      const data = await response.json();
      return data as (InventoryItem & { stock: any[]; transactions: any[] });
    },
    enabled: !!id,
  });
}

/**
 * Hook for inventory item mutations (create, update, delete)
 */
export function useInventoryItemMutations() {
  const queryClient = useQueryClient();
  
  const createMutation = useMutation({
    mutationFn: async (item: any) => {
      const response = await apiRequest('POST', '/api/inventory/items', item);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/items'] });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PATCH', `/api/inventory/items/${id}`, data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/items', variables.id] });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/inventory/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/items'] });
    }
  });
  
  return {
    createMutation,
    updateMutation,
    deleteMutation
  };
}

/**
 * Hook for updating stock levels
 */
export function useStockLevelMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      quantity, 
      location, 
      transactionType, 
      notes 
    }: { 
      id: string; 
      quantity: number; 
      location: string; 
      transactionType: string; 
      notes?: string 
    }) => {
      const response = await apiRequest('POST', `/api/inventory/stock/${id}`, {
        quantity,
        location,
        transactionType,
        notes
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/items', variables.id] });
    }
  });
}

/**
 * Hook for working with vendors
 */
export function useVendors() {
  return useQuery({
    queryKey: ['/api/inventory/vendors'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/inventory/vendors');
      return response.json() as Vendor[];
    }
  });
}

/**
 * Hook for working with low stock alerts
 */
export function useLowStockAlerts() {
  return useQuery({
    queryKey: ['/api/inventory/low-stock'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/inventory/low-stock');
      return response.json() as (InventoryItem & { currentStock: number })[];
    }
  });
}

/**
 * Hook for working with purchase orders
 */
export function usePurchaseOrders(filters?: {
  vendorId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const queryParams = new URLSearchParams();
  
  if (filters?.vendorId) queryParams.append('vendorId', filters.vendorId);
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.startDate) queryParams.append('startDate', filters.startDate.toISOString());
  if (filters?.endDate) queryParams.append('endDate', filters.endDate.toISOString());
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  return useQuery({
    queryKey: ['/api/inventory/purchase-orders', filters],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/inventory/purchase-orders${queryString}`);
      return response.json() as PurchaseOrder[];
    }
  });
}

/**
 * Hook for creating purchase orders
 */
export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ order, items }: { order: any; items: any[] }) => {
      const response = await apiRequest('POST', '/api/inventory/purchase-orders', {
        order,
        items
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/purchase-orders'] });
    }
  });
}

/**
 * Hook for generating automatic purchase orders from low stock
 */
export function useGenerateAutomaticPurchaseOrders() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/inventory/purchase-orders/auto-generate');
      return response.json() as PurchaseOrder[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/low-stock'] });
    }
  });
}

/**
 * Hook for inventory valuation
 */
export function useInventoryValuation() {
  return useQuery({
    queryKey: ['/api/inventory/valuation'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/inventory/valuation');
      return response.json() as {
        totalValue: number;
        valueByType: Record<string, number>;
        valueByVendor: Record<string, number>;
        items: (InventoryItem & { currentStock: number; stockValue: number })[];
      };
    }
  });
}

/**
 * Hook for inventory activity
 */
export function useInventoryActivity(startDate?: Date, endDate?: Date) {
  const queryParams = new URLSearchParams();
  
  if (startDate) queryParams.append('startDate', startDate.toISOString());
  if (endDate) queryParams.append('endDate', endDate.toISOString());
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  return useQuery({
    queryKey: ['/api/inventory/activity', startDate, endDate],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/inventory/activity${queryString}`);
      return response.json() as {
        totalTransactions: number;
        purchaseValue: number;
        saleValue: number;
        adjustmentValue: number;
        activityByDay: Record<string, {
          purchases: number;
          sales: number;
          adjustments: number;
        }>;
      };
    }
  });
}