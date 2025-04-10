import React from 'react';
import { useMatboards } from '../hooks/use-matboards';

const MatboardCatalogViewer: React.FC = () => {
  const { 
    loading, 
    error, 
    matboards, 
    crescentMatboards, 
    getUniqueCategories,
    getUniqueManufacturers 
  } = useMatboards();

  if (loading) {
    return <div className="p-4">Loading matboard catalog...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  const categories = getUniqueCategories();
  const manufacturers = getUniqueManufacturers();

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Matboard Catalog</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Manufacturers</h3>
        <div className="flex flex-wrap gap-2">
          {manufacturers.map(manufacturer => (
            <span 
              key={manufacturer} 
              className="px-3 py-1 bg-gray-100 rounded-full text-sm"
            >
              {manufacturer}
            </span>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <span 
              key={category} 
              className="px-3 py-1 bg-gray-100 rounded-full text-sm"
            >
              {category}
            </span>
          ))}
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2">Crescent Matboards From Database</h3>
      <p className="mb-2">Total Crescent matboards: {crescentMatboards.length}</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {crescentMatboards.slice(0, 8).map(mat => (
          <div key={mat.id} className="border rounded-lg p-4 shadow-sm">
            <div 
              className="w-full h-16 rounded-md mb-2" 
              style={{ backgroundColor: mat.color }}
            />
            <div className="text-sm font-semibold">{mat.name}</div>
            <div className="text-xs text-gray-600">{mat.category}</div>
            <div className="text-xs text-gray-600">Price: ${mat.price}/sq in</div>
            <div className="text-xs text-gray-600">Code: {mat.code}</div>
          </div>
        ))}
      </div>
      
      <h3 className="text-lg font-semibold mt-6 mb-2">All Matboards</h3>
      <p className="mb-2">Total matboards: {matboards.length}</p>
    </div>
  );
};

export default MatboardCatalogViewer;