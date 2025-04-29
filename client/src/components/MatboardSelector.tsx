import React, { useState } from 'react';
import { useAllMatboards } from '@/hooks/use-all-matboards';
import { MatColor } from '@shared/schema';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Search, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MatboardSelectorProps {
  selectedMatboards: {
    matboard: MatColor;
    position: number;
    width: number;
    offset: number;
  }[];
  onSelectMatboard: (matboard: MatColor, position: number) => void;
  onUpdateMatWidth: (width: number, position: number) => void;
  onUpdateMatOffset: (offset: number, position: number) => void;
  activePosition: number;
  maxMats?: number;
  useMultipleMats: boolean;
  onToggleMultipleMats: () => void;
}

export function MatboardSelector({ 
  selectedMatboards, 
  onSelectMatboard, 
  onUpdateMatWidth,
  onUpdateMatOffset,
  activePosition,
  maxMats = 3,
  useMultipleMats,
  onToggleMultipleMats
}: MatboardSelectorProps) {
  const { matboards, isLoading, error, categories } = useAllMatboards();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Get the currently active matboard
  const activeMatboard = selectedMatboards.find(m => m.position === activePosition)?.matboard || null;

  // Filter matboards by search query
  const filteredMatboards = searchQuery 
    ? matboards.filter(mat => 
        mat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        mat.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mat.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : matboards;

  // Get matboards for the current category tab
  const getMatboardsForTab = (tab: string) => {
    if (tab === "all") {
      return filteredMatboards;
    }
    return filteredMatboards.filter(mat => mat.category === tab);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Loading matboards...</span>
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-[150px]" />
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(j => (
                <Skeleton key={j} className="h-12 w-full" />
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
        <p>Error loading matboards: {error.message}</p>
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
          placeholder="Search by name or code..."
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

      {/* Multiple Mats Toggle */}
      <div className="mb-3 pb-3 border-b">
        <div className="flex items-center justify-between">
          <Label htmlFor="use-multiple-mats" className="font-medium">Use Multiple Mats</Label>
          <Switch 
            id="use-multiple-mats" 
            checked={useMultipleMats}
            onCheckedChange={onToggleMultipleMats}
          />
        </div>
        {useMultipleMats && (
          <p className="text-xs text-muted-foreground mt-1">
            You can select up to {maxMats} mats for layering. Each mat can have a different width and offset.
          </p>
        )}
      </div>
      
      {/* Mat Position Tabs */}
      {useMultipleMats && (
        <div className="mb-3">
          <Tabs 
            value={activePosition.toString()} 
            onValueChange={(value) => {
              // Position tabs are 1-based (1, 2, 3)
              const position = parseInt(value);
              const existingMat = selectedMatboards.find(m => m.position === position);
              if (!existingMat && matboards.length > 0) {
                // If this position doesn't have a mat yet, select the first available mat
                onSelectMatboard(matboards[0], position);
              }
            }}
          >
            <TabsList className="w-full">
              {Array.from({length: maxMats}, (_, i) => i + 1).map(pos => (
                <TabsTrigger 
                  key={pos} 
                  value={pos.toString()}
                  disabled={pos > 1 && !selectedMatboards.some(m => m.position === pos - 1)}
                  className="flex-1"
                >
                  {pos === 1 ? 'Top Mat' : pos === 2 ? 'Middle Mat' : 'Bottom Mat'}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}
      
      {/* Selected Matboard Display */}
      {activeMatboard && (
        <div className="mb-3 p-2 border rounded-md">
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-md border" 
              style={{ 
                backgroundColor: activeMatboard.color,
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)' 
              }} 
            />
            <div>
              <p className="font-semibold">{activeMatboard.name}</p>
              <p className="text-sm text-muted-foreground">
                {activeMatboard.code} - {activeMatboard.manufacturer}
              </p>
            </div>
          </div>
          
          {/* Mat Width and Offset Controls */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <Label htmlFor="mat-width" className="text-xs">Mat Width (inches)</Label>
              <Input 
                id="mat-width"
                type="number"
                min={1}
                max={8}
                step={0.25}
                value={selectedMatboards.find(m => m.position === activePosition)?.width || 2}
                onChange={(e) => onUpdateMatWidth(parseFloat(e.target.value), activePosition)}
                className="mt-1"
              />
            </div>
            
            {useMultipleMats && activePosition > 1 && (
              <div>
                <Label htmlFor="mat-offset" className="text-xs">Mat Offset (inches)</Label>
                <Input 
                  id="mat-offset"
                  type="number"
                  min={0}
                  max={2}
                  step={0.125}
                  value={selectedMatboards.find(m => m.position === activePosition)?.offset || 0}
                  onChange={(e) => onUpdateMatOffset(parseFloat(e.target.value), activePosition)}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-2 h-auto flex flex-wrap">
          <TabsTrigger value="all" className="flex-grow">All</TabsTrigger>
          {categories.slice(0, 5).map(category => (
            <TabsTrigger key={category} value={category} className="flex-grow">
              {category}
            </TabsTrigger>
          ))}
          {categories.length > 5 && (
            <TabsTrigger value="more" className="flex-grow">
              More...
            </TabsTrigger>
          )}
        </TabsList>

        {/* All Matboards Tab */}
        <TabsContent value="all" className="mt-0">
          <ScrollArea className="h-[400px]">
            <RadioGroup 
              value={activeMatboard?.id || ""} 
              onValueChange={(value) => {
                const mat = matboards.find(m => m.id === value);
                if (mat) onSelectMatboard(mat, activePosition);
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
            >
              {getMatboardsForTab("all").map((mat) => (
                <div key={mat.id} className="flex items-start space-x-2">
                  <RadioGroupItem value={mat.id} id={mat.id} />
                  <div className="flex-1">
                    <Label 
                      htmlFor={mat.id} 
                      className="flex items-center cursor-pointer p-2 rounded-md hover:bg-accent"
                    >
                      <div 
                        className="w-8 h-8 rounded-md mr-2 border" 
                        style={{ 
                          backgroundColor: mat.color,
                          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)' 
                        }} 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{mat.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {mat.code} - {mat.category}
                        </p>
                      </div>
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </ScrollArea>
        </TabsContent>

        {/* Category Tabs */}
        {categories.map(category => (
          <TabsContent key={category} value={category} className="mt-0">
            <ScrollArea className="h-[400px]">
              <RadioGroup 
                value={activeMatboard?.id || ""} 
                onValueChange={(value) => {
                  const mat = matboards.find(m => m.id === value);
                  if (mat) onSelectMatboard(mat, activePosition);
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
              >
                {getMatboardsForTab(category).map((mat) => (
                  <div key={mat.id} className="flex items-start space-x-2">
                    <RadioGroupItem value={mat.id} id={`${category}-${mat.id}`} />
                    <div className="flex-1">
                      <Label 
                        htmlFor={`${category}-${mat.id}`} 
                        className="flex items-center cursor-pointer p-2 rounded-md hover:bg-accent"
                      >
                        <div 
                          className="w-8 h-8 rounded-md mr-2 border" 
                          style={{ 
                            backgroundColor: mat.color,
                            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)' 
                          }} 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{mat.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {mat.code} - {mat.manufacturer}
                          </p>
                        </div>
                      </Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </ScrollArea>
          </TabsContent>
        ))}
        
        {/* More Categories Tab */}
        {categories.length > 5 && (
          <TabsContent value="more" className="mt-0">
            <Card>
              <CardContent className="p-2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categories.slice(5).map(category => (
                    <button
                      key={category}
                      className="p-2 text-sm rounded-md border hover:bg-accent text-center"
                      onClick={() => setActiveTab(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}