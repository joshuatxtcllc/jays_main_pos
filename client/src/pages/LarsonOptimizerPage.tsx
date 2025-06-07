
import React from 'react';
import LarsonOrderOptimizer from '../components/LarsonOrderOptimizer';

export default function LarsonOptimizerPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Larson-Juhl Order Optimizer</h1>
        <p className="text-muted-foreground mt-2">
          Optimize your frame moulding orders by comparing length vs. chop pricing to minimize costs and waste.
        </p>
      </div>
      
      <LarsonOrderOptimizer />
    </div>
  );
}
