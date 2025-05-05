import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useProduction } from '@/hooks/use-production';
import { useOrders } from '@/hooks/use-orders';
import OrderProgress from '@/components/OrderProgress';
import NotificationHistory from '@/components/NotificationHistory';
import { OrderEditDialog } from '@/components/OrderEditDialog';
import { OrderStatusHistory } from '@/components/OrderStatusHistory'; // Added import
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
import { AlertCircle, ArrowLeft, Clock, Edit, ShoppingBag } from 'lucide-react';

export default function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  const handleEditDialogOpenChange = (open: boolean) => {
    setIsEditDialogOpen(open);
  };

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
              <Link href="/orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Orders
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
          <p className="text-muted-foreground">
            Customer: {order.customerName || 'Unknown'} | Created: {new Date(order.createdAt || '').toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
          <Button 
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>
              Specifications and pricing information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Frame</h4>
                <p className="text-sm">{order.frameName || order.frameId || 'None'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Material</h4>
                <p className="text-sm">{order.frameMaterial || 'Standard'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Mat</h4>
                <p className="text-sm">{order.matColorName || order.matColorId || 'None'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Glass</h4>
                <p className="text-sm">{order.glassOptionName || order.glassOptionId || 'None'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Image Size</h4>
                <p className="text-sm">{order.artworkWidth}" × {order.artworkHeight}"</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Mat Width</h4>
                <p className="text-sm">{order.matWidth}" all around</p>
              </div>
              <div className="col-span-2">
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm">{order.artworkDescription || 'No description'}</p>
              </div>
              <div className="col-span-2">
                <h4 className="text-sm font-medium mb-1">Art Type</h4>
                <p className="text-sm">{order.artworkType || 'Not specified'}</p>
              </div>
              <div className="col-span-2">
                <h4 className="text-sm font-medium mb-1">Status</h4>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                    order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'}`}
                >
                  {order.status?.charAt(0).toUpperCase() + order.status?.slice(1).replace('_', ' ')}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <p className="text-sm">Subtotal</p>
                <p className="text-sm font-medium">${parseFloat(order.subtotal || '0').toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm">Tax</p>
                <p className="text-sm font-medium">${parseFloat(order.tax || '0').toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center font-medium mt-2">
                <p>Total</p>
                <p>${parseFloat(order.total || '0').toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/order-progress/${order.id}`}>
                <Clock className="mr-2 h-4 w-4" />
                Track Progress
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Order Progress */}
        <div className="md:col-span-2">
          <OrderProgress order={order} showHistory={false} />

          <div className="mt-6">
            <NotificationHistory orderId={order.id} />
            {/* Order Status History */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Status History</h3>
              <OrderStatusHistory orderId={order.id} /> {/* Assuming orderId is available */}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <OrderEditDialog 
        isOpen={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)}
        order={order}
      />
    </div>
  );
}