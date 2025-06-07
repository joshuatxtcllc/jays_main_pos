
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SimpleDiscordNotifierProps {
  orderId?: string;
  customerId?: string;
  defaultMessage?: string;
}

const SimpleDiscordNotifier: React.FC<SimpleDiscordNotifierProps> = ({
  orderId,
  customerId,
  defaultMessage
}) => {
  const [message, setMessage] = useState(defaultMessage || '');
  const [messageType, setMessageType] = useState<'order_update' | 'completion_notice' | 'estimate_update' | 'custom'>('order_update');
  const [customerEmail, setCustomerEmail] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);

  const messageTemplates = {
    order_update: "Hi! Your custom frame order has been updated. We're currently working on your piece and making great progress!",
    completion_notice: "Great news! Your custom frame is ready for pickup. Please come by the shop at your convenience.",
    estimate_update: "We wanted to update you on the timeline for your custom frame. Your piece is progressing nicely!",
    custom: ""
  };

  const handleSendNotification = async () => {
    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message to send",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/test/test-customer-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerId || 1,
          orderId: orderId || Math.floor(Math.random() * 1000),
          type: messageType,
          email: customerEmail || 'customer@jaysframes.com',
          discordUsername: discordUsername,
          message: message
        }),
      });

      if (response.ok) {
        toast({
          title: "Notification Sent!",
          description: "Customer has been notified via Discord and email",
        });
        setLastSent(new Date().toLocaleTimeString());
        setMessage('');
      } else {
        throw new Error('Failed to send notification');
      }
    } catch (error) {
      toast({
        title: "Failed to Send",
        description: "There was an error sending the notification",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplate = (type: string) => {
    setMessageType(type as any);
    setMessage(messageTemplates[type as keyof typeof messageTemplates]);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Quick Customer Notification
        </CardTitle>
        {lastSent && (
          <Badge variant="outline" className="w-fit">
            <CheckCircle className="w-3 h-3 mr-1" />
            Last sent: {lastSent}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Templates */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Quick Templates</Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(messageTemplates).map(([type, template]) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() => loadTemplate(type)}
                className="text-xs"
              >
                {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Button>
            ))}
          </div>
        </div>

        {/* Message Type */}
        <div>
          <Label htmlFor="messageType">Notification Type</Label>
          <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="order_update">Order Progress Update</SelectItem>
              <SelectItem value="completion_notice">Ready for Pickup</SelectItem>
              <SelectItem value="estimate_update">Timeline Update</SelectItem>
              <SelectItem value="custom">Custom Message</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerEmail">Customer Email</Label>
            <Input
              id="customerEmail"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="customer@example.com"
            />
          </div>
          <div>
            <Label htmlFor="discordUsername">Discord Username (Optional)</Label>
            <Input
              id="discordUsername"
              value={discordUsername}
              onChange={(e) => setDiscordUsername(e.target.value)}
              placeholder="@username"
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message to the customer..."
            rows={4}
          />
        </div>

        {/* Send Button */}
        <Button 
          onClick={handleSendNotification} 
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Notification
            </>
          )}
        </Button>

        {/* Info */}
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            This will send notifications via Discord (if username provided), email, and in-app notifications. 
            SMS will be available once Twilio approval is complete.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleDiscordNotifier;
