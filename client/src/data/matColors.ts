import { MatColor } from '@shared/schema';
import { fetchCrescentMatboards } from '../services/matboardService';
import { supabase } from '../lib/supabase';

// Basic mat colors (will be combined with Crescent matboards from Supabase)
export const basicMatColors: MatColor[] = [
  {
    id: 'white',
    name: 'White',
    color: '#FFFFFF',
    price: "0.02", // per square inch (wholesale)
    manufacturer: 'Basic',
    code: 'WHT',
    description: 'Pure white mat board',
    category: 'Standard'
  },
  {
    id: 'black',
    name: 'Black',
    color: '#2C2C2C',
    price: "0.025", // per square inch (wholesale)
    manufacturer: 'Basic',
    code: 'BLK',
    description: 'Deep black mat board',
    category: 'Standard'
  },
  {
    id: 'grey',
    name: 'Grey',
    color: '#ADADAD',
    price: "0.02", // per square inch (wholesale)
    manufacturer: 'Basic',
    code: 'GRY',
    description: 'Neutral grey mat board',
    category: 'Standard'
  },
  {
    id: 'beige',
    name: 'Beige',
    color: '#F5F5DC',
    price: "0.02", // per square inch (wholesale)
    manufacturer: 'Basic',
    code: 'BGE',
    description: 'Soft beige mat board',
    category: 'Standard'
  }
];

// Crescent Select Conservation Matboards (from the Larson Juhl Catalog)
export const crescentMatColors: MatColor[] = [
  // Whites
  {
    id: 'crescent-white',
    name: 'Bright White',
    color: '#FFFFFF',
    price: "0.025", // per square inch (wholesale)
    manufacturer: 'Crescent',
    code: 'S100',
    description: 'Bright white conservation mat board',
    category: 'Whites'
  },
  {
    id: 'crescent-cream',
    name: 'Cream',
    color: '#FFF8E1',
    price: "0.025", // per square inch (wholesale)
    manufacturer: 'Crescent',
    code: 'S101',
    description: 'Cream white conservation mat board',
    category: 'Whites'
  },
  {
    id: 'crescent-antique',
    name: 'Antique White',
    color: '#F5F1E6',
    price: "0.025", // per square inch (wholesale)
    manufacturer: 'Crescent',
    code: 'S102',
    description: 'Subtle antique white tone',
    category: 'Whites'
  },
  // Neutrals
  {
    id: 'crescent-stone',
    name: 'Stone',
    color: '#E0DCCC',
    price: "0.027", // per square inch (wholesale)
    manufacturer: 'Crescent',
    code: 'S200',
    description: 'Light stone grey conservation mat',
    category: 'Neutrals'
  },
  {
    id: 'crescent-fog',
    name: 'Fog',
    color: '#D6D6D6',
    price: "0.027", // per square inch (wholesale)
    manufacturer: 'Crescent',
    code: 'S201',
    description: 'Subtle fog grey conservation mat',
    category: 'Neutrals'
  },
  {
    id: 'crescent-granite',
    name: 'Granite',
    color: '#A9A9A9',
    price: "0.027", // per square inch (wholesale)
    manufacturer: 'Crescent',
    code: 'S202',
    description: 'Darker granite grey tone',
    category: 'Neutrals'
  },
  // Blues
  {
    id: 'crescent-colonial-blue',
    name: 'Colonial Blue',
    color: '#B5C7D3',
    price: "0.029", // per square inch (wholesale)
    manufacturer: 'Crescent',
    code: 'S300',
    description: 'Subtle colonial blue conservation mat',
    category: 'Blues'
  },
  {
    id: 'crescent-wedgewood',
    name: 'Wedgewood',
    color: '#6E99C0',
    price: "0.029", // per square inch (wholesale)
    manufacturer: 'Crescent',
    code: 'S301',
    description: 'Classic wedgewood blue conservation mat',
    category: 'Blues'
  },
  {
    id: 'crescent-ultramarine',
    name: 'Ultramarine',
    color: '#4166B0',
    price: "0.029", // per square inch (wholesale)
    manufacturer: 'Crescent',
    code: 'S302',
    description: 'Deep ultramarine blue conservation mat',
    category: 'Blues'
  },
  // Greens
  {
    id: 'crescent-sage',
    name: 'Sage',
    color: '#BCCCBA',
    price: "0.029", // per square inch (wholesale)
    manufacturer: 'Crescent',
    code: 'S400',
    description: 'Soft sage green conservation mat',
    category: 'Greens'
  },
  {
    id: 'crescent-celadon',
    name: 'Celadon',
    color: '#9CB084',
    price: "0.029", // per square inch (wholesale)
    manufacturer: 'Crescent',
    code: 'S401',
    description: 'Classic celadon green conservation mat',
    category: 'Greens'
  },
  {
    id: 'crescent-forest',
    name: 'Forest',
    color: '#4A6741',
    price: "0.029", // per square inch (wholesale)
    manufacturer: 'Crescent',
    code: 'S402',
    description: 'Deep forest green conservation mat',
    category: 'Greens'
  },
  // Earth Tones
  {
    id: 'crescent-sand',
    name: 'Sand',
    color: '#E6D7B8',
    price: "0.027", // per square inch (wholesale)
    manufacturer: 'Crescent',
    code: 'S500',
    description: 'Light sand beige conservation mat',
    category: 'Earth Tones'
  },
  {
    id: 'crescent-chamois',
    name: 'Chamois',
    color: '#D9BC8C',
    price: "0.027", // per square inch (wholesale)
    manufacturer: 'Crescent',
    code: 'S501',
    description: 'Warm chamois tan conservation mat',
    category: 'Earth Tones'
  },
  {
    id: 'crescent-chestnut',
    name: 'Chestnut',
    color: '#A67B5B',
    price: "0.027", // per square inch (wholesale)
    manufacturer: 'Crescent',
    code: 'S502',
    description: 'Rich chestnut brown conservation mat',
    category: 'Earth Tones'
  },
  // Warm Tones
  {
    id: 'crescent-pale-rose',
    name: 'Pale Rose',
    color: '#F0D4D4',
    price: "0.029", // per square inch (wholesale)
    manufacturer: 'Crescent',
    code: 'S600',
    description: 'Subtle pale rose conservation mat',
    category: 'Warm Tones'
  },
  {
    id: 'crescent-dusty-rose',
    name: 'Dusty Rose',
    color: '#D4A9A9',
    price: "0.029", // per square inch (wholesale)
    manufacturer: 'Crescent',
    code: 'S601',
    description: 'Classic dusty rose conservation mat',
    category: 'Warm Tones'
  },
  {
    id: 'crescent-rust',
    name: 'Rust',
    color: '#B56A55',
    price: "0.029", // per square inch (wholesale)
    manufacturer: 'Crescent',
    code: 'S602',
    description: 'Deep rust red conservation mat',
    category: 'Warm Tones'
  },
  // Black
  {
    id: 'crescent-black',
    name: 'Raven Black',
    color: '#1A1A1A',
    price: "0.03", // per square inch (wholesale)
    manufacturer: 'Crescent',
    code: 'S700',
    description: 'Deep black conservation mat board',
    category: 'Black'
  }
];

