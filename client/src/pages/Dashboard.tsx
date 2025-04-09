import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Order, Frame, MatColor, GlassOption, WholesaleOrder } from '@shared/schema';

// Dashboard overview stats
interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, description, icon }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-primary">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/orders'],
  });

  // Fetch frames for reference
  const { data: frames } = useQuery({
    queryKey: ['/api/frames'],
  });

  // Fetch mat colors for reference
  const { data: matColors } = useQuery({
    queryKey: ['/api/mat-colors'],
  });

  // Fetch glass options for reference
  const { data: glassOptions } = useQuery({
    queryKey: ['/api/glass-options'],
  });

  // Fetch wholesale orders
  const { data: wholesaleOrders } = useQuery({
    queryKey: ['/api/wholesale-orders'],
  });

  // Filter orders by time range
  const getFilteredOrders = () => {
    if (!orders) return [];
    
    const now = new Date();
    let filterDate = new Date();
    
    switch (timeRange) {
      case '7days':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        filterDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        filterDate.setDate(now.getDate() - 90);
        break;
      case '12months':
        filterDate.setMonth(now.getMonth() - 12);
        break;
      default:
        filterDate.setDate(now.getDate() - 30);
    }
    
    return orders.filter((order: Order) => {
      const orderDate = new Date(order.createdAt || '');
      return orderDate >= filterDate;
    });
  };

  const filteredOrders = getFilteredOrders();

  // Calculate dashboard stats
  const totalSales = filteredOrders.reduce((sum: number, order: Order) => sum + Number(order.total), 0);
  const totalOrders = filteredOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const pendingOrders = filteredOrders.filter((order: Order) => order.status === 'pending').length;
  
  // Prepare data for charts
  const prepareOrdersByDateData = () => {
    if (!filteredOrders.length) return [];
    
    const ordersByDate: { [key: string]: { date: string; orders: number; sales: number } } = {};
    
    filteredOrders.forEach((order: Order) => {
      const date = new Date(order.createdAt || '').toLocaleDateString();
      if (!ordersByDate[date]) {
        ordersByDate[date] = { date, orders: 0, sales: 0 };
      }
      ordersByDate[date].orders += 1;
      ordersByDate[date].sales += Number(order.total);
    });
    
    return Object.values(ordersByDate).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };
  
  const preparePopularFramesData = () => {
    if (!filteredOrders.length || !frames) return [];
    
    const framesCount: { [key: string]: number } = {};
    
    filteredOrders.forEach((order: Order) => {
      if (order.frameId) {
        if (!framesCount[order.frameId]) {
          framesCount[order.frameId] = 0;
        }
        framesCount[order.frameId] += 1;
      }
    });
    
    return Object.entries(framesCount).map(([frameId, count]) => {
      const frame = frames.find((f: Frame) => f.id === frameId);
      return {
        name: frame ? frame.name : 'Unknown',
        value: count,
      };
    }).sort((a, b) => b.value - a.value).slice(0, 5);
  };
  
  const prepareMatColorData = () => {
    if (!filteredOrders.length || !matColors) return [];
    
    const matColorCount: { [key: string]: number } = {};
    
    filteredOrders.forEach((order: Order) => {
      if (order.matColorId) {
        if (!matColorCount[order.matColorId]) {
          matColorCount[order.matColorId] = 0;
        }
        matColorCount[order.matColorId] += 1;
      }
    });
    
    return Object.entries(matColorCount).map(([matColorId, count]) => {
      const matColor = matColors.find((m: MatColor) => m.id === matColorId);
      return {
        name: matColor ? matColor.name : 'Unknown',
        value: count,
        color: matColor ? matColor.color : '#ccc',
      };
    });
  };
  
  const prepareGlassOptionsData = () => {
    if (!filteredOrders.length || !glassOptions) return [];
    
    const glassOptionCount: { [key: string]: number } = {};
    
    filteredOrders.forEach((order: Order) => {
      if (order.glassOptionId) {
        if (!glassOptionCount[order.glassOptionId]) {
          glassOptionCount[order.glassOptionId] = 0;
        }
        glassOptionCount[order.glassOptionId] += 1;
      }
    });
    
    return Object.entries(glassOptionCount).map(([glassOptionId, count]) => {
      const glassOption = glassOptions.find((g: GlassOption) => g.id === glassOptionId);
      return {
        name: glassOption ? glassOption.name : 'Unknown',
        value: count,
      };
    });
  };
  
  const ordersByDateData = prepareOrdersByDateData();
  const popularFramesData = preparePopularFramesData();
  const matColorData = prepareMatColorData();
  const glassOptionsData = prepareGlassOptionsData();
  
  // Colors for charts
  const COLORS = ['#00ADB5', '#E31E6A', '#21C685', '#FFC107', '#F44336'];
  
  if (ordersLoading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="12months">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={`$${totalSales.toFixed(2)}`}
          description={`${totalOrders} orders in selected period`}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          }
        />
        <StatCard
          title="Average Order Value"
          value={`$${averageOrderValue.toFixed(2)}`}
          description="Per order in selected period"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          }
        />
        <StatCard
          title="Pending Orders"
          value={pendingOrders}
          description="Orders awaiting fulfillment"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="6" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          }
        />
        <StatCard
          title="Wholesale Orders"
          value={wholesaleOrders?.length || 0}
          description="Material orders to wholesalers"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path>
              <path d="M16.5 9.4 7.55 4.24"></path>
              <polyline points="3.29 7 12 12 20.71 7"></polyline>
              <line x1="12" y1="22" x2="12" y2="12"></line>
              <circle cx="18.5" cy="15.5" r="2.5"></circle>
              <path d="M20.27 17.27 22 19"></path>
            </svg>
          }
        />
      </div>

      <Tabs 
        defaultValue="overview" 
        onValueChange={setSelectedTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Sales and order volume over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {ordersByDateData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={ordersByDateData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="orders"
                      stroke="#00ADB5"
                      activeDot={{ r: 8 }}
                      name="Orders"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="sales"
                      stroke="#E31E6A"
                      name="Sales ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No data available for the selected period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Popular Frames</CardTitle>
                <CardDescription>Most ordered frame styles</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {popularFramesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={popularFramesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" name="Orders" fill="#00ADB5" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Mat Colors</CardTitle>
                <CardDescription>Distribution of mat color choices</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {matColorData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={matColorData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {matColorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="materials" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Glass Options</CardTitle>
                <CardDescription>Distribution of glass choices</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {glassOptionsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={glassOptionsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {glassOptionsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Inventory/Stock Card for Wholesale */}
            <Card>
              <CardHeader>
                <CardTitle>Wholesale Orders</CardTitle>
                <CardDescription>Material orders by manufacturer</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {wholesaleOrders && wholesaleOrders.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        wholesaleOrders.reduce((acc: any[], order: WholesaleOrder) => {
                          const manufacturerIndex = acc.findIndex(
                            (item) => item.name === order.manufacturer
                          );
                          
                          if (manufacturerIndex === -1) {
                            acc.push({
                              name: order.manufacturer,
                              value: 1,
                            });
                          } else {
                            acc[manufacturerIndex].value += 1;
                          }
                          
                          return acc;
                        }, [])
                      }
                      margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" name="Orders" fill="#21C685" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No wholesale orders available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
