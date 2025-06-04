
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Send, Copy, Link } from 'lucide-react';

interface SendPaymentLinkProps {
  order?: {
    id: number;
    customerName: string;
    total: string;
    orderNumber?: string;
  };
  customerId?: number;
  onSuccess?: () => void;
}

interface CreatePaymentLinkPayload {
  amount: number;
  customerId?: number;
  description?: string;
  expiresInDays?: number;
  email?: string;
  phone?: string;
  sendNotification?: boolean;
}

export function SendPaymentLink({ order, customerId, onSuccess }: SendPaymentLinkProps) {
  const [amount, setAmount] = useState(order ? order.total : '');
  const [description, setDescription] = useState(
    order ? `Payment for Order #${order.orderNumber || order.id} - ${order.customerName}` : ''
  );
  const [expiresInDays, setExpiresInDays] = useState('7');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sendNotification, setSendNotification] = useState(true);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create payment link mutation
  const createPaymentLinkMutation = useMutation({
    mutationFn: async (data: CreatePaymentLinkPayload) => {
      const response = await apiRequest('POST', '/api/payment-links', data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-links'] });
      
      if (data.paymentLink?.token) {
        const baseUrl = window.location.origin;
        const paymentUrl = `${baseUrl}/payment/${data.paymentLink.token}`;
        setGeneratedLink(paymentUrl);
      }
      
      toast({
        title: 'Payment link created',
        description: sendNotification 
          ? 'The payment link has been created and sent to the customer.'
          : 'The payment link has been created successfully.',
      });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating payment link',
        description: error.message || 'There was an error creating the payment link.',
        variant: 'destructive',
      });
    },
  });

  const handleCreatePaymentLink = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid payment amount.',
        variant: 'destructive',
      });
      return;
    }

    if (sendNotification && !email && !phone) {
      toast({
        title: 'Contact information required',
        description: 'Please provide either an email address or phone number to send the notification.',
        variant: 'destructive',
      });
      return;
    }
    
    const payload: CreatePaymentLinkPayload = {
      amount: parseFloat(amount),
      expiresInDays: parseInt(expiresInDays),
      sendNotification,
    };
    
    if (description) payload.description = description;
    if (customerId || order) payload.customerId = customerId || order?.id;
    if (sendNotification) {
      if (email) payload.email = email;
      if (phone) payload.phone = phone;
    }
    
    createPaymentLinkMutation.mutate(payload);
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast({
        title: 'Link copied',
        description: 'Payment link copied to clipboard',
      });
    }
  };

  const openPaymentLink = () => {
    if (generatedLink) {
      window.open(generatedLink, '_blank');
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Send Payment Link
        </CardTitle>
        <CardDescription>
          Create and send a secure payment link to your customer using Stripe.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {generatedLink ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Payment Link Created!</h3>
              <p className="text-sm text-green-700 mb-3">
                Your payment link is ready. You can copy it and send it manually, or it has been automatically sent if you selected notification options.
              </p>
              
              <div className="flex items-center gap-2 p-2 bg-white border rounded">
                <Input value={generatedLink} readOnly className="flex-1" />
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button onClick={openPaymentLink} variant="outline" size="sm">
                  <Link className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <Button 
              onClick={() => {
                setGeneratedLink(null);
                setAmount(order ? order.total : '');
                setDescription(order ? `Payment for Order #${order.orderNumber || order.id} - ${order.customerName}` : '');
                setEmail('');
                setPhone('');
              }}
              variant="outline"
              className="w-full"
            >
              Create Another Link
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreatePaymentLink} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                {amount && !isNaN(parseFloat(amount)) && (
                  <p className="text-sm text-gray-600">
                    {formatCurrency(parseFloat(amount))}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiresInDays">Expires In (days)</Label>
                <Input
                  id="expiresInDays"
                  type="number"
                  min="1"
                  max="30"
                  placeholder="7"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Payment description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendNotification"
                  checked={sendNotification}
                  onCheckedChange={(checked) => setSendNotification(!!checked)}
                />
                <Label htmlFor="sendNotification">Send payment link automatically</Label>
              </div>
              
              {sendNotification && (
                <div className="pl-6 space-y-4 border-l-2 border-gray-200">
                  <div className="space-y-2">
                    <Label htmlFor="email">Customer Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="customer@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Customer Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (123) 456-7890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    Provide at least one contact method to send the payment link automatically.
                  </p>
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              disabled={createPaymentLinkMutation.isPending}
              className="w-full"
            >
              {createPaymentLinkMutation.isPending ? (
                'Creating Payment Link...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Create Payment Link
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
