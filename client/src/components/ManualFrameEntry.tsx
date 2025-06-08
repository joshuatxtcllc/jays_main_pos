import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ManualFrameEntryProps {
  onFrameAdd?: (frame: any) => void;
  useManualFrame?: boolean;
  onToggleManualFrame?: (toggle: boolean) => void;
  frameName?: string;
  onFrameNameChange?: (name: string) => void;
  frameCost?: number;
  onFrameCostChange?: (cost: number) => void;
}

export default function ManualFrameEntry({ 
  onFrameAdd,
  useManualFrame,
  onToggleManualFrame,
  frameName,
  onFrameNameChange,
  frameCost,
  onFrameCostChange
}: ManualFrameEntryProps) {
  const [frameData, setFrameData] = useState({
    name: '',
    manufacturer: '',
    material: 'wood',
    width: '',
    depth: '',
    price: '',
    color: '#8B4513'
  });

  const [mouldingData, setMouldingData] = useState({
    itemNumber: '',
    pricePerFoot: '',
    name: '',
    manufacturer: '',
    material: 'wood',
    width: '',
    depth: '',
    color: '#8B4513'
  });

  const handleFrameSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!frameData.name || !frameData.price || !frameData.width) {
      alert('Please fill in all required fields');
      return;
    }

    const newFrame = {
      id: `manual-${Date.now()}`,
      ...frameData,
      catalogImage: '',
      edgeTexture: '',
      corner: ''
    };

    onFrameAdd(newFrame);

    // Reset form
    setFrameData({
      name: '',
      manufacturer: '',
      material: 'wood',
      width: '',
      depth: '',
      price: '',
      color: '#8B4513'
    });
  };

  const handleMouldingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!mouldingData.itemNumber || !mouldingData.pricePerFoot) {
      alert('Please enter both item number and price per foot');
      return;
    }

    const newFrame = {
      id: `moulding-${mouldingData.itemNumber}`,
      name: mouldingData.name || `Moulding ${mouldingData.itemNumber}`,
      manufacturer: mouldingData.manufacturer || 'Custom',
      material: mouldingData.material,
      width: mouldingData.width || '2.25',
      depth: mouldingData.depth || '1.25',
      price: mouldingData.pricePerFoot,
      color: mouldingData.color,
      itemNumber: mouldingData.itemNumber,
      catalogImage: '',
      edgeTexture: '',
      corner: ''
    };

    onFrameAdd(newFrame);

    // Reset form
    setMouldingData({
      itemNumber: '',
      pricePerFoot: '',
      name: '',
      manufacturer: '',
      material: 'wood',
      width: '',
      depth: '',
      color: '#8B4513'
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Add Frame/Moulding</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="frame" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="frame">Custom Frame</TabsTrigger>
            <TabsTrigger value="moulding">Moulding Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="frame">
            <form onSubmit={handleFrameSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Frame Name *</Label>
                <Input
                  id="name"
                  value={frameData.name}
                  onChange={(e) => setFrameData({ ...frameData, name: e.target.value })}
                  placeholder="Enter frame name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={frameData.manufacturer}
                  onChange={(e) => setFrameData({ ...frameData, manufacturer: e.target.value })}
                  placeholder="Enter manufacturer"
                />
              </div>

              <div>
                <Label htmlFor="material">Material</Label>
                <select
                  id="material"
                  value={frameData.material}
                  onChange={(e) => setFrameData({ ...frameData, material: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="wood">Wood</option>
                  <option value="metal">Metal</option>
                  <option value="plastic">Plastic</option>
                  <option value="composite">Composite</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="width">Width (inches) *</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.125"
                    value={frameData.width}
                    onChange={(e) => setFrameData({ ...frameData, width: e.target.value })}
                    placeholder="2.25"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="depth">Depth (inches)</Label>
                  <Input
                    id="depth"
                    type="number"
                    step="0.125"
                    value={frameData.depth}
                    onChange={(e) => setFrameData({ ...frameData, depth: e.target.value })}
                    placeholder="1.25"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="price">Price per Foot *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={frameData.price}
                  onChange={(e) => setFrameData({ ...frameData, price: e.target.value })}
                  placeholder="12.99"
                  required
                />
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={frameData.color}
                  onChange={(e) => setFrameData({ ...frameData, color: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full">
                Add Frame
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="moulding">
            <form onSubmit={handleMouldingSubmit} className="space-y-4">
              <div>
                <Label htmlFor="itemNumber">Moulding Item Number *</Label>
                <Input
                  id="itemNumber"
                  value={mouldingData.itemNumber}
                  onChange={(e) => setMouldingData({ ...mouldingData, itemNumber: e.target.value })}
                  placeholder="e.g., 4512, 210286, L-100"
                  required
                />
              </div>

              <div>
                <Label htmlFor="pricePerFoot">Price per Foot *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="pricePerFoot"
                    type="number"
                    step="0.01"
                    min="0"
                    value={mouldingData.pricePerFoot}
                    onChange={(e) => setMouldingData({ ...mouldingData, pricePerFoot: e.target.value })}
                    placeholder="12.99"
                    className="pl-7"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="mouldingName">Name (Optional)</Label>
                <Input
                  id="mouldingName"
                  value={mouldingData.name}
                  onChange={(e) => setMouldingData({ ...mouldingData, name: e.target.value })}
                  placeholder="Auto-generated if left blank"
                />
              </div>

              <div>
                <Label htmlFor="mouldingManufacturer">Manufacturer (Optional)</Label>
                <Input
                  id="mouldingManufacturer"
                  value={mouldingData.manufacturer}
                  onChange={(e) => setMouldingData({ ...mouldingData, manufacturer: e.target.value })}
                  placeholder="e.g., Larson-Juhl, Nielsen"
                />
              </div>

              <div>
                <Label htmlFor="mouldingMaterial">Material</Label>
                <select
                  id="mouldingMaterial"
                  value={mouldingData.material}
                  onChange={(e) => setMouldingData({ ...mouldingData, material: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="wood">Wood</option>
                  <option value="metal">Metal</option>
                  <option value="plastic">Plastic</option>
                  <option value="composite">Composite</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="mouldingWidth">Width (inches)</Label>
                  <Input
                    id="mouldingWidth"
                    type="number"
                    step="0.125"
                    value={mouldingData.width}
                    onChange={(e) => setMouldingData({ ...mouldingData, width: e.target.value })}
                    placeholder="2.25"
                  />
                </div>
                <div>
                  <Label htmlFor="mouldingDepth">Depth (inches)</Label>
                  <Input
                    id="mouldingDepth"
                    type="number"
                    step="0.125"
                    value={mouldingData.depth}
                    onChange={(e) => setMouldingData({ ...mouldingData, depth: e.target.value })}
                    placeholder="1.25"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="mouldingColor">Color</Label>
                <Input
                  id="mouldingColor"
                  type="color"
                  value={mouldingData.color}
                  onChange={(e) => setMouldingData({ ...mouldingData, color: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full">
                Add Moulding
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}