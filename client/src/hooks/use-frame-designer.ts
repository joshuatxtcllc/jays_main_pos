import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

/**
 * Hook to fetch frames for the frame designer component
 */
export function useFramesForDesigner() {
  return useQuery({
    queryKey: ['/api/frames'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/frames');
      const frames = await response.json();
      
      // Transform frames to the format the designer component expects
      return frames.map((frame: any) => ({
        id: frame.id,
        name: frame.name,
        color: getFrameColor(frame),
        width: getFrameWidth(frame),
        price: parseFloat(frame.price),
        inStock: true // Since we're using catalog data, assume in stock
      }));
    }
  });
}

/**
 * Hook to fetch Crescent matboards for the frame designer component
 */
export function useMatboardsForDesigner() {
  return useQuery({
    queryKey: ['/api/larson-catalog/crescent'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/larson-catalog/crescent');
      const matboards = await response.json();
      
      // Transform matboards to the format the designer component expects
      return matboards.map((mat: any) => ({
        id: mat.id,
        name: mat.name,
        color: mat.color || mat.hex_color || '#FFFFF0',
        price: parseFloat(mat.price) || 15.99,
        inStock: true // Since we're using catalog data, assume in stock
      }));
    }
  });
}

/**
 * Extract color from frame data
 */
function getFrameColor(frame: any): string {
  // First try to get color from the known field
  if (frame.color) {
    return frame.color;
  }
  
  // If there's no color field, try to determine from name
  const name = frame.name.toLowerCase();
  
  if (name.includes('black')) return '#000000';
  if (name.includes('gold')) return '#D4AF37';
  if (name.includes('silver')) return '#C0C0C0';
  if (name.includes('white')) return '#FFFFFF';
  if (name.includes('walnut')) return '#5C4033';
  if (name.includes('oak') || name.includes('natural')) return '#D2B48C';
  if (name.includes('cherry') || name.includes('mahogany')) return '#800000';
  if (name.includes('espresso') || name.includes('dark wood')) return '#3D2314';
  
  // Material based fallbacks
  if (frame.material) {
    const material = frame.material.toLowerCase();
    if (material.includes('wood')) return '#8B4513';
    if (material.includes('metal')) return '#808080';
    if (material.includes('plastic')) return '#A9A9A9';
  }
  
  // Ultimate fallback is a medium brown
  return '#8B4513';
}

/**
 * Extract width from frame data
 */
function getFrameWidth(frame: any): number {
  // First try to get width from the known field
  if (frame.width) {
    return parseFloat(frame.width);
  }
  
  // If there's no width field, use a default
  return 1.5;
}