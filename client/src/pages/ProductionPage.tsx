
import React from 'react';
import { ProductionKanban } from '@/components/ProductionKanban';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useProductionKanban } from '@/hooks/use-production';

export default function ProductionPage() {
  const { orders, isLoading, error, updateOrderStatus } = useProductionKanban();

  return (
    <div className="container mx-auto py-4">
      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error loading production board</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>There was a problem connecting to the database. This might be due to a temporary connection issue.</p>
            <Button 
              variant="outline" 
              className="w-fit" 
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
      
      <ProductionKanban />
    </div>
  );
}
