
import path from 'path';
import { fileURLToPath } from 'url';

// Polyfill for __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ...rest of your code
import path from 'path';
import { fileURLToPath } from 'url';

// Polyfill for __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ...rest of your code
import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusProgress } from "@/components/OrderStatusProgress";
import { CustomerStatusHistory } from "@/components/OrderStatusHistory";
import CustomerDashboard from "@/components/customer/CustomerDashboard";
import { Loader2, LogOut, ShoppingBag } from "lucide-react";

export default function CustomerDashboardPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    // Check if customer is logged in
    const token = localStorage.getItem('customerAuthToken');
    const storedCustomerId = localStorage.getItem('customerId');
    const storedName = localStorage.getItem('customerName');
    
    if (!token || !storedCustomerId) {
      toast({
        title: "Authentication required",
        description: "Please log in to access your dashboard",
        variant: "destructive",
      });
      navigate('/customer-portal');
      return;
    }
    
    setCustomerId(parseInt(storedCustomerId, 10));
    setCustomerName(storedName || 'Customer');
    setIsLoading(false);
  }, [navigate, toast]);

  const handleLogout = () => {
    // Clear customer auth data
    localStorage.removeItem('customerAuthToken');
    localStorage.removeItem('customerEmail');
    localStorage.removeItem('customerName');
    localStorage.removeItem('customerId');
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    
    navigate('/customer-portal');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {customerName}</h1>
          <p className="text-muted-foreground">Track your framing orders and preferences</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {customerId && <CustomerDashboard customerId={customerId} />}
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Your Orders</CardTitle>
              <CardDescription>
                Track the status of your framing orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customerId && <CustomerStatusHistory customerId={customerId} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          {customerId && (
            <Card>
              <CardHeader>
                <CardTitle>Your Preferences</CardTitle>
                <CardDescription>
                  Manage your notification settings and framing preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <iframe 
                  src={`/customer-preferences-iframe?customerId=${customerId}`} 
                  className="w-full min-h-[500px] border-0"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
