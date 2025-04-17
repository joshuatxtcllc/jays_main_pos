import { useQuery, useMutation } from '@tanstack/react-query';
import { Frame } from '@shared/schema';
import { 
  fetchLarsonJuhlFrames,
  fetchNielsenFrames, 
  fetchRomaFrames,
  fetchAllVendorFrames,
  searchFramesByItemNumber,
  syncFramesWithDatabase
} from '@/services/vendorCatalogService';

/**
 * Hook for accessing vendor catalog frames
 */
export function useVendorFrames() {
  // Query to fetch all vendor frames
  const { 
    data: vendorFrames,
    isLoading: isLoadingVendorFrames,
    error: vendorFramesError,
    refetch: refetchVendorFrames
  } = useQuery({
    queryKey: ['/api/vendor-catalog/all'],
    queryFn: fetchAllVendorFrames,
  });

  // Query to fetch Larson-Juhl frames
  const { 
    data: larsonFrames,
    isLoading: isLoadingLarsonFrames,
    error: larsonFramesError,
    refetch: refetchLarsonFrames
  } = useQuery({
    queryKey: ['/api/vendor-catalog/larson'],
    queryFn: fetchLarsonJuhlFrames,
  });

  // Query to fetch Nielsen frames
  const { 
    data: nielsenFrames,
    isLoading: isLoadingNielsenFrames,
    error: nielsenFramesError,
    refetch: refetchNielsenFrames
  } = useQuery({
    queryKey: ['/api/vendor-catalog/nielsen'],
    queryFn: fetchNielsenFrames,
  });

  // Query to fetch Roma frames
  const { 
    data: romaFrames,
    isLoading: isLoadingRomaFrames,
    error: romaFramesError,
    refetch: refetchRomaFrames
  } = useQuery({
    queryKey: ['/api/vendor-catalog/roma'],
    queryFn: fetchRomaFrames,
  });

  // Mutation to search frames by item number
  const { 
    mutate: searchByItemNumber,
    data: searchResults,
    isPending: isSearching,
    error: searchError
  } = useMutation({
    mutationFn: (itemNumber: string) => searchFramesByItemNumber(itemNumber),
  });

  // Mutation to sync frames with database
  const { 
    mutate: syncFrames,
    isPending: isSyncing,
    error: syncError
  } = useMutation({
    mutationFn: syncFramesWithDatabase,
  });

  return {
    // All vendor frames
    vendorFrames: vendorFrames || [],
    isLoadingVendorFrames,
    vendorFramesError,
    refetchVendorFrames,
    
    // Larson-Juhl frames
    larsonFrames: larsonFrames || [],
    isLoadingLarsonFrames,
    larsonFramesError,
    refetchLarsonFrames,
    
    // Nielsen frames
    nielsenFrames: nielsenFrames || [],
    isLoadingNielsenFrames,
    nielsenFramesError,
    refetchNielsenFrames,
    
    // Roma frames
    romaFrames: romaFrames || [],
    isLoadingRomaFrames,
    romaFramesError,
    refetchRomaFrames,
    
    // Frame search
    searchByItemNumber,
    searchResults: searchResults || [],
    isSearching,
    searchError,
    
    // Sync frames
    syncFrames,
    isSyncing,
    syncError
  };
}