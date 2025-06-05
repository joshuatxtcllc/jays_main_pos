/**
 * ID Generator Utility
 * 
 * Provides functions to generate unique IDs for various entities in the system.
 */
import { randomUUID } from 'crypto';

/**
 * Generate a unique ID for any entity
 * @returns A unique string ID
 */
export function generateId(): string {
  return randomUUID();
}

/**
 * Generate a unique order number with a specified prefix
 * @param prefix The prefix to use (e.g., 'PO' for purchase orders, 'SO' for sales orders)
 * @returns A formatted order number string (e.g., PO-2023-001)
 */
export function generateOrderNumber(prefix: string): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${year}-${random}`;
}
/**
 * Generate a unique order number
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
}

/**
 * Generate a tracking ID
 */
export function generateTrackingId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a QR code ID
 */
export function generateQrCodeId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `QR-${timestamp}-${random}`.toUpperCase();
}
