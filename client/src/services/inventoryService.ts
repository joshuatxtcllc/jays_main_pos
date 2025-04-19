import { apiRequest } from "@/lib/queryClient";
import type { 
  InventoryItem, 
  InsertInventoryItem, 
  Supplier, 
  InsertSupplier,
  InventoryLocation,
  InsertInventoryLocation,
  PurchaseOrder,
  InsertPurchaseOrder,
  InventoryTransaction,
  InsertInventoryTransaction,
  InventoryCategory
} from "@shared/schema";

const API_BASE = "/api/inventory";

// Inventory Items
export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  const res = await apiRequest("GET", `${API_BASE}/items`);
  return res.json();
};

export const getInventoryItem = async (id: number): Promise<InventoryItem> => {
  const res = await apiRequest("GET", `${API_BASE}/items/${id}`);
  return res.json();
};

export const createInventoryItem = async (item: InsertInventoryItem): Promise<InventoryItem> => {
  const res = await apiRequest("POST", `${API_BASE}/items`, item);
  return res.json();
};

export const updateInventoryItem = async (id: number, item: Partial<InventoryItem>): Promise<InventoryItem> => {
  const res = await apiRequest("PATCH", `${API_BASE}/items/${id}`, item);
  return res.json();
};

export const deleteInventoryItem = async (id: number): Promise<void> => {
  await apiRequest("DELETE", `${API_BASE}/items/${id}`);
};

export const getLowStockItems = async (): Promise<InventoryItem[]> => {
  const res = await apiRequest("GET", `${API_BASE}/items/low-stock`);
  return res.json();
};

export const getItemByBarcode = async (barcode: string): Promise<InventoryItem> => {
  const res = await apiRequest("GET", `${API_BASE}/items/barcode/${barcode}`);
  return res.json();
};

// Suppliers
export const getSuppliers = async (): Promise<Supplier[]> => {
  const res = await apiRequest("GET", `${API_BASE}/suppliers`);
  return res.json();
};

export const getSupplier = async (id: number): Promise<Supplier> => {
  const res = await apiRequest("GET", `${API_BASE}/suppliers/${id}`);
  return res.json();
};

export const createSupplier = async (supplier: InsertSupplier): Promise<Supplier> => {
  const res = await apiRequest("POST", `${API_BASE}/suppliers`, supplier);
  return res.json();
};

export const updateSupplier = async (id: number, supplier: Partial<Supplier>): Promise<Supplier> => {
  const res = await apiRequest("PATCH", `${API_BASE}/suppliers/${id}`, supplier);
  return res.json();
};

export const deleteSupplier = async (id: number): Promise<void> => {
  await apiRequest("DELETE", `${API_BASE}/suppliers/${id}`);
};

// Inventory Locations
export const getInventoryLocations = async (): Promise<InventoryLocation[]> => {
  const res = await apiRequest("GET", `${API_BASE}/locations`);
  return res.json();
};

export const getInventoryLocation = async (id: number): Promise<InventoryLocation> => {
  const res = await apiRequest("GET", `${API_BASE}/locations/${id}`);
  return res.json();
};

export const createInventoryLocation = async (location: InsertInventoryLocation): Promise<InventoryLocation> => {
  const res = await apiRequest("POST", `${API_BASE}/locations`, location);
  return res.json();
};

// Purchase Orders
export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  const res = await apiRequest("GET", `${API_BASE}/purchase-orders`);
  return res.json();
};

export const getPurchaseOrder = async (id: number): Promise<PurchaseOrder> => {
  const res = await apiRequest("GET", `${API_BASE}/purchase-orders/${id}`);
  return res.json();
};

export const createPurchaseOrder = async (
  purchaseOrder: InsertPurchaseOrder, 
  lines: any[]
): Promise<PurchaseOrder> => {
  const res = await apiRequest("POST", `${API_BASE}/purchase-orders`, {
    ...purchaseOrder,
    lines
  });
  return res.json();
};

// Inventory Transactions
export const createInventoryTransaction = async (
  transaction: InsertInventoryTransaction
): Promise<InventoryTransaction> => {
  const res = await apiRequest("POST", `${API_BASE}/transactions`, transaction);
  return res.json();
};

// Inventory Valuation
export const getInventoryValuation = async (): Promise<any> => {
  const res = await apiRequest("GET", `${API_BASE}/valuation`);
  return res.json();
};

// Recommended Purchase Orders
export const getRecommendedPurchaseOrders = async (): Promise<any> => {
  const res = await apiRequest("GET", `${API_BASE}/recommended-purchase-orders`);
  return res.json();
};

// Import/Export
export const importInventoryFromCSV = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append("csvFile", file);
  
  const res = await fetch(`${API_BASE}/import-csv`, {
    method: "POST",
    body: formData,
  });
  
  return res.json();
};

export const exportInventoryToCSV = async (): Promise<Blob> => {
  const res = await apiRequest("GET", `${API_BASE}/export-csv`);
  return res.blob();
};