import React from 'react';
// Voice control feature disabled due to issues
import { ProductionKanban } from '@/components/ProductionKanban';

export default function ProductionPage() {
  return (
    <div className="container mx-auto py-4">
      <ProductionKanban />
      {/* Voice control feature disabled */}
    </div>
  );
}