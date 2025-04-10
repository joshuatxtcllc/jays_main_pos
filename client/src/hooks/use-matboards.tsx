import { useState, useEffect } from 'react';
import { MatColor } from '@shared/schema';
import { fetchCrescentMatboards, convertToMatColors } from '../services/matboardService';
import { basicMatColors, crescentMatColors } from '../data/matColors';

/**
 * Custom hook to fetch and manage matboard data
 * @returns An object with matboard data and loading state
 */
export function useMatboards() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matboards, setMatboards] = useState<MatColor[]>([]);
  const [crescentMatboards, setCrescentMatboards] = useState<MatColor[]>([]);

  useEffect(() => {
    async function loadMatboards() {
      try {
        setLoading(true);
        
        // Try to fetch Crescent matboards from the API
        const apiMatboards = await fetchCrescentMatboards();
        
        if (apiMatboards && apiMatboards.length > 0) {
          console.log('Loaded Crescent matboards from API:', apiMatboards.length);
          const converted = convertToMatColors(apiMatboards);
          setCrescentMatboards(converted);
        } else {
          console.log('No Crescent matboards found in Larson Juhl catalog or empty response. Using static fallback data.');
          setCrescentMatboards(crescentMatColors);
        }
        
        // Always include basic mat colors
        setMatboards([...basicMatColors, ...crescentMatColors]);
        
        setError(null);
      } catch (err) {
        console.error('Error in useMatboards hook:', err);
        setError('Failed to load matboard data');
        setCrescentMatboards(crescentMatColors);
        setMatboards([...basicMatColors, ...crescentMatColors]);
      } finally {
        setLoading(false);
      }
    }
    
    loadMatboards();
  }, []);

  return {
    loading,
    error,
    matboards,
    crescentMatboards,
    // Helper functions to filter matboards
    getMatboardById: (id: string) => matboards.find(mat => mat.id === id),
    getMatboardsByManufacturer: (manufacturer: string) => 
      matboards.filter(mat => mat.manufacturer === manufacturer),
    getMatboardsByCategory: (category: string) => 
      matboards.filter(mat => mat.category === category),
    getUniqueCategories: () => 
      Array.from(new Set(matboards.map(mat => mat.category).filter(Boolean) as string[])),
    getUniqueManufacturers: () => 
      Array.from(new Set(matboards.map(mat => mat.manufacturer).filter(Boolean) as string[]))
  };
}