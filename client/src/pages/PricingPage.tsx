import React from 'react';
import PriceCalculator from '@/components/PriceCalculator';
import { Calculator } from 'lucide-react';

const PricingPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Calculator className="w-8 h-8 mr-3 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Houston Heights Pricing</h1>
          <p className="text-muted-foreground mt-1">
            Custom framing pricing for Houston Heights location with real-time wholesale rates
          </p>
        </div>
      </div>
      
      <div className="mt-8">
        <PriceCalculator />
      </div>
    </div>
  );
};

export default PricingPage;