
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Clock,
  ShoppingBag,
  Bell,
  CreditCard,
  Check,
  AlertTriangle,
  FileText,
  Truck,
  Package,
  Calendar,
  Wrench,
  Loader2,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "../ui/badge";

interface TimelineEvent {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  orderId?: number;
  orderGroupId?: number;
  details?: any;
}

function getEventIcon(type: string) {
  switch (type) {
    case 'order_created':
      return <ShoppingBag className="h-5 w-5 text-blue-500" />;
    case 'payment_completed':
      return <CreditCard className="h-5 w-5 text-green-500" />;
    case 'status_changed':
      return <Bell className="h-5 w-5 text-yellow-500" />;
    case 'invoice_generated':
      return <FileText className="h-5 w-5 text-purple-500" />;
    case 'order_shipped':
      return <Truck className="h-5 w-5 text-indigo-500" />;
    case 'order_ready':
      return <Package className="h-5 w-5 text-teal-500" />;
    case 'appointment_scheduled':
      return <Calendar className="h-5 w-5 text-orange-500" />;
    case 'production_update':
      return <Wrench className="h-5 w-5 text-gray-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
}

function getEventBadge(type: string) {
  switch (type) {
    case 'order_created':
      return <Badge variant="default">New Order</Badge>;
    case 'payment_completed':
      return <Badge className="bg-green-100 text-green-800">Payment Received</Badge>;
    case 'status_changed':
      return <Badge className="bg-yellow-100 text-yellow-800">Status Updated</Badge>;
    case 'invoice_generated':
      return <Badge className="bg-purple-100 text-purple-800">Invoice</Badge>;
    case 'order_shipped':
      return <Badge className="bg-indigo-100 text-indigo-800">Shipped</Badge>;
    case 'order_ready':
      return <Badge className="bg-teal-100 text-teal-800">Ready for Pickup</Badge>;
    case 'appointment_scheduled':
      return <Badge className="bg-orange-100 text-orange-800">Appointment</Badge>;
    case 'production_update':
      return <Badge className="bg-gray-100 text-gray-800">Production</Badge>;
    default:
      return <Badge variant="outline">Activity</Badge>;
  }
}

export default function CustomerActivityTimeline({ customerId }: { customerId: number }) {
  // Combine order status history and customer notifications
  const { data: statusHistory, isLoading: isLoadingStatus } = useQuery({
    queryKey: [`/api/status-history/customers/${customerId}/status-history`],
    queryFn: () => apiRequest('GET', `/api/status-history/customers/${customerId}/status-history`)
      .then(res => res.json()),
    enabled: !!customerId
  });

  const { data: notifications, isLoading: isLoadingNotifications } = useQuery({
    queryKey: [`/api/notifications/customers/${customerId}/notifications`],
    queryFn: () => apiRequest('GET', `/api/notifications/customers/${customerId}/notifications`)
      .then(res => res.json()),
    enabled: !!customerId
  });

  // Combine and sort all customer activities
  const allActivities: TimelineEvent[] = [];
  
  if (statusHistory) {
    statusHistory.forEach((entry: any) => {
      allActivities.push({
        id: entry.id,
        type: 'status_changed',
        message: `Order #${entry.order_id} status changed from "${entry.previous_status}" to "${entry.new_status}"`,
        timestamp: entry.changed_at,
        orderId: entry.order_id,
        details: {
          frameName: entry.frame_name,
          artworkDescription: entry.artwork_description,
          previousStatus: entry.previous_status,
          newStatus: entry.new_status
        }
      });
    });
  }
  
  if (notifications) {
    notifications.forEach((notification: any) => {
      allActivities.push({
        id: notification.id,
        type: notification.type,
        message: notification.message,
        timestamp: notification.created_at,
        orderId: notification.order_id,
        details: notification.details ? JSON.parse(notification.details) : {}
      });
    });
  }
  
  // Sort all activities by timestamp (newest first)
  const sortedActivities = allActivities.sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  if (isLoadingStatus || isLoadingNotifications) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (sortedActivities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>
            No activity found for this customer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <div className="text-center">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No activity has been recorded yet
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>
          Recent activity for this customer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {sortedActivities.map((activity, index) => (
            <div key={`${activity.type}-${activity.id}-${index}`} className="flex">
              <div className="mr-4 flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-muted bg-background">
                  {getEventIcon(activity.type)}
                </div>
                {index < sortedActivities.length - 1 && (
                  <div className="h-full w-px bg-border" />
                )}
              </div>
              <div className="flex flex-col gap-2 pb-8">
                <div className="flex items-center gap-2">
                  {getEventBadge(activity.type)}
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(activity.timestamp), 'MMM dd, yyyy • h:mm a')}
                  </span>
                </div>
                <p className="text-sm">{activity.message}</p>
                {activity.orderId && (
                  <div className="mt-1 rounded-md bg-muted/50 p-2 text-xs">
                    <div className="font-medium">Order #{activity.orderId}</div>
                    {activity.details?.frameName && (
                      <div className="text-muted-foreground">
                        {activity.details.frameName}
                        {activity.details.artworkDescription ? ` - ${activity.details.artworkDescription}` : ''}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
