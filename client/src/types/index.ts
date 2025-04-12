// Material Types
export type MaterialType = 
  | "frame" 
  | "matboard" 
  | "glass" 
  | "backing_board" 
  | "hardware" 
  | "specialty_materials";

// Material Order Statuses - Import from the shared schema
import { MaterialOrderStatus as SharedMaterialOrderStatus } from "@shared/schema";
export type MaterialOrderStatus = SharedMaterialOrderStatus;

// Production Status
export type ProductionStatus = 
  | "scheduled" 
  | "in_production" 
  | "materials_arrived" 
  | "frame_cut" 
  | "mat_cut" 
  | "prepped" 
  | "completed" 
  | "delayed";

// Notification Types
export type NotificationType =
  | "status_update" 
  | "estimated_completion" 
  | "status_change" 
  | "due_date_update" 
  | "order_complete" 
  | "payment_reminder" 
  | "delay_notification";

// Customer Type
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxExempt: boolean;
  createdAt: string;
}

// Frame Type
export interface Frame {
  id: string;
  name: string;
  width: string;
  material: string;
  finish: string;
  price: string;
  depth: string;
  rabbet: string;
  manufacturer: string;
  catalogImage: string;
  corner?: string;
  edgeTexture?: string;
  color?: string;
}

// MatColor Type
export interface MatColor {
  id: string;
  name: string;
  color: string;
  price: string;
  manufacturer: string;
  code: string;
  description: string;
  category: string;
}

// GlassOption Type
export interface GlassOption {
  id: string;
  name: string;
  type: string;
  price: string;
  properties: string;
  description: string;
}

// SpecialService Type
export interface SpecialService {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
}

// OrderGroup Type
export interface OrderGroup {
  id: number;
  customerId: number;
  subtotal: string;
  tax: string;
  total: string;
  discount?: string;
  status: string;
  isPaid: boolean;
  createdAt: string;
  taxExempt: boolean;
  paymentMethod?: string;
  notes?: string;
}

// Order Type
export interface Order {
  id: number;
  customerId: number;
  orderGroupId: number;
  frameId: string;
  matColorId: string;
  glassOptionId: string;
  artworkWidth: string;
  artworkHeight: string;
  matWidth: string;
  floatingArtwork: boolean;
  subtotal: string;
  tax: string;
  total: string;
  artDescription?: string;
  artType?: string;
  notes?: string;
  createdAt: string;
  productionStatus?: ProductionStatus;
  estimatedCompletionDate?: string;
  quantity?: number;
  notificationsEnabled?: boolean;
  previousStatus?: ProductionStatus;
}

// MaterialOrder Type
export interface MaterialOrder {
  id: number;
  quantity: string;
  materialType: MaterialType;
  materialId: string;
  materialName: string;
  status: MaterialOrderStatus;
  notes: string | null;
  sourceOrderId: number | null;
  vendor: string | null;
  unitPrice: string | null;
  totalPrice: string | null;
  expectedDeliveryDate: string | null;
  createdAt: string;
  priority: string;
}

// CustomerNotification Type
export interface CustomerNotification {
  id: number;
  customerId: number;
  orderId: number;
  message: string;
  notificationType: NotificationType;
  sentAt: string;
  channel: string;
  read: boolean;
  previousStatus?: string;
  newStatus?: string;
}