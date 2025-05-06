
import { apiRequest } from '@/lib/queryClient';

export interface QrCodeData {
  id: number;
  code: string;
  type: string;
  entityId: string;
  title: string;
  description?: string;
  createdAt: string;
  lastScanned?: string;
  scanCount: number;
}

/**
 * Generate a QR code for an order
 */
export async function generateOrderQrCode(orderId: number, title?: string) {
  try {
    const response = await apiRequest('POST', '/api/qr-codes', {
      type: 'order',
      entityId: orderId.toString(),
      title: title || `Order #${orderId}`,
      description: `Framing Order #${orderId}`,
    });

    if (!response.ok) {
      throw new Error('Failed to generate QR code');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating QR code for order:', error);
    throw error;
  }
}

/**
 * Generate a QR code for materials related to an order
 */
export async function generateMaterialQrCode(orderId: number, materialType: string, materialId: string) {
  try {
    const response = await apiRequest('POST', '/api/qr-codes', {
      type: 'material',
      entityId: `${orderId}-${materialType}-${materialId}`,
      title: `${materialType.toUpperCase()} for Order #${orderId}`,
      description: `Material tracking for Order #${orderId}`,
    });

    if (!response.ok) {
      throw new Error('Failed to generate QR code');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating QR code for material:', error);
    throw error;
  }
}

/**
 * Get QR code by entity type and id
 */
export async function getQrCodeByEntity(type: string, entityId: string): Promise<QrCodeData | null> {
  try {
    // First try to find by type and entityId
    const response = await apiRequest('GET', `/api/qr-codes/search?type=${type}&entityId=${entityId}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch QR code');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching QR code:', error);
    return null;
  }
}

/**
 * Link a QR code to a material location
 */
export async function linkQrCodeToMaterialLocation(qrCodeId: number, materialLocationId: number) {
  try {
    const response = await apiRequest('POST', '/api/qr-codes/link-material', {
      qrCodeId,
      materialLocationId,
    });

    if (!response.ok) {
      throw new Error('Failed to link QR code to material location');
    }

    return await response.json();
  } catch (error) {
    console.error('Error linking QR code to material location:', error);
    throw error;
  }
}
