import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Printer, Send, FileText, Filter, Search } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

// Simplified types based on the schema
interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

interface OrderGroup {
  id: number;
  customerId: number;
  subtotal: string | null;
  tax: string | null;
  total: string | null;
  status: string;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string;
  stripePaymentIntentId: string | null;
  stripePaymentStatus: string | null;
  paymentDate: string | null;
}

interface Order {
  id: number;
  customerId: number;
  orderGroupId: number;
  frameId: string;
  matColorId: string;
  glassOptionId: string;
  artworkWidth: string;
  artworkHeight: string;
  matWidth: string;
  artworkDescription: string | null;
  artworkType: string | null;
  quantity: number;
  subtotal: string;
  tax: string;
  total: string;
  status: string;
  productionStatus: string;
  createdAt: string;
}

interface Invoice {
  orderGroup: OrderGroup;
  orders: Order[];
  customer: Customer;
}

interface CustomerInvoicesListProps {
  customerId: number;
}

export default function CustomerInvoicesList({ customerId }: CustomerInvoicesListProps) {
  const { toast } = useToast();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');

  // Fetch customer data
  const { data: customer, isLoading: isLoadingCustomer } = useQuery<Customer>({
    queryKey: ['/api/customers', customerId],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${customerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer data');
      }
      return response.json();
    },
  });

  // Fetch all invoices for the customer
  const { 
    data: invoiceData, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['/api/customers', customerId, 'invoices'],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${customerId}/orders`);
      if (!response.ok) {
        throw new Error('Failed to load invoices');
      }
      const orderHistory = await response.json();
      return orderHistory.map((item: any) => ({
        orderGroup: item.orderGroup,
        orders: item.orders,
        customer: customer,
      }));
    },
    enabled: !!customerId && !!customer,
  });

  // Format currency 
  const formatCurrency = (amount: string | number | null | undefined) => {
    if (!amount) return '$0.00';
    return `$${Number(amount).toFixed(2)}`;
  };

  // Format date
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // View invoice details
  const viewInvoice = (invoice: Invoice): void => {
    setSelectedInvoice(invoice);
  };

  // Send invoice by email
  const sendInvoice = async (orderGroupId: number): Promise<void> => {
    try {
      // Send invoice via API
      const response = await fetch(`/api/invoices/send/${orderGroupId}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: "Invoice Sent",
          description: `Invoice has been emailed to ${customer?.email}`,
          variant: "default"
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Failed to Send",
          description: errorData.message || "There was an error sending the invoice",
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
  const printInvoice = (invoice: Invoice): void => {
    setSelectedInvoice(invoice);
    // Let the invoice component handle printing via the UI
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // Apply filters and search
  const filteredInvoices = invoiceData ? invoiceData.filter(invoice => {
    // Filter by search term
    const matchesSearch = 
      searchTerm === '' || 
      invoice.orderGroup.id.toString().includes(searchTerm) ||
      (invoice.orderGroup.notes && invoice.orderGroup.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filter by status
    const matchesStatus = 
      statusFilter === 'all' || 
      invoice.orderGroup.status === statusFilter ||
      invoice.orderGroup.stripePaymentStatus === statusFilter;

    // Filter by payment method
    const matchesPaymentMethod = 
      paymentMethodFilter === 'all' || 
      invoice.orderGroup.paymentMethod === paymentMethodFilter;

    return matchesSearch && matchesStatus && matchesPaymentMethod;
  }) : [];

  // Get unique payment methods
  const paymentMethods = invoiceData 
    ? [...new Set(invoiceData.map(invoice => invoice.orderGroup.paymentMethod || 'unknown'))]
    : [];

  // Get unique statuses
  const statuses = invoiceData 
    ? [...new Set(invoiceData.map(invoice => 
        invoice.orderGroup.stripePaymentStatus || invoice.orderGroup.status
      ))]
    : [];

  if (isLoading || isLoadingCustomer) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Invoices & Order History</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              window.open(`/api/invoices/export/${customerId}`, '_blank');
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </CardTitle>
        <CardDescription>
          View and manage all invoices for this customer
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(!invoiceData || invoiceData.length === 0) ? (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Invoices</AlertTitle>
            <AlertDescription>
              There are no invoices available for this customer yet.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by invoice #, notes..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] text-xs">
                    <Filter className="h-3.5 w-3.5 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status || 'unknown'}>
                        {status || 'Unknown Status'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                  <SelectTrigger className="w-[180px] text-xs">
                    <Filter className="h-3.5 w-3.5 mr-2" />
                    <SelectValue placeholder="Filter by payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment Methods</SelectItem>
                    {paymentMethods.map(method => (
                      <SelectItem key={method} value={method}>
                        {method === 'credit_card' ? 'Credit Card' : 
                         method === 'cash' ? 'Cash' : 
                         method === 'check' ? 'Check' : 
                         method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No invoices match your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.orderGroup.id}>
                        <TableCell className="font-medium">{invoice.orderGroup.id}</TableCell>
                        <TableCell>{formatDate(invoice.orderGroup.createdAt)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            ['succeeded', 'paid', 'completed'].includes(invoice.orderGroup.stripePaymentStatus || invoice.orderGroup.status)
                              ? 'bg-green-100 text-green-800'
                              : ['pending', 'processing'].includes(invoice.orderGroup.stripePaymentStatus || invoice.orderGroup.status)
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {invoice.orderGroup.stripePaymentStatus || invoice.orderGroup.status}
                          </span>
                        </TableCell>
                        <TableCell>{invoice.orderGroup.paymentMethod || 'N/A'}</TableCell>
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
                              onClick={() => printInvoice(invoice)}
                            >
                              <Printer className="h-4 w-4" />
                              <span className="sr-only">Print</span>
                            </Button>
                            {customer?.email && (
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* Invoice dialog */}
        <Dialog 
          open={!!selectedInvoice} 
          onOpenChange={(isOpen) => !isOpen && setSelectedInvoice(null)}
        >
          <DialogContent className="max-w-4xl">
            {selectedInvoice && (
              <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">Invoice #{selectedInvoice.orderGroup.id}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Bill To:</h3>
                    <p className="text-sm">{selectedInvoice.customer.name}</p>
                    {selectedInvoice.customer.email && <p className="text-sm">{selectedInvoice.customer.email}</p>}
                    {selectedInvoice.customer.phone && <p className="text-sm">{selectedInvoice.customer.phone}</p>}
                    {selectedInvoice.customer.address && <p className="text-sm">{selectedInvoice.customer.address}</p>}
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">Invoice Date:</span>
                      <span>{formatDate(selectedInvoice.orderGroup.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Payment Status:</span>
                      <span>{selectedInvoice.orderGroup.stripePaymentStatus || selectedInvoice.orderGroup.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Payment Method:</span>
                      <span>{selectedInvoice.orderGroup.paymentMethod || 'N/A'}</span>
                    </div>
                    {selectedInvoice.orderGroup.paymentDate && (
                      <div className="flex justify-between">
                        <span className="font-medium">Payment Date:</span>
                        <span>{formatDate(selectedInvoice.orderGroup.paymentDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border rounded-md mb-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>Order #{order.id}</TableCell>
                          <TableCell>
                            {order.artworkDescription || `Custom Framing (${order.artworkWidth}" × ${order.artworkHeight}")`}
                          </TableCell>
                          <TableCell className="text-right">{order.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(parseFloat(order.subtotal) / order.quantity)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(order.subtotal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex flex-col items-end space-y-2 mb-6">
                  <div className="flex justify-between w-60">
                    <span className="font-medium">Subtotal:</span>
                    <span>{formatCurrency(selectedInvoice.orderGroup.subtotal)}</span>
                  </div>
                  <div className="flex justify-between w-60">
                    <span className="font-medium">Tax:</span>
                    <span>{formatCurrency(selectedInvoice.orderGroup.tax)}</span>
                  </div>
                  <div className="flex justify-between w-60 text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedInvoice.orderGroup.total)}</span>
                  </div>
                </div>
                
                {selectedInvoice.orderGroup.notes && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-medium mb-2">Notes:</h3>
                    <p className="text-sm">{selectedInvoice.orderGroup.notes}</p>
                  </div>
                )}
                
                <div className="flex justify-end mt-8 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedInvoice(null)}
                  >
                    Close
                  </Button>
                  <Button 
                    variant="default"
                    onClick={() => window.print()}
                    className="text-white"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  {customer?.email && (
                    <Button 
                      variant="default"
                      onClick={() => {
                        sendInvoice(selectedInvoice.orderGroup.id);
                        setSelectedInvoice(null);
                      }}
                      className="text-white"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}