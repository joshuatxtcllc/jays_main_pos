import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Frame, MatColor, GlassOption } from '@shared/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Loader2, Calculator, DollarSign, Info, RefreshCcw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

interface PriceBreakdown {
  framePrice: number;
  matPrice: number;
  glassPrice: number;
  laborCost: number;
  materialCost: number;
  subtotal: number;
  totalPrice: number;
  wholesalePrices?: {
    frame?: string;
    mat?: string;
    glass?: string;
  };
  laborRates?: {
    baseRate: number;
    regionalFactor: number;
    estimates: {
      frameAssembly: number;
      matCutting: number;
      glassCutting: number;
      fitting: number;
      finishing: number;
    };
  };
}

const PriceCalculator: React.FC = () => {
  const { toast } = useToast();
  const [dimensions, setDimensions] = useState({
    width: 16,
    height: 20,
    matWidth: 2
  });
  const [selectedItems, setSelectedItems] = useState({
    frameId: '',
    matColorId: '',
    glassOptionId: ''
  });
  const [quantity, setQuantity] = useState(1);
  const [showWholesalePrices, setShowWholesalePrices] = useState(false);
  const [activeTab, setActiveTab] = useState('calculator');
  
  // Fetch frames
  const { data: frames, isLoading: framesLoading } = useQuery({
    queryKey: ['/api/frames'],
    queryFn: async () => {
      const response = await fetch('/api/frames');
      if (!response.ok) {
        throw new Error('Failed to fetch frames');
      }
      return response.json() as Promise<Frame[]>;
    }
  });
  
  // Fetch mat colors
  const { data: matColors, isLoading: matsLoading } = useQuery({
    queryKey: ['/api/mat-colors'],
    queryFn: async () => {
      const response = await fetch('/api/mat-colors');
      if (!response.ok) {
        throw new Error('Failed to fetch mat colors');
      }
      return response.json() as Promise<MatColor[]>;
    }
  });
  
  // Fetch glass options
  const { data: glassOptionsList, isLoading: glassLoading } = useQuery({
    queryKey: ['/api/glass-options'],
    queryFn: async () => {
      const response = await fetch('/api/glass-options');
      if (!response.ok) {
        throw new Error('Failed to fetch glass options');
      }
      return response.json() as Promise<GlassOption[]>;
    }
  });
  
  // Fetch labor rates
  const { data: laborRates } = useQuery({
    queryKey: ['/api/pricing/labor-rates'],
    queryFn: async () => {
      const response = await fetch('/api/pricing/labor-rates');
      if (!response.ok) {
        throw new Error('Failed to fetch labor rates');
      }
      return response.json();
    }
  });
  
  // Calculate price
  const calculatePriceMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/pricing/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          frameId: selectedItems.frameId || null,
          matColorId: selectedItems.matColorId || null,
          glassOptionId: selectedItems.glassOptionId || null,
          artworkWidth: dimensions.width,
          artworkHeight: dimensions.height,
          matWidth: dimensions.matWidth,
          quantity,
          include_wholesale_prices: showWholesalePrices
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to calculate price');
      }
      
      return response.json() as Promise<PriceBreakdown>;
    },
    onSuccess: () => {
      toast({
        title: 'Price calculated',
        description: 'Price calculation completed using Houston Heights rates',
      });
    },
    onError: (error) => {
      toast({
        title: 'Price calculation failed',
        description: error instanceof Error ? error.message : 'Failed to calculate price',
        variant: 'destructive',
      });
    }
  });
  
  // Update frame wholesale prices from vendor API (admin only)
  const updateWholesalePricesMutation = useMutation({
    mutationFn: async () => {
      const adminKey = prompt('Enter admin API key to update wholesale prices');
      if (!adminKey) {
        throw new Error('Admin API key required');
      }
      
      const response = await fetch(`/api/pricing/update-wholesale?admin_key=${adminKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update wholesale prices');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Wholesale prices updated',
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update wholesale prices',
        variant: 'destructive',
      });
    }
  });
  
  const handleCalculate = () => {
    calculatePriceMutation.mutate();
  };
  
  const isLoading = framesLoading || matsLoading || glassLoading;
  const isPriceLoading = calculatePriceMutation.isPending;
  const isUpdatingPrices = updateWholesalePricesMutation.isPending;
  
  const frameOptions = frames?.map(frame => ({
    id: frame.id,
    name: frame.name,
    price: frame.price
  })) || [];
  
  const matOptions = matColors?.map(mat => ({
    id: mat.id,
    name: mat.name,
    price: mat.price
  })) || [];
  
  const glassOptionsData = glassOptionsList?.map(glass => ({
    id: glass.id,
    name: glass.name,
    price: glass.price
  })) || [];
  
  // Get selected items details
  const selectedFrame = frames?.find(f => f.id === selectedItems.frameId);
  const selectedMat = matColors?.find(m => m.id === selectedItems.matColorId);
  const selectedGlass = glassOptionsList?.find(g => g.id === selectedItems.glassOptionId);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Houston Heights Custom Framing Pricing</CardTitle>
        <CardDescription>
          Calculate accurate custom framing prices with real-time wholesale pricing and Houston Heights labor rates
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="calculator" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">Price Calculator</TabsTrigger>
          <TabsTrigger value="results">Price Breakdown</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calculator">
          <CardContent className="space-y-6 pt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading pricing data...</span>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="artwork-dimensions">Artwork Dimensions (inches)</Label>
                    <span className="text-sm text-muted-foreground">
                      {dimensions.width}" × {dimensions.height}" ({dimensions.width + dimensions.height}" united inches)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="width" className="text-xs">Width</Label>
                      <Input
                        id="width"
                        type="number"
                        min={1}
                        max={60}
                        value={dimensions.width}
                        onChange={(e) => setDimensions({ ...dimensions, width: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="height" className="text-xs">Height</Label>
                      <Input
                        id="height"
                        type="number"
                        min={1}
                        max={60}
                        value={dimensions.height}
                        onChange={(e) => setDimensions({ ...dimensions, height: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="mat-width">Mat Width (inches)</Label>
                    <span className="text-sm text-muted-foreground">{dimensions.matWidth}"</span>
                  </div>
                  <Slider
                    id="mat-width"
                    min={0}
                    max={4}
                    step={0.25}
                    value={[dimensions.matWidth]}
                    onValueChange={(value) => setDimensions({ ...dimensions, matWidth: value[0] })}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>No Mat (0")</span>
                    <span>Standard (2")</span>
                    <span>Wide (4")</span>
                  </div>
                </div>
                
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="frame">Frame Style</Label>
                    <Select
                      value={selectedItems.frameId}
                      onValueChange={(value) => setSelectedItems({ ...selectedItems, frameId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frame style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Frame</SelectItem>
                        {frameOptions.map(frame => (
                          <SelectItem key={frame.id} value={frame.id}>
                            {frame.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mat-color">Mat Color</Label>
                    <Select
                      value={selectedItems.matColorId}
                      onValueChange={(value) => setSelectedItems({ ...selectedItems, matColorId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select mat color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Mat</SelectItem>
                        {matOptions.map(mat => (
                          <SelectItem key={mat.id} value={mat.id}>
                            {mat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="glass-option">Glass Type</Label>
                    <Select
                      value={selectedItems.glassOptionId}
                      onValueChange={(value) => setSelectedItems({ ...selectedItems, glassOptionId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select glass type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Glass</SelectItem>
                        {glassOptionsData.map(glass => (
                          <SelectItem key={glass.id} value={glass.id}>
                            {glass.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      max={100}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="wholesale-prices"
                      checked={showWholesalePrices}
                      onCheckedChange={setShowWholesalePrices}
                    />
                    <Label htmlFor="wholesale-prices">Show wholesale prices (admin only)</Label>
                  </div>
                </div>
              </>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => updateWholesalePricesMutation.mutate()}
              disabled={isUpdatingPrices}
            >
              {isUpdatingPrices ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Prices...
                </>
              ) : (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Update Wholesale Prices
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleCalculate} 
              disabled={isPriceLoading}
            >
              {isPriceLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculate Houston Price
                </>
              )}
            </Button>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="results">
          <CardContent className="pt-4">
            {calculatePriceMutation.data ? (
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <DollarSign className="h-5 w-5 mr-1 text-primary" />
                    Price Breakdown
                  </h3>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Artwork Size:</span>
                      <span className="font-medium">{dimensions.width}" × {dimensions.height}"</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Frame:</span>
                      <span className="font-medium">
                        {selectedFrame?.name || 'None'} {selectedFrame && `(${formatCurrency(calculatePriceMutation.data.framePrice)})`}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mat:</span>
                      <span className="font-medium">
                        {selectedMat?.name || 'None'} {selectedMat && `(${formatCurrency(calculatePriceMutation.data.matPrice)})`}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Glass:</span>
                      <span className="font-medium">
                        {selectedGlass?.name || 'None'} {selectedGlass && `(${formatCurrency(calculatePriceMutation.data.glassPrice)})`}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Houston Heights Labor:</span>
                      <span className="font-medium">{formatCurrency(calculatePriceMutation.data.laborCost)}</span>
                    </div>
                    
                    <div className="border-t my-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Materials Subtotal:</span>
                      <span className="font-medium">{formatCurrency(calculatePriceMutation.data.materialCost)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-medium">{quantity}</span>
                    </div>
                    
                    <div className="border-t my-2" />
                    
                    <div className="flex justify-between font-semibold">
                      <span>Total Price:</span>
                      <span className="text-lg">{formatCurrency(calculatePriceMutation.data.totalPrice)}</span>
                    </div>
                  </div>
                  
                  {calculatePriceMutation.data.wholesalePrices && (
                    <div className="mt-6 pt-4 border-t">
                      <h4 className="text-md font-semibold flex items-center">
                        <Info className="h-4 w-4 mr-1 text-yellow-600" />
                        Wholesale Prices (Admin Only)
                      </h4>
                      
                      <div className="mt-2 text-xs text-muted-foreground space-y-1">
                        {selectedFrame && (
                          <div className="flex justify-between">
                            <span>Frame ({selectedFrame.name}):</span>
                            <span>${calculatePriceMutation.data.wholesalePrices.frame}/ft</span>
                          </div>
                        )}
                        
                        {selectedMat && (
                          <div className="flex justify-between">
                            <span>Mat ({selectedMat.name}):</span>
                            <span>${calculatePriceMutation.data.wholesalePrices.mat}/sq ft</span>
                          </div>
                        )}
                        
                        {selectedGlass && (
                          <div className="flex justify-between">
                            <span>Glass ({selectedGlass.name}):</span>
                            <span>${calculatePriceMutation.data.wholesalePrices.glass}/sq inch</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {calculatePriceMutation.data.laborRates && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-md font-semibold flex items-center">
                        <Info className="h-4 w-4 mr-1 text-blue-600" />
                        Houston Heights Labor Rates
                      </h4>
                      
                      <div className="mt-2 text-xs text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Base Labor Rate:</span>
                          <span>${calculatePriceMutation.data.laborRates.baseRate}/hour</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span>Regional Factor:</span>
                          <span>{(calculatePriceMutation.data.laborRates.regionalFactor * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Price Calculation Yet</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Enter your frame specifications and click "Calculate Houston Price" to see a detailed price breakdown
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab('calculator')}
                >
                  Go to Calculator
                </Button>
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setActiveTab('calculator')}
            >
              Back to Calculator
            </Button>
          </CardFooter>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default PriceCalculator;