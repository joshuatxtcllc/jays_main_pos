
import React, { useState, useEffect } from 'react';
import { ProductionKanban } from '@/components/ProductionKanban';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, Database } from "lucide-react";
import { useProductionKanban } from '@/hooks/use-production';

export default function ProductionPage() {
  const { orders, isLoading, error, updateOrderStatus } = useProductionKanban();
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    window.location.reload();
  };

  return (
    <div className="container mx-auto py-4">
      {error ? (
        <div className="space-y-4">
          <Alert variant="destructive" className="mb-4">
            <AlertTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Database Connection Error
            </AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>There was a problem connecting to the database. This might be due to a temporary connection issue or server load.</p>
              <Button 
                variant="outline" 
                className="w-fit" 
                onClick={handleRetry}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Connection
              </Button>
            </AlertDescription>
          </Alert>
          
          <div className="rounded-lg bg-muted/30 p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Production Kanban Temporarily Unavailable</h2>
            <p className="text-muted-foreground mb-4">
              The production board cannot be displayed due to a database connection issue.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              You can try accessing other parts of the application while we resolve this issue.
            </p>
          </div>
        </div>
      ) : (
        <ProductionKanban
          orders={orders || []} 
          isLoading={isLoading}
          error={error}
          updateOrderStatus={updateOrderStatus}
        />
      )}
    </div>
  );
}
