import { useState, useEffect } from 'react';
import { Frame } from '@shared/schema';
import { fetchFrameCatalog, convertToFrames } from '../services/frameService';
import { frameCatalog } from '../data/frameCatalog';

/**
 * Custom hook to fetch and manage frame data
 * @returns An object with frame data and loading state
 */
export function useFrames() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  
  useEffect(() => {
    async function loadFrames() {
      try {
        setLoading(true);
        
        // Try to fetch frames from the API
        const apiFrames = await fetchFrameCatalog();
        
        if (apiFrames && apiFrames.length > 0) {
          console.log('Loaded frames from API:', apiFrames.length);
          const converted = convertToFrames(apiFrames);
          setFrames(converted);
          
          // Extract unique manufacturers and materials
          const uniqueManufacturers = Array.from(new Set(converted.map(frame => frame.manufacturer)));
          const uniqueMaterials = Array.from(new Set(converted.map(frame => frame.material)));
          
          setManufacturers(uniqueManufacturers);
          setMaterials(uniqueMaterials);
        } else {
          console.log('No frames found in API or empty response. Using static fallback data.');
          // Use static data as fallback
          setFrames(frameCatalog);
          
          // Extract unique manufacturers and materials from static data
          const uniqueManufacturers = Array.from(new Set(frameCatalog.map(frame => frame.manufacturer)));
          const uniqueMaterials = Array.from(new Set(frameCatalog.map(frame => frame.material)));
          
          setManufacturers(uniqueManufacturers);
          setMaterials(uniqueMaterials);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error in useFrames hook:', err);
        setError('Failed to load frame data');
        
        // Use static data as fallback
        setFrames(frameCatalog);
        
        // Extract unique manufacturers and materials from static data
        const uniqueManufacturers = Array.from(new Set(frameCatalog.map(frame => frame.manufacturer)));
        const uniqueMaterials = Array.from(new Set(frameCatalog.map(frame => frame.material)));
        
        setManufacturers(uniqueManufacturers);
        setMaterials(uniqueMaterials);
      } finally {
        setLoading(false);
      }
    }
    
    loadFrames();
  }, []);
  
  return {
    loading,
    error,
    frames,
    manufacturers,
    materials,
    // Helper functions to filter frames
    getFrameById: (id: string) => frames.find(frame => frame.id === id),
    getFramesByManufacturer: (manufacturer: string) => 
      frames.filter(frame => frame.manufacturer === manufacturer),
    getFramesByMaterial: (material: string) => 
      frames.filter(frame => frame.material === material),
    getFramesByWidthRange: (minWidth: number, maxWidth: number) => 
      frames.filter(frame => {
        const width = parseFloat(String(frame.width));
        return width >= minWidth && width <= maxWidth;
      }),
    filterFrames: (filters: {
      manufacturer?: string;
      material?: string;
      minWidth?: number;
      maxWidth?: number;
      searchTerm?: string;
    }) => {
      return frames.filter(frame => {
        // Check manufacturer
        if (filters.manufacturer && frame.manufacturer !== filters.manufacturer) {
          return false;
        }
        
        // Check material
        if (filters.material && frame.material !== filters.material) {
          return false;
        }
        
        // Check width range
        if (filters.minWidth !== undefined || filters.maxWidth !== undefined) {
          const width = parseFloat(String(frame.width));
          if (filters.minWidth !== undefined && width < filters.minWidth) {
            return false;
          }
          if (filters.maxWidth !== undefined && width > filters.maxWidth) {
            return false;
          }
        }
        
        // Check search term (search in name, manufacturer, and material)
        if (filters.searchTerm) {
          const term = filters.searchTerm.toLowerCase();
          return (
            frame.name.toLowerCase().includes(term) ||
            frame.manufacturer.toLowerCase().includes(term) ||
            frame.material.toLowerCase().includes(term)
          );
        }
        
        return true;
      });
    }
  };
}