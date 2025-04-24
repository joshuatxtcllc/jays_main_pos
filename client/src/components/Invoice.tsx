import React, { useRef } from 'react';
import { Customer, Order, OrderGroup } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Printer, Send, Download } from 'lucide-react';
import { invoiceService } from '@/services/invoiceService';
import { useToast } from '@/hooks/use-toast';

interface InvoiceProps {
  orderGroup: OrderGroup;
  orders: Order[];
  customer: Customer;
  onClose?: () => void;
}

export function Invoice({ orderGroup, orders, customer, onClose }: InvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Format currency 
  const formatCurrency = (amount: string | number | null | undefined) => {
    if (!amount) return '$0.00';
    return `$${Number(amount).toFixed(2)}`;
  };

  // Format date
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MM/dd/yyyy');
  };

  // Handle printing
  const handlePrint = () => {
    const printContents = invoiceRef.current?.innerHTML || '';
    const originalContents = document.body.innerHTML;

    // Create a printable version with styles
    const printableContent = `
      <html>
        <head>
          <title>Invoice #${orderGroup.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            .invoice-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .invoice-title {
              font-size: 24px;
              font-weight: bold;
              color: #333;
            }
            .invoice-details {
              margin-bottom: 20px;
            }
            .invoice-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .invoice-table th, .invoice-table td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
            }
            .invoice-table th {
              background-color: #f0f0f0;
            }
            .invoice-totals {
              width: 100%;
              margin-top: 20px;
            }
            .invoice-totals td {
              padding: 5px;
            }
            .text-right {
              text-align: right;
            }
            .customer-details, .invoice-info {
              margin-bottom: 20px;
            }
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `;

    // Open a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printableContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };
    }
  };

  // Handle email sending
  const handleSendEmail = async () => {
    try {
      const result = await invoiceService.sendInvoiceByEmail(orderGroup.id);
      if (result.success) {
        toast({
          title: "Invoice Sent",
          description: `Invoice has been emailed to ${customer.email}`,
          variant: "default"
        });
      } else {
        toast({
          title: "Failed to Send",
          description: result.message || "There was an error sending the invoice",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not send invoice by email",
        variant: "destructive"
      });
    }
  };

  // Handle PDF download
  const handleDownload = () => {
    // This would be implemented with a PDF generation library
    // For now, we'll just trigger the print function as a fallback
    handlePrint();
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Invoice #{orderGroup.id}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          {customer.email && (
            <Button variant="outline" size="sm" onClick={handleSendEmail}>
              <Send className="mr-2 h-4 w-4" />
              Email
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6" ref={invoiceRef}>
          <div className="invoice-header">
            <div>
              <div className="invoice-title">Jays Frames Guru Framing</div>
              <div>123 Frame Street</div>
              <div>Anytown, ST 12345</div>
              <div>Phone: (555) 123-4567</div>
              <div>Email: info@jaysframes.com</div>
            </div>
            <div className="text-right">
              <div className="invoice-title">INVOICE</div>
              <div><strong>Invoice #:</strong> {orderGroup.id}</div>
              <div><strong>Date:</strong> {formatDate(orderGroup.createdAt)}</div>
              <div><strong>Due Date:</strong> {formatDate(orderGroup.paymentDate || orderGroup.createdAt)}</div>
              <div><strong>Status:</strong> {orderGroup.stripePaymentStatus || orderGroup.status}</div>
            </div>
          </div>

          <div className="flex justify-between mb-6">
            <div className="customer-details">
              <div className="font-bold mb-2">Bill To:</div>
              <div>{customer.name}</div>
              <div>{customer.address || 'No address on file'}</div>
              <div>Phone: {customer.phone || 'N/A'}</div>
              <div>Email: {customer.email || 'N/A'}</div>
            </div>
            <div className="invoice-info">
              <div><strong>Payment Method:</strong> {orderGroup.paymentMethod || 'N/A'}</div>
              {orderGroup.paymentMethod === 'check' && (
                <div><strong>Check #:</strong> {orderGroup.checkNumber || 'N/A'}</div>
              )}
              {orderGroup.discountAmount && (
                <div>
                  <strong>Discount:</strong> {orderGroup.discountType === 'percentage'
                    ? `${orderGroup.discountAmount}%`
                    : formatCurrency(orderGroup.discountAmount)}
                </div>
              )}
              <div><strong>Tax Exempt:</strong> {orderGroup.taxExempt ? 'Yes' : 'No'}</div>
            </div>
          </div>

          <table className="invoice-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Description</th>
                <th>Size</th>
                <th>Quantity</th>
                <th className="text-right">Price</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>Custom Framing #{order.id}</td>
                  <td>
                    {order.artworkDescription || 'Custom Frame'}<br />
                    {order.artworkType && <span>Type: {order.artworkType}</span>}
                  </td>
                  <td>
                    {order.artworkWidth}" × {order.artworkHeight}"<br />
                    Mat: {order.matWidth}"
                  </td>
                  <td>{order.quantity}</td>
                  <td className="text-right">{formatCurrency(order.subtotal)}</td>
                  <td className="text-right">{formatCurrency(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <table className="invoice-totals w-64">
              <tbody>
                <tr>
                  <td><strong>Subtotal:</strong></td>
                  <td className="text-right">{formatCurrency(orderGroup.subtotal)}</td>
                </tr>
                {orderGroup.discountAmount && (
                  <tr>
                    <td><strong>Discount:</strong></td>
                    <td className="text-right">-{formatCurrency(orderGroup.discountAmount)}</td>
                  </tr>
                )}
                <tr>
                  <td><strong>Tax:</strong></td>
                  <td className="text-right">{formatCurrency(orderGroup.tax)}</td>
                </tr>
                <tr className="border-t">
                  <td className="pt-2"><strong>Total:</strong></td>
                  <td className="text-right pt-2 font-bold">{formatCurrency(orderGroup.total)}</td>
                </tr>
                {orderGroup.paymentMethod === 'cash' && orderGroup.cashAmount && (
                  <>
                    <tr>
                      <td><strong>Cash Received:</strong></td>
                      <td className="text-right">{formatCurrency(orderGroup.cashAmount)}</td>
                    </tr>
                    <tr>
                      <td><strong>Change:</strong></td>
                      <td className="text-right">{formatCurrency(Number(orderGroup.cashAmount) - Number(orderGroup.total))}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-8 text-sm">
            <div className="font-bold mb-2">Terms & Conditions:</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Payment is due upon receipt unless other arrangements have been made.</li>
              <li>Custom framing orders cannot be returned or exchanged.</li>
              <li>Please retain this invoice for your records and for pickup of your completed orders.</li>
            </ul>
          </div>

          <div className="mt-4 pt-4 border-t text-center text-sm text-gray-500">
            Thank you for your business!
          </div>
        </CardContent>
      </Card>
    </div>
  );
}