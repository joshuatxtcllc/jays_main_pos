
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import QrCodeGenerator from './QrCodeGenerator';
import QrCodeScanner from './QrCodeScanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Camera } from 'lucide-react';

interface ArtworkLocationTrackerProps {
  orderId: number;
  onSave?: () => void;
  className?: string;
}

export function ArtworkLocationTracker({ orderId, onSave, className }: ArtworkLocationTrackerProps) {
  const [tab, setTab] = useState('locate');
  const [loading, setLoading] = useState(false);
  const [artworkLocation, setArtworkLocation] = useState('');
  const [webcamActive, setWebcamActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [savedLocationData, setSavedLocationData] = useState<any>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Fetch existing location data on initial load
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('GET', `/api/orders/${orderId}/location`);
        
        if (response.ok) {
          const data = await response.json();
          setSavedLocationData(data);
          if (data.location) {
            setArtworkLocation(data.location);
          }
        }
      } catch (error) {
        console.error('Error fetching artwork location data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchLocationData();
    }
  }, [orderId]);

  // Start webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setWebcamActive(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setWebcamActive(false);
  };

  // Capture image from webcam
  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(dataUrl);
    
    // Stop webcam after capture
    stopWebcam();
  };

  // Save artwork location and image
  const saveArtworkLocation = async () => {
    if (!artworkLocation.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter a physical storage location for the artwork.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('location', artworkLocation);
      
      // If we have a captured image, add it to form data
      if (capturedImage) {
        // Convert data URL to blob
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        formData.append('image', blob, 'artwork-location.jpg');
      }

      // Use fetch directly for form data
      const response = await fetch(`/api/orders/${orderId}/location`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to save artwork location');
      }

      const data = await response.json();
      setSavedLocationData(data);

      toast({
        title: "Location Saved",
        description: "Artwork location has been saved successfully."
      });

      if (onSave) {
        onSave();
      }

    } catch (error) {
      console.error('Error saving artwork location:', error);
      toast({
        title: "Error",
        description: `Failed to save location: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Artwork Location Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="locate">Locate Artwork</TabsTrigger>
            <TabsTrigger value="capture">Capture Image</TabsTrigger>
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
            <TabsTrigger value="scan">Scan QR</TabsTrigger>
          </TabsList>

          <TabsContent value="locate">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="location">Physical Storage Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Shelf A3, Bin 42, Rack 7-B"
                  value={artworkLocation}
                  onChange={(e) => setArtworkLocation(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Enter the physical location where this artwork is stored
                </p>
              </div>

              {savedLocationData && (
                <div className="bg-muted p-3 rounded-md mt-4">
                  <h3 className="font-medium">Current Location Information</h3>
                  <p><span className="font-medium">Location:</span> {savedLocationData.location}</p>
                  <p><span className="font-medium">Last Updated:</span> {new Date(savedLocationData.updatedAt).toLocaleString()}</p>
                  
                  {savedLocationData.imagePath && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium mb-1">Location Image</h4>
                      <img 
                        src={`/api/orders/${orderId}/location/image`} 
                        alt="Artwork storage location" 
                        className="max-w-full h-auto max-h-48 rounded-md"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="capture">
            <div className="space-y-4">
              {webcamActive ? (
                <div className="relative rounded-md overflow-hidden">
                  <video 
                    ref={videoRef} 
                    className="w-full h-auto rounded-md"
                    autoPlay 
                    playsInline
                  />
                  <Button 
                    onClick={captureImage}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Capture
                  </Button>
                </div>
              ) : capturedImage ? (
                <div className="space-y-2">
                  <img 
                    src={capturedImage} 
                    alt="Captured artwork" 
                    className="w-full h-auto rounded-md"
                  />
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCapturedImage(null)}>
                      Discard
                    </Button>
                    <Button variant="default" onClick={() => startWebcam()}>
                      Retake
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-border rounded-lg">
                  <p className="mb-4 text-center text-sm text-muted-foreground">
                    Take a photo of the artwork in its storage location
                  </p>
                  <Button onClick={startWebcam}>
                    <Camera className="mr-2 h-4 w-4" />
                    Start Camera
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="qrcode">
            <QrCodeGenerator
              type="artwork_location"
              entityId={`order-${orderId}`}
              title={`Artwork Location for Order #${orderId}`}
              description={`Physical location: ${artworkLocation || '[Not specified]'}`}
            />
          </TabsContent>

          <TabsContent value="scan">
            <QrCodeScanner 
              onScan={(data) => {
                if (data && data.type === 'artwork_location') {
                  // Extract location from QR code if available
                  const locationMatch = data.description?.match(/Physical location: (.+)/);
                  if (locationMatch && locationMatch[1] && locationMatch[1] !== '[Not specified]') {
                    setArtworkLocation(locationMatch[1]);
                    setTab('locate');
                  }
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter>
        <Button 
          onClick={saveArtworkLocation} 
          disabled={loading || !artworkLocation.trim()}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Artwork Location
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ArtworkLocationTracker;
