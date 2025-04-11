import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useProduction } from '@/hooks/use-production';
import { AlertTriangle, Calendar, CheckCircle, Clock, RefreshCw, Truck } from 'lucide-react';
import { Order, ProductionStatus } from '@shared/schema';
import NotificationHistory from './NotificationHistory';
import { format } from 'date-fns';

interface OrderProgressProps {
  order: Order;
  showHistory?: boolean;
}

export default function OrderProgress({
  order,
  showHistory = true
}: OrderProgressProps) {
  const { toggleNotificationsMutation } = useProduction({});

  // Calculate appropriate progress percentage based on status
  const getProgressPercentage = (status: ProductionStatus) => {
    switch (status) {
      case 'order_processed': return 10;
      case 'scheduled': return 20;
      case 'materials_ordered': return 30;
      case 'materials_arrived': return 40;
      case 'frame_cut': return 60;
      case 'mat_cut': return 70;
      case 'prepped': return 85;
      case 'completed': return 100;
      case 'delayed': return order.previousStatus ? getProgressPercentage(order.previousStatus as ProductionStatus) : 50;
      default: return 0;
    }
  };

  // Format the status for display
  const formatStatus = (status: ProductionStatus) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get appropriate status icon
  const getStatusIcon = (status: ProductionStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'delayed':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'materials_ordered':
      case 'materials_arrived':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'scheduled':
        return <Calendar className="h-5 w-5 text-indigo-500" />;
      default:
        return <RefreshCw className="h-5 w-5 text-primary" />;
    }
  };

  // Get appropriate color for progress bar
  const getProgressColor = (status: ProductionStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'delayed': return 'bg-amber-500';
      default: return '';  // Default color from theme
    }
  };

  // Handle notifications toggle
  const handleToggleNotifications = () => {
    toggleNotificationsMutation.mutate({
      id: order.id,
      enabled: !order.notificationsEnabled
    });
  };

  // Estimated completion date calculation
  const getEstimatedCompletionDate = () => {
    if (!order.estimatedCompletionDays) return null;
    
    const orderDate = order.lastStatusChange 
      ? new Date(order.lastStatusChange) 
      : order.createdAt 
        ? new Date(order.createdAt) 
        : new Date();
        
    const completionDate = new Date(orderDate);
    completionDate.setDate(completionDate.getDate() + order.estimatedCompletionDays);
    
    return completionDate;
  };

  const completionDate = getEstimatedCompletionDate();
  const progress = getProgressPercentage(order.productionStatus);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Order #{order.id} Progress</CardTitle>
              <CardDescription>
                Current Status: {formatStatus(order.productionStatus)}
              </CardDescription>
            </div>
            <Badge 
              variant={order.productionStatus === 'completed' ? 'default' : 'secondary'}
              className="flex items-center gap-1"
            >
              {getStatusIcon(order.productionStatus)}
              <span>{formatStatus(order.productionStatus)}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Production Progress</span>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className={getProgressColor(order.productionStatus)} />
          </div>

          {completionDate && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Estimated Completion</p>
                <p className="text-sm text-muted-foreground">
                  {format(completionDate, 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Switch 
              id={`notifications-${order.id}`}
              checked={order.notificationsEnabled}
              onCheckedChange={handleToggleNotifications}
              disabled={toggleNotificationsMutation.isPending}
            />
            <Label htmlFor={`notifications-${order.id}`} className="cursor-pointer">
              Email notifications {order.notificationsEnabled ? 'enabled' : 'disabled'}
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" onClick={() => window.location.href = `/order/${order.id}`}>
            View Order Details
          </Button>
          {order.productionStatus === 'completed' && (
            <Button variant="default" size="sm">Schedule Pickup</Button>
          )}
        </CardFooter>
      </Card>

      {showHistory && (
        <NotificationHistory orderId={order.id} />
      )}
    </div>
  );
}