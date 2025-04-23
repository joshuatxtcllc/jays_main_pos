import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

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
  return useQuery({
    queryKey: ['/api/materials/pick-list'],
    refetchOnWindowFocus: false
  });
}

export function useMaterialsBySupplier() {
  return useQuery({
    queryKey: ['/api/materials/by-supplier'],
    refetchOnWindowFocus: false
  });
}

export function useMaterialsForOrder(orderId: number) {
  return useQuery({
    queryKey: ['/api/materials/order', orderId],
    queryFn: () => apiRequest('GET', `/api/materials/order/${orderId}`)
      .then(res => res.json()),
    refetchOnWindowFocus: false,
    enabled: !!orderId
  });
}

export function useMaterialTypes() {
  return useQuery({
    queryKey: ['/api/materials/types'],
    refetchOnWindowFocus: false
  });
}

export function useMaterialSuppliers() {
  return useQuery({
    queryKey: ['/api/materials/suppliers'],
    refetchOnWindowFocus: false
  });
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Material> }) => {
      const response = await apiRequest('PATCH', `/api/materials/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials/pick-list'] });
      queryClient.invalidateQueries({ queryKey: ['/api/materials/by-supplier'] });
      
      toast({
        title: "Material updated",
        description: "The material has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePurchaseOrderPayload) => {
      const response = await apiRequest('POST', '/api/purchase-orders', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials/pick-list'] });
      queryClient.invalidateQueries({ queryKey: ['/api/materials/by-supplier'] });
      
      toast({
        title: "Purchase order created",
        description: "The purchase order has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create purchase order",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}