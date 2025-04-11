import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, DollarSign, CreditCard, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DiscountPanel } from '@/components/DiscountPanel';

// Initialize Stripe with the public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Payment form component
const PaymentForm = ({ orderGroupId }: { orderGroupId: number }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  // Handle form submission and payment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsLoading(true);
    setMessage(null);

    // Confirm the payment
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/orders',
      },
      redirect: 'if_required',
    });

    if (error) {
      // Show error to customer
      setMessage(error.message || 'An unexpected error occurred.');
      toast({
        title: 'Payment failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } else {
      // Payment succeeded
      toast({
        title: 'Payment successful',
        description: 'Your payment has been processed successfully.',
      });
      setLocation('/orders');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-6 pt-6">
        <PaymentElement />
        {message && <div className="text-red-500 text-sm">{message}</div>}
      </CardContent>
      <CardFooter className="pt-6 flex justify-between">
        <Button variant="outline" onClick={() => setLocation('/orders')}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!stripe || isLoading}
          className="ml-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing
            </>
          ) : (
            'Pay Now'
          )}
        </Button>
      </CardFooter>
    </form>
  );
};

// Cash or Check Payment Form
const CashCheckPaymentForm = ({ orderGroupId }: { orderGroupId: number }) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'check'>('cash');
  const [cashAmount, setCashAmount] = useState<string>('');
  const [checkNumber, setCheckNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'cash' && (!cashAmount || Number(cashAmount) <= 0)) {
      toast({
        title: 'Invalid cash amount',
        description: 'Please enter a valid cash amount.',
        variant: 'destructive',
      });
      return;
    }
    
    if (paymentMethod === 'check' && !checkNumber) {
      toast({
        title: 'Check number required',
        description: 'Please enter the check number.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/process-cash-check-payment', {
        orderGroupId,
        paymentMethod,
        cashAmount: paymentMethod === 'cash' ? cashAmount : undefined,
        checkNumber: paymentMethod === 'check' ? checkNumber : undefined,
        notes: notes || undefined
      });
      
      if (response.ok) {
        toast({
          title: 'Payment recorded',
          description: `${paymentMethod === 'cash' ? 'Cash' : 'Check'} payment has been successfully recorded.`,
        });
        setLocation('/orders');
      } else {
        const errorData = await response.json();
        toast({
          title: 'Payment failed',
          description: errorData.message || 'Failed to process payment.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error processing your payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handlePayment}>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <div className="flex space-x-4">
            <Button 
              type="button" 
              variant={paymentMethod === 'cash' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('cash')}
              className="flex-1"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Cash
            </Button>
            <Button 
              type="button" 
              variant={paymentMethod === 'check' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('check')}
              className="flex-1"
            >
              <Check className="mr-2 h-4 w-4" />
              Check
            </Button>
          </div>
        </div>
        
        {paymentMethod === 'cash' ? (
          <div className="space-y-2">
            <Label htmlFor="cashAmount">Cash Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
              <Input
                id="cashAmount"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="pl-8"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="checkNumber">Check Number</Label>
            <Input
              id="checkNumber"
              value={checkNumber}
              onChange={(e) => setCheckNumber(e.target.value)}
              placeholder="Check #"
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="notes">Payment Notes (Optional)</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any payment notes here"
          />
        </div>
      </CardContent>
      <CardFooter className="pt-6 flex justify-between">
        <Button variant="outline" onClick={() => setLocation('/orders')}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="ml-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing
            </>
          ) : (
            'Record Payment'
          )}
        </Button>
      </CardFooter>
    </form>
  );
};

// Checkout page component
const Checkout = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { orderGroupId } = useParams<{ orderGroupId: string }>();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Fetch order group details
  const { data: orderGroup, isLoading: orderGroupLoading, error: orderGroupError } = useQuery({
    queryKey: ['/api/order-groups', orderGroupId, refreshTrigger], 
    queryFn: () => fetch(`/api/order-groups/${orderGroupId}`).then(res => res.json()),
    enabled: !!orderGroupId,
  });

  // Fetch orders in the group
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['/api/order-groups', orderGroupId, 'orders', refreshTrigger],
    queryFn: () => fetch(`/api/order-groups/${orderGroupId}/orders`).then(res => res.json()),
    enabled: !!orderGroupId,
  });

  // Create payment intent when page loads
  useEffect(() => {
    if (orderGroupId) {
      const createPaymentIntent = async () => {
        try {
          const response = await apiRequest('POST', '/api/create-payment-intent', { orderGroupId });
          const data = await response.json();
          setClientSecret(data.clientSecret);
        } catch (error) {
          console.error('Error creating payment intent:', error);
          toast({
            title: 'Error',
            description: 'Unable to initialize payment. Please try again later.',
            variant: 'destructive',
          });
        }
      };

      createPaymentIntent();
    }
  }, [orderGroupId, toast, refreshTrigger]);

  // Handle discount application
  const handleDiscountApplied = () => {
    // Refresh the data to reflect new totals
    setRefreshTrigger(prev => prev + 1);
  };

  // Calculate totals
  const subtotal = orders?.reduce((acc: number, order: any) => acc + Number(order.subtotal), 0) || 0;
  const tax = orders?.reduce((acc: number, order: any) => acc + Number(order.tax), 0) || 0;
  const total = orders?.reduce((acc: number, order: any) => acc + Number(order.total), 0) || 0;

  if (orderGroupLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (orderGroupError || ordersError || !orderGroup || !orders) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was an error loading the checkout information. Please try again later.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setLocation('/orders')}>
              Return to Orders
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="md:col-span-5">
          {/* Order Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                Order Group #{orderGroup.id}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div key={order.id} className="border-b pb-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.artworkWidth}" × {order.artworkHeight}"
                        </p>
                      </div>
                      <p className="font-medium">${Number(order.total).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4">
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Subtotal</p>
                    <p>${subtotal.toFixed(2)}</p>
                  </div>
                  {orderGroup.discountAmount && orderGroup.discountType && (
                    <div className="flex justify-between mt-2 text-green-600">
                      <p>Discount {orderGroup.discountType === 'percentage' ? `(${orderGroup.discountAmount}%)` : ''}</p>
                      <p>-${orderGroup.discountType === 'percentage' 
                        ? ((Number(orderGroup.discountAmount) / 100) * subtotal).toFixed(2)
                        : Number(orderGroup.discountAmount).toFixed(2)
                      }</p>
                    </div>
                  )}
                  <div className="flex justify-between mt-2">
                    <p className="text-muted-foreground">
                      Tax {orderGroup.taxExempt ? '(Exempt)' : ''}
                    </p>
                    <p>${tax.toFixed(2)}</p>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between font-medium">
                    <p>Total</p>
                    <p>${total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Discount & Tax Exempt Panel */}
          <DiscountPanel 
            orderGroupId={Number(orderGroupId)}
            currentDiscount={
              orderGroup.discountAmount && orderGroup.discountType 
                ? { 
                    type: orderGroup.discountType, 
                    amount: String(orderGroup.discountAmount) 
                  } 
                : undefined
            }
            taxExempt={orderGroup.taxExempt}
            onDiscountApplied={handleDiscountApplied}
          />
        </div>
        
        {/* Right Column: Payment Form */}
        <div className="md:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Choose how you would like to pay for this order
              </CardDescription>
            </CardHeader>
            
            <Tabs defaultValue="credit_card" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="credit_card">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Credit Card
                </TabsTrigger>
                <TabsTrigger value="cash">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Cash
                </TabsTrigger>
                <TabsTrigger value="check">
                  <Check className="h-4 w-4 mr-2" />
                  Check
                </TabsTrigger>
              </TabsList>
              
              {/* Credit Card Payment */}
              <TabsContent value="credit_card">
                {clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentForm orderGroupId={Number(orderGroupId)} />
                  </Elements>
                ) : (
                  <CardContent className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </CardContent>
                )}
              </TabsContent>
              
              {/* Cash or Check Payment */}
              <TabsContent value="cash">
                <CashCheckPaymentForm orderGroupId={Number(orderGroupId)} />
              </TabsContent>
              
              <TabsContent value="check">
                <CashCheckPaymentForm orderGroupId={Number(orderGroupId)} />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;