import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export interface Material {
  id: string;
  materialType: string;
  materialId: string;
  materialName: string;
  quantity: string;
  status: 'pending' | 'ordered' | 'processed' | 'arrived';
  supplier?: string;
  price?: string;
  color?: string;
  dimensions?: string;
  notes?: string;
  sourceOrderId?: number;
  orderDate?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  unitMeasurement?: string;
  priority?: 'low' | 'medium' | 'high';
  sku?: string;
}

export interface MaterialType {
  id: string;
  name: string;
}

export interface MaterialSupplier {
  id: string;
  name: string;
}

export interface CreatePurchaseOrderPayload {
  materialIds: string[];
  notes?: string;
  expectedDeliveryDate?: string;
}

export function useMaterialsPickList() {
  const { toast } = useToast();
  const [filtersApplied, setFiltersApplied] = useState(false);

  const { data: materials = [], isLoading, error } = useQuery({
    queryKey: ['/api/materials/pick-list'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/materials/pick-list');
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching materials pick list:', error);
        toast({
          title: "Error loading materials",
          description: error instanceof Error ? error.message : "Failed to load materials",
          variant: "destructive",
        });
        return [];
      }
    }
  });

  return {
    materials,
    isLoading,
    error,
    filtersApplied,
    setFiltersApplied,
  };
}

export function useMaterialsBySupplier() {
  return useQuery({
    queryKey: ['/api/materials/by-supplier'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/materials/by-supplier');
      return await response.json();
    }
  });
}

export function useMaterialsForOrder(orderId: number) {
  return useQuery({
    queryKey: ['/api/materials/by-order', orderId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/materials/by-order/${orderId}`);
      return await response.json();
    },
    enabled: !!orderId,
  });
}

export function useMaterialTypes() {
  return useQuery({
    queryKey: ['/api/materials/types'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/materials/types');
      return await response.json();
    }
  });
}

export function useMaterialSuppliers() {
  return useQuery({
    queryKey: ['/api/materials/suppliers'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/materials/suppliers');
      return await response.json();
    }
  });
}

export function useUpdateMaterial() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { id: string; data: Partial<Material> }) => {
      // Convert { id, data } format to the format expected by the server
      console.log('Updating material with data:', params);
      const response = await apiRequest('PATCH', `/api/materials/${params.id}`, params);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
      toast({
        title: "Material updated",
        description: "Material has been successfully updated",
      });
    },
    onError: (error: Error) => {
      console.error('Material update error:', error);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useCreatePurchaseOrder() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreatePurchaseOrderPayload) => {
      const response = await apiRequest('POST', '/api/materials/purchase-orders', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
      toast({
        title: "Purchase order created",
        description: "Purchase order has been successfully created",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useMaterials() {
  return useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const response = await apiRequest('/api/materials');
      const result = await response.json();
      // Handle both old and new response formats
      if (result.success && result.data) {
        return result.data;
      }
      return result.materials || result || [];
    }
  });
}