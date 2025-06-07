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

    // Set properly proportioned canvas size
    const canvasWidth = 800;
    const canvasHeight = 600;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate artwork display size for wide canvas
    const artworkDisplaySize = 400; // Larger base size for wide canvas
    const aspectRatio = artworkWidth / artworkHeight;
    
    let artworkDisplayWidth, artworkDisplayHeight;
    if (aspectRatio > 1) {
      artworkDisplayWidth = artworkDisplaySize;
      artworkDisplayHeight = artworkDisplaySize / aspectRatio;
    } else {
      artworkDisplayHeight = artworkDisplaySize;
      artworkDisplayWidth = artworkDisplaySize * aspectRatio;
    }

    // Calculate frame and mat border widths (much more visible)
    let totalFrameWidth = 0;
    let totalMatWidth = 0;

    frames.forEach(frameItem => {
      const frameWidth = parseFloat(frameItem.frame.width) || 1;
      totalFrameWidth += frameWidth * 8; // Reduced multiplier for better proportions
    });

    mats.forEach(matItem => {
      totalMatWidth += matItem.width * 8; // Reduced multiplier for better proportions
    });

    const totalBorderWidth = totalFrameWidth + totalMatWidth;

    // Calculate total composition size
    const totalWidth = artworkDisplayWidth + (totalBorderWidth * 2);
    const totalHeight = artworkDisplayHeight + (totalBorderWidth * 2);

    // Center the composition on canvas
    const startX = (canvas.width - totalWidth) / 2;
    const startY = (canvas.height - totalHeight) / 2;

    // Current drawing position (start from outside)
    let currentX = startX;
    let currentY = startY;
    let currentWidth = totalWidth;
    let currentHeight = totalHeight;

    // Draw frames from outside to inside
    const sortedFrames = [...frames].sort((a, b) => b.position - a.position);
    
    if (useMultipleFrames) {
      sortedFrames.forEach(frameItem => {
        const frameWidth = (parseFloat(frameItem.frame.width) || 1) * 8;
        
        // Draw frame rectangle
        ctx.fillStyle = frameItem.frame.color || '#8B4513';
        ctx.fillRect(currentX, currentY, currentWidth, currentHeight);
        
        // Create inner opening
        ctx.fillStyle = 'transparent';
        ctx.clearRect(currentX + frameWidth, currentY + frameWidth, 
                     currentWidth - frameWidth * 2, currentHeight - frameWidth * 2);
        
        // Move inward for next layer
        currentX += frameWidth;
        currentY += frameWidth;
        currentWidth -= frameWidth * 2;
        currentHeight -= frameWidth * 2;
      });
    } else if (frames.length > 0) {
      const frame = sortedFrames[sortedFrames.length - 1].frame;
      const frameWidth = (parseFloat(frame.width) || 1) * 8;
      
      // Draw single frame
      ctx.fillStyle = frame.color || '#8B4513';
      ctx.fillRect(currentX, currentY, currentWidth, currentHeight);
      
      // Create inner opening
      ctx.clearRect(currentX + frameWidth, currentY + frameWidth,
                   currentWidth - frameWidth * 2, currentHeight - frameWidth * 2);
      
      currentX += frameWidth;
      currentY += frameWidth;
      currentWidth -= frameWidth * 2;
      currentHeight -= frameWidth * 2;
    }

    // Draw mats from outside to inside
    const sortedMats = [...mats].sort((a, b) => b.position - a.position);
    
    if (useMultipleMats) {
      sortedMats.forEach(matItem => {
        const matWidth = matItem.width * 8;
        
        // Draw mat rectangle
        ctx.fillStyle = matItem.matboard.color || '#FFFFFF';
        ctx.fillRect(currentX, currentY, currentWidth, currentHeight);
        
        // Create inner opening
        ctx.clearRect(currentX + matWidth, currentY + matWidth,
                     currentWidth - matWidth * 2, currentHeight - matWidth * 2);
        
        // Move inward for next layer
        currentX += matWidth;
        currentY += matWidth;
        currentWidth -= matWidth * 2;
        currentHeight -= matWidth * 2;
      });
    } else if (mats.length > 0) {
      const mat = sortedMats[sortedMats.length - 1];
      const matWidth = mat.width * 8;
      
      // Draw single mat
      ctx.fillStyle = mat.matboard.color || '#FFFFFF';
      ctx.fillRect(currentX, currentY, currentWidth, currentHeight);
      
      // Create inner opening
      ctx.clearRect(currentX + matWidth, currentY + matWidth,
                   currentWidth - matWidth * 2, currentHeight - matWidth * 2);
      
      currentX += matWidth;
      currentY += matWidth;
      currentWidth -= matWidth * 2;
      currentHeight -= matWidth * 2;
    }

    // Draw artwork in the center
    if (artworkImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, currentX, currentY, currentWidth, currentHeight);
        
        if (onFrameImageCaptured) {
          setTimeout(() => {
            try {
              const frameDesignImage = canvas.toDataURL('image/jpeg', 0.9);
              onFrameImageCaptured(frameDesignImage);
            } catch (error) {
              console.error('Error capturing frame design:', error);
            }
          }, 100);
        }
      };
      img.onerror = () => drawPlaceholder();
      img.src = artworkImage;
    } else {
      drawPlaceholder();
    }

    function drawPlaceholder() {
      if (!ctx) return;
      
      // Draw placeholder artwork
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(currentX, currentY, currentWidth, currentHeight);
      ctx.strokeStyle = '#dee2e6';
      ctx.lineWidth = 2;
      ctx.strokeRect(currentX, currentY, currentWidth, currentHeight);
      
      // Add placeholder text
      ctx.fillStyle = '#6c757d';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Your Artwork', currentX + currentWidth / 2, currentY + currentHeight / 2);
      
      if (onFrameImageCaptured) {
        setTimeout(() => {
          try {
            const frameDesignImage = canvas.toDataURL('image/jpeg', 0.9);
            onFrameImageCaptured(frameDesignImage);
          } catch (error) {
            console.error('Error capturing frame design:', error);
          }
        }, 100);
      }
    }

  }, [frames, mats, artworkWidth, artworkHeight, artworkImage, useMultipleFrames, useMultipleMats, onFrameImageCaptured]);

  return (
    <div className="frame-visualizer-container w-full">
      <div className="w-full bg-gray-50 p-2 sm:p-4 rounded-lg overflow-x-auto">
        <div className="flex justify-center min-w-[320px]">
          <canvas 
            ref={canvasRef}
            className="border-2 border-gray-300 shadow-xl rounded-lg bg-white max-w-full h-auto"
            width={800}
            height={600}
            style={{ 
              width: '100%',
              maxWidth: '800px',
              height: 'auto',
              aspectRatio: '4/3',
              display: 'block'
            }}
          />
        </div>
      </div>
      <div className="text-center text-sm text-gray-600 mt-4">
        {frames.length > 0 || mats.length > 0 ? (
          <div className="space-y-2">
            <p>
              {frames.length > 0 && (useMultipleFrames ? `${frames.length} frames` : 'Single frame')}
              {frames.length > 0 && mats.length > 0 && ' | '}
              {mats.length > 0 && (useMultipleMats ? `${mats.length} mats` : 'Single mat')}
              {(frames.length > 0 || mats.length > 0) && ` | Artwork: ${artworkWidth}" × ${artworkHeight}"`}
            </p>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
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
          </div>
        ) : (
          <p>Select frames and mats to see preview</p>
        )}
      </div>
    </div>
  );
}