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
import { Loader2 } from 'lucide-react';

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

// Checkout page component
const Checkout = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { orderGroupId } = useParams<{ orderGroupId: string }>();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  // Fetch order group details
  const { data: orderGroup, isLoading: orderGroupLoading, error: orderGroupError } = useQuery({
    queryKey: ['/api/order-groups', orderGroupId], 
    queryFn: () => fetch(`/api/order-groups/${orderGroupId}`).then(res => res.json()),
    enabled: !!orderGroupId,
  });

  // Fetch orders in the group
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['/api/order-groups', orderGroupId, 'orders'],
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
  }, [orderGroupId, toast]);

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
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Order Summary */}
        <div className="md:col-span-2">
          <Card>
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
                  <div className="flex justify-between mt-2">
                    <p className="text-muted-foreground">Tax</p>
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
        </div>
        
        {/* Payment Form */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                Complete your purchase securely with Stripe
              </CardDescription>
            </CardHeader>
            
            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm orderGroupId={Number(orderGroupId)} />
              </Elements>
            ) : (
              <CardContent className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;