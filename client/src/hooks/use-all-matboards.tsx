import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MatColor } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export function useAllMatboards() {
  const [allMatboards, setAllMatboards] = useState<MatColor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch matboards from mat_colors table (includes all Crescent Select)
  const {
    data: matColorsData,
    isLoading: isMatColorsLoading,
    error: matColorsError
  } = useQuery({
    queryKey: ['/api/mat-colors'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/mat-colors');
      return response.json();
    }
  });

  // Fetch matboards from Crescent Select API
  const {
    data: crescentSelectData,
    isLoading: isCrescentSelectLoading,
    error: crescentSelectError
  } = useQuery({
    queryKey: ['/api/crescent-select'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/crescent-select');
      return response.json();
    }
  });

  useEffect(() => {
    // Only process when both queries are done
    if (!isMatColorsLoading && !isCrescentSelectLoading) {
      setIsLoading(false);
      
      // Handle errors if any
      if (matColorsError) {
        console.error('Error fetching mat colors:', matColorsError);
        setError(matColorsError as Error);
        return;
      }
      
      if (crescentSelectError) {
        console.error('Error fetching Crescent Select mats:', crescentSelectError);
        setError(crescentSelectError as Error);
        return;
      }
      
      // Success - combine and deduplicate matboards
      try {
        // Create a Map to deduplicate by ID
        const matboardMap = new Map<string, MatColor>();
        
        // Add mat_colors data (which should already include all imported mats)
        if (matColorsData && Array.isArray(matColorsData)) {
          matColorsData.forEach((mat: MatColor) => {
            matboardMap.set(mat.id, mat);
          });
          
          console.log(`Added ${matColorsData.length} mats from mat_colors`);
        }
        
        // Convert to array and set state
        const combinedMatboards = Array.from(matboardMap.values());
        console.log(`Total deduplicated matboards: ${combinedMatboards.length}`);
        
        // Group matboards by category
        const categorizedMatboards = combinedMatboards.sort((a, b) => {
          // Sort by category first
          if (a.category && b.category) {
            return a.category.localeCompare(b.category);
          } else if (a.category) {
            return -1;
          } else if (b.category) {
            return 1;
          }
          
          // Then by name
          return a.name.localeCompare(b.name);
        });
        
        setAllMatboards(categorizedMatboards);
      } catch (error) {
        console.error('Error processing matboard data:', error);
        setError(error as Error);
      }
    }
  }, [matColorsData, crescentSelectData, isMatColorsLoading, isCrescentSelectLoading, matColorsError, crescentSelectError]);

  // Function to get matboards by category
  const getMatboardsByCategory = (category: string) => {
    return allMatboards.filter(mat => mat.category === category);
  };

  // Get all unique categories
  const categories = Array.from(new Set(allMatboards.map(mat => mat.category || 'Uncategorized')))
    .filter(category => category) // Remove empty categories
    .sort();

  return {
    matboards: allMatboards,
    isLoading,
    error,
    categories,
    getMatboardsByCategory
  };
}