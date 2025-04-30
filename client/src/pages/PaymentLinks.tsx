import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

interface PaymentLink {
  id: number;
  token: string;
  amount: string;
  description: string | null;
  customerId: number | null;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  used: boolean;
  paymentIntentId: string | null;
  paymentStatus: string;
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

export default function PaymentLinksPage() {
  const [activeTab, setActiveTab] = useState('create');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('7');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sendNotification, setSendNotification] = useState(false);
  
  // Notification state for existing links
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyPhone, setNotifyPhone] = useState('');
  const [selectedPaymentLink, setSelectedPaymentLink] = useState<number | null>(null);
  
  // Query payment links
  const { data: paymentLinks, isLoading } = useQuery<PaymentLink[]>({
    queryKey: ['/api/payment-links'],
    retry: 1,
  });
  
  // Create payment link mutation
  const createPaymentLinkMutation = useMutation({
    mutationFn: async (data: CreatePaymentLinkPayload) => {
      const response = await apiRequest('POST', '/api/payment-links', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-links'] });
      toast({
        title: 'Payment link created',
        description: 'The payment link has been created successfully.',
      });
      // Reset form
      setAmount('');
      setDescription('');
      setCustomerId('');
      setExpiresInDays('7');
      setEmail('');
      setPhone('');
      setSendNotification(false);
      // Switch to view tab
      setActiveTab('view');
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating payment link',
        description: error.message || 'There was an error creating the payment link.',
        variant: 'destructive',
      });
    },
  });
  
  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async ({ id, email, phone }: { id: number; email?: string; phone?: string }) => {
      const response = await apiRequest('POST', `/api/payment-links/${id}/notify`, {
        email,
        phone,
        notificationType: email && phone ? 'both' : email ? 'email' : 'sms',
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Notification sent',
        description: `The payment link notification has been sent.`,
      });
      setNotifyEmail('');
      setNotifyPhone('');
      setSelectedPaymentLink(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error sending notification',
        description: error.message || 'There was an error sending the notification.',
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
    
    const payload: CreatePaymentLinkPayload = {
      amount: parseFloat(amount),
      expiresInDays: parseInt(expiresInDays),
      sendNotification,
    };
    
    if (description) payload.description = description;
    if (customerId && !isNaN(parseInt(customerId))) payload.customerId = parseInt(customerId);
    if (sendNotification) {
      if (email) payload.email = email;
      if (phone) payload.phone = phone;
    }
    
    createPaymentLinkMutation.mutate(payload);
  };
  
  const handleSendNotification = (id: number) => {
    if (!notifyEmail && !notifyPhone) {
      toast({
        title: 'Missing contact information',
        description: 'Please provide either an email address or phone number to send the notification.',
        variant: 'destructive',
      });
      return;
    }
    
    sendNotificationMutation.mutate({
      id,
      email: notifyEmail || undefined,
      phone: notifyPhone || undefined,
    });
  };
  
  const getPaymentUrl = (token: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/payment/${token}`;
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Payment Links</h1>
      
      <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="create">Create Payment Link</TabsTrigger>
          <TabsTrigger value="view">View Payment Links</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Payment Link</CardTitle>
              <CardDescription>
                Generate a payment link for a custom amount that can be sent to customers.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCreatePaymentLink}>
              <CardContent className="space-y-4">
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiresInDays">Expires In (days)</Label>
                    <Input
                      id="expiresInDays"
                      type="number"
                      min="1"
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
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer ID (optional)</Label>
                  <Input
                    id="customerId"
                    type="number"
                    placeholder="Customer ID"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendNotification"
                      checked={sendNotification}
                      onCheckedChange={(checked) => setSendNotification(!!checked)}
                    />
                    <Label htmlFor="sendNotification">Send notification immediately</Label>
                  </div>
                  
                  {sendNotification && (
                    <div className="pl-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="customer@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (123) 456-7890"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  disabled={createPaymentLinkMutation.isPending}
                >
                  {createPaymentLinkMutation.isPending ? 'Creating...' : 'Create Payment Link'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="view">
          <Card>
            <CardHeader>
              <CardTitle>Payment Links</CardTitle>
              <CardDescription>
                View and manage your existing payment links.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading payment links...</p>
              ) : !paymentLinks || paymentLinks.length === 0 ? (
                <p>No payment links found. Create one to get started.</p>
              ) : (
                <div className="space-y-6">
                  {paymentLinks.map((link) => (
                    <div key={link.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h3 className="font-semibold">Amount</h3>
                          <p className="text-lg">{formatCurrency(parseFloat(link.amount))}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Status</h3>
                          <p className={`font-medium ${link.used ? 'text-green-600' : 'text-amber-600'}`}>
                            {link.used ? `Used (${link.paymentStatus})` : 'Pending'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="font-semibold">Description</h3>
                        <p>{link.description || 'No description'}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h3 className="font-semibold">Created</h3>
                          <p>{new Date(link.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Expires</h3>
                          <p>{new Date(link.expiresAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="font-semibold">Payment URL</h3>
                        <div className="flex mt-1">
                          <Input 
                            value={getPaymentUrl(link.token)} 
                            readOnly 
                            className="mr-2"
                          />
                          <Button
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(getPaymentUrl(link.token));
                              toast({
                                title: 'URL copied',
                                description: 'Payment link URL copied to clipboard',
                              });
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                      
                      {!link.used && (
                        <div className="border-t pt-4 mt-4">
                          <h3 className="font-semibold mb-2">Send Notification</h3>
                          {selectedPaymentLink === link.id ? (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor={`notifyEmail-${link.id}`}>Email</Label>
                                <Input
                                  id={`notifyEmail-${link.id}`}
                                  type="email"
                                  placeholder="customer@example.com"
                                  value={notifyEmail}
                                  onChange={(e) => setNotifyEmail(e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`notifyPhone-${link.id}`}>Phone Number</Label>
                                <Input
                                  id={`notifyPhone-${link.id}`}
                                  type="tel"
                                  placeholder="+1 (123) 456-7890"
                                  value={notifyPhone}
                                  onChange={(e) => setNotifyPhone(e.target.value)}
                                />
                              </div>
                              
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => handleSendNotification(link.id)}
                                  disabled={sendNotificationMutation.isPending}
                                >
                                  {sendNotificationMutation.isPending ? 'Sending...' : 'Send'}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedPaymentLink(null);
                                    setNotifyEmail('');
                                    setNotifyPhone('');
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => setSelectedPaymentLink(link.id)}
                            >
                              Send to Customer
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}