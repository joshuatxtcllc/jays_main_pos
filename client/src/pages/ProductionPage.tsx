import React from 'react';
import { ProductionKanban } from '@/components/ProductionKanban';
// No layout wrapper needed since we have the Header in App.tsx

export default function ProductionPage() {
  return (
    <div className="production-page">
      <ProductionKanban />
    </div>
  );
}