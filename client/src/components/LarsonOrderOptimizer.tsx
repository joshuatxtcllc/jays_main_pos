
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Calculator, AlertTriangle, DollarSign, Package, Scissors } from 'lucide-react';

interface OrderOptimization {
  itemNumber: string;
  footageNeeded: number;
  lengthOption: {
    sticksNeeded: number;
    totalFootage: number;
    wasteFootage: number;
    costPerFoot: number;
    totalCost: number;
    description: string;
  };
  chopOption: {
    footageNeeded: number;
    costPerFoot: number;
    totalCost: number;
    description: string;
  };
  mixedOption?: {
    fullSticks: number;
    chopFootage: number;
    totalCost: number;
    description: string;
  };
  recommendation: {
    method: 'length' | 'chop' | 'mixed';
    savings: number;
    reason: string;
    alert?: string;
  };
}

export default function LarsonOrderOptimizer() {
  const [itemNumber, setItemNumber] = useState('');
  const [artworkWidth, setArtworkWidth] = useState('16');
  const [artworkHeight, setArtworkHeight] = useState('20');
  const [matWidth, setMatWidth] = useState('3');
  const [customFootage, setCustomFootage] = useState('');
  const [optimizationMode, setOptimizationMode] = useState<'frame' | 'footage'>('frame');
  const [optimization, setOptimization] = useState<OrderOptimization | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateOptimization = async () => {
    if (!itemNumber) return;
    
    setIsCalculating(true);
    try {
      const endpoint = optimizationMode === 'frame' 
        ? '/api/larson-optimizer/optimize/frame'
        : '/api/larson-optimizer/optimize/footage';
      
      const body = optimizationMode === 'frame'
        ? {
            itemNumber,
            artworkWidth: parseFloat(artworkWidth),
            artworkHeight: parseFloat(artworkHeight),
            matWidth: parseFloat(matWidth)
          }
        : {
            itemNumber,
            footageNeeded: parseFloat(customFootage)
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const result = await response.json();
        setOptimization(result);
      } else {
        console.error('Failed to calculate optimization');
      }
    } catch (error) {
      console.error('Error calculating optimization:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const getRecommendationIcon = (method: string) => {
    switch (method) {
      case 'length': return <Package className="h-4 w-4" />;
      case 'chop': return <Scissors className="h-4 w-4" />;
      case 'mixed': return <Calculator className="h-4 w-4" />;
      default: return <Calculator className="h-4 w-4" />;
    }
  };

  const getRecommendationColor = (method: string) => {
    switch (method) {
      case 'length': return 'bg-blue-500';
      case 'chop': return 'bg-green-500';
      case 'mixed': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Larson-Juhl Order Optimizer
          </CardTitle>
          <CardDescription>
            Determine the most cost-effective way to purchase frame moulding: 
            full length sticks vs. chop pricing vs. mixed approach
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Item Number Input */}
          <div className="space-y-2">
            <Label htmlFor="itemNumber">Larson-Juhl Item Number</Label>
            <Input
              id="itemNumber"
              value={itemNumber}
              onChange={(e) => setItemNumber(e.target.value)}
              placeholder="e.g., 10-036M, 100750, etc."
            />
          </div>

          {/* Mode Selection */}
          <div className="space-y-2">
            <Label>Calculation Mode</Label>
            <div className="flex gap-2">
              <Button
                variant={optimizationMode === 'frame' ? 'default' : 'outline'}
                onClick={() => setOptimizationMode('frame')}
                size="sm"
              >
                Frame Dimensions
              </Button>
              <Button
                variant={optimizationMode === 'footage' ? 'default' : 'outline'}
                onClick={() => setOptimizationMode('footage')}
                size="sm"
              >
                Custom Footage
              </Button>
            </div>
          </div>

          {/* Frame Dimensions Inputs */}
          {optimizationMode === 'frame' && (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="artworkWidth">Artwork Width (in)</Label>
                <Input
                  id="artworkWidth"
                  type="number"
                  value={artworkWidth}
                  onChange={(e) => setArtworkWidth(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artworkHeight">Artwork Height (in)</Label>
                <Input
                  id="artworkHeight"
                  type="number"
                  value={artworkHeight}
                  onChange={(e) => setArtworkHeight(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="matWidth">Mat Width (in)</Label>
                <Input
                  id="matWidth"
                  type="number"
                  value={matWidth}
                  onChange={(e) => setMatWidth(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Custom Footage Input */}
          {optimizationMode === 'footage' && (
            <div className="space-y-2">
              <Label htmlFor="customFootage">Footage Needed (ft)</Label>
              <Input
                id="customFootage"
                type="number"
                step="0.1"
                value={customFootage}
                onChange={(e) => setCustomFootage(e.target.value)}
                placeholder="Enter exact footage needed"
              />
            </div>
          )}

          <Button 
            onClick={calculateOptimization} 
            disabled={isCalculating || !itemNumber || (optimizationMode === 'footage' && !customFootage)}
            className="w-full"
          >
            {isCalculating ? 'Calculating...' : 'Optimize Order'}
          </Button>
        </CardContent>
      </Card>

      {/* Optimization Results */}
      {optimization && (
        <div className="space-y-4">
          {/* Alert for Optimal Ranges */}
          {optimization.recommendation.alert && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {optimization.recommendation.alert}
              </AlertDescription>
            </Alert>
          )}

          {/* Recommendation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getRecommendationIcon(optimization.recommendation.method)}
                Recommendation: {optimization.recommendation.method.toUpperCase()}
              </CardTitle>
              <CardDescription>
                {optimization.recommendation.reason}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge className={getRecommendationColor(optimization.recommendation.method)}>
                  Save {formatCurrency(optimization.recommendation.savings)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {optimization.footageNeeded} ft needed
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Options Comparison */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Length Option */}
            <Card className={optimization.recommendation.method === 'length' ? 'ring-2 ring-blue-500' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-4 w-4" />
                  Length Pricing
                </CardTitle>
                <CardDescription>Full 9.5' sticks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(optimization.lengthOption.totalCost)}</div>
                  <div className="text-sm text-muted-foreground">
                    {optimization.lengthOption.description}
                  </div>
                </div>
                <Separator />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total footage:</span>
                    <span>{optimization.lengthOption.totalFootage}'</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waste:</span>
                    <span className="text-red-600">{optimization.lengthOption.wasteFootage.toFixed(1)}'</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost per foot:</span>
                    <span>{formatCurrency(optimization.lengthOption.costPerFoot)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chop Option */}
            <Card className={optimization.recommendation.method === 'chop' ? 'ring-2 ring-green-500' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Scissors className="h-4 w-4" />
                  Chop Pricing
                </CardTitle>
                <CardDescription>Cut to exact length</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(optimization.chopOption.totalCost)}</div>
                  <div className="text-sm text-muted-foreground">
                    {optimization.chopOption.description}
                  </div>
                </div>
                <Separator />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Exact footage:</span>
                    <span>{optimization.chopOption.footageNeeded}'</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waste:</span>
                    <span className="text-green-600">0'</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost per foot:</span>
                    <span>{formatCurrency(optimization.chopOption.costPerFoot)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mixed Option */}
            {optimization.mixedOption && (
              <Card className={optimization.recommendation.method === 'mixed' ? 'ring-2 ring-purple-500' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calculator className="h-4 w-4" />
                    Mixed Approach
                  </CardTitle>
                  <CardDescription>Combination of full sticks + chop</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold">{formatCurrency(optimization.mixedOption.totalCost)}</div>
                    <div className="text-sm text-muted-foreground">
                      {optimization.mixedOption.description}
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Full sticks:</span>
                      <span>{optimization.mixedOption.fullSticks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chop footage:</span>
                      <span>{optimization.mixedOption.chopFootage.toFixed(1)}'</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
