import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Loader2, CreditCard, Banknote, FileCheck } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/stripe-js';
import InvoiceViewer from './InvoiceViewer';
import { OrderGroup } from '@shared/schema';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render
let stripePromise: Promise<any> | null = null;

// Initialize Stripe only if we have the public key
if (import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
}

interface CheckoutPaymentProps {
  orderGroupId: number;
  onPaymentComplete?: (orderGroup: OrderGroup) => void;
}

// Component for card payment using Stripe
const CardPaymentForm = ({ clientSecret, onSuccess }: { clientSecret: string, onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setIsProcessing(true);
    setErrorMessage(null);
    
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: 'if_required',
      });
      
      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        toast({
          title: 'Payment Failed',
          description: error.message || 'There was an issue processing your payment',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Payment Successful',
          description: 'Your payment was processed successfully',
        });
        onSuccess();
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred');
      toast({
        title: 'Payment Error',
        description: 'An unexpected error occurred during payment processing',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Pay Now'
        )}
      </Button>
    </form>
  );
};

// Cash payment form
const CashPaymentForm = ({ total, onSubmit }: { total: number, onSubmit: (cashReceived: number, change: number) => void }) => {
  const [cashReceived, setCashReceived] = useState('');
  const [change, setChange] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleCashChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCashReceived(value);
    
    // Calculate change
    const cashAmount = parseFloat(value) || 0;
    setChange(Math.max(0, cashAmount - total));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      onSubmit(parseFloat(cashReceived), change);
      setIsProcessing(false);
    }, 500);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cash-amount">Cash Received</Label>
        <div className="flex items-center">
          <span className="bg-muted px-3 py-2 rounded-l-md border border-r-0 border-input">$</span>
          <Input
            id="cash-amount"
            type="number"
            step="0.01"
            min={total}
            value={cashReceived}
            onChange={handleCashChanged}
            placeholder="0.00"
            className="rounded-l-none"
          />
        </div>
      </div>
      
      <div className="p-4 bg-muted rounded-md">
        <div className="flex justify-between">
          <span>Total Due:</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between">
          <span>Cash Received:</span>
          <span>{formatCurrency(parseFloat(cashReceived) || 0)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Change Due:</span>
          <span>{formatCurrency(change)}</span>
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={isProcessing || parseFloat(cashReceived) < total} 
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Complete Cash Payment'
        )}
      </Button>
    </form>
  );
};

// Check payment form
const CheckPaymentForm = ({ total, onSubmit }: { total: number, onSubmit: (checkNumber: string) => void }) => {
  const [checkNumber, setCheckNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      onSubmit(checkNumber);
      setIsProcessing(false);
    }, 500);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="check-number">Check Number</Label>
        <Input
          id="check-number"
          value={checkNumber}
          onChange={(e) => setCheckNumber(e.target.value)}
          placeholder="Enter check number"
          required
        />
      </div>
      
      <div className="p-4 bg-muted rounded-md">
        <div className="flex justify-between font-semibold">
          <span>Total Due:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={isProcessing || !checkNumber} 
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Complete Check Payment'
        )}
      </Button>
    </form>
  );
};

