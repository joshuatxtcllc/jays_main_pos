import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Customer, 
  Order, 
  OrderGroup, 
  MatColor, 
  Frame, 
  GlassOption 
} from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

// Create PDF and printing utilities
const printInvoice = () => {
  window.print();
};

export interface InvoiceProps {
  orders: Order[];
  customer: Customer;
  orderGroup: OrderGroup;
  onSendByEmail?: () => void;
  onClose?: () => void;
  showControls?: boolean;
}

const Invoice: React.FC<InvoiceProps> = ({ 
  orders, 
  customer, 
  orderGroup,
  onSendByEmail,
  onClose,
  showControls = true
}) => {
  const { toast } = useToast();

  const handleEmailInvoice = async () => {
    if (onSendByEmail) {
      onSendByEmail();
    } else {
      // Default implementation if no callback provided
      try {
        const response = await fetch(`/api/invoices/${orderGroup.id}/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: customer.email
          }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          toast({
            title: 'Invoice sent',
            description: `Invoice has been emailed to ${customer.email}`,
          });
        } else {
          toast({
            title: 'Error',
            description: data.message || 'Failed to send invoice by email',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error sending invoice by email:', error);
        toast({
          title: 'Error',
          description: 'Failed to send invoice by email',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="invoice-container p-6 max-w-4xl mx-auto">
      {/* Print-only styles */}
      <style type="text/css" media="print">
        {`
          @page { size: letter; margin: 0.5in; }
          .no-print { display: none !important; }
          .invoice-container { padding: 0 !important; }
          body { background: white !important; }
        `}
      </style>
      
      {/* Invoice Header */}
      <div className="flex justify-between mb-8 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">Jays Frames Guru Framing</h1>
          <p>123 Main Street</p>
          <p>Anytown, USA 12345</p>
          <p>Phone: (555) 123-4567</p>
          <p>Email: contact@jaysframes.com</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold">INVOICE</h2>
          <p className="text-sm text-muted-foreground">Invoice #: {orderGroup.id}</p>
          <p className="text-sm text-muted-foreground">Date: {new Date(orderGroup.createdAt || new Date()).toLocaleDateString()}</p>
          <p className="text-sm text-muted-foreground">Due: On Receipt</p>
          <p className={`font-bold text-lg ${orderGroup.status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
            {orderGroup.status === 'paid' ? 'PAID' : 'UNPAID'}
          </p>
        </div>
      </div>
      
      {/* Customer Information */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Customer Information:</h3>
        <p>{customer.name}</p>
        <p>{customer.email}</p>
        <p>{customer.phone}</p>
        <p>{customer.address}</p>
        {customer.taxExempt && <p className="text-green-600 font-medium">** Tax Exempt Customer **</p>}
      </div>
      
      {/* Order Items Table */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Order Items:</h3>
        <table className="w-full border-collapse">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-right">Price</th>
              <th className="p-2 text-right">Qty</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="p-2">Custom Framing #{order.id}</td>
                <td className="p-2">
                  <div>
                    <p className="font-medium">{order.artworkDescription || 'Artwork'}</p>
                    <p className="text-sm">Frame: {order.frameName}</p>
                    <p className="text-sm">Mat: {order.matName}</p>
                    <p className="text-sm">Glass: {order.glassName}</p>
                    <p className="text-sm">Dimensions: {order.artworkWidth}" × {order.artworkHeight}"</p>
                    {order.productionStatus === 'completed' && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Completed</span>
                    )}
                  </div>
                </td>
                <td className="p-2 text-right">{formatCurrency(Number(order.price))}</td>
                <td className="p-2 text-right">{order.quantity}</td>
                <td className="p-2 text-right">{formatCurrency(Number(order.price) * order.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64">
          <div className="flex justify-between border-b py-2">
            <span>Subtotal:</span>
            <span>{formatCurrency(Number(orderGroup.subtotal))}</span>
          </div>
          {orderGroup.discount > 0 && (
            <div className="flex justify-between border-b py-2 text-green-600">
              <span>Discount:</span>
              <span>-{formatCurrency(Number(orderGroup.discount))}</span>
            </div>
          )}
          <div className="flex justify-between border-b py-2">
            <span>Tax ({(Number(orderGroup.tax) / Number(orderGroup.subtotal) * 100).toFixed(2)}%):</span>
            <span>{formatCurrency(Number(orderGroup.tax))}</span>
          </div>
          <div className="flex justify-between py-2 font-semibold text-lg">
            <span>Total:</span>
            <span>{formatCurrency(Number(orderGroup.total))}</span>
          </div>
          {orderGroup.paymentMethod && (
            <div className="flex justify-between py-2 text-sm text-muted-foreground">
              <span>Payment Method:</span>
              <span>{orderGroup.paymentMethod}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Notes */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Notes:</h3>
        <p className="text-sm text-muted-foreground">
          {orderGroup.notes || 'Thank you for your business! All custom framing services include our quality craftsmanship and attention to detail. Please keep your invoice as proof of purchase.'}
        </p>
      </div>
      
      {/* Terms */}
      <div className="text-xs text-muted-foreground mb-8">
        <h4 className="font-semibold mb-1">Terms and Conditions:</h4>
        <p>Custom framing is non-refundable due to its unique nature. We guarantee our craftsmanship and will repair any defects in workmanship at no charge. Please inspect your order carefully upon receipt. Any damage claims must be made within 7 days of pickup or delivery.</p>
      </div>
      
      {/* Controls (hidden when printing) */}
      {showControls && (
        <div className="flex justify-end gap-4 mt-8 no-print">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="outline" onClick={handleEmailInvoice}>Email Invoice</Button>
          <Button onClick={printInvoice}>Print Invoice</Button>
        </div>
      )}
    </div>
  );
};

export default Invoice;