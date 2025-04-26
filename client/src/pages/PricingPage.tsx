import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define a schema for form validation
const formSchema = z.object({
  frameId: z.string().optional(),
  matColorId: z.string().optional(),
  glassOptionId: z.string().optional(),
  artworkWidth: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val) && val > 0, {
    message: "Width must be a positive number",
  }),
  artworkHeight: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val) && val > 0, {
    message: "Height must be a positive number",
  }),
  matWidth: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= 0, {
    message: "Mat width must be a non-negative number",
  }),
  quantity: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0, {
    message: "Quantity must be a positive integer",
  }),
  includeWholesalePrices: z.boolean().default(false),
  addToWholesaleOrder: z.boolean().default(true),
});

// Define the expected result type
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

interface Frame {
  id: string;
  name: string;
  price: string;
  description?: string;
  material?: string;
  color?: string;
  thumbnailUrl?: string;
}

interface MatColor {
  id: string;
  name: string;
  color: string;
  category?: string;
}

interface GlassOption {
  id: string;
  name: string;
  description?: string;
  price?: string;
}

// Component definition
export default function PricingPage() {
  const { toast } = useToast();
  const [pricingResult, setPricingResult] = useState<PricingResult | null>(null);

  // Form setup with validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      frameId: "",
      matColorId: "",
      glassOptionId: "",
      artworkWidth: "16",
      artworkHeight: "20",
      matWidth: "2",
      quantity: "1",
      includeWholesalePrices: true,
      addToWholesaleOrder: true,
    },
  });

  // Fetch frames data
  const { data: frames = [], isLoading: isLoadingFrames } = useQuery<Frame[]>({
    queryKey: ['/api/frames'],
  });

  // Fetch mat colors data
  const { data: matColors = [], isLoading: isLoadingMatColors } = useQuery<MatColor[]>({
    queryKey: ['/api/larson-catalog/crescent'],
  });

  // Fetch glass options data
  const { data: glassOptions = [], isLoading: isLoadingGlassOptions } = useQuery<GlassOption[]>({
    queryKey: ['/api/glass-options'],
    queryFn: async () => {
      // Fallback for demo purposes if the API endpoint doesn't exist
      return [
        { id: "regular", name: "Regular Glass", price: "0.08" },
        { id: "non-glare", name: "Non-glare Glass", price: "0.15" },
        { id: "museum", name: "Museum Glass", price: "0.30" },
        { id: "uv", name: "Museum Non-glare", price: "0.40" },
      ];
    },
  });

  // Pricing calculation mutation
  const calculatePriceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/pricing/calculate", {
        ...data,
        include_wholesale_prices: data.includeWholesalePrices
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to calculate price");
      }
      return response.json();
    },
    onSuccess: (data: PricingResult) => {
      setPricingResult(data);
      toast({
        title: "Price calculation successful",
        description: "The pricing has been calculated based on Houston Heights specifications.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error calculating price",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    calculatePriceMutation.mutate(data);
  };

  const isLoading = isLoadingFrames || isLoadingMatColors || isLoadingGlassOptions || calculatePriceMutation.isPending;

  return (
    <div className="container max-w-6xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Houston Heights Custom Framing Price Calculator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Frame Specifications</CardTitle>
            <CardDescription>
              Enter the artwork dimensions and select materials for accurate pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Frame Selection */}
                <FormField
                  control={form.control}
                  name="frameId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frame Style</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a frame style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Frame</SelectItem>
                          {frames.map((frame: Frame) => (
                            <SelectItem key={frame.id} value={frame.id}>
                              {frame.name} (${frame.price}/ft)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose from our selection of frames or select none
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mat Color Selection */}
                <FormField
                  control={form.control}
                  name="matColorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mat Color</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a mat color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Mat</SelectItem>
                          {matColors.map((mat: MatColor) => (
                            <SelectItem key={mat.id} value={mat.id}>
                              {mat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose a mat color for your artwork
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Glass Option Selection */}
                <FormField
                  control={form.control}
                  name="glassOptionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Glass Option</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a glass option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Glass</SelectItem>
                          {glassOptions.map((glass: GlassOption) => (
                            <SelectItem key={glass.id} value={glass.id}>
                              {glass.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the type of glass for your frame
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Artwork Width */}
                <FormField
                  control={form.control}
                  name="artworkWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Artwork Width (inches)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.25" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the width of your artwork in inches
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Artwork Height */}
                <FormField
                  control={form.control}
                  name="artworkHeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Artwork Height (inches)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.25" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the height of your artwork in inches
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mat Width */}
                <FormField
                  control={form.control}
                  name="matWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mat Width (inches)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.25" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the width of the mat border in inches
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Quantity */}
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" step="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the number of frames to order
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Include Wholesale Prices Switch */}
                <FormField
                  control={form.control}
                  name="includeWholesalePrices"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Show Wholesale Prices</FormLabel>
                        <FormDescription>
                          Include wholesale price details in calculation
                        </FormDescription>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="accent-primary h-4 w-4"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Add to Wholesale Order Switch */}
                <FormField
                  control={form.control}
                  name="addToWholesaleOrder"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-primary/10">
                      <div className="space-y-0.5">
                        <FormLabel className="font-bold">Add to Wholesale Order</FormLabel>
                        <FormDescription>
                          This will create a material order for the frame shop
                        </FormDescription>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="accent-primary h-4 w-4"
                          disabled={true} // Making it mandatory - can't be unchecked
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    "Calculate Price"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Results Display */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Results</CardTitle>
            <CardDescription>
              Houston Heights location-specific price calculation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pricingResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-sm font-medium">Frame Price:</div>
                  <div className="text-sm font-mono text-right">${pricingResult.framePrice.toFixed(2)}</div>
                  
                  <div className="text-sm font-medium">Mat Price:</div>
                  <div className="text-sm font-mono text-right">${pricingResult.matPrice.toFixed(2)}</div>
                  
                  <div className="text-sm font-medium">Glass Price:</div>
                  <div className="text-sm font-mono text-right">${pricingResult.glassPrice.toFixed(2)}</div>
                  
                  <div className="text-sm font-medium">Labor Cost:</div>
                  <div className="text-sm font-mono text-right">${pricingResult.laborCost.toFixed(2)}</div>
                  
                  <div className="text-sm font-medium">Material Cost:</div>
                  <div className="text-sm font-mono text-right">${pricingResult.materialCost.toFixed(2)}</div>
                  
                  <div className="border-t pt-2 text-base font-semibold">Subtotal:</div>
                  <div className="border-t pt-2 text-base font-semibold font-mono text-right">${pricingResult.subtotal.toFixed(2)}</div>
                  
                  <div className="text-base font-bold">Total Price:</div>
                  <div className="text-base font-bold font-mono text-right">${pricingResult.totalPrice.toFixed(2)}</div>
                </div>

                {pricingResult.wholesalePrices && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h3 className="text-sm font-semibold mb-2">Wholesale Prices</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Frame Wholesale:</div>
                      <div className="font-mono text-right">${pricingResult.wholesalePrices.frame}</div>
                      
                      <div>Mat Wholesale:</div>
                      <div className="font-mono text-right">${pricingResult.wholesalePrices.mat}</div>
                      
                      <div>Glass Wholesale:</div>
                      <div className="font-mono text-right">${pricingResult.wholesalePrices.glass}</div>
                    </div>
                  </div>
                )}

                {pricingResult.laborRates && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h3 className="text-sm font-semibold mb-2">Labor Breakdown</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Base Rate:</div>
                      <div className="font-mono text-right">${pricingResult.laborRates.baseRate.toFixed(2)}/hour</div>
                      
                      <div>Regional Factor:</div>
                      <div className="font-mono text-right">{pricingResult.laborRates.regionalFactor.toFixed(2)}x</div>
                      
                      <div className="col-span-2 mt-2 mb-1 text-xs font-medium">Time Estimates:</div>
                      
                      <div>Frame Assembly:</div>
                      <div className="font-mono text-right">{(pricingResult.laborRates.estimates.frameAssembly * 60).toFixed(0)} min</div>
                      
                      <div>Mat Cutting:</div>
                      <div className="font-mono text-right">{(pricingResult.laborRates.estimates.matCutting * 60).toFixed(0)} min</div>
                      
                      <div>Glass Cutting:</div>
                      <div className="font-mono text-right">{(pricingResult.laborRates.estimates.glassCutting * 60).toFixed(0)} min</div>
                      
                      <div>Fitting:</div>
                      <div className="font-mono text-right">{(pricingResult.laborRates.estimates.fitting * 60).toFixed(0)} min</div>
                      
                      <div>Finishing:</div>
                      <div className="font-mono text-right">{(pricingResult.laborRates.estimates.finishing * 60).toFixed(0)} min</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <p className="mb-4">Enter frame specifications and click "Calculate Price" to see pricing details.</p>
                <p className="text-sm">All prices are calculated using Houston Heights location-specific pricing formulas.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-xs text-muted-foreground">Prices updated: April 25, 2025</p>
            {pricingResult && (
              <Button variant="outline" onClick={() => window.print()}>
                Print Quote
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}