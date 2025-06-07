import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from '@/components/ui/separator';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Order, OrderGroup } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { formatCurrency } from '@/lib/utils';

export function CartWidget() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch active order group (cart)
  const { data: orderGroups } = useQuery<OrderGroup[]>({
    queryKey: ['/api/order-groups'],
    queryFn: () => fetch('/api/order-groups').then(res => res.json()),
    select: (data) => data?.filter(group => group.status === 'open') || [],
  });

  // Fetch orders for any open order groups
  const { data: allOrders } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    queryFn: () => fetch('/api/orders').then(res => res.json()),
  });
  
  const openOrderGroup = orderGroups?.[0];
  const cartOrders = allOrders?.filter(order => order.orderGroupId === openOrderGroup?.id) || [];
  
  // Quantities state for each order
  const [quantities, setQuantities] = useState<{[orderId: number]: number}>({});
  
  // Initialize quantities when orders are loaded
  useEffect(() => {
    if (cartOrders.length > 0) {
      const initialQuantities = cartOrders.reduce((acc, order) => {
        acc[order.id] = order.quantity || 1;
        return acc;
      }, {} as {[orderId: number]: number});
      setQuantities(initialQuantities);
    }
  }, [cartOrders]);
  
  const handleQuantityChange = async (orderId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setQuantities(prev => ({
      ...prev,
      [orderId]: newQuantity
    }));
    
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/order-groups'] });
      
      toast({
        title: "Quantity updated",
        description: `Item quantity has been updated to ${newQuantity}`,
      });
    } catch (error) {
      // Revert the local state change on error
      setQuantities(prev => ({
        ...prev,
        [orderId]: cartOrders.find(order => order.id === orderId)?.quantity || 1
      }));
      
      toast({
        title: "Error updating quantity",
        description: "There was an error updating the item quantity",
        variant: "destructive",
      });
    }
  };
  
  const handleRemoveOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/order-groups'] });
      
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart",
      });
    } catch (error) {
      toast({
        title: "Error removing item",
        description: "There was an error removing the item from your cart",
        variant: "destructive",
      });
    }
  };
  
  const handleCheckout = () => {
    if (openOrderGroup?.id) {
      setIsOpen(false);
      navigate(`/checkout/${openOrderGroup.id}`);
    } else {
      toast({
        title: "No active order",
        description: "There is no active order to checkout.",
        variant: "destructive",
      });
    }
  };
  
  // Calculate total number of items in cart
  const totalItems = cartOrders.reduce((sum, order) => sum + (order.quantity || 1), 0);
  
  // Calculate cart total
  const cartTotal = openOrderGroup?.total || 0;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative dark:text-white dark:hover:bg-gray-800">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 px-1.5 py-0.5 min-w-[1.2rem] h-5">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            You have {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-6 h-[calc(100vh-12rem)] overflow-y-auto">
          {cartOrders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            cartOrders.map((order) => (
              <div key={order.id} className="space-y-3">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">Frame #{order.frameId}</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.artworkWidth}" × {order.artworkHeight}" artwork with {order.matWidth}" mat
                    </p>
                    <p className="text-sm text-muted-foreground">{order.artworkDescription}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(Number(order.subtotal))}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`quantity-${order.id}`} className="text-sm">Qty:</Label>
                    <div className="flex items-center">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-r-none"
                        onClick={() => handleQuantityChange(order.id, (quantities[order.id] || 1) - 1)}
                        disabled={(quantities[order.id] || 1) <= 1}
                      >
                        -
                      </Button>
                      <Input
                        id={`quantity-${order.id}`}
                        type="number"
                        min="1"
                        className="h-8 w-12 rounded-none text-center"
                        value={quantities[order.id] || 1}
                        onChange={(e) => handleQuantityChange(order.id, parseInt(e.target.value) || 1)}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-l-none"
                        onClick={() => handleQuantityChange(order.id, (quantities[order.id] || 1) + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleRemoveOrder(order.id)}
                  >
                    Remove
                  </Button>
                </div>
                
                <Separator />
              </div>
            ))
          )}
        </div>
        
        <SheetFooter className="flex-col sm:flex-col space-y-4">
          <div className="flex justify-between">
            <span className="font-medium">Total</span>
            <span className="font-bold">{formatCurrency(Number(cartTotal))}</span>
          </div>
          
          <div className="flex gap-4">
            <SheetClose asChild>
              <Button variant="outline" className="flex-1">
                Continue Shopping
              </Button>
            </SheetClose>
            <Button 
              className="flex-1" 
              disabled={cartOrders.length === 0}
              onClick={handleCheckout}
            >
              Checkout
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}