import React, { useState, useEffect } from 'react';
import { Frame } from '@shared/schema';
import { useFrames } from '@/hooks/use-frames';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Loader2, Search, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import VendorFrameSearch from './VendorFrameSearch';

interface FrameSelectorProps {
  selectedFrames: {
    frame: Frame;
    position: number;
    distance: number;
  }[];
  onSelectFrame: (frame: Frame, position: number) => void;
  onUpdateFrameDistance: (distance: number, position: number) => void;
  activePosition: number;
  maxFrames?: number;
  useMultipleFrames: boolean;
  onToggleMultipleFrames: () => void;
}

export function FrameSelector({
  selectedFrames,
  onSelectFrame,
  onUpdateFrameDistance,
  activePosition,
  maxFrames = 2,
  useMultipleFrames,
  onToggleMultipleFrames
}: FrameSelectorProps) {
  const { frames, loading: isLoading, error } = useFrames();
  const [searchQuery, setSearchQuery] = useState("");
  const [materialFilter, setMaterialFilter] = useState("all");
  const [manufacturerFilter, setManufacturerFilter] = useState("all");
  const [widthFilter, setWidthFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  
  // Get the currently active frame
  const activeFrame = selectedFrames.find(f => f.position === activePosition)?.frame || null;
  
  // Generate filter options from available frames
  const materialOptions = React.useMemo(() => {
    const materials = Array.from(new Set(frames?.map(frame => frame.material) || []));
    return ["all", ...materials];
  }, [frames]);

  const manufacturerOptions = React.useMemo(() => {
    const manufacturers = Array.from(new Set(frames?.map(frame => frame.manufacturer) || []));
    return ["all", ...manufacturers];
  }, [frames]);

  const widthOptions = React.useMemo(() => {
    const widths = Array.from(new Set(frames?.map(frame => frame.width) || []))
      .sort((a, b) => Number(a) - Number(b));
    return ["all", ...widths.map(w => w.toString())];
  }, [frames]);
  
  // Group price ranges
  const priceOptions = [
    { label: "All Prices", value: "all" },
    { label: "Under $10/ft", value: "under10" },
    { label: "$10-20/ft", value: "10to20" },
    { label: "$20-30/ft", value: "20to30" },
    { label: "Over $30/ft", value: "over30" },
  ];
  
  // Filter frames based on all criteria
  const filteredFrames = React.useMemo(() => {
    if (!frames) return [];
    
    return frames.filter(frame => {
      // Search filter
      if (searchQuery.trim() !== '') {
        const searchLower = searchQuery.trim().toLowerCase();
        
        // Get item number from frame.id (e.g., "larson-4512" -> "4512")
        const frameItemNumber = frame.id.split('-')[1] || '';
        
        // Prioritize exact item number match
        if (frameItemNumber === searchLower) {
          return true;
        }
        
        // Check if search matches any of the following:
        const nameMatch = frame.name.toLowerCase().includes(searchLower);
        const idMatch = frame.id.toLowerCase().includes(searchLower);
        const materialMatch = frame.material.toLowerCase().includes(searchLower);
        const manufacturerMatch = frame.manufacturer.toLowerCase().includes(searchLower);
        
        if (!(nameMatch || idMatch || materialMatch || manufacturerMatch)) {
          return false;
        }
      }
      
      // Material filter
      if (materialFilter !== 'all' && frame.material !== materialFilter) {
        return false;
      }
      
      // Manufacturer filter
      if (manufacturerFilter !== 'all' && frame.manufacturer !== manufacturerFilter) {
        return false;
      }
      
      // Width filter
      if (widthFilter !== 'all' && frame.width.toString() !== widthFilter) {
        return false;
      }
      
      // Price filter
      const price = Number(frame.price);
      if (priceFilter === 'under10' && price >= 10) {
        return false;
      } else if (priceFilter === '10to20' && (price < 10 || price >= 20)) {
        return false;
      } else if (priceFilter === '20to30' && (price < 20 || price >= 30)) {
        return false;
      } else if (priceFilter === 'over30' && price < 30) {
        return false;
      }
      
      return true;
    });
  }, [frames, searchQuery, materialFilter, manufacturerFilter, widthFilter, priceFilter]);
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };
  
  // Reset all filters
  const resetFilters = () => {
    setMaterialFilter("all");
    setManufacturerFilter("all");
    setWidthFilter("all");
    setPriceFilter("all");
    setSearchQuery("");
  };
  
  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Loading frames...</span>
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-[150px]" />
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(j => (
                <Skeleton key={j} className="h-20 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>Error loading frames: {error.message}</p>
        <p>Please try again later or contact support.</p>
      </div>
    );
  }
  
  return (
    <div className="p-2 h-full">
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by item # or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 pr-8"
        />
        {searchQuery && (
          <button 
            onClick={clearSearch}
            className="absolute right-2 top-2.5"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
      
      {/* Multiple Frames Toggle */}
      <div className="mb-3 pb-3 border-b">
        <div className="flex items-center justify-between">
          <Label htmlFor="use-multiple-frames" className="font-medium">Use Multiple Frames</Label>
          <Switch 
            id="use-multiple-frames" 
            checked={useMultipleFrames}
            onCheckedChange={onToggleMultipleFrames}
          />
        </div>
        {useMultipleFrames && (
          <p className="text-xs text-muted-foreground mt-1">
            You can select up to {maxFrames} frames (inner and outer). The outer frame will have a distance from the inner frame.
          </p>
        )}
      </div>
      
      {/* Frame Position Tabs */}
      {useMultipleFrames && (
        <div className="mb-3">
          <Tabs 
            value={activePosition.toString()} 
            onValueChange={(value) => {
              // Position tabs are 1-based (1, 2)
              const position = parseInt(value);
              const existingFrame = selectedFrames.find(f => f.position === position);
              if (!existingFrame && frames.length > 0) {
                // If this position doesn't have a frame yet, select the first available frame
                onSelectFrame(frames[0], position);
              }
            }}
          >
            <TabsList className="w-full">
              {Array.from({length: maxFrames}, (_, i) => i + 1).map(pos => (
                <TabsTrigger 
                  key={pos} 
                  value={pos.toString()}
                  disabled={pos > 1 && !selectedFrames.some(f => f.position === pos - 1)}
                  className="flex-1"
                >
                  {pos === 1 ? 'Inner Frame' : 'Outer Frame'}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}
      
      {/* Selected Frame Display */}
      {activeFrame && (
        <div className="mb-3 p-2 border rounded-md">
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-md border" 
              style={{ 
                backgroundColor: activeFrame.color || '#8B4513',
                backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.1) 2px, transparent 2px, transparent 8px)`,
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)' 
              }} 
            />
            <div>
              <p className="font-semibold">{activeFrame.name}</p>
              <p className="text-sm text-muted-foreground">
                {activeFrame.manufacturer} - ${activeFrame.price}/ft
              </p>
            </div>
          </div>
          
          {/* Frame Distance Control (only for outer frame) */}
          {useMultipleFrames && activePosition > 1 && (
            <div className="mt-2">
              <Label htmlFor="frame-distance" className="text-xs">Distance from inner frame (inches)</Label>
              <Input 
                id="frame-distance"
                type="number"
                min={0}
                max={2}
                step={0.125}
                value={selectedFrames.find(f => f.position === activePosition)?.distance || 0}
                onChange={(e) => onUpdateFrameDistance(parseFloat(e.target.value), activePosition)}
                className="mt-1"
              />
            </div>
          )}
        </div>
      )}
      
      {/* Frame Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        <div>
          <Label htmlFor="material-filter" className="text-xs">Material</Label>
          <select
            id="material-filter"
            className="w-full p-2 mt-1 border border-input rounded-md bg-background text-sm"
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
          >
            {materialOptions.map(option => (
              <option key={option} value={option}>
                {option === 'all' ? 'All Materials' : option}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <Label htmlFor="manufacturer-filter" className="text-xs">Manufacturer</Label>
          <select
            id="manufacturer-filter"
            className="w-full p-2 mt-1 border border-input rounded-md bg-background text-sm"
            value={manufacturerFilter}
            onChange={(e) => setManufacturerFilter(e.target.value)}
          >
            {manufacturerOptions.map(option => (
              <option key={option} value={option}>
                {option === 'all' ? 'All Manufacturers' : option}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <Label htmlFor="width-filter" className="text-xs">Width</Label>
          <select
            id="width-filter"
            className="w-full p-2 mt-1 border border-input rounded-md bg-background text-sm"
            value={widthFilter}
            onChange={(e) => setWidthFilter(e.target.value)}
          >
            {widthOptions.map(option => (
              <option key={option} value={option}>
                {option === 'all' ? 'All Widths' : `${option}"`}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <Label htmlFor="price-filter" className="text-xs">Price Range</Label>
          <select
            id="price-filter"
            className="w-full p-2 mt-1 border border-input rounded-md bg-background text-sm"
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
          >
            {priceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* VendorFrameSearch - External frames from API */}
      <div className="mb-4">
        <Label className="text-sm font-medium">Search Vendor Catalog</Label>
        <VendorFrameSearch 
          onSelectFrame={(frame) => onSelectFrame(frame, activePosition)} 
        />
      </div>
      
      {/* Filtered Frames Display */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Available Frames ({filteredFrames.length})</h3>
          {(materialFilter !== 'all' || manufacturerFilter !== 'all' || 
            widthFilter !== 'all' || priceFilter !== 'all' || searchQuery) && (
            <button 
              onClick={resetFilters}
              className="text-xs text-primary hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
        
        <ScrollArea className="h-[300px]">
          {filteredFrames.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <p className="mb-2">No frames match your filter criteria.</p>
              <button 
                className="text-sm text-primary hover:underline"
                onClick={resetFilters}
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {filteredFrames.map(frame => (
                <div 
                  key={frame.id}
                  className={`cursor-pointer hover:scale-105 transform transition-transform duration-200 relative rounded overflow-hidden border ${activeFrame?.id === frame.id ? 'border-2 border-primary' : 'border-border'}`}
                  onClick={() => onSelectFrame(frame, activePosition)}
                >
                  <div 
                    className="w-full h-16 flex items-center justify-center p-1"
                    style={{
                      backgroundColor: frame.color || '#8B4513',
                      backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.1) 2px, transparent 2px, transparent 8px)`
                    }}
                  >
                    <span className="text-white text-xs font-mono tracking-tight opacity-80 text-center">
                      {frame.manufacturer.split('-')[0]} {frame.id.split('-')[1]}
                    </span>
                  </div>
                  <div className="bg-black/70 text-white text-xs p-1 absolute bottom-0 left-0 right-0">
                    <div className="font-medium truncate">{frame.name}</div>
                    <div className="flex justify-between">
                      <span>{frame.material}</span>
                      <span>${Number(frame.price).toFixed(2)}/ft</span>
                    </div>
                  </div>
                  {activeFrame?.id === frame.id && (
                    <div className="absolute top-1 right-1 bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

export default FrameSelector;