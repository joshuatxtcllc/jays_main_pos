import React from 'react';
import { ProductionKanban } from '@/components/ProductionKanban';
import { MainLayout } from '@/components/layout/MainLayout';

export default function ProductionPage() {
  return (
    <MainLayout>
      <ProductionKanban />
    </MainLayout>
  );
}