import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Material {
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

// Hook to get materials pick list
export const useMaterialsPickList = () => {
  return useQuery({
    queryKey: ['materials', 'pick-list'],
    queryFn: async (): Promise<Material[]> => {
      try {
        const response = await fetch('/api/materials/pick-list');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching materials pick list:', error);
        // Return empty array as fallback
        return [];
      }
    },
    retry: 1,
    retryDelay: 1000,
  });
};

// Hook to update material order
export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Material> }) => {
      try {
        const response = await fetch(`/api/materials/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to update material: ${errorText}`);
        }

        return response.json();
      } catch (error) {
        console.error('Error updating material:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
};

// Hook to create purchase order
export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ materialIds, expectedDeliveryDate }: { materialIds: string[]; expectedDeliveryDate: string }) => {
      try {
        const response = await fetch('/api/materials/purchase-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ materialIds, expectedDeliveryDate }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create purchase order: ${errorText}`);
        }

        return response.json();
      } catch (error) {
        console.error('Error creating purchase order:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
};

// Hook to get materials by supplier
export const useMaterialsBySupplier = () => {
  return useQuery({
    queryKey: ['materials', 'by-supplier'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/materials/by-supplier');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching materials by supplier:', error);
        return {};
      }
    },
    retry: 1,
  });
};

// Hook to get material types
export const useMaterialTypes = () => {
  return useQuery({
    queryKey: ['materials', 'types'],
    queryFn: async (): Promise<string[]> => {
      try {
        const response = await fetch('/api/materials/types');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching material types:', error);
        return ['frame', 'mat', 'glass', 'hardware'];
      }
    },
    retry: 1,
  });
};

// Hook to get material suppliers
export const useMaterialSuppliers = () => {
  return useQuery({
    queryKey: ['materials', 'suppliers'],
    queryFn: async (): Promise<string[]> => {
      try {
        const response = await fetch('/api/materials/suppliers');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching material suppliers:', error);
        return ['Larson-Juhl', 'Crescent', 'Tru Vue'];
      }
    },
    retry: 1,
  });
};