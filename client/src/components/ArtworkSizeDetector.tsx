import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Upload, Camera, Ruler, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ArtworkSizeDetector as Detector, ArtworkDimensions, createImageFromFile } from '@/lib/artworkSizeDetector';

interface ArtworkSizeDetectorProps {
  onDimensionsDetected: (dimensions: ArtworkDimensions, imageDataUrl: string) => void;
  defaultWidth?: number;
  defaultHeight?: number;
}

export function ArtworkSizeDetector({
  onDimensionsDetected,
  defaultWidth = 8,
  defaultHeight = 10
}: ArtworkSizeDetectorProps) {
  const { toast } = useToast();
  const [detector, setDetector] = useState<Detector | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<string>('upload');
  const [dimensions, setDimensions] = useState<ArtworkDimensions>({
    width: defaultWidth,
    height: defaultHeight,
    unit: 'in'
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [manualEntry, setManualEntry] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize detector on component mount
  useEffect(() => {
    const initDetector = async () => {
      try {
        const newDetector = new Detector();
        await newDetector.initialize();
        setDetector(newDetector);
      } catch (error) {
        console.error('Failed to initialize artwork detector:', error);
        toast({
          title: 'Initialization Error',
          description: 'Failed to initialize artwork size detection. Manual entry will be used instead.',
          variant: 'destructive'
        });
        setManualEntry(true);
      }
    };

    initDetector();

    // Cleanup
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  // Handle file selection
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload an image file (JPG, PNG, etc.)',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Create data URL for preview
      const dataUrl = URL.createObjectURL(file);
      setImagePreview(dataUrl);

      if (detector) {
        // Convert file to Image element
        const image = await createImageFromFile(file);
        
        // Detect dimensions
        const detectedDimensions = await detector.estimateDimensions(image);
        setDimensions(detectedDimensions);
        
        // Convert to data URL for passing to parent
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgDataUrl = e.target?.result as string;
          onDimensionsDetected(detectedDimensions, imgDataUrl);
        };
        reader.readAsDataURL(file);
        
        toast({
          title: 'Dimensions Detected',
          description: `Detected artwork size: ${detectedDimensions.width}" × ${detectedDimensions.height}"`,
        });
      } else {
        // If detector isn't available, just pass the image
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgDataUrl = e.target?.result as string;
          onDimensionsDetected(dimensions, imgDataUrl);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: 'Processing Error',
        description: 'Failed to process image. Please try again or enter dimensions manually.',
        variant: 'destructive'
      });
      setManualEntry(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Handle manual dimension change
  const handleDimensionChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setDimensions(prev => ({
        ...prev,
        [dimension]: numValue
      }));
    }
  };

  // Handle applying manual dimensions
  const handleApplyManualDimensions = () => {
    if (imagePreview) {
      onDimensionsDetected(dimensions, imagePreview);
      toast({
        title: 'Dimensions Updated',
        description: `Manual dimensions set to ${dimensions.width}" × ${dimensions.height}"`,
      });
    } else {
      toast({
        title: 'No Image Selected',
        description: 'Please upload an image first.',
        variant: 'destructive'
      });
    }
  };

  // Handle webcam access
  const startWebcam = async () => {
    try {
      // Request access to the environment-facing camera (rear camera on mobile)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { exact: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      }).catch(() => {
        // Fallback to any available camera if environment camera isn't available
        return navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          } 
        });
      });
      
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      toast({
        title: 'Webcam Error',
        description: 'Failed to access camera. Please check permissions or use file upload instead.',
        variant: 'destructive'
      });
    }
  };

  // Handle stopping webcam
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      if (webcamRef.current) {
        webcamRef.current.srcObject = null;
      }
    }
  };

  // Handle webcam tab change
  useEffect(() => {
    if (tab === 'webcam') {
      startWebcam();
    } else {
      stopWebcam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // Handle webcam capture
  const captureFromWebcam = async () => {
    if (!webcamRef.current || !streamRef.current) {
      toast({
        title: 'Webcam Not Ready',
        description: 'Webcam is not ready. Please try again.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Create canvas to capture frame
      const canvas = document.createElement('canvas');
      canvas.width = webcamRef.current.videoWidth;
      canvas.height = webcamRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      // Draw video frame to canvas
      ctx.drawImage(webcamRef.current, 0, 0);
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImagePreview(dataUrl);

      if (detector) {
        // Create image from data URL for detection
        const img = new Image();
        img.onload = async () => {
          try {
            // Detect dimensions
            const detectedDimensions = await detector.estimateDimensions(img);
            
            // Validate dimensions are within reasonable ranges for framing
            const isValidSize = 
              detectedDimensions.width >= 2 && 
              detectedDimensions.width <= 60 && 
              detectedDimensions.height >= 2 && 
              detectedDimensions.height <= 60;
            
            if (isValidSize) {
              setDimensions(detectedDimensions);
              onDimensionsDetected(detectedDimensions, dataUrl);
              
              toast({
                title: 'Dimensions Detected',
                description: `Detected artwork size: ${detectedDimensions.width}" × ${detectedDimensions.height}"`,
              });
            } else {
              // If dimensions are unreasonable, fall back to default dimensions
              const defaultDimensions = {
                width: 16,
                height: Math.round((16 / img.width) * img.height * 10) / 10,
                unit: 'in' as const
              };
              
              setDimensions(defaultDimensions);
              onDimensionsDetected(defaultDimensions, dataUrl);
              
              toast({
                title: 'Detection Adjusted',
                description: `Using standard dimensions. Please verify or adjust manually.`,
                variant: 'warning'
              });
              
              // Show manual entry for user to adjust
              setManualEntry(true);
            }
          } catch (error) {
            console.error('Error detecting dimensions:', error);
            toast({
              title: 'Detection Error',
              description: 'Failed to detect dimensions. Please try again or enter manually.',
              variant: 'destructive'
            });
            setManualEntry(true);
            onDimensionsDetected(dimensions, dataUrl);
          } finally {
            setLoading(false);
          }
        };
        img.onerror = () => {
          toast({
            title: 'Image Error',
            description: 'Failed to process captured image.',
            variant: 'destructive'
          });
          setLoading(false);
        };
        img.src = dataUrl;
      } else {
        // If detector isn't available, just use default dimensions
        onDimensionsDetected(dimensions, dataUrl);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error capturing from webcam:', error);
      toast({
        title: 'Capture Error',
        description: 'Failed to capture image from webcam.',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  // Handle download reference marker
  const downloadMarker = () => {
    if (detector) {
      detector.downloadMarker();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Artwork Size Detection</CardTitle>
        <CardDescription>
          Upload an image of your artwork with a reference marker to automatically determine its size.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Reference marker section */}
          <div className="bg-muted p-4 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium mb-1">Reference Marker (Required for Accurate Measurement)</h4>
                <p className="text-sm text-muted-foreground">
                  For accurate size detection, download and print this marker, then place it next to your artwork before taking a photo. For best results, make sure the marker is printed at exactly 5cm × 5cm and is clearly visible in the photo.
                </p>
              </div>
              <Button onClick={downloadMarker} variant="outline" size="sm">
                Download Marker
              </Button>
            </div>
          </div>

          {/* Image upload/capture tabs */}
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </TabsTrigger>
              <TabsTrigger value="webcam">
                <Camera className="mr-2 h-4 w-4" />
                Use Webcam
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <div 
                className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileInputChange}
                  disabled={loading}
                />
                <div className="text-center">
                  {loading ? (
                    <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mx-auto" />
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium">Click to upload artwork image</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG or GIF, max 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="webcam" className="space-y-4">
              <div className="rounded-md overflow-hidden bg-black">
                <video 
                  ref={webcamRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-auto"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
              </div>
              <Button 
                onClick={captureFromWebcam} 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Capture Image
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>

          {/* Image preview */}
          {imagePreview && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Image Preview</h4>
              <div className="rounded-md overflow-hidden border bg-muted/20">
                <img 
                  src={imagePreview} 
                  alt="Artwork preview" 
                  className="w-full h-auto object-contain"
                  style={{ maxHeight: '200px' }}
                />
              </div>
            </div>
          )}

          {/* Manual dimensions input */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Artwork Dimensions</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setManualEntry(!manualEntry)}
              >
                {manualEntry ? 'Hide Manual Entry' : 'Edit Manually'}
              </Button>
            </div>
            
            {manualEntry ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="width">Width (inches)</Label>
                    <Input 
                      id="width"
                      type="number" 
                      step="0.01"
                      min="0.1"
                      value={dimensions.width}
                      onChange={(e) => handleDimensionChange('width', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="height">Height (inches)</Label>
                    <Input 
                      id="height"
                      type="number"
                      step="0.01"
                      min="0.1" 
                      value={dimensions.height}
                      onChange={(e) => handleDimensionChange('height', e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleApplyManualDimensions} size="sm">
                  Apply Dimensions
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-muted p-3 rounded-md">
                <Ruler className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">
                  {dimensions.width}" × {dimensions.height}"
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <div className="flex items-start space-x-2">
          <ImageIcon className="h-4 w-4 mt-0.5" />
          <div>
            <p>For best results, ensure the reference marker is clearly visible and on the same plane as your artwork.</p>
            <p className="mt-1">The marker should be printed at exactly 5cm × 5cm size.</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}