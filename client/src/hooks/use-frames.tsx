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
  const { data: apiFrames, isLoading: loading, error } = useQuery({
    queryKey: ['/api/frames'],
    queryFn: async () => {
      try {
        console.log('Fetching frames from catalog API...');
        const response = await fetchFrameCatalog();

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Loaded frames from API:', data?.length || 0);

        if (!Array.isArray(data) || data.length === 0) {
          console.log('No valid frames from API, using static frame catalog data');
          return frameCatalog;
        }

        // Convert API data to Frame format with validation
        console.log('Converting API frame data to Frame format');
        const convertedFrames = data
          .filter((frame: any) => frame && typeof frame === 'object')
          .map((frame: any, index: number) => ({
            id: frame.id || `api-frame-${index}`,
            name: frame.name || `Frame ${index + 1}`,
            material: frame.material || 'wood',
            width: String(frame.width || '1.0'),
            depth: String(frame.depth || '0.5'),
            color: frame.color || '#8B4513',
            price: String(frame.price || '10.00'),
            manufacturer: frame.manufacturer || 'Generic',
            imageUrl: frame.imageUrl || frame.image_url || '',
            description: frame.description || ''
          }));

        console.log(`Successfully converted ${convertedFrames.length} frames from API`);
        return convertedFrames.length > 0 ? convertedFrames : frameCatalog;
      } catch (error) {
        console.error('Error fetching frames from API:', error);
        console.log('Using static frame data as fallback');
        return frameCatalog;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 2, // Retry failed requests twice
    retryDelay: 1000, // Wait 1 second between retries
  });

  // Set frames from API or use static data as fallback
  useEffect(() => {
    if (apiFrames && apiFrames.length > 0) {
      setFrames(apiFrames);
    } else if (!loading && (!apiFrames || apiFrames.length === 0)) {
      // If API returned no frames or had an error, use static data
      console.log('No frames from API, using static frame catalog data');
      setFrames(frameCatalog);
    }
  }, [apiFrames, loading]);

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
    loading: loading,
    error,
    getFrameById,
    getFramesByManufacturer
  };
}