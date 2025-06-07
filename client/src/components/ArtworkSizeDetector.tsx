import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, Upload, Camera, Ruler, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ArtworkSizeDetector as Detector, ArtworkDimensions, createImageFromFile } from '@/lib/artworkSizeDetector';
import { Frame, MatColor } from '@shared/schema';
import FrameVisualizer from '@/components/FrameVisualizer';

interface ArtworkSizeDetectorProps {
  onDimensionsDetected: (dimensions: ArtworkDimensions, imageDataUrl: string) => void;
  defaultWidth?: number;
  defaultHeight?: number;
  frames?: { frame: Frame; position: number; distance: number; pricingMethod: string; }[];
  mats?: { matboard: MatColor; position: number; width: number; offset: number; }[];
  useMultipleFrames?: boolean;
  useMultipleMats?: boolean;
  onFrameImageCaptured?: (imageData: string) => void;
}

export function ArtworkSizeDetector({
  onDimensionsDetected,
  defaultWidth = 8,
  defaultHeight = 10,
  frames = [],
  mats = [],
  useMultipleFrames = false,
  useMultipleMats = false,
  onFrameImageCaptured
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
        console.log('Artwork size detector initialized successfully');
      } catch (error) {
        console.error('Failed to initialize artwork detector:', error);
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
  }, []); // Removed toast dependency to prevent re-renders

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
      // First, get list of available video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('Available camera devices:', videoDevices.length);
      videoDevices.forEach((device, index) => {
        console.log(`Camera ${index}: ${device.label || 'Unnamed camera'}`);
      });
      
      // Try to use the rear camera first on mobile devices (usually better quality)
      let stream;
      
      try {
        // Attempt to get environment camera (rear camera) with high resolution
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: { exact: "environment" },
            width: { ideal: 3840 }, // 4K if available
            height: { ideal: 2160 },
            frameRate: { ideal: 30 }
          } 
        });
        console.log('Successfully accessed rear-facing camera');
      } catch (err) {
        console.log('Could not access rear camera, trying alternative:', err);
        
        // If we have multiple cameras, try to find the best one (not the front-facing)
        if (videoDevices.length > 1) {
          // Try the second camera if available (often the rear one)
          const backCameraId = videoDevices[videoDevices.length > 1 ? 1 : 0].deviceId;
          
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                deviceId: { exact: backCameraId },
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                frameRate: { ideal: 30 }
              }
            });
            console.log('Using specific camera device:', backCameraId);
          } catch (specificErr) {
            console.log('Error using specific camera, falling back to default:', specificErr);
            stream = await navigator.mediaDevices.getUserMedia({
              video: { 
                width: { ideal: 1920 },
                height: { ideal: 1080 }
              }
            });
          }
        } else {
          // Fallback to any available camera
          stream = await navigator.mediaDevices.getUserMedia({
            video: { 
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          });
        }
      }
      
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Apply constraints to get the best quality
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          console.log('Video track capabilities:', videoTrack.getCapabilities());
          
          // Try to set focus mode to manual or continuous
          try {
            await videoTrack.applyConstraints({
              advanced: [
                { focusMode: "continuous" }, // Keep refocusing as needed
                { whiteBalance: "continuous" },
                { exposureMode: "continuous" }
              ]
            });
          } catch (constraintErr) {
            console.log('Could not apply advanced constraints:', constraintErr);
          }
        }
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

  // Handle webcam capture with improved quality
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
      // Attempt to focus before capture (if supported)
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack && videoTrack.getCapabilities && videoTrack.getCapabilities().focusMode) {
        try {
          await videoTrack.applyConstraints({ 
            advanced: [{ focusMode: "continuous" }] 
          });
          // Wait a moment for the camera to focus
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (focusErr) {
          console.log('Focus before capture not supported:', focusErr);
        }
      }
      
      // Create high-resolution canvas to capture frame
      const canvas = document.createElement('canvas');
      canvas.width = webcamRef.current.videoWidth;
      canvas.height = webcamRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      console.log('Capturing image at resolution:', canvas.width, 'x', canvas.height);
      
      // Draw video frame to canvas with image enhancement
      ctx.drawImage(webcamRef.current, 0, 0);
      
      // Apply basic image enhancement
      try {
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Apply basic contrast enhancement for better marker detection
        this.enhanceImageContrast(imageData.data);
        
        // Put enhanced image back
        ctx.putImageData(imageData, 0, 0);
      } catch (enhancementError) {
        console.log('Image enhancement failed, continuing with original image:', enhancementError);
      }
      
      // Convert to high-quality JPEG
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setImagePreview(dataUrl);

      if (detector) {
        // Create image from data URL for detection
        const img = new Image();
        img.onload = async () => {
          try {
            console.log('Processing image for size detection, resolution:', img.width, 'x', img.height);
            
            // Detect dimensions
            const detectedDimensions = await detector.estimateDimensions(img);
            
            console.log('Detection result:', detectedDimensions);
            
            // Create visualization of the detection
            try {
              const visualizationCanvas = detector.createVisualization(img, detectedDimensions);
              const visualizationDataUrl = visualizationCanvas.toDataURL('image/jpeg');
              setImagePreview(visualizationDataUrl);
            } catch (visError) {
              console.error('Error creating visualization:', visError);
              // Continue with original image if visualization fails
            }
            
            // Validate dimensions are within reasonable ranges for framing (5" to 40")
            const isValidSize = 
              detectedDimensions.width >= 5 && 
              detectedDimensions.width <= 40 && 
              detectedDimensions.height >= 5 && 
              detectedDimensions.height <= 40;
            
            if (isValidSize) {
              setDimensions(detectedDimensions);
              onDimensionsDetected(detectedDimensions, dataUrl);
              
              toast({
                title: 'Dimensions Detected',
                description: `Detected artwork size: ${detectedDimensions.width}" × ${detectedDimensions.height}"`,
              });
            } else {
              console.log('Detection resulted in invalid size:', detectedDimensions);
              
              // If dimensions are unreasonable, estimate based on aspect ratio
              const aspectRatio = img.width / img.height;
              
              // Use standard sizes as a fallback
              let defaultWidth = 16;
              let defaultHeight;
              
              if (aspectRatio >= 1) { // Landscape or square
                defaultHeight = Math.round((defaultWidth / aspectRatio) * 10) / 10;
              } else { // Portrait
                defaultHeight = 20;
                defaultWidth = Math.round((defaultHeight * aspectRatio) * 10) / 10;
              }
              
              // Ensure dimensions are within reasonable ranges
              defaultWidth = Math.max(5, Math.min(40, defaultWidth));
              defaultHeight = Math.max(5, Math.min(40, defaultHeight));
              
              const defaultDimensions = {
                width: defaultWidth,
                height: defaultHeight,
                unit: 'in' as const
              };
              
              setDimensions(defaultDimensions);
              onDimensionsDetected(defaultDimensions, dataUrl);
              
              toast({
                title: 'Detection Adjusted',
                description: `Using estimated dimensions. Please verify or adjust manually.`,
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
  
  // Basic image enhancement for better marker detection
  const enhanceImageContrast = (data: Uint8ClampedArray) => {
    // Simple contrast enhancement
    const factor = 1.2; // Contrast factor (1.0 = no change)
    const intercept = 128 * (1 - factor);
    
    for (let i = 0; i < data.length; i += 4) {
      // Enhance RGB channels
      data[i] = Math.min(255, Math.max(0, Math.floor(factor * data[i] + intercept)));
      data[i+1] = Math.min(255, Math.max(0, Math.floor(factor * data[i+1] + intercept)));
      data[i+2] = Math.min(255, Math.max(0, Math.floor(factor * data[i+2] + intercept)));
      // Alpha channel remains unchanged
    }
  };

  // Handle download reference marker
  const downloadMarker = () => {
    if (detector) {
      detector.downloadMarker();
    }
  };

  return (
    <Card className="w-full max-w-none border-2 border-red-200">
      <CardHeader>
        <CardTitle className="text-red-700">Artwork Upload & Frame Preview</CardTitle>
        <CardDescription>
          <strong className="text-red-600">REQUIRED:</strong> Upload an image of your artwork with a reference marker to automatically determine its size and see your framing preview. Orders cannot proceed without artwork images.
        </CardDescription>
      </CardHeader>
      <CardContent className="max-w-none">
        <div className="space-y-4 w-full">
          {/* Main display area with integrated camera and preview */}
          <div className="space-y-4 w-full">
            {/* Main display area */}
            <div className="border rounded-md bg-muted/10 min-h-[400px] flex flex-col w-full">
              <div className="p-4 border-b bg-white/50 rounded-t-md">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Artwork Capture & Detection</h4>
                  <div className="flex items-center gap-2">
                    <Tabs value={tab} onValueChange={setTab} className="w-auto">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="webcam" className="text-xs">
                          <Camera className="mr-1 h-3 w-3" />
                          Camera
                        </TabsTrigger>
                        <TabsTrigger value="upload" className="text-xs">
                          <Upload className="mr-1 h-3 w-3" />
                          Upload
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-4">
                {tab === 'webcam' ? (
                  <div className="space-y-4">
                    {/* Camera view as main display */}
                    <div className="relative rounded-md overflow-hidden bg-black w-full" style={{ aspectRatio: '16/9' }}>
                      <video 
                        ref={webcamRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Camera grid overlay for alignment */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-3/4 h-3/4 border-2 border-white/30 grid grid-cols-3 grid-rows-3">
                          <div className="border-r border-b border-white/30"></div>
                          <div className="border-r border-b border-white/30"></div>
                          <div className="border-b border-white/30"></div>
                          <div className="border-r border-b border-white/30"></div>
                          <div className="border-r border-b border-white/30"></div>
                          <div className="border-b border-white/30"></div>
                          <div className="border-r border-white/30"></div>
                          <div className="border-r border-white/30"></div>
                          <div></div>
                        </div>
                      </div>
                      
                      {/* Instruction overlay */}
                      <div className="absolute top-4 left-0 right-0 text-center text-white text-sm bg-black/50 py-2 px-4 mx-4 rounded">
                        Position artwork with 1" × 1" marker on same plane
                      </div>
                      
                      {/* Capture button overlay */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <Button 
                          onClick={captureFromWebcam} 
                          size="lg"
                          className="bg-white text-black hover:bg-gray-100"
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
                              Capture & Detect Size
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Upload area */}
                    <div 
                      className="border-2 border-dashed rounded-md p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors min-h-[300px]"
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
                          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto" />
                        ) : (
                          <>
                            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">Upload Artwork Image</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Click to upload JPG, PNG or GIF with reference marker
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Show captured/uploaded image and frame preview */}
                {imagePreview && (
                  <div className="mt-6 space-y-4 w-full">
                    <div className="border rounded-md p-1 sm:p-2 bg-white w-full max-w-none">
                      <h4 className="text-sm font-medium mb-2 text-center">Frame Preview</h4>
                      <div className="w-full flex justify-center overflow-hidden">
                        <div className="w-full max-w-full">
                          <FrameVisualizer
                            frames={frames}
                            mats={mats}
                            artworkWidth={dimensions.width}
                            artworkHeight={dimensions.height}
                            artworkImage={imagePreview}
                            useMultipleFrames={useMultipleFrames}
                            useMultipleMats={useMultipleMats}
                            onFrameImageCaptured={onFrameImageCaptured}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dimensions and controls section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Detected dimensions */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Detected Dimensions</h4>
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
                    {frames.length > 0 && mats.length > 0 && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {useMultipleFrames ? `${frames.length} frames` : 'Single frame'} | 
                          {useMultipleMats ? `${mats.length} mats` : 'Single mat'}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Reference marker info */}
              <div className="lg:col-span-1 space-y-4">
              <div className="bg-muted p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">Reference Marker</h4>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                            <span className="sr-only">Help</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                              <path d="M12 17h.01" />
                            </svg>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 text-sm">
                          <div className="space-y-2">
                            <h4 className="font-medium">Instructions for Accurate Measurement</h4>
                            <p className="text-muted-foreground">
                              Download and print this marker at exactly 1" × 1" size.
                              Place it next to your artwork on the same plane before taking a photo.
                            </p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Button onClick={downloadMarker} variant="outline" size="sm">
                      Download Marker
                    </Button>
                  </div>
                </div>
                
                {/* Compact photo tips */}
                <div className="bg-muted p-2 rounded-md text-xs text-muted-foreground">
                  <p className="flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    Print marker at exactly 1" × 1" size.
                  </p>
                  <p className="mt-1 flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                    Place marker on same plane as artwork.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <div className="flex items-center space-x-2">
          <ImageIcon className="h-4 w-4" />
          <span>Print marker at exactly 1" × 1" and place next to artwork</span>
        </div>
      </CardFooter>
    </Card>
  );
}