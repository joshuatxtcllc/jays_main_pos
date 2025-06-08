import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, RotateCcw, Move, ZoomIn, ZoomOut } from 'lucide-react';

interface FrameDesign {
  id: string;
  frameName: string;
  matColor: string;
  glassType: string;
  dimensions: {
    width: number;
    height: number;
    unit: string;
  };
  artworkImage?: string;
  totalPrice: number;
}

interface DualPreviewSystemProps {
  primaryDesign?: FrameDesign;
  comparisonDesign?: FrameDesign;
  onDesignSelect?: (design: FrameDesign) => void;
  onCompareToggle?: (enabled: boolean) => void;
}

export function DualPreviewSystem({ 
  primaryDesign, 
  comparisonDesign, 
  onDesignSelect, 
  onCompareToggle 
}: DualPreviewSystemProps) {
  const [compareMode, setCompareMode] = useState(false);
  const [primaryZoom, setPrimaryZoom] = useState(1);
  const [comparisonZoom, setComparisonZoom] = useState(1);
  const [primaryRotation, setPrimaryRotation] = useState(0);
  const [comparisonRotation, setComparisonRotation] = useState(0);

  useEffect(() => {
    if (onCompareToggle) {
      onCompareToggle(compareMode);
    }
  }, [compareMode, onCompareToggle]);

  const FramePreview = ({ 
    design, 
    title, 
    zoom, 
    rotation, 
    onZoomChange, 
    onRotationChange,
    isComparison = false 
  }: {
    design?: FrameDesign;
    title: string;
    zoom: number;
    rotation: number;
    onZoomChange: (zoom: number) => void;
    onRotationChange: (rotation: number) => void;
    isComparison?: boolean;
  }) => {
    if (!design) {
      return (
        <Card className={`h-96 ${isComparison ? 'border-orange-200' : 'border-blue-200'}`}>
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <Eye className="mx-auto mb-2 h-12 w-12" />
              <p>No design selected</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={`${isComparison ? 'border-orange-200' : 'border-blue-200'}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Badge variant={isComparison ? 'secondary' : 'default'}>
              ${design.totalPrice.toFixed(2)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Frame Preview Container */}
          <div className="relative h-64 bg-gray-50 rounded-lg overflow-hidden border-2 border-gray-200 mb-4">
            {/* Simulated Frame */}
            <div 
              className="absolute inset-4 border-8 rounded-sm shadow-lg transition-transform duration-200"
              style={{
                borderColor: design.matColor === 'black' ? '#2C2C2C' : 
                           design.matColor === 'crescent-ultramarine' ? '#4166B0' : 
                           design.matColor || '#8B4513',
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center'
              }}
            >
              {/* Mat */}
              <div className="relative h-full bg-white border-4" style={{
                borderColor: design.matColor === 'black' ? '#2C2C2C' : 
                           design.matColor === 'crescent-ultramarine' ? '#4166B0' : 
                           design.matColor || '#F5F5DC'
              }}>
                {/* Artwork Area */}
                <div className="absolute inset-4 bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                  {design.artworkImage ? (
                    <img 
                      src={design.artworkImage} 
                      alt="Artwork" 
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <span>Artwork Preview</span>
                  )}
                </div>
              </div>
            </div>

            {/* Glass Effect Overlay */}
            <div className="absolute inset-4 bg-gradient-to-br from-transparent via-white/10 to-transparent pointer-events-none rounded-sm"></div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
              <span className="text-xs font-mono">{(zoom * 100).toFixed(0)}%</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onZoomChange(Math.min(2, zoom + 0.1))}
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onRotationChange(rotation + 90)}
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>

          {/* Design Details */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Frame:</span>
              <span className="font-medium">{design.frameName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dimensions:</span>
              <span className="font-medium">
                {design.dimensions.width}" × {design.dimensions.height}"
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Glass:</span>
              <span className="font-medium">{design.glassType}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Frame Preview</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant={compareMode ? "default" : "outline"}
            size="sm"
            onClick={() => setCompareMode(!compareMode)}
          >
            {compareMode ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            Compare Mode
          </Button>
        </div>
      </div>

      {/* Preview Grid */}
      <div className={`grid gap-4 ${compareMode ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Primary Preview */}
        <FramePreview
          design={primaryDesign}
          title="Primary Design"
          zoom={primaryZoom}
          rotation={primaryRotation}
          onZoomChange={setPrimaryZoom}
          onRotationChange={setPrimaryRotation}
        />

        {/* Comparison Preview */}
        {compareMode && (
          <FramePreview
            design={comparisonDesign}
            title="Comparison Design"
            zoom={comparisonZoom}
            rotation={comparisonRotation}
            onZoomChange={setComparisonZoom}
            onRotationChange={setComparisonRotation}
            isComparison={true}
          />
        )}
      </div>

      {/* Comparison Actions */}
      {compareMode && primaryDesign && comparisonDesign && (
        <Card className="bg-gray-50">
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Price Comparison</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Primary:</span>
                    <span>${primaryDesign.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comparison:</span>
                    <span>${comparisonDesign.totalPrice.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Difference:</span>
                    <span className={
                      primaryDesign.totalPrice < comparisonDesign.totalPrice 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }>
                      ${Math.abs(primaryDesign.totalPrice - comparisonDesign.totalPrice).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => onDesignSelect?.(primaryDesign)}
                  >
                    Select Primary
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => onDesignSelect?.(comparisonDesign)}
                  >
                    Select Comparison
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Design Notes</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Zoom and rotate to examine details</p>
                  <p>• Compare pricing and materials</p>
                  <p>• Select preferred design for order</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}