
export interface ExternalKanbanOrder {
  orderId: string;
  customerName: string;
  artworkTitle?: string;
  frameSize: string;
  status: string;
  stage: string;
  priority: string;
  dueDate: string;
  createdAt: string;
  estimatedCompletion?: string;
  materials?: {
    frameType: string;
    matColor: string;
    glass: string;
  };
}

export interface ExternalKanbanResponse {
  success: boolean;
  orders: ExternalKanbanOrder[];
  error?: string;
}

class ExternalKanbanService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.EXTERNAL_KANBAN_URL || '';
    this.apiKey = process.env.EXTERNAL_KANBAN_API_KEY || '';
  }

  async fetchOrders(): Promise<ExternalKanbanResponse> {
    if (!this.baseUrl || !this.apiKey) {
      return {
        success: false,
        orders: [],
        error: 'External Kanban URL or API key not configured'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform external data to our internal format
      const transformedOrders = data.orders?.map((order: any) => ({
        id: order.orderId || order.id,
        orderNumber: order.orderId || order.orderNumber,
        customerName: order.customerName,
        artworkTitle: order.artworkTitle || order.description,
        frameSize: order.frameSize || `${order.width || 0}x${order.height || 0}`,
        status: this.mapExternalStatus(order.status),
        stage: order.stage || 'pending',
        priority: order.priority || 'standard',
        dueDate: order.dueDate,
        createdAt: order.createdAt,
        estimatedCompletion: order.estimatedCompletion,
        materials: order.materials || {
          frameType: order.frameType || 'Unknown',
          matColor: order.matColor || 'White',
          glass: order.glass || 'Regular'
        }
      })) || [];

      return {
        success: true,
        orders: transformedOrders
      };

    } catch (error) {
      console.error('Error fetching from external Kanban:', error);
      return {
        success: false,
        orders: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async updateOrderStatus(orderId: string, status: string, stage?: string, notes?: string): Promise<boolean> {
    if (!this.baseUrl || !this.apiKey) {
      console.error('External Kanban URL or API key not configured');
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: this.mapInternalToExternalStatus(status),
          stage,
          notes,
          updatedBy: 'Jays Frames POS',
          timestamp: new Date().toISOString()
        }),
        timeout: 10000
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating external Kanban order:', error);
      return false;
    }
  }

  private mapExternalStatus(externalStatus: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'pending',
      'in_progress': 'in_production',
      'in_production': 'in_production',
      'designing': 'in_design',
      'material_prep': 'awaiting_materials',
      'cutting': 'in_production',
      'assembly': 'in_production',
      'quality_check': 'in_production',
      'completed': 'ready_for_pickup',
      'ready': 'ready_for_pickup',
      'delivered': 'completed',
      'picked_up': 'completed'
    };
    
    return statusMap[externalStatus.toLowerCase()] || 'pending';
  }

  private mapInternalToExternalStatus(internalStatus: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'pending',
      'in_design': 'designing',
      'awaiting_materials': 'material_prep',
      'in_production': 'in_production',
      'ready_for_pickup': 'completed',
      'completed': 'delivered'
    };
    
    return statusMap[internalStatus] || 'pending';
  }

  async healthCheck(): Promise<{ status: string; connected: boolean; lastSync?: string }> {
    if (!this.baseUrl || !this.apiKey) {
      return {
        status: 'not_configured',
        connected: false
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      return {
        status: response.ok ? 'connected' : 'error',
        connected: response.ok,
        lastSync: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        connected: false
      };
    }
  }
}

export const externalKanbanService = new ExternalKanbanService();
