import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useStripe } from '@stripe/react-stripe-js';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

/**
 * PaymentStatus component to handle payment success/failure status
 * This page is typically accessed after a Stripe redirect
 */
const PaymentStatus = () => {
  const stripe = useStripe();
  const [location, setLocation] = useLocation();
  const [status, setStatus] = React.useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = React.useState<string>('');

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Extract the client secret from URL query parameters
    const clientSecret = new URLSearchParams(window.location.search).get('payment_intent_client_secret');

    if (clientSecret) {
      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        if (!paymentIntent) {
          setStatus('failed');
          setMessage('Unable to retrieve payment information.');
          return;
        }

        switch (paymentIntent.status) {
          case 'succeeded':
            setStatus('success');
            setMessage('Your payment was successful! Your framing order has been submitted.');
            break;
          case 'processing':
            setStatus('loading');
            setMessage('Your payment is processing. We will notify you when it is complete.');
            break;
          case 'requires_payment_method':
            setStatus('failed');
            setMessage('Your payment was not successful, please try again.');
            break;
          default:
            setStatus('failed');
            setMessage('Something went wrong with your payment.');
            break;
        }
      });
    } else {
      // No client secret in URL, likely direct navigation to this page
      setStatus('failed');
      setMessage('No payment information found.');
    }
  }, [stripe]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              {status === 'loading' && 'Processing Payment'}
              {status === 'success' && 'Payment Successful'}
              {status === 'failed' && 'Payment Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            {status === 'loading' && (
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            )}
            {status === 'failed' && (
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
            )}
            <p className="text-center">{message}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            {status === 'success' && (
              <Button onClick={() => setLocation('/orders')}>
                View Your Orders
              </Button>
            )}
            {status === 'failed' && (
              <Button onClick={() => window.history.back()}>
                Try Again
              </Button>
            )}
            {status === 'loading' && (
              <Button variant="outline" disabled>
                Please Wait...
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PaymentStatus;