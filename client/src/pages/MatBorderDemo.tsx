import React, { useState } from 'react';
import FrameVisualizer from '@/components/FrameVisualizer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Sample data that matches our schema types
const sampleMats = [
  { 
    id: "mat-1", 
    name: 'White', 
    color: '#FFFFFF', 
    category: 'Standard', 
    manufacturer: 'Crescent',
    price: "2.50",
    code: "WH123",
    description: "Pure white matboard"
  },
  { 
    id: "mat-2", 
    name: 'Black', 
    color: '#000000', 
    category: 'Standard', 
    manufacturer: 'Crescent',
    price: "2.50",
    code: "BK123",
    description: "Deep black matboard"
  },
  { 
    id: "mat-3", 
    name: 'Soft Blue', 
    color: '#A4C2F4', 
    category: 'Colors', 
    manufacturer: 'Crescent',
    price: "3.00",
    code: "BL123",
    description: "Gentle blue matboard"
  },
  { 
    id: "mat-4", 
    name: 'Forest Green', 
    color: '#38761D', 
    category: 'Colors', 
    manufacturer: 'Crescent',
    price: "3.00",
    code: "GR123",
    description: "Rich green matboard"
  },
  { 
    id: "mat-5", 
    name: 'Burgundy', 
    color: '#85200C', 
    category: 'Colors', 
    manufacturer: 'Crescent',
    price: "3.00",
    code: "BU123",
    description: "Deep red matboard"
  },
  { 
    id: "mat-6", 
    name: 'Cream', 
    color: '#F9F2E7', 
    category: 'Standard', 
    manufacturer: 'Crescent',
    price: "2.50",
    code: "CR123",
    description: "Subtle cream matboard"
  },
];

const sampleFrames = [
  { 
    id: 'frame-1', 
    name: 'Classic Black', 
    width: "1.25", 
    depth: "0.75",
    color: '#000000', 
    manufacturer: 'Larson', 
    material: 'Wood',
    price: "12.50",
    catalogImage: "/images/frame-black.jpg",
    edgeTexture: null,
    corner: null
  },
  { 
    id: 'frame-2', 
    name: 'Gold Leaf', 
    width: "1.5", 
    depth: "0.75",
    color: '#D4AF37', 
    manufacturer: 'Larson', 
    material: 'Metal',
    price: "15.00",
    catalogImage: "/images/frame-gold.jpg",
    edgeTexture: null,
    corner: null
  },
  { 
    id: 'frame-3', 
    name: 'Walnut', 
    width: "1.0", 
    depth: "0.5",
    color: '#5C4033', 
    manufacturer: 'Roma', 
    material: 'Wood',
    price: "10.00",
    catalogImage: "/images/frame-walnut.jpg",
    edgeTexture: null,
    corner: null
  },
  { 
    id: 'frame-4', 
    name: 'Silver Modern', 
    width: "0.75", 
    depth: "0.5",
    color: '#C0C0C0', 
    manufacturer: 'Nielsen', 
    material: 'Metal',
    price: "9.50",
    catalogImage: "/images/frame-silver.jpg",
    edgeTexture: null,
    corner: null
  },
];

