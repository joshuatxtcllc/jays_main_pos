
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Bell, Send, TestTube } from 'lucide-react';

export default function NotificationCenterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    orderId: '',
    type: 'order_update',
    email: '',
    phone: '',
    discordUserId: '',
    message: '',
    title: '',
    channels: {
      email: true,
      discord: false,
      inApp: true,
      sms: false
    }
  });

  const notificationTypes = [
    { value: 'order_update', label: 'Order Status Update' },
    { value: 'completion', label: 'Order Completion Notice' },
    { value: 'estimate', label: 'Estimate Update' },
    { value: 'custom', label: 'Custom Message' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChannelChange = (channel: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      channels: { ...prev.channels, [channel]: checked }
    }));
  };

  const sendNotification = async (isTest = false) => {
    setIsLoading(true);
    
    try {
      const endpoint = isTest 
        ? '/api/test-notifications/test-customer-notification'
        : '/api/notifications/send-customer-notification';
        
      const payload = {
        customerId: parseInt(formData.customerId) || 1,
        orderId: parseInt(formData.orderId) || 123,
        type: formData.type,
        email: formData.email,
        phone: formData.phone,
        discordUserId: formData.discordUserId,
        message: formData.message,
        title: formData.title,
        channels: formData.channels
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: isTest ? 'Test Notification Sent!' : 'Notification Sent!',
          description: `Successfully sent ${formData.type} notification`,
          variant: 'default'
        });
      } else {
        throw new Error(result.error || 'Failed to send notification');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send notification',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestData = () => {
    setFormData({
      customerId: '1',
      orderId: '123',
      type: 'order_update',
      email: 'test@jaysframes.com',
      phone: '',
      discordUserId: '',
      message: 'Your custom frame is now being crafted by our artisans.',
      title: 'Frame Production Update',
      channels: {
        email: true,
        discord: false,
        inApp: true,
        sms: false
      }
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Notification Center</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Send Notification Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send Customer Notification</CardTitle>
            <CardDescription>
              Send notifications to customers via email, Discord, SMS, or in-app alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer & Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerId">Customer ID</Label>
                <Input
                  id="customerId"
                  value={formData.customerId}
                  onChange={(e) => handleInputChange('customerId', e.target.value)}
                  placeholder="1"
                />
              </div>
              <div>
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  value={formData.orderId}
                  onChange={(e) => handleInputChange('orderId', e.target.value)}
                  placeholder="123"
                />
              </div>
            </div>

            {/* Notification Type */}
            <div>
              <Label htmlFor="type">Notification Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {notificationTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contact Information */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="customer@example.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone (for SMS)</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1234567890"
              />
            </div>

            <div>
              <Label htmlFor="discordUserId">Discord User ID</Label>
              <Input
                id="discordUserId"
                value={formData.discordUserId}
                onChange={(e) => handleInputChange('discordUserId', e.target.value)}
                placeholder="123456789012345678"
              />
            </div>

            {/* Message Content */}
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Order Update"
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Your frame is being processed..."
                rows={4}
              />
            </div>

            {/* Notification Channels */}
            <div>
              <Label className="text-base font-medium">Notification Channels</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email-channel"
                    checked={formData.channels.email}
                    onCheckedChange={(checked) => handleChannelChange('email', !!checked)}
                  />
                  <Label htmlFor="email-channel">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="discord-channel"
                    checked={formData.channels.discord}
                    onCheckedChange={(checked) => handleChannelChange('discord', !!checked)}
                  />
                  <Label htmlFor="discord-channel">Discord</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inapp-channel"
                    checked={formData.channels.inApp}
                    onCheckedChange={(checked) => handleChannelChange('inApp', !!checked)}
                  />
                  <Label htmlFor="inapp-channel">In-App</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sms-channel"
                    checked={formData.channels.sms}
                    onCheckedChange={(checked) => handleChannelChange('sms', !!checked)}
                  />
                  <Label htmlFor="sms-channel">SMS</Label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={fillTestData}
                variant="outline"
                className="flex-1"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Fill Test Data
              </Button>
              <Button
                onClick={() => sendNotification(true)}
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                Test Send
              </Button>
              <Button
                onClick={() => sendNotification(false)}
                disabled={isLoading}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Live
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common notification templates and actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  type: 'order_update',
                  title: 'Production Update',
                  message: 'Your frame is now in production and being carefully crafted by our artisans.'
                }));
              }}
            >
              📦 Production Started
            </Button>

            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  type: 'completion',
                  title: 'Order Complete',
                  message: 'Great news! Your custom frame is ready for pickup at our studio.'
                }));
              }}
            >
              ✅ Order Complete
            </Button>

            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  type: 'estimate',
                  title: 'Timeline Update',
                  message: 'We wanted to update you on your frame timeline.'
                }));
              }}
            >
              ⏰ Timeline Update
            </Button>

            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  type: 'custom',
                  title: 'Quality Check',
                  message: 'Your frame has passed our rigorous quality inspection and looks amazing!'
                }));
              }}
            >
              🔍 Quality Check
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
