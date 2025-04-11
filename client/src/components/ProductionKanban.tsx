import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProductionKanban } from '@/hooks/use-production';
import { Loader2, ArrowLeftCircle, ArrowRightCircle, CalendarIcon, ClipboardList, Mail, Phone, Info } from 'lucide-react';
import { Order, ProductionStatus, productionStatuses } from '@shared/schema';
import { formatCurrency } from '@/lib/utils';

interface OrderCardProps {
  order: Order;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onSchedule: (days: number) => void;
}

function OrderCard({ order, onMoveLeft, onMoveRight, canMoveLeft, canMoveRight, onSchedule }: OrderCardProps) {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [estimatedDays, setEstimatedDays] = useState(7);

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleSchedule = () => {
    onSchedule(estimatedDays);
    setIsScheduleDialogOpen(false);
  };

  return (
    <Card className="mb-4 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-md">Order #{order.id}</CardTitle>
          <Badge variant={
            order.productionStatus === 'completed' ? 'default' :
            order.productionStatus === 'delayed' ? 'destructive' :
            'secondary'
          }>
            {formatStatus(order.productionStatus || 'order_processed')}
          </Badge>
        </div>
        <CardDescription>
          {order.customerName || 'Customer'}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm space-y-2 pb-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium">Frame:</span> {order.frameId?.split('-')[1] || 'None'}
          </div>
          <div>
            <span className="font-medium">Mat:</span> {order.matColorId?.split('-')[1] || 'None'}
          </div>
          <div>
            <span className="font-medium">Size:</span> {order.artworkWidth}×{order.artworkHeight}"
          </div>
          <div>
            <span className="font-medium">Glass:</span> {order.glassOptionId?.split('-')[1] || 'None'}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Phone className="h-3 w-3" />
          <span className="text-xs">{order.customerPhone || 'No phone'}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Mail className="h-3 w-3" />
          <span className="text-xs">{order.customerEmail || 'No email'}</span>
        </div>

        {order.estimatedCompletionDays && (
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-3 w-3" />
            <span className="text-xs">
              Est. completion: {new Date(new Date().setDate(new Date().getDate() + order.estimatedCompletionDays)).toLocaleDateString()}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onMoveLeft}
          disabled={!canMoveLeft}
        >
          <ArrowLeftCircle className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        {order.productionStatus === 'order_processed' ? (
          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="default">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Order #{order.id} for Production</DialogTitle>
                <DialogDescription>
                  Set the estimated number of days until completion
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="estimated-days">Estimated Days</Label>
                <Input 
                  id="estimated-days" 
                  type="number" 
                  min={7} 
                  max={30}
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 7 days required for scheduling.
                </p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSchedule}>Schedule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Button 
            variant="default" 
            size="sm"
            onClick={onMoveRight}
            disabled={!canMoveRight}
          >
            Next
            <ArrowRightCircle className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function KanbanColumn({ 
  title, 
  orders = [], 
  isLoading = false, 
  previousStatus, 
  nextStatus,
  updateOrderStatus,
  scheduleOrder,
  currentStatus
}: { 
  title: string;
  orders?: Order[];
  isLoading?: boolean;
  previousStatus?: ProductionStatus;
  nextStatus?: ProductionStatus;
  updateOrderStatus: (id: number, status: ProductionStatus) => void;
  scheduleOrder: (id: number, days: number) => void;
  currentStatus: ProductionStatus;
}) {
  return (
    <div className="kanban-column min-w-[280px] max-w-[280px]">
      <div className="bg-muted rounded-t-lg p-3 sticky top-0 z-10">
        <h3 className="font-medium">{title}</h3>
        <div className="text-xs text-muted-foreground">
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div className="p-3 min-h-[calc(100vh-180px)] bg-muted/30 rounded-b-lg">
        {isLoading ? (
          <div className="flex items-center justify-center h-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-20 text-muted-foreground">
            <ClipboardList className="h-8 w-8 mb-2" />
            <p className="text-xs">No orders in this column</p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              canMoveLeft={!!previousStatus}
              canMoveRight={!!nextStatus}
              onMoveLeft={() => updateOrderStatus(order.id, previousStatus as ProductionStatus)}
              onMoveRight={() => updateOrderStatus(order.id, nextStatus as ProductionStatus)}
              onSchedule={(days) => scheduleOrder(order.id, days)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function ProductionKanban() {
  const { 
    orders, 
    isLoading, 
    error, 
    updateOrderStatus: updateStatus,
    scheduleOrder,
  } = useProductionKanban();

  const handleUpdateStatus = (id: number, status: ProductionStatus) => {
    updateStatus({ id, status });
  };

  const handleScheduleOrder = (id: number, days: number) => {
    scheduleOrder({ id, estimatedDays: days });
  };

  // Generate columns based on production statuses
  const columns = [
    { 
      title: 'Order Processed', 
      status: 'order_processed',
      nextStatus: 'scheduled',
    },
    { 
      title: 'Scheduled', 
      status: 'scheduled',
      previousStatus: 'order_processed',
      nextStatus: 'materials_ordered',
    },
    { 
      title: 'Materials Ordered', 
      status: 'materials_ordered',
      previousStatus: 'scheduled',
      nextStatus: 'materials_arrived',
    },
    { 
      title: 'Materials Arrived', 
      status: 'materials_arrived',
      previousStatus: 'materials_ordered',
      nextStatus: 'frame_cut',
    },
    { 
      title: 'Frame Cut', 
      status: 'frame_cut',
      previousStatus: 'materials_arrived',
      nextStatus: 'mat_cut',
    },
    { 
      title: 'Mat Cut', 
      status: 'mat_cut',
      previousStatus: 'frame_cut',
      nextStatus: 'prepped',
    },
    { 
      title: 'Prepped', 
      status: 'prepped',
      previousStatus: 'mat_cut',
      nextStatus: 'completed',
    },
    { 
      title: 'Completed', 
      status: 'completed',
      previousStatus: 'prepped',
    },
    { 
      title: 'Delayed', 
      status: 'delayed',
      previousStatus: 'completed',
    }
  ];

  // Filter orders by their status
  const getOrdersByStatus = (status: ProductionStatus) => {
    if (!orders) return [];
    return orders.filter(order => order.productionStatus === status);
  };

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 rounded-lg">
        <h2 className="font-semibold text-lg">Error Loading Production Board</h2>
        <p className="text-muted-foreground">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Production Kanban Board</h1>
          <p className="text-muted-foreground">
            Manage and track framing orders through each production stage
          </p>
        </div>
        <div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Info className="h-4 w-4 mr-2" />
                How to Use
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Using the Production Kanban Board</DialogTitle>
                <DialogDescription>
                  A guide to managing your framing production workflow
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <h3 className="font-medium">Moving Orders</h3>
                  <p className="text-sm text-muted-foreground">
                    Use the 'Back' and 'Next' buttons to move orders between production stages.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Scheduling</h3>
                  <p className="text-sm text-muted-foreground">
                    New orders must be scheduled before they can enter production. Click 'Schedule' 
                    on orders in the first column to set an estimated completion date.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Customer Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatic notifications are sent to customers when orders change status. 
                    You can disable notifications for specific orders in the order details.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Daily Capacity</h3>
                  <p className="text-sm text-muted-foreground">
                    The system limits new production to 5 orders per day to ensure quality 
                    and predictable completion times.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading production board...</span>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-4 pb-4">
            {columns.map((column) => (
              <KanbanColumn
                key={column.status}
                title={column.title}
                orders={getOrdersByStatus(column.status as ProductionStatus)}
                previousStatus={column.previousStatus as ProductionStatus}
                nextStatus={column.nextStatus as ProductionStatus}
                updateOrderStatus={handleUpdateStatus}
                scheduleOrder={handleScheduleOrder}
                currentStatus={column.status as ProductionStatus}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}