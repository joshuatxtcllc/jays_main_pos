import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PricingResult {
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

const PriceCalculator = () => {
  // Form state
  const [artworkWidth, setArtworkWidth] = useState<number>(16);
  const [artworkHeight, setArtworkHeight] = useState<number>(20);
  const [matWidth, setMatWidth] = useState<number>(2);
  const [quantity, setQuantity] = useState<number>(1);
  const [frameId, setFrameId] = useState<string>("none");
  const [matColorId, setMatColorId] = useState<string>("none");
  const [glassOptionId, setGlassOptionId] = useState<string>("none");
  const [includeWholesalePrices, setIncludeWholesalePrices] = useState<boolean>(false);
  const [pricingResult, setPricingResult] = useState<PricingResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Define frame interface
  interface Frame {
    id: string;
    name: string;
    price: string;
    description?: string;
    material?: string;
    color?: string;
    thumbnailUrl?: string;
  }

  // Define mat color interface
  interface MatColor {
    id: string;
    name: string;
    color: string;
    category?: string;
  }

  // Define glass option interface
  interface GlassOption {
    id: string;
    name: string;
    description?: string;
    price?: string;
  }

  // Fetch material options
  const { data: frames = [], isLoading: framesLoading } = useQuery<Frame[]>({
    queryKey: ['/api/frames'],
  });

  const { data: matColors = [], isLoading: matColorsLoading } = useQuery<MatColor[]>({
    queryKey: ['/api/mat-colors'],
  });

  const { data: glassOptions = [], isLoading: glassOptionsLoading } = useQuery<GlassOption[]>({
    queryKey: ['/api/glass-options'],
  });

  // Calculate united inches and finished size
  const unitedInches = artworkWidth + artworkHeight;
  const finishedWidth = artworkWidth + (matWidth * 2);
  const finishedHeight = artworkHeight + (matWidth * 2);
  const finishedUnitedInches = finishedWidth + finishedHeight;

  // Check if materials are loading
  const materialsLoading = framesLoading || matColorsLoading || glassOptionsLoading;

  // Calculate pricing
  const calculatePrice = async () => {
    setIsCalculating(true);
    
    try {
      const res = await apiRequest('POST', '/api/pricing/calculate', {
        frameId,
        matColorId,
        glassOptionId,
        artworkWidth,
        artworkHeight,
        matWidth,
        quantity,
        include_wholesale_prices: includeWholesalePrices
      });
      
      const result = await res.json();
      setPricingResult(result);
    } catch (error) {
      console.error('Error calculating price:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input form */}
      <Card>
        <CardHeader>
          <CardTitle>Houston Heights Custom Framing Calculator</CardTitle>
          <CardDescription>
            Enter your artwork dimensions and select materials to calculate pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Artwork Dimensions (inches)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="artworkWidth">Width</Label>
                <Input
                  id="artworkWidth"
                  type="number"
                  min={1}
                  step={0.25}
                  value={artworkWidth}
                  onChange={(e) => setArtworkWidth(parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artworkHeight">Height</Label>
                <Input
                  id="artworkHeight"
                  type="number"
                  min={1}
                  step={0.25}
                  value={artworkHeight}
                  onChange={(e) => setArtworkHeight(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Mat Width: {matWidth}"</h3>
            </div>
            <Slider
              min={0}
              max={4}
              step={0.25}
              value={[matWidth]}
              onValueChange={(value) => setMatWidth(value[0])}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Frame</h3>
            <Select value={frameId} onValueChange={setFrameId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a frame" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No frame</SelectItem>
                {materialsLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading frames...
                  </SelectItem>
                ) : (
                  frames.map((frame: Frame) => (
                    <SelectItem key={frame.id} value={frame.id}>
                      {frame.name} (${parseFloat(frame.price).toFixed(2)}/ft)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Mat Color</h3>
            <Select value={matColorId} onValueChange={setMatColorId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a mat color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No mat</SelectItem>
                {materialsLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading mat colors...
                  </SelectItem>
                ) : (
                  matColors.map((mat: MatColor) => (
                    <SelectItem key={mat.id} value={mat.id}>
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 mr-2 border border-border" 
                          style={{ backgroundColor: mat.color }}
                        ></div>
                        {mat.name}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Glass</h3>
            <Select value={glassOptionId} onValueChange={setGlassOptionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select glass type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No glass</SelectItem>
                {materialsLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading glass options...
                  </SelectItem>
                ) : (
                  glassOptions.map((glass: GlassOption) => (
                    <SelectItem key={glass.id} value={glass.id}>
                      {glass.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
            />
          </div>

          {/* Admin section with checkbox for wholesale prices */}
          <div className="pt-4 border-t">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showWholesale"
                checked={includeWholesalePrices}
                onChange={(e) => setIncludeWholesalePrices(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              <Label htmlFor="showWholesale">Show wholesale prices (admin)</Label>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={calculatePrice} disabled={isCalculating || materialsLoading}>
            {isCalculating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : (
              'Calculate Price'
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Results</CardTitle>
          <CardDescription>
            Houston Heights location-specific pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-md p-4 text-center">
              <div className="text-sm text-muted-foreground">Artwork Size</div>
              <div className="text-2xl font-bold">{artworkWidth}" × {artworkHeight}"</div>
            </div>
            <div className="border rounded-md p-4 text-center">
              <div className="text-sm text-muted-foreground">Finished Size</div>
              <div className="text-2xl font-bold">{finishedWidth}" × {finishedHeight}"</div>
            </div>
          </div>

          <div className="border rounded-md p-4 text-center">
            <div className="text-sm text-muted-foreground">United Inches</div>
            <div className="text-2xl font-bold">{finishedUnitedInches.toFixed(1)}"</div>
          </div>

          {pricingResult ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    {pricingResult.wholesalePrices && <TableHead className="text-right">Wholesale</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Frame</TableCell>
                    <TableCell className="text-right">${pricingResult.framePrice.toFixed(2)}</TableCell>
                    {pricingResult.wholesalePrices && (
                      <TableCell className="text-right">${pricingResult.wholesalePrices.frame || '0.00'}</TableCell>
                    )}
                  </TableRow>
                  <TableRow>
                    <TableCell>Mat</TableCell>
                    <TableCell className="text-right">${pricingResult.matPrice.toFixed(2)}</TableCell>
                    {pricingResult.wholesalePrices && (
                      <TableCell className="text-right">${pricingResult.wholesalePrices.mat || '0.00'}</TableCell>
                    )}
                  </TableRow>
                  <TableRow>
                    <TableCell>Glass</TableCell>
                    <TableCell className="text-right">${pricingResult.glassPrice.toFixed(2)}</TableCell>
                    {pricingResult.wholesalePrices && (
                      <TableCell className="text-right">${pricingResult.wholesalePrices.glass || '0.00'}</TableCell>
                    )}
                  </TableRow>
                  <TableRow>
                    <TableCell>Labor</TableCell>
                    <TableCell className="text-right">${pricingResult.laborCost.toFixed(2)}</TableCell>
                    {pricingResult.wholesalePrices && <TableCell className="text-right">-</TableCell>}
                  </TableRow>
                  <TableRow className="font-medium">
                    <TableCell>Materials Subtotal</TableCell>
                    <TableCell className="text-right">${pricingResult.materialCost.toFixed(2)}</TableCell>
                    {pricingResult.wholesalePrices && <TableCell className="text-right">-</TableCell>}
                  </TableRow>
                  <TableRow className="font-medium">
                    <TableCell>Subtotal (per item)</TableCell>
                    <TableCell className="text-right">${pricingResult.subtotal.toFixed(2)}</TableCell>
                    {pricingResult.wholesalePrices && <TableCell className="text-right">-</TableCell>}
                  </TableRow>
                  <TableRow className="font-bold text-lg">
                    <TableCell>Total Price ({quantity} items)</TableCell>
                    <TableCell className="text-right">${pricingResult.totalPrice.toFixed(2)}</TableCell>
                    {pricingResult.wholesalePrices && <TableCell className="text-right">-</TableCell>}
                  </TableRow>
                </TableBody>
              </Table>

              {pricingResult.laborRates && (
                <div className="mt-6">
                  <h3 className="text-md font-medium mb-2">Houston Heights Labor Rates</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Base Rate: ${pricingResult.laborRates.baseRate.toFixed(2)}/hr</div>
                    <div>Regional Factor: {pricingResult.laborRates.regionalFactor.toFixed(2)}x</div>
                    <div className="mt-2">Estimated Hours:</div>
                    <div className="ml-4">Frame Assembly: {pricingResult.laborRates.estimates.frameAssembly} hr</div>
                    <div className="ml-4">Mat Cutting: {pricingResult.laborRates.estimates.matCutting} hr</div>
                    <div className="ml-4">Glass Cutting: {pricingResult.laborRates.estimates.glassCutting} hr</div>
                    <div className="ml-4">Fitting: {pricingResult.laborRates.estimates.fitting} hr</div>
                    <div className="ml-4">Finishing: {pricingResult.laborRates.estimates.finishing} hr</div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              Enter dimensions and select materials to calculate price
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceCalculator;