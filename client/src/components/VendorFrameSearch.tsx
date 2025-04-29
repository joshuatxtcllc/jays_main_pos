import React, { useState, useEffect, useRef } from 'react';
import { useVendorFrames } from '@/hooks/use-vendor-frames';
import { Frame } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Search, RefreshCw } from 'lucide-react';

interface VendorFrameSearchProps {
  onSelectFrame: (frame: Frame, position: number) => void;
  position?: number;
}

const VendorFrameSearch: React.FC<VendorFrameSearchProps> = ({ onSelectFrame, position = 1 }) => {
  const { toast } = useToast();
  const [itemNumber, setItemNumber] = useState<string>('');
  const [localSearchResults, setLocalSearchResults] = useState<Frame[]>([]);
  const [localIsSearching, setLocalIsSearching] = useState<boolean>(false);
  const prevSearchResultsRef = useRef<Frame[] | null>(null);
  
  const { 
    searchByItemNumber, 
    searchResults, 
    isSearching,
    searchError,
    syncFrames,
    isSyncing
  } = useVendorFrames();
  
  // When search results from the hook change, update our local state
  useEffect(() => {
    // Only update if searchResults has actually changed
    if (searchResults && 
        JSON.stringify(searchResults) !== JSON.stringify(prevSearchResultsRef.current)) {
      prevSearchResultsRef.current = searchResults;
      setLocalSearchResults(searchResults);
      
      if (localIsSearching) {
        setLocalIsSearching(false);
      }
    }
  }, [searchResults, localIsSearching]);
  
  // Handle search errors
  useEffect(() => {
    if (searchError) {
      toast({
        title: "Search Error",
        description: "Failed to search vendor catalogs. Please try again.",
        variant: "destructive"
      });
      
      if (localIsSearching) {
        setLocalIsSearching(false);
      }
    }
  }, [searchError, toast, localIsSearching]);
  
  const handleSearch = () => {
    if (!itemNumber.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter an item number to search for",
        variant: "destructive"
      });
      return;
    }
    
    setLocalIsSearching(true);
    // Use the searchByItemNumber mutation
    searchByItemNumber(itemNumber.trim());
  };
  
  const handleSyncFrames = () => {
    syncFrames();
    toast({
      title: "Syncing Frames",
      description: "Frame database sync has been initiated",
    });
  };
  
  const handleSelectFrame = (frame: Frame) => {
    onSelectFrame(frame, position);
    toast({
      title: "Frame Selected",
      description: `${frame.name} (${frame.id}) has been selected for position ${position}`,
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Vendor Catalog Search</CardTitle>
        <CardDescription>
          Search for frames by item number across all vendor catalogs
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Label htmlFor="item-number">Item Number</Label>
              <Input
                id="item-number"
                value={itemNumber}
                onChange={(e) => setItemNumber(e.target.value)}
                placeholder="Enter frame item number (e.g., 210286)"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || localIsSearching}
              className="mb-px"
            >
              {(isSearching || localIsSearching) ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </div>
          
          <Button
            variant="outline"
            onClick={handleSyncFrames}
            disabled={isSyncing}
            className="self-end"
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync Frames with Database
          </Button>
          
          {localSearchResults.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Search Results:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {localSearchResults.map((frame) => (
                  <Card key={frame.id} className="overflow-hidden">
                    <div className="relative h-40 overflow-hidden">
                      {frame.catalogImage ? (
                        <img 
                          src={frame.catalogImage} 
                          alt={frame.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback for broken images
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = `https://via.placeholder.com/200x150/f0f0f0/2d2d2d?text=${frame.id}`;
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-muted">
                          <span className="text-xs text-muted-foreground">No Image Available</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h4 className="font-semibold text-sm truncate">{frame.name}</h4>
                      <p className="text-xs text-muted-foreground">Item #: {frame.id.split('-')[1]}</p>
                      <div className="flex justify-between items-center text-xs mt-1">
                        <span>{frame.manufacturer}</span>
                        <span>{frame.material}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs mt-1">
                        <span>Width: {frame.width}"</span>
                        <span className="font-medium">${parseFloat(String(frame.price)).toFixed(2)}/ft</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-3 pt-0">
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleSelectFrame(frame)}
                      >
                        Select Frame
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ) : (localSearchResults.length === 0 && !isSearching && !localIsSearching && itemNumber.trim() !== '') ? (
            <div className="p-4 text-center text-muted-foreground">
              No frames found with item number "{itemNumber}". Try searching for a different item number.
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorFrameSearch;