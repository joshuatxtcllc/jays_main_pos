import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useProduction } from '@/hooks/use-production';
import { Bell, CheckCircle2, ClockIcon, Mail } from 'lucide-react';
import { CustomerNotification } from '@shared/schema';
import { formatRelative } from 'date-fns';

interface NotificationHistoryProps {
  orderId?: number;
  customerId?: number;
}

export default function NotificationHistory({
  orderId,
  customerId,
}: NotificationHistoryProps) {
  const { 
    orderNotifications,
    customerNotifications,
    isLoadingOrderNotifications,
    isLoadingCustomerNotifications
  } = useProduction({ orderId, customerId });

  // Determine which notifications to display
  const notifications = orderId 
    ? orderNotifications 
    : customerId 
      ? customerNotifications 
      : [];

  // Function to format the notification time
  const formatNotificationTime = (date: Date | string) => {
    return formatRelative(new Date(date), new Date());
  };

  // Function to get appropriate icon for notification
  const getNotificationIcon = (notification: CustomerNotification) => {
    if (notification.notificationType === 'status_update') {
      return <CheckCircle2 className="h-4 w-4 mr-2" />;
    } else if (notification.notificationType === 'estimated_completion') {
      return <ClockIcon className="h-4 w-4 mr-2" />;
    } else {
      return <Bell className="h-4 w-4 mr-2" />;
    }
  };

  // Function to get appropriate color for notification status
  const getNotificationStatusColor = (notification: CustomerNotification) => {
    const status = notification.newStatus;
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to format notification status
  const formatStatus = (status?: string) => {
    if (!status) return '';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Calculate progress percentage based on status
  const getProgressPercentage = (status?: string) => {
    if (!status) return 0;
    
    switch (status) {
      case 'order_processed': return 10;
      case 'scheduled': return 20;
      case 'materials_ordered': return 30;
      case 'materials_arrived': return 40;
      case 'frame_cut': return 60;
      case 'mat_cut': return 70;
      case 'prepped': return 85;
      case 'completed': return 100;
      default: return 50;
    }
  };

  if (isLoadingOrderNotifications || isLoadingCustomerNotifications) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Loading notification history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>No notifications found</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default">
            <AlertTitle>No notifications yet</AlertTitle>
            <AlertDescription>
              We'll keep you updated on your order status as it progresses through our production workflow.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Progress Updates</CardTitle>
        <CardDescription>
          Track your order's journey through our production process
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {notifications.map((notification) => (
            <AccordionItem key={notification.id} value={`notification-${notification.id}`}>
              <AccordionTrigger className="flex items-start">
                <div className="flex items-center text-left">
                  {getNotificationIcon(notification)}
                  <div>
                    <span className="font-medium mr-2">{formatStatus(notification.notificationType)}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatNotificationTime(notification.sentAt)}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {notification.newStatus && (
                    <div className="flex gap-2 items-center mb-1">
                      <Badge variant="outline" className={getNotificationStatusColor(notification)}>
                        {formatStatus(notification.newStatus)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {notification.previousStatus && 
                          `(From: ${formatStatus(notification.previousStatus)})`}
                      </span>
                    </div>
                  )}
                  
                  {notification.newStatus && (
                    <div className="my-3">
                      <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{getProgressPercentage(notification.newStatus)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${getProgressPercentage(notification.newStatus)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm">{notification.message}</p>
                  
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Mail className="h-3 w-3 mr-1" />
                    <span>
                      {notification.successful 
                        ? 'Email notification sent'
                        : 'Email notification failed to send'}
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}