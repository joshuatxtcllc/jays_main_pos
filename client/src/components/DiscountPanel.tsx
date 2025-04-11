import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface DiscountPanelProps {
  orderGroupId: number;
  currentDiscount?: {
    type: string;
    amount: string;
  };
  taxExempt?: boolean;
  onDiscountApplied: () => void;
}

export function DiscountPanel({ 
  orderGroupId, 
  currentDiscount,
  taxExempt = false,
  onDiscountApplied 
}: DiscountPanelProps) {
  const [discountType, setDiscountType] = useState<string>(currentDiscount?.type || 'percentage');
  const [discountAmount, setDiscountAmount] = useState<string>(currentDiscount?.amount || '');
  const [isTaxExempt, setIsTaxExempt] = useState<boolean>(taxExempt);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const { toast } = useToast();

  const handleApplyDiscount = async () => {
    if (!discountAmount || Number(discountAmount) <= 0) {
      toast({
        title: 'Invalid discount',
        description: 'Please enter a valid discount amount',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', `/api/order-groups/${orderGroupId}/apply-discount`, {
        discountType,
        discountAmount,
        taxExempt: isTaxExempt
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Discount applied',
          description: data.message,
        });
        onDiscountApplied();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error applying discount',
          description: errorData.message || 'Something went wrong',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to apply discount',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Discounts & Tax Status</CardTitle>
        <CardDescription>Apply discounts or mark order as tax exempt</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Discount Type</Label>
            <RadioGroup 
              value={discountType} 
              onValueChange={setDiscountType}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage">Percentage (%)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed">Fixed Amount ($)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="discountAmount">
              {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
            </Label>
            <div className="flex items-center">
              <Input
                id="discountAmount"
                type="number"
                min="0"
                step={discountType === 'percentage' ? '1' : '0.01'}
                max={discountType === 'percentage' ? '100' : undefined}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                className="flex-1"
                placeholder={discountType === 'percentage' ? '10' : '25.00'}
              />
              <span className="ml-2">{discountType === 'percentage' ? '%' : '$'}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="taxExempt" 
              checked={isTaxExempt}
              onCheckedChange={(checked) => setIsTaxExempt(checked as boolean)}
            />
            <Label htmlFor="taxExempt">Tax Exempt</Label>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleApplyDiscount} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Applying...' : 'Apply'}
        </Button>
      </CardFooter>
    </Card>
  );
}