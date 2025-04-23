import React from 'react';
import MaterialsPickList from '@/components/materials/MaterialsPickList';
import { useLocation } from 'wouter';

const MaterialsPickListPage: React.FC = () => {
  const [, setLocation] = useLocation();

  const handleCreateOrder = () => {
    // After creating an order, navigate to the material orders page
    setLocation('/materials');
  };

  return (
    <div className="container mx-auto py-6">
      <MaterialsPickList onCreateOrder={handleCreateOrder} />
    </div>
  );
};

export default MaterialsPickListPage;