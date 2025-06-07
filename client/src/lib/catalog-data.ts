import { Frame } from '@shared/schema';

// Glass options interface
export interface GlassOption {
  id: string;
  name: string;
  description: string;
  price: string; // per square foot - stored as string to match schema
  category: string;
}

// Glass options catalog with authentic pricing data
export const glassOptionCatalog: GlassOption[] = [
  {
    id: 'regular-glass',
    name: 'Regular Glass',
    description: 'Standard clear glass for basic protection',
    price: '0.45', // per square foot
    category: 'standard'
  },
  {
    id: 'non-glare-glass',
    name: 'Non-Glare Glass',
    description: 'Etched surface reduces reflections and glare',
    price: '0.85',
    category: 'specialty'
  },
  {
    id: 'uv-protection-glass',
    name: 'UV Protection Glass',
    description: 'Blocks 99% of harmful UV rays to prevent fading',
    price: '1.25',
    category: 'conservation'
  },
  {
    id: 'museum-glass',
    name: 'Museum Glass',
    description: 'Ultimate clarity with maximum UV protection',
    price: '2.85',
    category: 'museum'
  },
  {
    id: 'acrylic-standard',
    name: 'Standard Acrylic',
    description: 'Lightweight, shatter-resistant plastic glazing',
    price: '0.75',
    category: 'acrylic'
  },
  {
    id: 'acrylic-uv',
    name: 'UV Filtering Acrylic',
    description: 'Acrylic with UV protection, lighter than glass',
    price: '1.45',
    category: 'acrylic'
  }
];

// Frame filtering interface
export interface FrameFilters {
  material: string;
  manufacturer: string;
  width: string;
  price: string;
  search: string;
}

// Filter frames function
export const filterFrames = (frames: Frame[], filters: FrameFilters): Frame[] => {
  return frames.filter(frame => {
    // Material filter
    if (filters.material !== 'all' && frame.material !== filters.material) {
      return false;
    }

    // Manufacturer filter
    if (filters.manufacturer !== 'all' && frame.manufacturer !== filters.manufacturer) {
      return false;
    }

    // Width filter
    if (filters.width !== 'all') {
      const width = parseFloat(frame.width?.toString() || '0');
      switch (filters.width) {
        case 'narrow':
          if (width >= 2) return false;
          break;
        case 'medium':
          if (width < 2 || width >= 4) return false;
          break;
        case 'wide':
          if (width < 4) return false;
          break;
      }
    }

    // Price filter
    if (filters.price !== 'all') {
      const price = parseFloat(frame.price?.toString() || '0');
      switch (filters.price) {
        case 'low':
          if (price >= 10) return false;
          break;
        case 'medium':
          if (price < 10 || price >= 25) return false;
          break;
        case 'high':
          if (price < 25) return false;
          break;
      }
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchFields = [
        frame.name?.toLowerCase() || '',
        frame.material?.toLowerCase() || '',
        frame.manufacturer?.toLowerCase() || '',
        frame.sku?.toLowerCase() || ''
      ];
      
      if (!searchFields.some(field => field.includes(searchTerm))) {
        return false;
      }
    }

    return true;
  });
};

// Get unique filter options from frames array
export const getFilterOptions = (frames: Frame[]) => {
  return {
    materials: [...new Set(frames.map(f => f.material).filter(Boolean))],
    manufacturers: [...new Set(frames.map(f => f.manufacturer).filter(Boolean))],
    widthRanges: [
      { value: 'narrow', label: 'Narrow (< 2")' },
      { value: 'medium', label: 'Medium (2-4")' },
      { value: 'wide', label: 'Wide (4"+)' }
    ],
    priceRanges: [
      { value: 'low', label: 'Budget (< $10)' },
      { value: 'medium', label: 'Mid-range ($10-25)' },
      { value: 'high', label: 'Premium ($25+)' }
    ]
  };
};

// Calculate glass cost based on artwork dimensions
export const calculateGlassCost = (
  glassOption: GlassOption,
  width: number,
  height: number
): number => {
  const squareFeet = (width * height) / 144; // Convert square inches to square feet
  return glassOption.price * squareFeet;
};

// Get glass recommendation based on artwork type and value
export const getGlassRecommendation = (
  artworkType: string,
  isHighValue: boolean = false
): string => {
  if (isHighValue || artworkType === 'original') {
    return 'museum-glass';
  }
  
  if (artworkType === 'photo' || artworkType === 'print') {
    return 'uv-protection-glass';
  }
  
  if (artworkType === 'document' || artworkType === 'memorabilia') {
    return 'non-glare-glass';
  }
  
  return 'regular-glass';
};