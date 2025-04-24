import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Customer, OrderGroup, Order } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { invoiceService } from '@/services/invoiceService';
import { Invoice } from '@/components/Invoice';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Printer, Send } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface CustomerInvoicesProps {
  customer: Customer;
}

export function CustomerInvoices({ customer }: CustomerInvoicesProps) {
  const { toast } = useToast();
  const [selectedInvoice, setSelectedInvoice] = useState<{
    orderGroup: OrderGroup;
    orders: Order[];
    customer: Customer;
  } | null>(null);

  // Fetch all invoices for the customer
  const { 
    data: invoices, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: [`/api/customers/${customer.id}/invoices`],
    queryFn: () => invoiceService.getCustomerInvoices(customer.id),
    enabled: !!customer.id,
  });

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

  // View invoice details
  const viewInvoice = (invoice: { orderGroup: OrderGroup; orders: Order[]; customer: Customer }) => {
    setSelectedInvoice(invoice);
  };

  // Send invoice by email
  const sendInvoice = async (orderGroupId: number) => {
    try {
      const result = await invoiceService.sendInvoiceByEmail(orderGroupId);
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

  // Handle printing an invoice
  const printInvoice = async (orderGroupId: number) => {
    try {
      const invoiceData = await invoiceService.generateInvoice(orderGroupId);
      setSelectedInvoice(invoiceData);
      // The invoice component will handle the actual printing
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not generate printable invoice",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Failed to load invoices"}
        </AlertDescription>
      </Alert>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Invoices</AlertTitle>
        <AlertDescription>
          There are no invoices available for this customer yet.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.orderGroup.id}>
              <TableCell className="font-medium">{invoice.orderGroup.id}</TableCell>
              <TableCell>{formatDate(invoice.orderGroup.createdAt)}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  ['succeeded', 'paid', 'completed'].includes(invoice.orderGroup.stripePaymentStatus || invoice.orderGroup.status || '')
                    ? 'bg-green-100 text-green-800'
                    : ['pending', 'processing'].includes(invoice.orderGroup.stripePaymentStatus || invoice.orderGroup.status || '')
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {invoice.orderGroup.stripePaymentStatus || invoice.orderGroup.status}
                </span>
              </TableCell>
              <TableCell>{invoice.orderGroup.paymentMethod}</TableCell>
              <TableCell className="text-right">{formatCurrency(invoice.orderGroup.total)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => viewInvoice(invoice)}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => printInvoice(invoice.orderGroup.id)}
                  >
                    <Printer className="h-4 w-4" />
                    <span className="sr-only">Print</span>
                  </Button>
                  {customer.email && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => sendInvoice(invoice.orderGroup.id)}
                    >
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Email</span>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog 
        open={!!selectedInvoice} 
        onOpenChange={(isOpen) => !isOpen && setSelectedInvoice(null)}
      >
        <DialogContent className="max-w-4xl">
          {selectedInvoice && (
            <Invoice 
              orderGroup={selectedInvoice.orderGroup}
              orders={selectedInvoice.orders}
              customer={selectedInvoice.customer}
              onClose={() => setSelectedInvoice(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}