// Default to combined basic and statically defined Crescent colors
let matColorCatalog: MatColor[] = [...basicMatColors, ...crescentMatColors];

// Function to load mat colors from Supabase - only in browser environment
export const loadCrescentMatboardsFromSupabase = async (): Promise<void> => {
  // Skip on server-side to avoid fetch errors
  if (typeof window === 'undefined') {
    console.log('Skipping Supabase fetch on server-side');
    return;
  }

  try {
    console.log('Fetching Crescent matboards from Larson Juhl catalog...');
    const supabaseMatboards = await fetchCrescentMatboards();
    if (supabaseMatboards && supabaseMatboards.length > 0) {
      // Replace static Crescent matboards with ones from Supabase
      const basicColors = basicMatColors;
      matColorCatalog = [...basicColors, ...supabaseMatboards];
      console.log(`Loaded ${supabaseMatboards.length} Crescent matboards from Larson Juhl catalog`);
    } else {
      console.log('No Crescent matboards found in Larson Juhl catalog or empty response. Using static fallback data.');
    }
  } catch (error) {
    console.error('Failed to load Crescent matboards:', error);
    console.log('Using static Crescent matboard catalog as fallback.');
    // Keep using the static list as fallback
  }
};

// Initialize loading of matboards from Supabase - only in browser environment
if (typeof window !== 'undefined') {
  loadCrescentMatboardsFromSupabase();
}

// Export the combined catalog
export { matColorCatalog };

// Helper function to get mat color by ID
export const getMatColorById = (id: string): MatColor | undefined => {
  return matColorCatalog.find(mat => mat.id === id);
};

// Get mat colors by manufacturer
export const getMatColorsByManufacturer = (manufacturer: string): MatColor[] => {
  return matColorCatalog.filter(mat => mat.manufacturer === manufacturer);
};

// Get mat colors by category
export const getMatColorsByCategory = (category: string): MatColor[] => {
  return matColorCatalog.filter(mat => mat.category === category);
};

// Get unique categories
export const getUniqueMatCategories = (): string[] => {
  const categories = new Set<string>();
  matColorCatalog.forEach(mat => {
    if (mat.category) {
      categories.add(mat.category);
    }
  });
  return Array.from(categories);
};
