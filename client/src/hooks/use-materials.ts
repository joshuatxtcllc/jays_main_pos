import {
  useQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Material item types
interface MaterialItem {
  id: string;
  orderIds: number[];
  name: string;
  sku: string;
  supplier: string;
  type: string;
  quantity: number;
  status: string;
  orderDate?: string;
  receiveDate?: string;
  priority: "low" | "medium" | "high";
  notes?: string;
}

// Update material order params
interface UpdateMaterialOrderParams {
  id: string;
  status?: string;
  notes?: string;
  orderDate?: string;
  receiveDate?: string;
}

// Get all materials in the pick list
export const useMaterialPickList = () => {
  return useQuery<MaterialItem[]>({
    queryKey: ['/api/materials/pick-list'],
  });
};

// Get materials grouped by supplier
export const useMaterialsBySupplier = () => {
  return useQuery<Record<string, MaterialItem[]>>({
    queryKey: ['/api/materials/by-supplier'],
  });
};

// Get materials for a specific order
export const useMaterialsForOrder = (orderId: number) => {
  return useQuery<MaterialItem[]>({
    queryKey: ['/api/materials/order', orderId],
    enabled: !!orderId, // Only run if orderId is provided
  });
};

// Update material order status and notes
export const useUpdateMaterialOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (params: UpdateMaterialOrderParams) => {
      const response = await apiRequest(
        'PATCH', 
        `/api/materials/${params.id}`,
        params
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating material",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Create a purchase order from selected materials
export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (materialIds: string[]) => {
      const response = await apiRequest(
        'POST', 
        '/api/purchase-orders',
        { materialIds }
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating purchase order",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Get material types (for filters)
export const useMaterialTypes = () => {
  return useQuery<string[]>({
    queryKey: ['/api/materials/types'],
  });
};

// Get material suppliers (for filters)
export const useMaterialSuppliers = () => {
  return useQuery<string[]>({
    queryKey: ['/api/materials/suppliers'],
  });
};