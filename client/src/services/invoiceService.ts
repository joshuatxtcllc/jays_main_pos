import { Customer, Order, OrderGroup } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface InvoiceDetails {
  orderGroup: OrderGroup;
  orders: Order[];
  customer: Customer;
}

export const invoiceService = {
  /**
   * Generate a printable invoice for an order group
   */
  generateInvoice: async (orderGroupId: number): Promise<InvoiceDetails> => {
    try {
      const response = await apiRequest('GET', `/api/invoices/${orderGroupId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to generate invoice:", error);
      throw error;
    }
  },

  /**
   * Send invoice by email to customer
   */
  sendInvoiceByEmail: async (orderGroupId: number, email?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiRequest('POST', `/api/invoices/${orderGroupId}/send`, { email });
      return await response.json();
    } catch (error) {
      console.error("Failed to send invoice by email:", error);
      throw error;
    }
  },

  /**
   * Mark an invoice as sent
   */
  markInvoiceAsSent: async (orderGroupId: number): Promise<{ success: boolean }> => {
    try {
      const response = await apiRequest('PATCH', `/api/invoices/${orderGroupId}/mark-sent`);
      return await response.json();
    } catch (error) {
      console.error("Failed to mark invoice as sent:", error);
      throw error;
    }
  },

  /**
   * Get all invoices for a customer
   */
  getCustomerInvoices: async (customerId: number): Promise<InvoiceDetails[]> => {
    try {
      const response = await apiRequest('GET', `/api/customers/${customerId}/invoices`);
      return await response.json();
    } catch (error) {
      console.error("Failed to get customer invoices:", error);
      throw error;
    }
  }
};