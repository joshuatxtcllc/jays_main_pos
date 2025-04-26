import React, { useEffect } from 'react';
import { useParams } from 'wouter';
import { useProduction } from '@/hooks/use-production';
import OrderProgress from '@/components/OrderProgress';
import NotificationHistory from '@/components/NotificationHistory';
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ArrowLeft, Clock, ShoppingBag } from 'lucide-react';
import { Link } from 'wouter';

export default function OrderProgressPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { toast } = useToast();

  const {
    order,
    isLoadingOrder,
    orderError,
    orderNotifications,
    isLoadingOrderNotifications,
  } = useProduction({
    orderId: orderId ? parseInt(orderId) : undefined
  });

  useEffect(() => {
    if (orderError) {
      toast({
        title: 'Error',
        description: 'Failed to load order details. Please try again.',
        variant: 'destructive',
      });
    }
  }, [orderError, toast]);

  if (isLoadingOrder) {
    return (
      <div className="container mx-auto py-10 space-y-6">
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-10 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Not Found</CardTitle>
            <CardDescription>
              We couldn't find the order you're looking for.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-center mb-6">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Progress</h1>
          <p className="text-muted-foreground">
            Track the status of your custom framing order
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/orders">
              <ShoppingBag className="mr-2 h-4 w-4" />
              All Orders
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Summary */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>
              Order #{order.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Artwork Dimensions</p>
              <p className="text-sm text-muted-foreground">
                {order.artworkWidth}" x {order.artworkHeight}"
              </p>
            </div>

            {order.artworkDescription && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Artwork Description</p>
                <p className="text-sm text-muted-foreground">
                  {order.artworkDescription}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Order Date</p>
                <p className="text-sm text-muted-foreground">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Not available'}
                </p>
              </div>
            </div>

            <div className="space-y-1 border-t pt-4">
              <div className="flex justify-between items-center">
                <p className="text-sm">Subtotal</p>
                <p className="text-sm font-medium">${parseFloat(order.subtotal).toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm">Tax</p>
                <p className="text-sm font-medium">${parseFloat(order.tax).toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center font-medium mt-2">
                <p>Total</p>
                <p>${parseFloat(order.total).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/orders`}>
                View All Orders
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Order Progress */}
        <div className="md:col-span-2">
          <OrderProgress order={order} showHistory={false} />

          <div className="mt-6">
            <NotificationHistory orderId={order.id} />
          </div>
        </div>
      </div>
    </div>
  );
}