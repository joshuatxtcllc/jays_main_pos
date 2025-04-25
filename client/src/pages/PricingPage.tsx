import React from 'react';
import PriceCalculator from '@/components/PriceCalculator';
import { PageHeader } from '@/components/ui/page-header';

const PricingPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Houston Heights Pricing"
        description="Custom framing pricing for Houston Heights location with real-time wholesale rates"
        icon="calculator"
      />
      
      <div className="mt-8">
        <PriceCalculator />
      </div>
    </div>
  );
};

export default PricingPage;