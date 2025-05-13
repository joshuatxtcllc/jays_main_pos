import React, { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Image } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { Order } from '@shared/schema';
import { useOrders } from '@/hooks/use-orders';
import { useToast } from '@/hooks/use-toast';
import { uploadArtworkImage } from '@/services/fileService';

// For Type safety with Numeric/String conversions in the form
type FormValue<T> = T extends number ? string | number : T;

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
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Define typed state for form data with explicit string types
  type OrderFormData = {
    frameId: string;
    matColorId: string;
    glassOptionId: string;
    artworkWidth: string;
    artworkHeight: string;
    matWidth: string;
    artworkDescription: string;
    artworkType: string;
  };

  const [formData, setFormData] = useState<OrderFormData>({
    frameId: '',
    matColorId: '',
    glassOptionId: '',
    artworkWidth: '',
    artworkHeight: '',
    matWidth: '',
    artworkDescription: '',
    artworkType: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);

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
        artworkWidth: order.artworkWidth || '',
        artworkHeight: order.artworkHeight || '',
        matWidth: order.matWidth || '',
        artworkDescription: order.artworkDescription || '',
        artworkType: order.artworkType || '',
      });
    } else {
      setFormData({
        frameId: '',
        matColorId: '',
        glassOptionId: '',
        artworkWidth: '',
        artworkHeight: '',
        matWidth: '',
        artworkDescription: '',
        artworkType: '',
      });
    }
  }, [order]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Check if dimensions were modified to trigger recalculation
  const hasDimensionsChanged = () => {
    if (!order) return false;

    // Compare string representations to handle different types
    return (
      String(formData.artworkWidth) !== String(order.artworkWidth) ||
      String(formData.artworkHeight) !== String(order.artworkHeight) ||
      String(formData.matWidth) !== String(order.matWidth)
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setArtworkPreview(reader.result as string);
      setUploadingImage(false);
    };
    reader.onerror = () => {
      toast({
        title: "Error Reading File",
        description: "There was an error reading the selected file.",
        variant: "destructive",
      });
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (order && Object.keys(formData).length > 0) {
      // Determine if pricing needs to be recalculated based on dimension changes
      const dimensionsChanged = hasDimensionsChanged();

      // Convert form string values to the correct types for the API
      const orderUpdate: Partial<Order> = {
        frameId: formData.frameId || undefined,
        matColorId: formData.matColorId || undefined,
        glassOptionId: formData.glassOptionId || undefined,
        artworkWidth: formData.artworkWidth ? formData.artworkWidth : undefined,
        artworkHeight: formData.artworkHeight ? formData.artworkHeight : undefined,
        matWidth: formData.matWidth ? formData.matWidth : undefined,
        artworkDescription: formData.artworkDescription || undefined,
        artworkType: formData.artworkType || undefined
      };

      updateOrder({ 
        id: order.id, 
        data: orderUpdate,
        recalculatePricing: dimensionsChanged
      }, {
        onSuccess: async () => {
          // If dimensions changed, show additional message about pricing updates
          if (dimensionsChanged) {
            toast({
              title: 'Size Updated',
              description: 'Order dimensions and pricing have been recalculated',
              variant: 'default',
            });
          }

          if (artworkPreview) {
            try {
              await uploadArtworkImage(order.id, artworkPreview);
              toast({
                title: 'Artwork Updated',
                description: 'Order artwork has been updated',
                variant: 'default',
              });
            } catch (error) {
              console.error("Error uploading artwork image:", error);
              toast({
                title: "Image Upload Failed",
                description: "Order was updated but the artwork image failed to upload.",
                variant: "destructive",
              });
            }
          }
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
                value={formData.frameId?.toString() || ''} 
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
                value={formData.matColorId?.toString() || ''} 
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
                value={formData.glassOptionId?.toString() || ''} 
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
              value={formData.artworkWidth?.toString() || ''}
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
              value={formData.artworkHeight?.toString() || ''}
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
              value={formData.matWidth?.toString() || ''}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="artworkImage" className="text-right">
              Artwork Image
            </Label>
            <div className="col-span-3">
              <div className="flex items-center space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={triggerFileInput}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </>
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="artworkImage"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                {artworkPreview && (
                  <div className="relative border rounded-md p-1">
                    <img 
                      src={artworkPreview} 
                      alt="Artwork preview" 
                      className="h-16 object-cover rounded" 
                    />
                  </div>
                )}
                {!artworkPreview && order.artworkImagePath && (
                  <div className="text-sm flex items-center text-muted-foreground">
                    <Image className="h-4 w-4 mr-1" />
                    Existing artwork image available
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="artworkDescription" className="text-right">
              Description
            </Label>
            <Input
              id="artworkDescription"
              name="artworkDescription"
              value={formData.artworkDescription?.toString() || ''}
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
              value={formData.artworkType?.toString() || ''}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isUpdatingOrder || uploadingImage}>
            {(isUpdatingOrder || uploadingImage) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}