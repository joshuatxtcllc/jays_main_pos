import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface QrCodeScannerProps {
  onScan?: (data: any) => void;
  className?: string;
}

export function QrCodeScanner({ onScan, className }: QrCodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const [loadingData, setLoadingData] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<any>(null);

  // Clean up camera stream when component unmounts or when scanning is turned off
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const startScanning = async () => {
    try {
      // Try to use the environment facing camera (back camera) if available
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });

      setCameraStream(stream);
      setScanning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Start the scanning process
      scanQrCode();

    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopScanning = () => {
    setScanning(false);
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const scanQrCode = () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Here we would normally detect the QR code from the canvas
        // But since we don't have a QR code detection library that works 
        // directly with canvas data (due to compatibility issues),
        // we'll use the file upload approach as a fallback

        // For demo purposes, we can take screenshots periodically and try to detect QR codes
        // in a production environment, we would integrate with a JS library 
        // that can detect QR codes from video frames
      }
    }

    // Continue scanning
    if (scanning) {
      requestAnimationFrame(scanQrCode);
    }
  };

  const captureAndAnalyze = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/jpeg');

    // For demonstration purposes, we'll handle this with manual input
    const capturedCode = prompt("Scanning functionality requires a QR code reader library. For now, please enter the QR code manually:");
    if (capturedCode) {
      handleScannedCode(capturedCode);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      if (!event.target) return;

      // This would normally be processed by a QR code scanner library
      // For demonstration, we'll use manual input
      const uploadedCode = prompt("Enter the QR code from the uploaded image:");
      if (uploadedCode) {
        handleScannedCode(uploadedCode);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleScannedCode = async (code: string) => {
    try {
      setScannedCode(code);
      setLoadingData(true);

      // Look up the QR code data
      const response = await apiRequest('GET', `/api/qr-codes/${encodeURIComponent(code)}`);

      if (!response.ok) {
        throw new Error('QR code not found or invalid');
      }

      // Safely parse the response
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Handle non-JSON responses
        const text = await response.text();
        throw new Error('Invalid response format. Expected JSON but got: ' + 
          (text.substring(0, 50) + (text.length > 50 ? '...' : '')));
      }

      setScannedData(data);

      // Record a scan
      await apiRequest('POST', '/api/qr-codes/scan', { 
        qrCodeId: data.id,
        location: 'POS System'
      });

      // Call the onScan callback with the data
      if (onScan) {
        onScan(data);
      }

      toast({
        title: "QR Code Scanned",
        description: `Successfully scanned: ${data.title}`
      });

    } catch (error) {
      console.error('Error processing QR code:', error);
      toast({
        title: "Error",
        description: `Failed to process QR code: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
      // Optionally stop scanning after a successful scan
      // stopScanning();
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>QR Code Scanner</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {scanning ? (
            <div className="relative">
              <video
                ref={videoRef}
                style={{ width: '100%', borderRadius: '8px' }}
                autoPlay
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
              />
              <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-primary rounded-lg" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-border rounded-lg">
              <p className="mb-4 text-center text-sm text-muted-foreground">
                Start the camera to scan a QR code, or upload an image containing a QR code.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('qr-file-input')?.click()}
                >
                  Upload Image
                </Button>
                <input
                  id="qr-file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          )}

          {loadingData && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {scannedData && !loadingData && (
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{scannedData.title}</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Type:</span> {scannedData.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                <p><span className="font-medium">Code:</span> {scannedData.code}</p>
                {scannedData.description && (
                  <p><span className="font-medium">Description:</span> {scannedData.description}</p>
                )}
                <p><span className="font-medium">Scan Count:</span> {scannedData.scanCount}</p>
                <p><span className="font-medium">Last Scanned:</span> {scannedData.lastScanned ? new Date(scannedData.lastScanned).toLocaleString() : 'Never'}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {scanning ? (
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={stopScanning}
            >
              Stop Camera
            </Button>
            <Button 
              className="flex-1"
              onClick={captureAndAnalyze}
            >
              Capture & Analyze
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full"
            onClick={startScanning}
            disabled={loadingData}
          >
            Start Camera
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default QrCodeScanner;