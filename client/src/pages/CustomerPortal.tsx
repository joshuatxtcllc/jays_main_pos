
import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Lock, Mail, User } from "lucide-react";

export default function CustomerPortal() {
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate inputs
      if (!email.trim()) {
        throw new Error('Email is required');
      }
      
      if (!orderId.trim()) {
        throw new Error('Order ID is required');
      }
      
      // Call API to verify customer credentials
      const response = await apiRequest('POST', '/api/customer-portal/login', {
        email,
        orderId: parseInt(orderId, 10)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid login details');
      }
      
      const data = await response.json();
      
      // Store customer token in localStorage
      localStorage.setItem('customerAuthToken', data.token);
      localStorage.setItem('customerEmail', email);
      localStorage.setItem('customerName', data.customerName || '');
      localStorage.setItem('customerId', data.customerId.toString());
      
      // Redirect to customer dashboard
      toast({
        title: "Login successful",
        description: "Welcome to your customer portal",
      });
      
      navigate('/customer-dashboard');
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Customer Portal</CardTitle>
          <CardDescription className="text-center">
            Sign in to track your framing orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Order ID"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the order ID provided in your confirmation email
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-sm text-center text-muted-foreground mt-2">
            Need help? Contact us at support@jaysframes.com
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