const CheckoutPayment: React.FC<CheckoutPaymentProps> = ({ 
  orderGroupId,
  onPaymentComplete 
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'check'>('card');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch order group
  const { data: orderGroup, isLoading } = useQuery({
    queryKey: [`/api/order-groups/${orderGroupId}`],
    queryFn: async () => {
      const response = await fetch(`/api/order-groups/${orderGroupId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order group');
      }
      return response.json();
    }
  });
  
  // Create payment intent mutation
  const createPaymentIntentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderGroupId,
          amount: orderGroup.total,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create payment intent',
        variant: 'destructive',
      });
    }
  });
  
  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async ({ 
      method, 
      details = {} 
    }: { 
      method: 'card' | 'cash' | 'check', 
      details?: Record<string, any> 
    }) => {
      const response = await fetch(`/api/order-groups/${orderGroupId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: method,
          details,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process payment');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Payment Complete',
        description: 'Your payment has been processed successfully',
      });
      
      setPaymentComplete(true);
      
      // Update cache with the updated order group
      queryClient.setQueryData([`/api/order-groups/${orderGroupId}`], data);
      
      // Call the callback if provided
      if (onPaymentComplete) {
        onPaymentComplete(data);
      }
    },
    onError: (error) => {
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'An error occurred processing the payment',
        variant: 'destructive',
      });
    }
  });
  
  // Initialize payment intent when payment method is selected
  useEffect(() => {
    if (paymentMethod === 'card' && orderGroup && !clientSecret && !paymentComplete) {
      createPaymentIntentMutation.mutate();
    }
  }, [paymentMethod, orderGroup, clientSecret, paymentComplete]);
  
  const handleCardPaymentSuccess = () => {
    processPaymentMutation.mutate({ method: 'card' });
  };
  
  const handleCashPayment = (cashReceived: number, change: number) => {
    processPaymentMutation.mutate({ 
      method: 'cash', 
      details: { cashReceived, change } 
    });
  };
  
  const handleCheckPayment = (checkNumber: string) => {
    processPaymentMutation.mutate({ 
      method: 'check', 
      details: { checkNumber } 
    });
  };
  
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Processing Payment</CardTitle>
          <CardDescription>Loading order information...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (!orderGroup) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Order information not found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Unable to load order details. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }
  
  // If payment is complete, show success and invoice options
  if (paymentComplete) {
    return (
      <>
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <div className="bg-green-100 p-2 rounded-full mr-2">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              Payment Complete
            </CardTitle>
            <CardDescription>
              Thank you for your payment of {formatCurrency(Number(orderGroup.total))}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-medium capitalize">{orderGroup.paymentMethod || paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span>#{orderGroupId}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Return to Home
            </Button>
            <Button onClick={() => setShowInvoice(true)}>
              View Invoice
            </Button>
          </CardFooter>
        </Card>
        
        {showInvoice && (
          <InvoiceViewer 
            orderGroupId={orderGroupId} 
            onClose={() => setShowInvoice(false)}
          />
        )}
      </>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Payment</CardTitle>
        <CardDescription>
          Complete your payment of {formatCurrency(Number(orderGroup.total))}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup 
          value={paymentMethod} 
          onValueChange={(value) => setPaymentMethod(value as 'card' | 'cash' | 'check')}
          className="grid grid-cols-3 gap-4"
        >
          <div>
            <RadioGroupItem 
              value="card" 
              id="card" 
              className="peer sr-only" 
            />
            <Label 
              htmlFor="card" 
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <CreditCard className="mb-3 h-6 w-6" />
              <span className="text-sm font-medium">Card</span>
            </Label>
          </div>
          
          <div>
            <RadioGroupItem 
              value="cash" 
              id="cash" 
              className="peer sr-only" 
            />
            <Label 
              htmlFor="cash" 
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <Banknote className="mb-3 h-6 w-6" />
              <span className="text-sm font-medium">Cash</span>
            </Label>
          </div>
          
          <div>
            <RadioGroupItem 
              value="check" 
              id="check" 
              className="peer sr-only" 
            />
            <Label 
              htmlFor="check" 
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <FileCheck className="mb-3 h-6 w-6" />
              <span className="text-sm font-medium">Check</span>
            </Label>
          </div>
        </RadioGroup>
        
        <div className="pt-4 border-t">
          {paymentMethod === 'card' && (
            <>
              {!stripePromise && (
                <div className="p-4 text-amber-600 bg-amber-50 rounded-md mb-4">
                  <p>Stripe payment is not configured. Please set VITE_STRIPE_PUBLIC_KEY.</p>
                </div>
              )}
              
              {stripePromise && clientSecret ? (
                <Elements 
                  stripe={stripePromise} 
                  options={{ clientSecret, appearance: { theme: 'stripe' } }}
                >
                  <CardPaymentForm 
                    clientSecret={clientSecret} 
                    onSuccess={handleCardPaymentSuccess} 
                  />
                </Elements>
              ) : stripePromise && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </>
          )}
          
          {paymentMethod === 'cash' && (
            <CashPaymentForm 
              total={Number(orderGroup.total)} 
              onSubmit={handleCashPayment} 
            />
          )}
          
          {paymentMethod === 'check' && (
            <CheckPaymentForm 
              total={Number(orderGroup.total)} 
              onSubmit={handleCheckPayment} 
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckoutPayment;