import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProductionKanban } from '@/hooks/use-production';
import { Loader2, ArrowLeftCircle, ArrowRightCircle, CalendarIcon, ClipboardList, Mail, Phone, Info, GripVertical } from 'lucide-react';
import { Order, ProductionStatus, productionStatuses } from '@shared/schema';
import { formatCurrency } from '@/lib/utils';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Define item types for drag and drop
const ItemTypes = {
  ORDER_CARD: 'order',
};

interface OrderCardProps {
  order: Order;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onSchedule: (days: number) => void;
  index: number;
  moveOrder: (id: number, targetStatus: ProductionStatus) => void;
}

function OrderCard({ 
  order, 
  onMoveLeft, 
  onMoveRight, 
  canMoveLeft, 
  canMoveRight, 
  onSchedule, 
  index,
  moveOrder
}: OrderCardProps) {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [estimatedDays, setEstimatedDays] = useState(7);
  const ref = useRef<HTMLDivElement>(null);

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleSchedule = () => {
    onSchedule(estimatedDays);
    setIsScheduleDialogOpen(false);
  };

  // Setup drag source
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.ORDER_CARD,
    item: { 
      id: order.id, 
      status: order.productionStatus,
      index
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Apply drag ref to the component
  drag(ref);

  return (
    <Card 
      ref={ref} 
      className={`mb-4 shadow-sm relative cursor-move ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="absolute top-2 right-2 text-muted-foreground">
        <GripVertical className="h-4 w-4" />
      </div>
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
          {/* We use a generic customer reference since the customerName is added in the query result */}
          Customer #{order.customerId || 'Unknown'}
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
            <span className="font-medium">Glass:</span> {
              (() => {
                // Handle both formats: with hyphen (vendor-id) or just id (museum, uv)
                if (!order.glassOptionId) return 'None';
                return order.glassOptionId.includes('-') 
                  ? order.glassOptionId.split('-')[1] 
                  : order.glassOptionId === 'museum' ? 'Museum' : 
                    order.glassOptionId === 'uv' ? 'UV Protection' : 
                    order.glassOptionId;
              })()
            }
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Phone className="h-3 w-3" />
          <span className="text-xs">Contact customer for details</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Mail className="h-3 w-3" />
          <span className="text-xs">Order #{order.id}</span>
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
  const ref = useRef<HTMLDivElement>(null);
  
  // Set up drop target for the column
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.ORDER_CARD,
    drop: (item: { id: number; status: ProductionStatus }) => {
      // Only update if the status is different
      if (item.status !== currentStatus) {
        updateOrderStatus(item.id, currentStatus);
      }
      return { status: currentStatus };
    },
    canDrop: (item: { id: number; status: ProductionStatus }) => {
      // Only allow drops if:
      // 1. The source column is adjacent to target (previous or next) or
      // 2. The delayed column can accept from any column
      if (currentStatus === 'delayed') return true;
      if (item.status === previousStatus || item.status === nextStatus) return true;
      return false;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  
  // Apply drop ref to the column
  drop(ref);
  
  // Determine the column highlight styling based on drag state
  const getColumnStyle = () => {
    if (isOver && canDrop) {
      return 'bg-primary/10 border-primary border-2';
    } else if (canDrop) {
      return 'bg-muted/30 border-primary/30 border-2';
    } else if (isOver) {
      return 'bg-destructive/10 border-destructive border-2';
    }
    return 'bg-muted/30';
  };

  return (
    <div className="kanban-column min-w-[280px] max-w-[280px]">
      <div className="bg-muted rounded-t-lg p-3 sticky top-0 z-10">
        <h3 className="font-medium">{title}</h3>
        <div className="text-xs text-muted-foreground">
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div 
        ref={ref}
        className={`p-3 min-h-[calc(100vh-180px)] rounded-b-lg ${getColumnStyle()} transition-colors duration-150`}
      >
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
          orders.map((order, index) => (
            <OrderCard
              key={order.id}
              order={order}
              canMoveLeft={!!previousStatus}
              canMoveRight={!!nextStatus}
              onMoveLeft={() => updateOrderStatus(order.id, previousStatus as ProductionStatus)}
              onMoveRight={() => updateOrderStatus(order.id, nextStatus as ProductionStatus)}
              onSchedule={(days) => scheduleOrder(order.id, days)}
              index={index}
              moveOrder={updateOrderStatus}
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
    return orders.filter((order: Order) => order.productionStatus === status);
  };

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 rounded-lg">
        <h2 className="font-semibold text-lg">Error Loading Production Board</h2>
        <p className="text-muted-foreground">{(error as Error).message}</p>
      </div>
    );
  }

  const KanbanBoard = () => (
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
                    Use drag and drop to move cards between production stages, or use the 'Back' and 'Next' buttons.
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

  // Wrap the entire Kanban board in the DndProvider with HTML5Backend
  return (
    <DndProvider backend={HTML5Backend}>
      <KanbanBoard />
    </DndProvider>
  );
}