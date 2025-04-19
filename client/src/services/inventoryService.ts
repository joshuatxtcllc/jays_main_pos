import { InventoryItem, InsertInventoryItem, Supplier, InsertSupplier, InventoryLocation, PurchaseOrder } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Function to fetch all inventory items
export async function getAllInventoryItems(): Promise<InventoryItem[]> {
  const response = await apiRequest("GET", "/api/inventory/items");
  return await response.json();
}

// Function to fetch an inventory item by ID
export async function getInventoryItemById(id: number): Promise<InventoryItem> {
  const response = await apiRequest("GET", `/api/inventory/items/${id}`);
  return await response.json();
}

// Function to create a new inventory item
export async function createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
  const response = await apiRequest("POST", "/api/inventory/items", item);
  // Invalidate the inventory items cache
  queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
  return await response.json();
}

// Function to update an inventory item
export async function updateInventoryItem(id: number, item: Partial<InventoryItem>): Promise<InventoryItem> {
  const response = await apiRequest("PATCH", `/api/inventory/items/${id}`, item);
  // Invalidate specific item and all items caches
  queryClient.invalidateQueries({ queryKey: ["/api/inventory/items", id] });
  queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
  return await response.json();
}

// Function to delete an inventory item
export async function deleteInventoryItem(id: number): Promise<void> {
  await apiRequest("DELETE", `/api/inventory/items/${id}`);
  // Invalidate the inventory items cache
  queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
}

// Function to fetch low stock items
export async function getLowStockItems(): Promise<InventoryItem[]> {
  const response = await apiRequest("GET", "/api/inventory/items/low-stock");
  return await response.json();
}

// Function to fetch all suppliers
export async function getAllSuppliers(): Promise<Supplier[]> {
  const response = await apiRequest("GET", "/api/inventory/suppliers");
  return await response.json();
}

// Function to fetch a supplier by ID
export async function getSupplierById(id: number): Promise<Supplier> {
  const response = await apiRequest("GET", `/api/inventory/suppliers/${id}`);
  return await response.json();
}

// Function to create a new supplier
export async function createSupplier(supplier: InsertSupplier): Promise<Supplier> {
  const response = await apiRequest("POST", "/api/inventory/suppliers", supplier);
  // Invalidate the suppliers cache
  queryClient.invalidateQueries({ queryKey: ["/api/inventory/suppliers"] });
  return await response.json();
}

// Function to update a supplier
export async function updateSupplier(id: number, supplier: Partial<Supplier>): Promise<Supplier> {
  const response = await apiRequest("PATCH", `/api/inventory/suppliers/${id}`, supplier);
  // Invalidate specific supplier and all suppliers caches
  queryClient.invalidateQueries({ queryKey: ["/api/inventory/suppliers", id] });
  queryClient.invalidateQueries({ queryKey: ["/api/inventory/suppliers"] });
  return await response.json();
}

// Function to delete a supplier
export async function deleteSupplier(id: number): Promise<void> {
  await apiRequest("DELETE", `/api/inventory/suppliers/${id}`);
  // Invalidate the suppliers cache
  queryClient.invalidateQueries({ queryKey: ["/api/inventory/suppliers"] });
}

// Function to fetch all inventory locations
export async function getAllLocations(): Promise<InventoryLocation[]> {
  const response = await apiRequest("GET", "/api/inventory/locations");
  return await response.json();
}

// Purchase order related functions
export async function getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
  const response = await apiRequest("GET", "/api/inventory/purchase-orders");
  return await response.json();
}

export async function getPurchaseOrderById(id: number): Promise<PurchaseOrder> {
  const response = await apiRequest("GET", `/api/inventory/purchase-orders/${id}`);
  return await response.json();
}

export async function createPurchaseOrder(poData: any): Promise<PurchaseOrder> {
  const response = await apiRequest("POST", "/api/inventory/purchase-orders", poData);
  queryClient.invalidateQueries({ queryKey: ["/api/inventory/purchase-orders"] });
  return await response.json();
}

// Inventory transaction functions
export async function createInventoryTransaction(transactionData: any): Promise<any> {
  const response = await apiRequest("POST", "/api/inventory/transactions", transactionData);
  queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
  return await response.json();
}

// Barcode scanning function - for future integration with barcode scanner
export async function lookupItemByBarcode(barcode: string): Promise<InventoryItem | null> {
  try {
    const response = await apiRequest("GET", `/api/inventory/barcode/${barcode}`);
    return await response.json();
  } catch (error) {
    console.error("Error looking up barcode:", error);
    return null;
  }
}

// Function to get current inventory valuation
export async function getInventoryValuation(): Promise<{
  totalValue: number;
  itemCount: number;
  valuationByCategory: { category: string; value: number }[];
}> {
  const response = await apiRequest("GET", "/api/inventory/valuation");
  return await response.json();
}

// Function to generate recommended purchase orders based on reorder levels
export async function generateRecommendedPurchaseOrders(): Promise<any> {
  const response = await apiRequest("GET", "/api/inventory/recommended-orders");
  return await response.json();
}

// Function to import inventory items from CSV
export async function importInventoryFromCSV(file: File): Promise<{ 
  success: boolean; 
  importedCount: number;
  errors: string[] 
}> {
  const formData = new FormData();
  formData.append("csvFile", file);
  
  const response = await fetch("/api/inventory/import", {
    method: "POST",
    body: formData,
  });
  
  queryClient.invalidateQueries({ queryKey: ["/api/inventory/items"] });
  return await response.json();
}

// Function to export inventory items to CSV
export async function exportInventoryToCSV(): Promise<string> {
  const response = await apiRequest("GET", "/api/inventory/export", null, {
    responseType: "blob"
  });
  
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}