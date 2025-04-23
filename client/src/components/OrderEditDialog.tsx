import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { Order } from '@shared/schema';
import { useOrders } from '@/hooks/use-orders';

// Interface for frame data
interface Frame {
  id: string;
  name: string;
}

// Interface for mat color data
interface MatColor {
  id: string;
  name: string;
}

// Interface for glass option data
interface GlassOption {
  id: string;
  name: string;
}

interface OrderEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export function OrderEditDialog({ isOpen, onClose, order }: OrderEditDialogProps) {
  const { updateOrder, isUpdatingOrder } = useOrders();
  const [formData, setFormData] = useState<Partial<Order>>({});

  // Fetch necessary reference data
  const { data: frames } = useQuery({
    queryKey: ['/api/frames'],
    queryFn: async () => {
      const res = await fetch('/api/frames');
      if (!res.ok) {
        throw new Error('Failed to fetch frames');
      }
      return res.json();
    },
  });

  const { data: matColors } = useQuery({
    queryKey: ['/api/larson-catalog/crescent'],
    queryFn: async () => {
      const res = await fetch('/api/larson-catalog/crescent');
      if (!res.ok) {
        throw new Error('Failed to fetch mat colors');
      }
      return res.json();
    },
  });

  const { data: glassOptions } = useQuery({
    queryKey: ['/api/glass-options'],
    queryFn: async () => {
      const res = await fetch('/api/glass-options');
      if (!res.ok) {
        throw new Error('Failed to fetch glass options');
      }
      return res.json();
    },
  });

  // Initialize form data when order changes
  useEffect(() => {
    if (order) {
      setFormData({
        frameId: order.frameId || '',
        matColorId: order.matColorId || '',
        glassOptionId: order.glassOptionId || '',
        artworkWidth: order.artworkWidth,
        artworkHeight: order.artworkHeight,
        matWidth: order.matWidth,
        artworkDescription: order.artworkDescription || '',
        artworkType: order.artworkType || '',
      });
    } else {
      setFormData({});
    }
  }, [order]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (order && Object.keys(formData).length > 0) {
      updateOrder({ 
        id: order.id, 
        data: formData 
      }, {
        onSuccess: () => {
          onClose();
        }
      });
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Order #{order.id}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="frameId" className="text-right">
              Frame
            </Label>
            <div className="col-span-3">
              <Select 
                value={formData.frameId} 
                onValueChange={(value) => handleSelectChange('frameId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a frame" />
                </SelectTrigger>
                <SelectContent>
                  {frames && frames.map((frame: any) => (
                    <SelectItem key={frame.id} value={frame.id}>
                      {frame.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="matColorId" className="text-right">
              Mat Color
            </Label>
            <div className="col-span-3">
              <Select 
                value={formData.matColorId} 
                onValueChange={(value) => handleSelectChange('matColorId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a mat color" />
                </SelectTrigger>
                <SelectContent>
                  {matColors && matColors.map((mat: any) => (
                    <SelectItem key={mat.id} value={mat.id}>
                      {mat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="glassOptionId" className="text-right">
              Glass Option
            </Label>
            <div className="col-span-3">
              <Select 
                value={formData.glassOptionId} 
                onValueChange={(value) => handleSelectChange('glassOptionId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select glass" />
                </SelectTrigger>
                <SelectContent>
                  {glassOptions && glassOptions.map((glass: any) => (
                    <SelectItem key={glass.id} value={glass.id}>
                      {glass.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="artworkWidth" className="text-right">
              Width (inches)
            </Label>
            <Input
              id="artworkWidth"
              name="artworkWidth"
              type="number"
              step="0.125"
              value={formData.artworkWidth}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="artworkHeight" className="text-right">
              Height (inches)
            </Label>
            <Input
              id="artworkHeight"
              name="artworkHeight"
              type="number"
              step="0.125"
              value={formData.artworkHeight}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="matWidth" className="text-right">
              Mat Width (inches)
            </Label>
            <Input
              id="matWidth"
              name="matWidth"
              type="number"
              step="0.125"
              value={formData.matWidth}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="artworkDescription" className="text-right">
              Description
            </Label>
            <Input
              id="artworkDescription"
              name="artworkDescription"
              value={formData.artworkDescription}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="artworkType" className="text-right">
              Type
            </Label>
            <Input
              id="artworkType"
              name="artworkType"
              value={formData.artworkType}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isUpdatingOrder}>
            {isUpdatingOrder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}