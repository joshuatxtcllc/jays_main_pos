import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as inventoryService from "@/services/inventoryService";
import { toast } from "@/hooks/use-toast";
import type { 
  InventoryItem, 
  InsertInventoryItem, 
  Supplier, 
  InsertSupplier,
  InventoryLocation,
  InsertInventoryLocation,
  PurchaseOrder
} from "@shared/schema";

// Query key constants
const INVENTORY_ITEMS_KEY = "/api/inventory/items";
const SUPPLIERS_KEY = "/api/inventory/suppliers";
const LOCATIONS_KEY = "/api/inventory/locations";
const PURCHASE_ORDERS_KEY = "/api/inventory/purchase-orders";
const LOW_STOCK_KEY = "/api/inventory/items/low-stock";
const VALUATION_KEY = "/api/inventory/valuation";
const RECOMMENDED_ORDERS_KEY = "/api/inventory/recommended-purchase-orders";
const METRICS_KEY = "/api/inventory/metrics";
const ACTIVITY_KEY = "/api/inventory/activity";
const STOCK_HISTORY_KEY = "/api/inventory/stock-history";
const BATCH_OPERATIONS_KEY = "/api/inventory/batch-operations";

// Inventory Items hooks
export const useInventoryItems = () => {
  return useQuery({
    queryKey: [INVENTORY_ITEMS_KEY],
    queryFn: inventoryService.getInventoryItems
  });
};

export const useInventoryItem = (id: number) => {
  return useQuery({
    queryKey: [INVENTORY_ITEMS_KEY, id],
    queryFn: () => inventoryService.getInventoryItem(id),
    // Only fetch when ID is available and valid
    enabled: !!id
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: InsertInventoryItem) => inventoryService.createInventoryItem(item),
    onSuccess: () => {
      // Invalidate and refetch inventory items
      queryClient.invalidateQueries({ queryKey: [INVENTORY_ITEMS_KEY] });
      toast({
        title: "Item created",
        description: "Inventory item has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating item",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useUpdateInventoryItem = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: Partial<InventoryItem>) => inventoryService.updateInventoryItem(id, item),
    onSuccess: () => {
      // Invalidate specific item and all items
      queryClient.invalidateQueries({ queryKey: [INVENTORY_ITEMS_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [INVENTORY_ITEMS_KEY] });
      toast({
        title: "Item updated",
        description: "Inventory item has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating item",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => inventoryService.deleteInventoryItem(id),
    onSuccess: () => {
      // Invalidate and refetch inventory items
      queryClient.invalidateQueries({ queryKey: [INVENTORY_ITEMS_KEY] });
      toast({
        title: "Item deleted",
        description: "Inventory item has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting item",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useLowStockItems = () => {
  return useQuery({
    queryKey: [LOW_STOCK_KEY],
    queryFn: inventoryService.getLowStockItems
  });
};

export const useItemByBarcode = (barcode: string) => {
  return useQuery({
    queryKey: [`${INVENTORY_ITEMS_KEY}/barcode`, barcode],
    queryFn: () => inventoryService.getItemByBarcode(barcode),
    // Only fetch when barcode is available and valid
    enabled: !!barcode && barcode.length > 0
  });
};

// Suppliers hooks
export const useSuppliers = () => {
  return useQuery({
    queryKey: [SUPPLIERS_KEY],
    queryFn: inventoryService.getSuppliers
  });
};

export const useSupplier = (id: number) => {
  return useQuery({
    queryKey: [SUPPLIERS_KEY, id],
    queryFn: () => inventoryService.getSupplier(id),
    // Only fetch when ID is available and valid
    enabled: !!id
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (supplier: InsertSupplier) => inventoryService.createSupplier(supplier),
    onSuccess: () => {
      // Invalidate and refetch suppliers
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY] });
      toast({
        title: "Supplier created",
        description: "Supplier has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating supplier",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useUpdateSupplier = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (supplier: Partial<Supplier>) => inventoryService.updateSupplier(id, supplier),
    onSuccess: () => {
      // Invalidate specific supplier and all suppliers
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY] });
      toast({
        title: "Supplier updated",
        description: "Supplier has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating supplier",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => inventoryService.deleteSupplier(id),
    onSuccess: () => {
      // Invalidate and refetch suppliers
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY] });
      toast({
        title: "Supplier deleted",
        description: "Supplier has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting supplier",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Inventory Locations hooks
export const useInventoryLocations = () => {
  return useQuery({
    queryKey: [LOCATIONS_KEY],
    queryFn: inventoryService.getInventoryLocations
  });
};

export const useInventoryLocation = (id: number) => {
  return useQuery({
    queryKey: [LOCATIONS_KEY, id],
    queryFn: () => inventoryService.getInventoryLocation(id),
    enabled: !!id
  });
};

export const useCreateInventoryLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (location: InsertInventoryLocation) => 
      inventoryService.createInventoryLocation(location),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LOCATIONS_KEY] });
      toast({
        title: "Location created",
        description: "Inventory location has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating location",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Purchase Orders hooks
export const usePurchaseOrders = () => {
  return useQuery({
    queryKey: [PURCHASE_ORDERS_KEY],
    queryFn: inventoryService.getPurchaseOrders
  });
};

export const usePurchaseOrder = (id: number) => {
  return useQuery({
    queryKey: [PURCHASE_ORDERS_KEY, id],
    queryFn: () => inventoryService.getPurchaseOrder(id),
    enabled: !!id
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ purchaseOrder, lines }: { 
      purchaseOrder: any, 
      lines: any[] 
    }) => inventoryService.createPurchaseOrder(purchaseOrder, lines),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PURCHASE_ORDERS_KEY] });
      toast({
        title: "Purchase order created",
        description: "Purchase order has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating purchase order",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Inventory Transactions hooks
export const useCreateInventoryTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventoryService.createInventoryTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_ITEMS_KEY] });
      toast({
        title: "Transaction recorded",
        description: "Inventory transaction has been successfully recorded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error recording transaction",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Inventory Valuation hooks
export const useInventoryValuation = () => {
  return useQuery({
    queryKey: [VALUATION_KEY],
    queryFn: inventoryService.getInventoryValuation
  });
};

// Recommended Purchase Orders hooks
export const useRecommendedPurchaseOrders = () => {
  return useQuery({
    queryKey: [RECOMMENDED_ORDERS_KEY],
    queryFn: inventoryService.getRecommendedPurchaseOrders
  });
};

// Dashboard and Analytics hooks
export const useInventoryMetrics = () => {
  return useQuery({
    queryKey: [METRICS_KEY],
    queryFn: inventoryService.getInventoryMetrics
  });
};

export const useInventoryActivity = (timeframe: 'week' | 'month' | 'quarter' = 'month') => {
  return useQuery({
    queryKey: [ACTIVITY_KEY, timeframe],
    queryFn: () => inventoryService.getInventoryActivity(timeframe)
  });
};

export const useStockHistory = (itemId: number, period: 'month' | 'quarter' | 'year' = 'month') => {
  return useQuery({
    queryKey: [STOCK_HISTORY_KEY, itemId, period],
    queryFn: () => inventoryService.getStockHistory(itemId, period),
    enabled: !!itemId
  });
};

// Batch Operations hooks
export const useBatchUpdateItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: { ids: number[], changes: Partial<InventoryItem> }) => 
      inventoryService.batchUpdateItems(updates.ids, updates.changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_ITEMS_KEY] });
      toast({
        title: "Batch update successful",
        description: "Selected inventory items have been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Batch update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useBatchDeleteItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => inventoryService.batchDeleteItems(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_ITEMS_KEY] });
      toast({
        title: "Batch delete successful",
        description: "Selected inventory items have been deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Batch delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Import/Export hooks
export const useImportInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => inventoryService.importInventoryFromCSV(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_ITEMS_KEY] });
      toast({
        title: "Import successful",
        description: "Inventory items have been successfully imported.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useExportInventory = () => {
  return useMutation({
    mutationFn: inventoryService.exportInventoryToCSV,
    onSuccess: (blob) => {
      // Create a download link for the CSV file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventory-export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "Export successful",
        description: "Inventory items have been successfully exported to CSV.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<InventoryLocation[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventoryData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch inventory data with error handling for each request
      const fetchWithErrorHandling = async (url: string) => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
        }
        return response.json();
      };

      const [itemsData, locationsData, suppliersData, lowStockData] = await Promise.all([
        fetchWithErrorHandling('/api/inventory/items'),
        fetchWithErrorHandling('/api/inventory/locations'),
        fetchWithErrorHandling('/api/inventory/suppliers'),
        fetchWithErrorHandling('/api/inventory/items/low-stock')
      ]);

      setItems(itemsData || []);
      setLocations(locationsData || []);
      setSuppliers(suppliersData || []);
      setLowStockItems(lowStockData || []);
    } catch (err) {
      console.error('Error loading data from inventory API:', err);
      setError('The string did not match the expected pattern.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  return { items, locations, suppliers, lowStockItems, loading, error };
}