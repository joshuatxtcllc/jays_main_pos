import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing Stripe public key. Set VITE_STRIPE_PUBLIC_KEY in your environment.');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// The form component that contains the PaymentElement
const PaymentForm = ({ token, amount, description }: { token: string; amount: string; description: string | null }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-status?token=${token}`,
        },
        redirect: 'if_required',
      });
      
      if (error) {
        toast({
          title: 'Payment Failed',
          description: error.message || 'An error occurred while processing your payment.',
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }
      
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        try {
          // Payment succeeded, mark the payment link as used
          console.log('Payment succeeded, marking payment link as used');
          const completeResponse = await apiRequest('POST', `/api/payment/${token}/complete`, {
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status,
          });
          
          if (!completeResponse.ok) {
            console.error('Error completing payment:', await completeResponse.text());
          } else {
            console.log('Payment completion successful');
          }
          
          // Show success toast and redirect
          toast({
            title: 'Payment Successful',
            description: 'Your payment has been processed successfully.',
          });
          
          // Redirect to payment status page
          window.location.href = `/payment-status?status=success&token=${token}`;
        } catch (err) {
          console.error('Error completing payment:', err);
          toast({
            title: 'Payment Status Update Failed',
            description: 'Your payment processed, but we had trouble updating our records.',
            variant: 'destructive',
          });
          window.location.href = `/payment-status?status=success&token=${token}`;
        }
      } else {
        window.location.href = `/payment-status?status=processing&token=${token}`;
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <PaymentElement className="mb-6" />
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
          `Pay ${formatCurrency(parseFloat(amount))}`
        )}
      </Button>
    </form>
  );
};

// The main Payment page component
const Payment = () => {
  const [, params] = useRoute('/payment/:token');
  const { toast } = useToast();
  const token = params?.token || '';
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<{
    amount: string;
    description: string | null;
    expiresAt: string;
  } | null>(null);
  
  // Validate the payment link and get the payment intent client secret
  useEffect(() => {
    const validatePaymentLink = async () => {
      try {
        console.log(`Attempting to validate token: ${token}`);
        const response = await apiRequest('GET', `/api/payment/${token}/validate`);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Validation response not OK:', errorText);
          setError('This payment link is invalid or has expired.');
          setIsLoading(false);
          return;
        }
        
        const data = await response.json();
        console.log('Validation response:', data);
        
        if (!data.valid) {
          setError(data.message || 'This payment link is invalid or has expired.');
          setIsLoading(false);
          return;
        }
        
        if (!data.canProcess) {
          setError(data.message || 'Unable to process this payment at the moment.');
          setIsLoading(false);
          return;
        }
        
        setClientSecret(data.clientSecret);
        setPaymentDetails(data.paymentLink);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error validating payment link:', err);
        setError('Failed to validate payment link. Please try again later.');
        setIsLoading(false);
      }
    };
    
    validatePaymentLink();
  }, [token, toast]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-12 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Payment Error</CardTitle>
            <CardDescription>
              We couldn't process your payment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-12 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Payment</CardTitle>
          <CardDescription>
            Please provide your payment details to complete the transaction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paymentDetails && (
            <div className="mb-6 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Amount:</span>
                <span className="text-lg font-semibold">
                  {formatCurrency(parseFloat(paymentDetails.amount))}
                </span>
              </div>
              
              {paymentDetails.description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="mt-1">{paymentDetails.description}</p>
                </div>
              )}
              
              <div>
                <span className="font-medium">Expires:</span>
                <p className="mt-1">{new Date(paymentDetails.expiresAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
          
          {clientSecret && paymentDetails && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                },
              }}
            >
              <PaymentForm 
                token={token} 
                amount={paymentDetails.amount} 
                description={paymentDetails.description} 
              />
            </Elements>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Payment;