
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { 
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  TimelineSeparator
} from '@mui/lab';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Clock, 
  CheckCircle, 
  Scissors, 
  Truck, 
  Package, 
  AlertTriangle, 
  XCircle, 
  ArrowRight
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusHistoryEntry {
  id: number;
  order_id: number;
  previous_status: string;
  new_status: string;
  changed_at: string;
  notes: string | null;
  frame_name?: string;
  artwork_description?: string;
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  processed: <ArrowRight className="h-4 w-4" />,
  ordered: <Package className="h-4 w-4" />,
  arrived: <Truck className="h-4 w-4" />,
  frame_cut: <Scissors className="h-4 w-4" />,
  mat_cut: <Scissors className="h-4 w-4" />,
  prepped: <Package className="h-4 w-4" />,
  completed: <CheckCircle className="h-4 w-4" />,
  delayed: <AlertTriangle className="h-4 w-4" />,
  canceled: <XCircle className="h-4 w-4" />
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  processed: "bg-blue-300",
  ordered: "bg-blue-500",
  arrived: "bg-purple-500",
  frame_cut: "bg-indigo-500",
  mat_cut: "bg-teal-500",
  prepped: "bg-cyan-500",
  completed: "bg-green-500",
  delayed: "bg-orange-500",
  canceled: "bg-red-500"
};

export function OrderStatusHistory({ 
  orderId, 
  limit = 10
}: { 
  orderId: number; 
  limit?: number;
}) {
  const { data: statusHistory, isLoading, error } = useQuery({
    queryKey: [`/api/status-history/orders/${orderId}/status-history`],
    queryFn: () => apiRequest('GET', `/api/status-history/orders/${orderId}/status-history`)
      .then(res => res.json())
      .then(data => data.slice(0, limit)),
    enabled: !!orderId
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Status History</CardTitle>
          <CardDescription>Loading status history...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error || !statusHistory) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Status History</CardTitle>
          <CardDescription>Error loading status history</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Order Status History</CardTitle>
        <CardDescription>Status changes for this order</CardDescription>
      </CardHeader>
      <CardContent>
        {statusHistory.length === 0 ? (
          <p className="text-muted-foreground">No status changes recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {statusHistory.map((entry: StatusHistoryEntry) => (
              <div key={entry.id} className="flex items-start gap-3 p-3 rounded-md border">
                <div className={cn("p-2 rounded-full", statusColors[entry.new_status] || "bg-gray-500")}>
                  {statusIcons[entry.new_status] || <Clock className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[entry.new_status] || "bg-gray-500"}>
                      {entry.new_status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(entry.changed_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  {entry.previous_status && (
                    <p className="text-sm mt-1">
                      Changed from <span className="font-medium">{entry.previous_status.replace('_', ' ')}</span>
                    </p>
                  )}
                  {entry.notes && (
                    <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CustomerStatusHistory({ 
  customerId, 
  limit = 20
}: { 
  customerId: number;
  limit?: number; 
}) {
  const { data: statusHistory, isLoading, error } = useQuery({
    queryKey: [`/api/status-history/customers/${customerId}/status-history`],
    queryFn: () => apiRequest('GET', `/api/status-history/customers/${customerId}/status-history`)
      .then(res => res.json())
      .then(data => data.slice(0, limit)),
    enabled: !!customerId
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Orders Status History</CardTitle>
          <CardDescription>Loading status history...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error || !statusHistory) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Orders Status History</CardTitle>
          <CardDescription>Error loading status history</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const groupedByOrder: Record<number, StatusHistoryEntry[]> = {};
  
  statusHistory.forEach((entry: StatusHistoryEntry) => {
    if (!groupedByOrder[entry.order_id]) {
      groupedByOrder[entry.order_id] = [];
    }
    groupedByOrder[entry.order_id].push(entry);
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Orders Status History</CardTitle>
        <CardDescription>Recent status changes for all your orders</CardDescription>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedByOrder).length === 0 ? (
          <p className="text-muted-foreground">No status changes recorded for your orders yet.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByOrder).map(([orderId, entries]) => (
              <div key={orderId} className="border rounded-md p-4">
                <h3 className="font-medium mb-2">
                  Order #{orderId} - {entries[0].frame_name || 'Custom Frame'}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {entries[0].artwork_description || 'Artwork'}
                </p>
                <div className="space-y-3">
                  {entries.slice(0, 5).map((entry: StatusHistoryEntry) => (
                    <div key={entry.id} className="flex items-start gap-3 p-2 bg-muted/50 rounded-md">
                      <div className={cn("p-1.5 rounded-full", statusColors[entry.new_status] || "bg-gray-500")}>
                        {statusIcons[entry.new_status] || <Clock className="h-3 w-3" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[entry.new_status] || "bg-gray-500"}>
                            {entry.new_status.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(entry.changed_at), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
