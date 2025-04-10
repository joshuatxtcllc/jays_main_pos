import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Frame } from '@shared/schema';
import { fetchFrameCatalog } from '@/services/frameService';
import { frameCatalog } from '@/data/frameCatalog';

/**
 * Custom hook to fetch and manage frame data
 * @returns An object with frame data and loading state
 */
export function useFrames() {
  const [frames, setFrames] = useState<Frame[] | null>(null);
  
  // Use TanStack Query to fetch frames
  const { 
    data: apiFrames, 
    isLoading, 
    error 
  } = useQuery({ 
    queryKey: ['/api/frames'],
    queryFn: async () => {
      console.log('Fetching frames from catalog API...');
      try {
        const data = await fetchFrameCatalog();
        console.log('Loaded frames from API:', data.length);
        console.log('Converting API frame data to Frame format');
        return data;
      } catch (error) {
        console.error('Error fetching frames from API:', error);
        // Return empty array, we'll use static data as fallback
        return [];
      }
    }
  });
  
  // Set frames from API or use static data as fallback
  useEffect(() => {
    if (apiFrames && apiFrames.length > 0) {
      setFrames(apiFrames);
    } else if (!isLoading && (!apiFrames || apiFrames.length === 0)) {
      // If API returned no frames or had an error, use static data
      console.log('No frames from API, using static frame catalog data');
      setFrames(frameCatalog);
    }
  }, [apiFrames, isLoading]);
  
  /**
   * Gets a frame by its ID
   * @param id The frame ID
   * @returns The frame or undefined if not found
   */
  const getFrameById = (id: string): Frame | undefined => {
    if (frames) {
      return frames.find(frame => frame.id === id);
    }
    
    // Fallback to static data
    return frameCatalog.find(frame => frame.id === id);
  };
  
  /**
   * Gets frames by manufacturer
   * @param manufacturer The manufacturer name
   * @returns An array of frames from the specified manufacturer
   */
  const getFramesByManufacturer = (manufacturer: string): Frame[] => {
    if (frames) {
      return frames.filter(frame => frame.manufacturer === manufacturer);
    }
    
    // Fallback to static data
    return frameCatalog.filter(frame => frame.manufacturer === manufacturer);
  };
  
  return {
    frames,
    loading: isLoading,
    error,
    getFrameById,
    getFramesByManufacturer
  };
}