import React from 'react';
import { useProduction } from '@/hooks/use-production';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Bell, 
  Clock, 
  Mail, 
  MessageSquare, 
  Check, 
  AlertTriangle,
  Calendar,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { CustomerNotification, NotificationType } from '@shared/schema';

export default function NotificationHistory({ 
  orderId,
  customerId,
  limit = 5
}: { 
  orderId?: number;
  customerId?: number;
  limit?: number;
}) {
  const { 
    orderNotifications,
    customerNotifications,
    isLoadingOrderNotifications,
    isLoadingCustomerNotifications
  } = useProduction({
    orderId,
    customerId
  });

  const getNotificationIcon = (type: NotificationType) => {
    if (type === "status_update") {
      return <Info className="h-4 w-4" />;
    } else if (type === "estimated_completion") {
      return <Calendar className="h-4 w-4" />;
    } else if (type.includes('status_change')) {
      return <Info className="h-4 w-4" />;
    } else if (type.includes('due_date')) {
      return <Calendar className="h-4 w-4" />;
    } else if (type.includes('completion')) {
      return <Check className="h-4 w-4" />;
    } else if (type.includes('delay')) {
      return <AlertTriangle className="h-4 w-4" />;
    } else {
      return <Bell className="h-4 w-4" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Determine which notifications to show
  const notifications = orderId ? orderNotifications : customerId ? customerNotifications : [];
  
  // Sort notifications by date, most recent first
  const sortedNotifications = [...notifications].sort((a, b) => {
    return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
  });
  
  // Limit the number of notifications if specified
  const limitedNotifications = limit ? sortedNotifications.slice(0, limit) : sortedNotifications;

  const isLoading = orderId ? isLoadingOrderNotifications : isLoadingCustomerNotifications;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
          <CardDescription>Recent updates about your order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
          <CardDescription>Recent updates about your order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center">
            <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No notifications have been sent yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification History</CardTitle>
        <CardDescription>Recent updates about your order</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {limitedNotifications.map((notification) => (
            <AccordionItem key={notification.id} value={`notification-${notification.id}`}>
              <AccordionTrigger>
                <div className="flex items-center text-left">
                  <span className="mr-2">{getNotificationIcon(notification.notificationType as NotificationType)}</span>
                  <div>
                    <span className="font-medium">{notification.subject}</span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>
                        {format(new Date(notification.sentAt), 'PPP p')}
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 pt-2">
                    <div className="bg-muted p-2 rounded-full">
                      {getChannelIcon(notification.channel)}
                    </div>
                    <div>
                      <p className="whitespace-pre-line">{notification.message}</p>
                      <div className="flex items-center mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          {notification.successful ? (
                            <>
                              <Check className="h-3 w-3 mr-1 text-green-500" />
                              <span className="text-green-600">Delivered</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                              <span className="text-amber-600">Delivery failed</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {notification.previousStatus && notification.newStatus && (
                    <div className="mt-2 text-xs text-muted-foreground border-t pt-2">
                      <p>
                        Status changed from <strong>{notification.previousStatus}</strong> to <strong>{notification.newStatus}</strong>
                      </p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}