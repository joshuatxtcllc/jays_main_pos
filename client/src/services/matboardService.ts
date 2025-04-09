import { supabase } from '../lib/supabase';
import { MatColor } from '@shared/schema';

/**
 * Fetches Crescent Select Conservation Matboards data from Supabase
 */
export async function fetchCrescentMatboards(): Promise<MatColor[]> {
  try {
    // Safely check that supabase has the expected methods
    if (typeof supabase?.from !== 'function') {
      console.warn('Supabase client not properly initialized');
      return [];
    }
    
    const { data, error } = await supabase
      .from('crescent_matboards')
      .select('*');
    
    if (error) {
      console.error('Error fetching Crescent matboards:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.warn('No Crescent matboards found in Supabase');
      return [];
    }
    
    // Transform the data to match our MatColor type
    return data.map((item: any) => ({
      id: item.id || `crescent-${item.code || 'unknown'}`,
      name: item.name || 'Unknown',
      color: item.hex_color || '#FFFFFF',
      price: (item.price !== undefined) ? String(item.price) : "0.025",
      manufacturer: 'Crescent',
      code: item.code || 'unknown',
      description: item.description || '',
      category: item.category || 'Other'
    }));
  } catch (error) {
    console.error('Unexpected error fetching Crescent matboards:', error);
    // Fall back to empty array - the static data will be used instead
    return [];
  }
}