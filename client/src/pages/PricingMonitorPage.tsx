
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Download, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PricingStatus {
  adjustmentsNeeded: boolean;
  recommendations: Array<{
    component: string;
    currentFactor: number;
    recommendedFactor: number;
    adjustment: number;
    reason: string;
  }>;
  currentPrices: Array<{
    scenario: string;
    totalPrice: number;
    breakdown: {
      frame: number;
      mat: number;
      glass: number;
      labor: number;
    };
  }>;
  summary: string;
}

export default function PricingMonitorPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isChecking, setIsChecking] = useState(false);

  // Fetch current pricing status
  const { data: pricingStatus, isLoading, error } = useQuery<{
    success: boolean;
    data: PricingStatus;
    timestamp: string;
  }>({
    queryKey: ['/api/pricing-monitor/status'],
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  // Manual pricing check mutation
  const checkPricingMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/pricing-monitor/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to trigger pricing check');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pricing-monitor/status'] });
      toast({
        title: "Pricing Check Complete",
        description: "Latest pricing alignment has been analyzed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Check Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Download report function
  const downloadReport = async () => {
    try {
      const response = await fetch('/api/pricing-monitor/report');
      if (!response.ok) throw new Error('Failed to generate report');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pricing-report-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Report Downloaded",
        description: "Pricing alignment report has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the pricing report",
        variant: "destructive",
      });
    }
  };

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      await checkPricingMutation.mutateAsync();
    } finally {
      setIsChecking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading pricing status...</span>
      </div>
    );
  }

  if (error || !pricingStatus?.success) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load pricing status. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const { data: status } = pricingStatus;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pricing Monitor</h1>
          <p className="text-muted-foreground">
            Automated monitoring of pricing alignment with industry standards
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={downloadReport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Report
          </Button>
          
          <Button
            onClick={handleManualCheck}
            disabled={isChecking}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Check Now'}
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status.adjustmentsNeeded ? (
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            Pricing Alignment Status
          </CardTitle>
          <CardDescription>
            Last checked: {new Date(pricingStatus.timestamp).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant={status.adjustmentsNeeded ? "destructive" : "default"}>
            <AlertDescription className="text-base">
              {status.summary}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Current Pricing Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Current Pricing Analysis</CardTitle>
          <CardDescription>
            Comparison of current prices against industry benchmarks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {status.currentPrices.map((price, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{price.scenario}</h3>
                  <Badge variant="outline">
                    ${price.totalPrice.toFixed(2)}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Frame:</span>
                    <span>${price.breakdown.frame.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mat:</span>
                    <span>${price.breakdown.mat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Glass:</span>
                    <span>${price.breakdown.glass.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Labor:</span>
                    <span>${price.breakdown.labor.toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {status.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Pricing Adjustment Recommendations
            </CardTitle>
            <CardDescription>
              Suggested changes to align with industry standards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {status.recommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold capitalize">{rec.component} Adjustment</h4>
                    <Badge variant={rec.adjustment > 0 ? "destructive" : "secondary"}>
                      {rec.adjustment > 0 ? '+' : ''}{Math.round(rec.adjustment * 100)}%
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {rec.reason}
                  </p>
                  
                  <div className="text-xs space-y-1">
                    <div>Current Factor: {rec.currentFactor.toFixed(3)}</div>
                    <div>Recommended Factor: {rec.recommendedFactor.toFixed(3)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Monitoring</CardTitle>
          <CardDescription>
            This system runs automatically every 6 hours to ensure pricing stays competitive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-semibold">Next Check</h4>
              <p className="text-sm text-muted-foreground">
                Scheduled for 6 hours from last run
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-semibold">Tolerance</h4>
              <p className="text-sm text-muted-foreground">
                ±15% from industry targets
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-semibold">Action Required</h4>
              <p className="text-sm text-muted-foreground">
                {status.adjustmentsNeeded ? 'Yes - Review recommendations' : 'No - All aligned'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
