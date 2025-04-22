import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell 
} from "recharts";
import { 
  AlertTriangle, 
  BarChart3, 
  Calendar, 
  DollarSign, 
  Package2, 
  PackageCheck, 
  Truck, 
  TrendingDown, 
  TrendingUp 
} from "lucide-react";
import { useInventoryMetrics, useLowStockItems, useInventoryActivity } from "@/hooks/use-inventory";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { InventoryItem } from "@shared/schema";

// Extended type for low stock items with current quantity
interface LowStockItem {
  id: number;
  sku: string;
  name: string;
  currentQuantity: number;
  minimumStockLevel: number;
  reorderLevel: number;
  unitOfMeasure?: string;
}

// Color palette for charts
const COLORS = ["#00ADB5", "#3A55D9", "#FF5722", "#7C4DFF", "#4CAF50", "#FFC107"];

const InventoryDashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('month');
  
  // Fetch inventory metrics
  const { data: metrics, isLoading: metricsLoading } = useInventoryMetrics();
  const { data: lowStockItems, isLoading: lowStockLoading } = useLowStockItems() as 
    { data: LowStockItem[] | undefined, isLoading: boolean };
  const { data: activityData, isLoading: activityLoading } = useInventoryActivity(timeframe);
  
  // Calculate days of inventory
  const daysOfInventory = metrics?.totalValue && metrics?.averageDailyUsage 
    ? Math.round(metrics.totalValue / (metrics.averageDailyUsage || 1)) 
    : 0;
  
  // Prepare data for category distribution chart
  const categoryData = metrics?.categoryDistribution?.map((category: { name: string; itemCount: number }) => ({
    name: category.name,
    value: category.itemCount
  })) || [];
  
  // Prepare data for inventory value by location chart
  const locationValueData = metrics?.locationValues?.map((location: { name: string; totalValue: number }) => ({
    name: location.name,
    value: location.totalValue
  })) || [];
  
  // Prepare data for inventory activity chart
  const activityChartData = activityData?.dailyActivity?.map((day: { date: string; received: number; consumed: number }) => ({
    date: day.date,
    received: day.received,
    consumed: day.consumed,
    net: day.received - day.consumed
  })) || [];
  
  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                {metricsLoading ? (
                  <Skeleton className="h-9 w-20 mt-1" />
                ) : (
                  <h3 className="text-3xl font-bold">{metrics?.totalItems || 0}</h3>
                )}
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Package2 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Total Value */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
                {metricsLoading ? (
                  <Skeleton className="h-9 w-24 mt-1" />
                ) : (
                  <h3 className="text-3xl font-bold">{formatCurrency(metrics?.totalValue || 0)}</h3>
                )}
              </div>
              <div className="p-2 bg-secondary/10 rounded-full">
                <DollarSign className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Days of Inventory */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Days of Inventory</p>
                {metricsLoading ? (
                  <Skeleton className="h-9 w-16 mt-1" />
                ) : (
                  <h3 className="text-3xl font-bold">{daysOfInventory}</h3>
                )}
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Low Stock Items */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                {lowStockLoading ? (
                  <Skeleton className="h-9 w-16 mt-1" />
                ) : (
                  <h3 className="text-3xl font-bold">{lowStockItems?.length || 0}</h3>
                )}
              </div>
              <div className="p-2 bg-destructive/10 rounded-full">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Activity Analysis */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Inventory Activity</CardTitle>
              <CardDescription>Tracking receiving and consumption over time</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant={timeframe === 'week' ? "default" : "outline"} 
                size="sm"
                onClick={() => setTimeframe('week')}
              >
                Week
              </Button>
              <Button 
                variant={timeframe === 'month' ? "default" : "outline"} 
                size="sm"
                onClick={() => setTimeframe('month')}
              >
                Month
              </Button>
              <Button 
                variant={timeframe === 'quarter' ? "default" : "outline"} 
                size="sm"
                onClick={() => setTimeframe('quarter')}
              >
                Quarter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={activityChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="received" stroke="#00ADB5" name="Received" strokeWidth={2} />
                <Line type="monotone" dataKey="consumed" stroke="#FF5722" name="Consumed" strokeWidth={2} />
                <Line type="monotone" dataKey="net" stroke="#3A55D9" name="Net Change" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Breakdown of inventory items by category</CardDescription>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        {/* Value by Location */}
        <Card>
          <CardHeader>
            <CardTitle>Value by Location</CardTitle>
            <CardDescription>Distribution of inventory value across locations</CardDescription>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={locationValueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Value']} />
                  <Bar dataKey="value" fill="#3A55D9">
                    {locationValueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Low Stock Items */}
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Items</CardTitle>
          <CardDescription>Items that need reordering soon</CardDescription>
        </CardHeader>
        <CardContent>
          {lowStockLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : lowStockItems?.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <PackageCheck className="h-12 w-12 mx-auto mb-2" />
              <p>All items have adequate stock levels</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Item</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Current Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Minimum Level</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Reorder Level</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-popover divide-y divide-border">
                  {lowStockItems?.slice(0, 5).map((item: LowStockItem) => (
                    <tr key={item.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm">{item.name}</td>
                      <td className="px-4 py-3 text-sm">{item.currentQuantity} {item.unitOfMeasure}</td>
                      <td className="px-4 py-3 text-sm">{item.minimumStockLevel}</td>
                      <td className="px-4 py-3 text-sm">{item.reorderLevel}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={
                          item.currentQuantity <= item.minimumStockLevel 
                            ? "destructive" 
                            : item.currentQuantity <= item.reorderLevel 
                              ? "secondary" 
                              : "outline"
                        }>
                          {item.currentQuantity <= item.minimumStockLevel 
                            ? "Critical" 
                            : item.currentQuantity <= item.reorderLevel 
                              ? "Reorder Now" 
                              : "Adequate"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {lowStockItems && lowStockItems.length > 5 && (
            <div className="mt-4 text-center">
              <Button variant="link">View all {lowStockItems.length} low stock items</Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Procurement Status */}
      <Card>
        <CardHeader>
          <CardTitle>Procurement Status</CardTitle>
          <CardDescription>Status of recent and pending purchase orders</CardDescription>
        </CardHeader>
        <CardContent>
          {/* This will be implemented next */}
          <div className="text-center py-12 text-muted-foreground">
            <Truck className="h-12 w-12 mx-auto mb-2" />
            <p>Purchase order data will be displayed here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryDashboard;