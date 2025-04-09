import { supabase } from '@/lib/supabase';
import { MatColor } from '@shared/schema';

/**
 * Fetches Crescent Select Conservation Matboards data from Supabase
 */
export async function fetchCrescentMatboards(): Promise<MatColor[]> {
  try {
    // Check if supabase client has the from method (not a mock)
    if (typeof supabase.from === 'function') {
      const { data, error } = await supabase
        .from('crescent_matboards')
        .select('*');

      if (error) {
        console.error('Supabase error fetching matboards:', error);
        return []; // Return empty array instead of throwing
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
    } else {
      console.log('Using mock data for Crescent matboards');
      // Return mock data when Supabase client is not available
      return [];
    }
  } catch (error) {
    console.error('Error fetching Crescent matboards:', error);
    return []; // Return empty array instead of throwing
  }
}