import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, ZoomOut, RotateCw, Upload } from 'lucide-react';

interface Frame {
  id: string;
  name: string;
  width: string;
  color?: string;
  material: string;
  manufacturer: string;
}

interface Mat {
  matboard: {
    id: string;
    name: string;
    color: string;
  };
  position: number;
  width: number;
}

interface ProductionFrameVisualizerProps {
  frames: { frame: Frame; position: number; distance: number; pricingMethod: string; }[];
  mats: Mat[];
  artworkWidth: number;
  artworkHeight: number;
  artworkImage?: string | null;
  useMultipleMats: boolean;
  useMultipleFrames: boolean;
  onFrameImageCaptured?: (imageData: string) => void;
}

export default function ProductionFrameVisualizer({
  frames,
  mats,
  artworkWidth,
  artworkHeight,
  artworkImage,
  useMultipleMats,
  useMultipleFrames,
  onFrameImageCaptured
}: ProductionFrameVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const currentArtworkImage = uploadedImage || artworkImage;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-resolution canvas
    const canvasWidth = 1000;
    const canvasHeight = 700;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear with professional background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle grid pattern for professional look
    drawGrid(ctx, canvasWidth, canvasHeight);

    // Calculate artwork display size with proper scaling
    const maxDisplaySize = Math.min(canvasWidth, canvasHeight) * 0.6 * zoom;
    const aspectRatio = artworkWidth / artworkHeight;
    
    let artworkDisplayWidth, artworkDisplayHeight;
    if (aspectRatio > 1) {
      artworkDisplayWidth = maxDisplaySize;
      artworkDisplayHeight = maxDisplaySize / aspectRatio;
    } else {
      artworkDisplayHeight = maxDisplaySize;
      artworkDisplayWidth = maxDisplaySize * aspectRatio;
    }

    // Calculate professional frame and mat dimensions
    let totalFrameWidth = 0;
    let totalMatWidth = 0;

    frames.forEach(frameItem => {
      const frameWidth = parseFloat(frameItem.frame.width) || 1;
      totalFrameWidth += frameWidth * 15; // Professional scale factor
    });

    mats.forEach(matItem => {
      totalMatWidth += matItem.width * 15; // Professional scale factor
    });

    const totalBorderWidth = totalFrameWidth + totalMatWidth;

    // Calculate total composition size
    const totalWidth = artworkDisplayWidth + (totalBorderWidth * 2);
    const totalHeight = artworkDisplayHeight + (totalBorderWidth * 2);

    // Center the composition on canvas
    const startX = (canvas.width - totalWidth) / 2;
    const startY = (canvas.height - totalHeight) / 2;

    // Save context for rotation
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Current drawing position
    let currentX = startX;
    let currentY = startY;
    let currentWidth = totalWidth;
    let currentHeight = totalHeight;

    // Draw frames with realistic materials and shadows
    const sortedFrames = [...frames].sort((a, b) => b.position - a.position);
    
    if (useMultipleFrames) {
      sortedFrames.forEach((frameItem, index) => {
        const frameWidth = (parseFloat(frameItem.frame.width) || 1) * 15;
        drawRealisticFrame(ctx, currentX, currentY, currentWidth, currentHeight, frameWidth, frameItem.frame, index);
        
        currentX += frameWidth;
        currentY += frameWidth;
        currentWidth -= frameWidth * 2;
        currentHeight -= frameWidth * 2;
      });
    } else if (frames.length > 0) {
      const frame = sortedFrames[0].frame;
      const frameWidth = (parseFloat(frame.width) || 1) * 15;
      drawRealisticFrame(ctx, currentX, currentY, currentWidth, currentHeight, frameWidth, frame, 0);
      
      currentX += frameWidth;
      currentY += frameWidth;
      currentWidth -= frameWidth * 2;
      currentHeight -= frameWidth * 2;
    }

    // Draw mats with realistic textures and beveled edges
    const sortedMats = [...mats].sort((a, b) => b.position - a.position);
    
    if (useMultipleMats) {
      sortedMats.forEach((matItem, index) => {
        const matWidth = matItem.width * 15;
        drawRealisticMat(ctx, currentX, currentY, currentWidth, currentHeight, matWidth, matItem.matboard, index);
        
        currentX += matWidth;
        currentY += matWidth;
        currentWidth -= matWidth * 2;
        currentHeight -= matWidth * 2;
      });
    } else if (mats.length > 0) {
      const mat = sortedMats[0];
      const matWidth = mat.width * 15;
      drawRealisticMat(ctx, currentX, currentY, currentWidth, currentHeight, matWidth, mat.matboard, 0);
      
      currentX += matWidth;
      currentY += matWidth;
      currentWidth -= matWidth * 2;
      currentHeight -= matWidth * 2;
    }

    // Draw artwork
    if (currentArtworkImage) {
      const img = new Image();
      img.onload = () => {
        // Add subtle shadow behind artwork
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.drawImage(img, currentX, currentY, currentWidth, currentHeight);
        
        ctx.shadowColor = 'transparent';
        
        if (onFrameImageCaptured) {
          setTimeout(() => {
            try {
              const frameDesignImage = canvas.toDataURL('image/jpeg', 0.95);
              onFrameImageCaptured(frameDesignImage);
            } catch (error) {
              console.error('Error capturing frame design:', error);
            }
          }, 100);
        }
      };
      img.onerror = () => drawPlaceholder();
      img.src = currentArtworkImage;
    } else {
      drawPlaceholder();
    }

    function drawPlaceholder() {
      if (!ctx) return;
      
      // Professional placeholder design
      const gradient = ctx.createLinearGradient(currentX, currentY, currentX + currentWidth, currentY + currentHeight);
      gradient.addColorStop(0, '#f8f9fa');
      gradient.addColorStop(1, '#e9ecef');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(currentX, currentY, currentWidth, currentHeight);
      
      // Decorative border
      ctx.strokeStyle = '#dee2e6';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.strokeRect(currentX + 10, currentY + 10, currentWidth - 20, currentHeight - 20);
      ctx.setLineDash([]);
      
      // Professional placeholder text
      ctx.fillStyle = '#6c757d';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Your Artwork', currentX + currentWidth / 2, currentY + currentHeight / 2 - 20);
      
      ctx.font = '16px Arial';
      ctx.fillText(`${artworkWidth}" × ${artworkHeight}"`, currentX + currentWidth / 2, currentY + currentHeight / 2 + 20);
      
      if (onFrameImageCaptured) {
        setTimeout(() => {
          try {
            const frameDesignImage = canvas.toDataURL('image/jpeg', 0.95);
            onFrameImageCaptured(frameDesignImage);
          } catch (error) {
            console.error('Error capturing frame design:', error);
          }
        }, 100);
      }
    }

    ctx.restore();

  }, [frames, mats, artworkWidth, artworkHeight, currentArtworkImage, useMultipleFrames, useMultipleMats, onFrameImageCaptured, zoom, rotation]);

  function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.strokeStyle = '#f1f3f4';
    ctx.lineWidth = 1;
    const gridSize = 20;
    
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  function drawRealisticFrame(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, frameWidth: number, frame: Frame, layerIndex: number) {
    // Create realistic frame color based on material
    let frameColor = frame.color || getFrameColorByMaterial(frame.material);
    
    // Add depth with gradient
    const gradient = ctx.createLinearGradient(x, y, x + frameWidth, y + frameWidth);
    gradient.addColorStop(0, lightenColor(frameColor, 20));
    gradient.addColorStop(0.5, frameColor);
    gradient.addColorStop(1, darkenColor(frameColor, 20));
    
    // Draw frame with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    
    // Create inner opening
    ctx.shadowColor = 'transparent';
    ctx.clearRect(x + frameWidth, y + frameWidth, width - frameWidth * 2, height - frameWidth * 2);
    
    // Add frame texture based on material
    addFrameTexture(ctx, x, y, width, height, frameWidth, frame.material);
  }

  function drawRealisticMat(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, matWidth: number, matboard: any, layerIndex: number) {
    // Draw mat with subtle texture
    ctx.fillStyle = matboard.color || '#FFFFFF';
    ctx.fillRect(x, y, width, height);
    
    // Add beveled edge effect
    const bevelSize = Math.min(matWidth / 3, 8);
    
    // Top bevel
    const topGradient = ctx.createLinearGradient(x, y, x, y + bevelSize);
    topGradient.addColorStop(0, lightenColor(matboard.color || '#FFFFFF', 15));
    topGradient.addColorStop(1, matboard.color || '#FFFFFF');
    ctx.fillStyle = topGradient;
    ctx.fillRect(x, y, width, bevelSize);
    
    // Left bevel
    const leftGradient = ctx.createLinearGradient(x, y, x + bevelSize, y);
    leftGradient.addColorStop(0, lightenColor(matboard.color || '#FFFFFF', 15));
    leftGradient.addColorStop(1, matboard.color || '#FFFFFF');
    ctx.fillStyle = leftGradient;
    ctx.fillRect(x, y, bevelSize, height);
    
    // Bottom bevel
    const bottomGradient = ctx.createLinearGradient(x, y + height - bevelSize, x, y + height);
    bottomGradient.addColorStop(0, matboard.color || '#FFFFFF');
    bottomGradient.addColorStop(1, darkenColor(matboard.color || '#FFFFFF', 10));
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(x, y + height - bevelSize, width, bevelSize);
    
    // Right bevel
    const rightGradient = ctx.createLinearGradient(x + width - bevelSize, y, x + width, y);
    rightGradient.addColorStop(0, matboard.color || '#FFFFFF');
    rightGradient.addColorStop(1, darkenColor(matboard.color || '#FFFFFF', 10));
    ctx.fillStyle = rightGradient;
    ctx.fillRect(x + width - bevelSize, y, bevelSize, height);
    
    // Create inner opening
    ctx.clearRect(x + matWidth, y + matWidth, width - matWidth * 2, height - matWidth * 2);
  }

  function getFrameColorByMaterial(material: string): string {
    const materialColors: { [key: string]: string } = {
      'wood': '#8B4513',
      'metal': '#A9A9A9',
      'plastic': '#2F4F4F',
      'composite': '#654321',
      'aluminum': '#C0C0C0',
      'gold': '#FFD700',
      'silver': '#C0C0C0',
      'bronze': '#CD7F32'
    };
    
    return materialColors[material.toLowerCase()] || '#8B4513';
  }

  function addFrameTexture(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, frameWidth: number, material: string) {
    if (material.toLowerCase().includes('wood')) {
      // Add wood grain texture
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < frameWidth; i += 3) {
        ctx.beginPath();
        ctx.moveTo(x + i, y);
        ctx.lineTo(x + i, y + height);
        ctx.stroke();
      }
    } else if (material.toLowerCase().includes('metal')) {
      // Add metallic sheen
      const gradient = ctx.createLinearGradient(x, y, x + frameWidth, y);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, frameWidth, height);
    }
  }

  function lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  function darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
      (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
      (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
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
  };

  return (
    <div className="production-frame-visualizer w-full">
      {/* Professional Controls */}
      <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRotation((rotation + 90) % 360)}
          >
            <RotateCw className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Artwork
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        
        <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Download Preview
        </Button>
      </div>

      {/* High-Resolution Canvas */}
      <div className="w-full bg-white p-6 rounded-lg shadow-lg border">
        <div className="flex justify-center">
          <canvas 
            ref={canvasRef}
            className="border border-gray-200 shadow-xl rounded-lg"
            width={1000}
            height={700}
            style={{ 
              width: '100%',
              maxWidth: '1000px',
              height: 'auto',
              display: 'block'
            }}
          />
        </div>
      </div>

      {/* Professional Details */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Artwork Details</h4>
            <p>Dimensions: {artworkWidth}" × {artworkHeight}"</p>
            <p>Aspect Ratio: {(artworkWidth / artworkHeight).toFixed(2)}:1</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Frame Configuration</h4>
            <p>{frames.length > 0 ? (useMultipleFrames ? `${frames.length} frames` : 'Single frame') : 'No frame selected'}</p>
            <p>{mats.length > 0 ? (useMultipleMats ? `${mats.length} mats` : 'Single mat') : 'No mat selected'}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Technical Specs</h4>
            <p>Resolution: 1000×700px</p>
            <p>Format: High-quality PNG/JPEG</p>
          </div>
        </div>
      </div>
    </div>
  );
}