import { useEffect, useRef } from 'react';

interface Frame {
  id: string;
  name: string;
  width: string;
  color: string;
  material: string;
}

interface Mat {
  matboard: {
    id: string;
    name: string;
    color: string;
  };
  position: number;
  width: number;
  offset: number;
}

interface FrameVisualizerProps {
  frames: { frame: Frame; position: number; distance: number; pricingMethod: string; }[];
  mats: Mat[];
  artworkWidth: number;
  artworkHeight: number;
  artworkImage: string | null;
  useMultipleMats: boolean;
  useMultipleFrames: boolean;
  onFrameImageCaptured?: (imageData: string) => void;
}

export default function FrameVisualizer({
  frames,
  mats,
  artworkWidth,
  artworkHeight,
  artworkImage,
  useMultipleMats,
  useMultipleFrames,
  onFrameImageCaptured
}: FrameVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Helper function to draw frames and mats
  const drawFramesAndMats = (
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    frameList: { frame: Frame; position: number; distance: number; pricingMethod: string; }[],
    matList: Mat[],
    useMultipleMats: boolean,
    useMultipleFrames: boolean,
    currentWidth: number,
    currentHeight: number
  ) => {
    let currentX = startX;
    let currentY = startY;
    let drawWidth = currentWidth;
    let drawHeight = currentHeight;

    const scaleFactor = Math.min(currentWidth / artworkWidth, currentHeight / artworkHeight);

    // Sort frames by position (outermost to innermost)
    const sortedFrames = frameList.sort((a, b) => b.position - a.position);
    
    // Sort mats by position (outermost to innermost)  
    const sortedMats = matList.sort((a, b) => b.position - a.position);

    // Draw frames from outermost to innermost
    if (useMultipleFrames) {
      for (let i = 0; i < sortedFrames.length; i++) {
        const frame = sortedFrames[i].frame;
        const frameWidthPx = parseFloat(frame.width) * scaleFactor;
        
        // Draw frame
        ctx.fillStyle = frame.color || '#8B4513';
        ctx.fillRect(currentX, currentY, drawWidth, drawHeight);
        
        // Move inward for the next frame/mat
        currentX += frameWidthPx;
        currentY += frameWidthPx;
        drawWidth -= frameWidthPx * 2;
        drawHeight -= frameWidthPx * 2;
      }
    } else {
      // Draw only the innermost frame
      if (sortedFrames.length > 0) {
        const frame = sortedFrames[sortedFrames.length - 1].frame;
        const frameWidthPx = parseFloat(frame.width) * scaleFactor;
        
        // Draw frame
        ctx.fillStyle = frame.color || '#8B4513';
        ctx.fillRect(currentX, currentY, drawWidth, drawHeight);
        
        // Move inward for the mats
        currentX += frameWidthPx;
        currentY += frameWidthPx;
        drawWidth -= frameWidthPx * 2;
        drawHeight -= frameWidthPx * 2;
      }
    }

    // Draw mats from outermost to innermost
    if (useMultipleMats) {
      for (let i = 0; i < sortedMats.length; i++) {
        const mat = sortedMats[i];
        const matWidthPx = mat.width * scaleFactor;
        
        // Draw mat
        ctx.fillStyle = mat.matboard.color;
        ctx.fillRect(currentX, currentY, drawWidth, drawHeight);
        
        // Move inward for the next mat
        currentX += matWidthPx;
        currentY += matWidthPx;
        drawWidth -= matWidthPx * 2;
        drawHeight -= matWidthPx * 2;
      }
    } else {
      // Draw only the innermost mat
      if (sortedMats.length > 0) {
        const mat = sortedMats[sortedMats.length - 1];
        const matWidthPx = mat.width * scaleFactor;
        
        // Draw mat
        ctx.fillStyle = mat.matboard.color;
        ctx.fillRect(currentX, currentY, drawWidth, drawHeight);
        
        // Move inward for the artwork
        currentX += matWidthPx;
        currentY += matWidthPx;
        drawWidth -= matWidthPx * 2;
        drawHeight -= matWidthPx * 2;
      }
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set larger canvas size as requested
    canvas.width = 600;
    canvas.height = 600;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate dimensions for preview with larger max size
    const maxSize = 500;
    const aspectRatio = artworkWidth / artworkHeight;
    
    let currentWidth, currentHeight;
    if (aspectRatio > 1) {
      currentWidth = Math.min(maxSize, artworkWidth * 10);
      currentHeight = currentWidth / aspectRatio;
    } else {
      currentHeight = Math.min(maxSize, artworkHeight * 10);
      currentWidth = currentHeight * aspectRatio;
    }

    const startX = (canvas.width - currentWidth) / 2;
    const startY = (canvas.height - currentHeight) / 2;

    // Draw artwork background
    if (artworkImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, startX, startY, currentWidth, currentHeight);
        
        // Draw frames and mats on top
        drawFramesAndMats(
          ctx, 
          startX, 
          startY, 
          frames, 
          mats, 
          useMultipleMats, 
          useMultipleFrames, 
          currentWidth, 
          currentHeight
        );
        
        // Capture frame design image with debouncing for better performance
        if (onFrameImageCaptured) {
          setTimeout(() => {
            try {
              const frameDesignImage = canvas.toDataURL('image/jpeg', 0.8);
              onFrameImageCaptured(frameDesignImage);
            } catch (error) {
              console.error('Error capturing frame design image:', error);
            }
          }, 200);
        }
      };
      img.src = artworkImage;
    } else {
      // Draw placeholder artwork
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(startX, startY, currentWidth, currentHeight);
      ctx.strokeStyle = '#dee2e6';
      ctx.strokeRect(startX, startY, currentWidth, currentHeight);
      
      // Add placeholder text
      ctx.fillStyle = '#6c757d';
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Upload Artwork', startX + currentWidth / 2, startY + currentHeight / 2);
      
      // Draw frames and mats
      drawFramesAndMats(
        ctx, 
        startX, 
        startY, 
        frames, 
        mats, 
        useMultipleMats, 
        useMultipleFrames, 
        currentWidth, 
        currentHeight
      );
      
      // Capture frame design image
      if (onFrameImageCaptured) {
        setTimeout(() => {
          try {
            const frameDesignImage = canvas.toDataURL('image/jpeg', 0.8);
            onFrameImageCaptured(frameDesignImage);
          } catch (error) {
            console.error('Error capturing frame design image:', error);
          }
        }, 200);
      }
    }
  }, [frames, mats, artworkWidth, artworkHeight, artworkImage, useMultipleMats, useMultipleFrames, onFrameImageCaptured]);

  return (
    <div className="frame-visualizer-container flex flex-col items-center justify-center p-4 w-full h-full">
      <div className="flex-1 w-full flex items-center justify-center">
        <canvas 
          ref={canvasRef}
          className="border border-border shadow-lg rounded-lg bg-white"
          style={{ 
            maxWidth: '100%', 
            maxHeight: '100%', 
            aspectRatio: artworkWidth && artworkHeight ? `${artworkWidth}/${artworkHeight}` : '1/1',
            width: '600px', 
            height: '600px' 
          }}
        />
      </div>
      <div className="text-center text-sm text-muted-foreground mt-2 w-full">
        {frames.length > 0 && mats.length > 0 ? (
          <>
            <p>
              {useMultipleFrames ? `${frames.length} frames` : 'Single frame'} | 
              {useMultipleMats ? `${mats.length} mats` : 'Single mat'} | 
              Artwork: {artworkWidth}" × {artworkHeight}"
            </p>
            <button 
              className="mt-2 text-sm px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              onClick={() => {
                if (canvasRef.current) {
                  try {
                    const link = document.createElement('a');
                    link.download = `framed-artwork-${new Date().toISOString().split('T')[0]}.png`;
                    link.href = canvasRef.current.toDataURL('image/jpeg', 0.9);
                    link.click();
                  } catch (error) {
                    console.error('Error downloading frame design image:', error);
                  }
                }
              }}
            >
              Download Preview
            </button>
          </>
        ) : (
          <p>Select frames and mats to see preview</p>
        )}
      </div>
    </div>
  );
}