const MatBorderDemo = () => {
  const [artworkWidth, setArtworkWidth] = useState(16);
  const [artworkHeight, setArtworkHeight] = useState(20);
  const [useMultipleMats, setUseMultipleMats] = useState(true);
  const [useMultipleFrames, setUseMultipleFrames] = useState(false);
  
  // State for selected mats
  const [selectedMats, setSelectedMats] = useState([
    { 
      matboard: sampleMats[0], // White
      position: 3, // Bottom mat (closest to artwork)
      width: 2,
      offset: 0
    },
    { 
      matboard: sampleMats[2], // Soft Blue
      position: 2, // Middle mat
      width: 0.5,
      offset: 0.25
    },
    { 
      matboard: sampleMats[4], // Burgundy
      position: 1, // Top mat (furthest from artwork)
      width: 0.25,
      offset: 0.25
    }
  ]);
  
  // State for selected frames
  const [selectedFrames, setSelectedFrames] = useState([
    {
      frame: sampleFrames[0], // Black frame
      position: 1, // Inner frame
      distance: 0
    },
    {
      frame: sampleFrames[1], // Gold frame
      position: 2, // Outer frame
      distance: 0.5
    }
  ]);
  
  // Function to update mat colors
  const updateMatColor = (position: number, matId: number) => {
    const selectedMat = sampleMats.find(mat => mat.id === matId);
    if (selectedMat) {
      const updatedMats = selectedMats.map(mat => {
        if (mat.position === position) {
          return { ...mat, matboard: selectedMat };
        }
        return mat;
      });
      setSelectedMats(updatedMats);
    }
  };
  
  // Function to update mat widths
  const updateMatWidth = (position: number, width: number) => {
    const updatedMats = selectedMats.map(mat => {
      if (mat.position === position) {
        return { ...mat, width };
      }
      return mat;
    });
    setSelectedMats(updatedMats);
  };
  
  // Function to update frame selection
  const updateFrame = (position: number, frameId: string) => {
    const selectedFrame = sampleFrames.find(frame => frame.id === frameId);
    if (selectedFrame) {
      const updatedFrames = selectedFrames.map(frame => {
        if (frame.position === position) {
          return { ...frame, frame: selectedFrame };
        }
        return frame;
      });
      setSelectedFrames(updatedFrames);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mat Border Enhancement Demo</h1>
      <p className="mb-8 text-muted-foreground">
        This demo shows the new thin contrast lines along the inside edges of mats, 
        making it easier to distinguish between different mats when using multiple mats.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Frame Preview</CardTitle>
              <CardDescription>
                See how your artwork will look with the selected mats and frames
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center">
              <FrameVisualizer
                frames={useMultipleFrames ? selectedFrames : [selectedFrames[0]]}
                mats={useMultipleMats ? selectedMats : [selectedMats[0]]}
                artworkWidth={artworkWidth}
                artworkHeight={artworkHeight}
                artworkImage={null}
                useMultipleMats={useMultipleMats}
                useMultipleFrames={useMultipleFrames}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-5">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Customize your framing options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Artwork Dimensions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (inches)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={artworkWidth}
                      onChange={(e) => setArtworkWidth(Number(e.target.value))}
                      min={1}
                      max={60}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (inches)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={artworkHeight}
                      onChange={(e) => setArtworkHeight(Number(e.target.value))}
                      min={1}
                      max={60}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="multiple-mats">Use Multiple Mats</Label>
                  <Switch
                    id="multiple-mats"
                    checked={useMultipleMats}
                    onCheckedChange={setUseMultipleMats}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="multiple-frames">Use Multiple Frames</Label>
                  <Switch
                    id="multiple-frames"
                    checked={useMultipleFrames}
                    onCheckedChange={setUseMultipleFrames}
                  />
                </div>
              </div>
              
              {useMultipleMats ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Mat Configuration</h3>
                  
                  {/* Bottom Mat (closest to artwork) */}
                  <div className="space-y-3 p-3 border rounded-md">
                    <h4 className="font-medium">Bottom Mat (closest to artwork)</h4>
                    <div className="space-y-2">
                      <Label htmlFor="bottom-mat-color">Color</Label>
                      <Select 
                        value={selectedMats[0].matboard.id.toString()} 
                        onValueChange={(value) => updateMatColor(3, Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a color" />
                        </SelectTrigger>
                        <SelectContent>
                          {sampleMats.map((mat) => (
                            <SelectItem key={mat.id} value={mat.id.toString()}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full border" 
                                  style={{ backgroundColor: mat.color }}
                                ></div>
                                <span>{mat.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="bottom-mat-width">Width: {selectedMats[0].width}"</Label>
                      </div>
                      <Slider
                        id="bottom-mat-width"
                        min={1}
                        max={4}
                        step={0.25}
                        value={[selectedMats[0].width]}
                        onValueChange={(value) => updateMatWidth(3, value[0])}
                      />
                    </div>
                  </div>
                  
                  {/* Middle Mat */}
                  <div className="space-y-3 p-3 border rounded-md">
                    <h4 className="font-medium">Middle Mat</h4>
                    <div className="space-y-2">
                      <Label htmlFor="middle-mat-color">Color</Label>
                      <Select 
                        value={selectedMats[1].matboard.id.toString()} 
                        onValueChange={(value) => updateMatColor(2, Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a color" />
                        </SelectTrigger>
                        <SelectContent>
                          {sampleMats.map((mat) => (
                            <SelectItem key={mat.id} value={mat.id.toString()}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full border" 
                                  style={{ backgroundColor: mat.color }}
                                ></div>
                                <span>{mat.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="middle-mat-width">Width: {selectedMats[1].width}"</Label>
                      </div>
                      <Slider
                        id="middle-mat-width"
                        min={0.25}
                        max={1}
                        step={0.25}
                        value={[selectedMats[1].width]}
                        onValueChange={(value) => updateMatWidth(2, value[0])}
                      />
                    </div>
                  </div>
                  
                  {/* Top Mat (furthest from artwork) */}
                  <div className="space-y-3 p-3 border rounded-md">
                    <h4 className="font-medium">Top Mat (furthest from artwork)</h4>
                    <div className="space-y-2">
                      <Label htmlFor="top-mat-color">Color</Label>
                      <Select 
                        value={selectedMats[2].matboard.id.toString()} 
                        onValueChange={(value) => updateMatColor(1, Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a color" />
                        </SelectTrigger>
                        <SelectContent>
                          {sampleMats.map((mat) => (
                            <SelectItem key={mat.id} value={mat.id.toString()}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full border" 
                                  style={{ backgroundColor: mat.color }}
                                ></div>
                                <span>{mat.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="top-mat-width">Width: {selectedMats[2].width}"</Label>
                      </div>
                      <Slider
                        id="top-mat-width"
                        min={0.25}
                        max={1}
                        step={0.25}
                        value={[selectedMats[2].width]}
                        onValueChange={(value) => updateMatWidth(1, value[0])}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Single Mat Configuration</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="single-mat-color">Color</Label>
                      <Select 
                        value={selectedMats[0].matboard.id.toString()} 
                        onValueChange={(value) => updateMatColor(3, Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a color" />
                        </SelectTrigger>
                        <SelectContent>
                          {sampleMats.map((mat) => (
                            <SelectItem key={mat.id} value={mat.id.toString()}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full border" 
                                  style={{ backgroundColor: mat.color }}
                                ></div>
                                <span>{mat.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="single-mat-width">Width: {selectedMats[0].width}"</Label>
                      </div>
                      <Slider
                        id="single-mat-width"
                        min={1}
                        max={4}
                        step={0.25}
                        value={[selectedMats[0].width]}
                        onValueChange={(value) => updateMatWidth(3, value[0])}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Frame Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Frame Configuration</h3>
                
                {/* Inner Frame */}
                <div className="space-y-3 p-3 border rounded-md">
                  <h4 className="font-medium">Inner Frame</h4>
                  <div className="space-y-2">
                    <Label htmlFor="inner-frame">Style</Label>
                    <Select 
                      value={selectedFrames[0].frame.id} 
                      onValueChange={(value) => updateFrame(1, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a frame" />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleFrames.map((frame) => (
                          <SelectItem key={frame.id} value={frame.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-sm border" 
                                style={{ backgroundColor: frame.color }}
                              ></div>
                              <span>{frame.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {useMultipleFrames && (
                  <div className="space-y-3 p-3 border rounded-md">
                    <h4 className="font-medium">Outer Frame</h4>
                    <div className="space-y-2">
                      <Label htmlFor="outer-frame">Style</Label>
                      <Select 
                        value={selectedFrames[1].frame.id} 
                        onValueChange={(value) => updateFrame(2, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a frame" />
                        </SelectTrigger>
                        <SelectContent>
                          {sampleFrames.map((frame) => (
                            <SelectItem key={frame.id} value={frame.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-sm border" 
                                  style={{ backgroundColor: frame.color }}
                                ></div>
                                <span>{frame.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Notice the thin contrast lines along the inside edges of each mat, making it easier to distinguish the different mat layers.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MatBorderDemo;