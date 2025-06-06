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

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on container size for better mobile handling
    const container = canvas.parentElement;
    const containerWidth = container?.clientWidth || 600;
    const containerHeight = container?.clientHeight || 600;
    const size = Math.min(containerWidth - 32, containerHeight - 32, 600);
    
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate artwork dimensions for display - make responsive to canvas size
    const maxArtworkSize = Math.min(canvas.width * 0.5, 300);
    const aspectRatio = artworkWidth / artworkHeight;
    
    let displayWidth, displayHeight;
    if (aspectRatio > 1) {
      displayWidth = Math.min(maxArtworkSize, artworkWidth * 15);
      displayHeight = displayWidth / aspectRatio;
    } else {
      displayHeight = Math.min(maxArtworkSize, artworkHeight * 15);
      displayWidth = displayHeight * aspectRatio;
    }

    // Calculate total border width from frames and mats
    let totalBorderWidth = 0;
    
    // Add frame widths (scaled for visual display) - responsive scaling
    const scaleFactor = Math.min(canvas.width / 600, 1) * 15;
    frames.forEach(frameItem => {
      const frameWidth = parseFloat(frameItem.frame.width) || 1;
      totalBorderWidth += frameWidth * scaleFactor;
    });
    
    // Add mat widths (scaled for visual display)
    mats.forEach(matItem => {
      totalBorderWidth += matItem.width * scaleFactor;
    });

    // Calculate total dimensions including borders
    const totalWidth = displayWidth + (totalBorderWidth * 2);
    const totalHeight = displayHeight + (totalBorderWidth * 2);
    
    // Center the entire composition
    const startX = (canvas.width - totalWidth) / 2;
    const startY = (canvas.height - totalHeight) / 2;

    // Draw from outside to inside
    let currentX = startX;
    let currentY = startY;
    let currentWidth = totalWidth;
    let currentHeight = totalHeight;

    // Sort frames by position (outermost first)
    const sortedFrames = [...frames].sort((a, b) => b.position - a.position);
    
    // Draw frames
    if (useMultipleFrames) {
      sortedFrames.forEach(frameItem => {
        const frameWidth = (parseFloat(frameItem.frame.width) || 1) * scaleFactor;
        
        // Draw frame
        ctx.fillStyle = frameItem.frame.color || '#8B4513';
        ctx.fillRect(currentX, currentY, currentWidth, currentHeight);
        
        // Move inward
        currentX += frameWidth;
        currentY += frameWidth;
        currentWidth -= frameWidth * 2;
        currentHeight -= frameWidth * 2;
      });
    } else if (frames.length > 0) {
      // Draw single frame (innermost)
      const frame = sortedFrames[sortedFrames.length - 1].frame;
      const frameWidth = (parseFloat(frame.width) || 1) * scaleFactor;
      
      ctx.fillStyle = frame.color || '#8B4513';
      ctx.fillRect(currentX, currentY, currentWidth, currentHeight);
      
      currentX += frameWidth;
      currentY += frameWidth;
      currentWidth -= frameWidth * 2;
      currentHeight -= frameWidth * 2;
    }

    // Sort mats by position (innermost first - highest position number first)
    const sortedMats = [...mats].sort((a, b) => b.position - a.position);
    
    // Draw mats
    if (useMultipleMats && sortedMats.length > 0) {
      // Find the top mat (position 1 - outermost)
      const topMat = sortedMats.find(mat => mat.position === 1);
      if (topMat) {
        // Draw the main top mat area
        const topMatWidth = topMat.width * scaleFactor;
        ctx.fillStyle = topMat.matboard.color || '#FFFFFF';
        ctx.fillRect(currentX, currentY, currentWidth, currentHeight);
        
        // Move inward by top mat width
        currentX += topMatWidth;
        currentY += topMatWidth;
        currentWidth -= topMatWidth * 2;
        currentHeight -= topMatWidth * 2;
        
        // Draw thin lines for middle and bottom mats inside the top mat
        sortedMats.forEach(matItem => {
          if (matItem.position > 1) { // Middle (2) and bottom (3) mats
            const lineWidth = Math.max(1, matItem.width * scaleFactor * 0.3); // Thin line representation
            
            // Draw thin border line
            ctx.strokeStyle = matItem.matboard.color || '#FFFFFF';
            ctx.lineWidth = lineWidth;
            ctx.strokeRect(currentX, currentY, currentWidth, currentHeight);
            
            // Move slightly inward for next mat line
            const inset = lineWidth + 2;
            currentX += inset;
            currentY += inset;
            currentWidth -= inset * 2;
            currentHeight -= inset * 2;
          }
        });
      }
    } else if (mats.length > 0) {
      // Draw single mat (use the first available mat)
      const mat = sortedMats[0];
      const matWidth = mat.width * scaleFactor;
      
      ctx.fillStyle = mat.matboard.color || '#FFFFFF';
      ctx.fillRect(currentX, currentY, currentWidth, currentHeight);
      
      currentX += matWidth;
      currentY += matWidth;
      currentWidth -= matWidth * 2;
      currentHeight -= matWidth * 2;
    }

    // Draw artwork
    if (artworkImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, currentX, currentY, currentWidth, currentHeight);
        
        // Capture the frame design
        if (onFrameImageCaptured) {
          setTimeout(() => {
            try {
              const frameDesignImage = canvas.toDataURL('image/jpeg', 0.8);
              onFrameImageCaptured(frameDesignImage);
            } catch (error) {
              console.error('Error capturing frame design:', error);
            }
          }, 100);
        }
      };
      img.onerror = () => {
        // Fallback if image fails to load
        drawPlaceholder();
      };
      img.src = artworkImage;
    } else {
      drawPlaceholder();
    }

    function drawPlaceholder() {
      // Draw placeholder artwork
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(currentX, currentY, currentWidth, currentHeight);
      ctx.strokeStyle = '#dee2e6';
      ctx.strokeRect(currentX, currentY, currentWidth, currentHeight);
      
      // Add placeholder text
      ctx.fillStyle = '#6c757d';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Your Artwork', currentX + currentWidth / 2, currentY + currentHeight / 2);
      
      // Capture the frame design
      if (onFrameImageCaptured) {
        setTimeout(() => {
          try {
            const frameDesignImage = canvas.toDataURL('image/jpeg', 0.8);
            onFrameImageCaptured(frameDesignImage);
          } catch (error) {
            console.error('Error capturing frame design:', error);
          }
        }, 100);
      }
    }

  }, [frames, mats, artworkWidth, artworkHeight, artworkImage, useMultipleFrames, useMultipleMats, onFrameImageCaptured]);

  return (
    <div className="frame-visualizer-container flex flex-col items-center justify-center p-2 w-full h-full">
      <div className="flex-1 w-full flex items-center justify-center">
        <canvas 
          ref={canvasRef}
          className="border border-gray-300 shadow-lg rounded-lg bg-white"
          style={{ 
            maxWidth: '100%', 
            maxHeight: '70vh',
            width: 'min(600px, 100vw - 2rem)', 
            height: 'min(600px, 70vh)',
            aspectRatio: '1/1'
          }}
        />
      </div>
      <div className="text-center text-xs sm:text-sm text-gray-600 mt-2 w-full px-2">
        {frames.length > 0 || mats.length > 0 ? (
          <>
            <p className="mb-2 break-words">
              {frames.length > 0 && (useMultipleFrames ? `${frames.length} frames` : 'Single frame')}
              {frames.length > 0 && mats.length > 0 && ' | '}
              {mats.length > 0 && (useMultipleMats ? `${mats.length} mats` : 'Single mat')}
              {(frames.length > 0 || mats.length > 0) && ` | Artwork: ${artworkWidth}" × ${artworkHeight}"`}
            </p>
            <button 
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs sm:text-sm"
              onClick={() => {
                if (canvasRef.current) {
                  try {
                    const link = document.createElement('a');
                    link.download = `framed-artwork-${new Date().toISOString().split('T')[0]}.png`;
                    link.href = canvasRef.current.toDataURL('image/png', 1.0);
                    link.click();
                  } catch (error) {
                    console.error('Error downloading frame design:', error);
                  }
                }
              }}
            >
              Download Preview
            </button>
          </>
        ) : (
          <p className="text-xs sm:text-sm">Select frames and mats to see preview</p>
        )}
      </div>
    </div>
  );
}