import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Header from "./components/Header";
import PosSystem from "./pages/PosSystem";
import Orders from "./pages/Orders";
import Dashboard from "./pages/Dashboard";
import Checkout from "./pages/Checkout";
import PaymentStatus from "./pages/PaymentStatus";
import CustomerManagement from "./pages/CustomerManagement";
import ProductionPage from "./pages/ProductionPage";
import OrderProgressPage from "./pages/OrderProgressPage";
import MaterialOrdersPage from "./pages/MaterialOrdersPage";
import MaterialsPickListPage from "./pages/MaterialsPickListPage";
import HubIntegrationPage from "./pages/HubIntegrationPage";
import WebhookIntegrationPage from "./pages/WebhookIntegrationPage";
import MatOptionPage from "./pages/MatOptionPage";
import InventoryPage from "./pages/InventoryPage";
import InventoryTrackingPage from "./pages/InventoryTrackingPage";
import PricingPage from "./pages/PricingPage";
import VendorSettings from "./pages/VendorSettings";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import PaymentLinks from "./pages/PaymentLinks";
import Payment from "./pages/Payment";
import MatBorderDemo from "./pages/MatBorderDemo"; // Added for mat border demonstration
import SystemHealthPage from "@/pages/SystemHealthPage";
import WebhookIntegrationPage from "@/pages/WebhookIntegrationPage";
import NotificationCenterPage from '@/pages/NotificationCenterPage';
import NotFound from "@/pages/not-found";
import { ErrorBoundary } from 'react-error-boundary'; //added imports
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import ChatWidget from "./components/ChatWidget";
import FrameEducationPage from '@/pages/FrameEducationPage';
import { AuthProvider } from './hooks/use-auth';
import { IntuitivePerformanceMonitor } from './components/IntuitivePerformanceMonitor';
import MobileNavMenu from './components/MobileNavMenu';
import { lazy } from 'react';
import PricingMonitorPage from './pages/PricingMonitorPage';
import LarsonOptimizerPage from './pages/LarsonOptimizerPage';
// Import the notification service
import { notificationService } from "./lib/notificationService";

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-xl font-bold text-destructive mb-4">Something went wrong</h2>
      <pre className="bg-muted p-4 rounded-md mb-4 max-w-full overflow-auto">{error.message}</pre>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  );
}


function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Initialize notification service and handle theme preference
  useEffect(() => {
    // Initialize the notification service
    notificationService.init();

    // Cleanup on unmount
    return () => {
      notificationService.cleanup();
    };
  }, []);

  // Check for saved theme preference or use OS preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Apply theme
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // The ErrorFallback component is already defined above, so we can remove this duplicate

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          FallbackComponent={ErrorFallback}
          onError={(error: Error, info: any) => {
            console.error("App error:", error);
            console.error("Component stack:", info.componentStack);
          }}
        >
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <TooltipProvider>
                <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
                  <MobileNavMenu />
                  <Header darkMode={darkMode} toggleTheme={toggleTheme} />
                  <main className="container pt-16 lg:pt-24 pb-10 px-3 lg:px-4">
                    <Switch>
                      <Route path="/" component={PosSystem} />
                      <Route path="/orders" component={Orders} />
                      <Route path="/dashboard" component={Dashboard} />
                      <Route path="/production" component={ProductionPage} />
                      <Route path="/orders/:orderId" component={OrderDetailsPage} />
                      <Route path="/orders/progress/:orderId" component={OrderProgressPage} />
                      <Route path="/customer-portal" component={lazy(() => import('./pages/CustomerPortal'))} />
                      <Route path="/customer-dashboard" component={lazy(() => import('./pages/CustomerDashboardPage'))} />
                      <Route path="/materials" component={MaterialOrdersPage} />
                      <Route path="/materials-pick-list" component={MaterialsPickListPage} />
                      <Route path="/inventory" component={InventoryPage} />
                      <Route path="/inventory-tracking" component={InventoryTrackingPage} />
                      <Route path="/hub" component={HubIntegrationPage} />
                      <Route path="/pricing" component={PricingPage} />
                      <Route path="/vendor-settings" component={VendorSettings} />
                      <Route path="/mat-test" component={MatOptionPage} />
                      <Route path="/checkout/:orderGroupId" component={Checkout} />
                      <Route path="/payment-status" component={PaymentStatus} />
                      <Route path="/order-progress/:orderId" component={OrderProgressPage} />
                      <Route path="/customers/:id" component={CustomerManagement} />
                      <Route path="/customers" component={CustomerManagement} />
                      <Route path="/payment-links" component={PaymentLinks} />
                      <Route path="/payment/:token" component={Payment} />
                      <Route path="/frame-education" component={FrameEducationPage} />
                      <Route path="/webhook-integration" component={WebhookIntegrationPage} />
                      <Route path="/mat-border-demo" component={MatBorderDemo} />
                      <Route path="/system-health" component={SystemHealthPage} />
                      <Route path="/pricing-monitor" element={<PricingMonitorPage />} />
                      <Route path="/larson-optimizer" element={<LarsonOptimizerPage />} />
                      <Route path="/notifications" component={NotificationCenterPage} />
                      <Route component={NotFound} />
                    </Switch>
                  </main>
                  <ChatWidget />
                  {/* Intuitive Performance Monitor */}
                  <IntuitivePerformanceMonitor 
                    updateInterval={5000}
                    compact={true}
                  />
                </div>
                <Toaster />
              </TooltipProvider>
            </AuthProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

export default App;