import React, { useEffect, useRef } from 'react';
import { Frame, MatColor } from '@shared/schema';

// Utility function to lighten a color for frame visualization
function lightenColor(color: string, percent: number): string {
  // Convert hex to RGB
  let r = parseInt(color.substring(1, 3), 16);
  let g = parseInt(color.substring(3, 5), 16);
  let b = parseInt(color.substring(5, 7), 16);
  
  // Lighten
  r = Math.min(255, Math.round(r + (255 - r) * (percent / 100)));
  g = Math.min(255, Math.round(g + (255 - g) * (percent / 100)));
  b = Math.min(255, Math.round(b + (255 - b) * (percent / 100)));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

interface FrameVisualizerProps {
  frames: {
    frame: Frame;
    position: number;
    distance: number;
  }[];
  mats: {
    matboard: MatColor;
    position: number;
    width: number;
    offset: number;
  }[];
  artworkWidth: number;
  artworkHeight: number;
  artworkImage: string | null;
  useMultipleMats: boolean;
  useMultipleFrames: boolean;
}

const FrameVisualizer: React.FC<FrameVisualizerProps> = ({
  frames,
  mats,
  artworkWidth,
  artworkHeight,
  artworkImage,
  useMultipleMats,
  useMultipleFrames
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check if we have at least one frame and one mat
    if (frames.length === 0 || mats.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Sort mats by position (bottom to top)
    const sortedMats = [...mats].sort((a, b) => b.position - a.position);
    
    // Sort frames by position (inner to outer)
    const sortedFrames = [...frames].sort((a, b) => a.position - b.position);
    
    // Load the artwork image
    const artworkImg = new Image();
    artworkImg.crossOrigin = "Anonymous";
    
    // Create a default placeholder image if no artwork is provided
    if (!artworkImage) {
      console.log('No artwork image provided, creating placeholder');
      const placeholderCanvas = document.createElement('canvas');
      const placeholderCtx = placeholderCanvas.getContext('2d');
      if (placeholderCtx) {
        placeholderCanvas.width = 400;
        placeholderCanvas.height = 300;
        placeholderCtx.fillStyle = '#f0f0f0';
        placeholderCtx.fillRect(0, 0, placeholderCanvas.width, placeholderCanvas.height);
        placeholderCtx.fillStyle = '#888';
        placeholderCtx.font = '16px Arial';
        placeholderCtx.textAlign = 'center';
        placeholderCtx.fillText('Upload an image', placeholderCanvas.width/2, placeholderCanvas.height/2);
        artworkImg.src = placeholderCanvas.toDataURL();
      }
    } else {
      artworkImg.src = artworkImage;
    }
    
    // Create frame textures
    const frameImages = sortedFrames.map(frameItem => {
      const { frame } = frameItem;
      
      // Create a new image for each frame
      const frameImg = new Image();
      frameImg.crossOrigin = "Anonymous";
      
      // Create a frame texture for this specific frame
      const frameCanvas = document.createElement('canvas');
      const frameCtx = frameCanvas.getContext('2d');
      
      if (frameCtx) {
        frameCanvas.width = 100;
        frameCanvas.height = 100;
        
        // Get the frame color
        let frameColor = '#8B4513'; // Default medium brown wood color
        
        // Check if frame name contains color information
        if (frame.name && frame.material) {
          const nameLower = frame.name.toLowerCase();
          const materialLower = frame.material.toLowerCase();
          
          // Choose appropriate color based on material AND name
          if (nameLower.includes('black') || materialLower.includes('black')) {
            frameColor = '#000000'; // True black
          } else if (nameLower.includes('gold') || materialLower.includes('gold')) {
            frameColor = '#D4AF37'; // Gold
          } else if (nameLower.includes('silver') || nameLower.includes('metal') || 
                   materialLower.includes('silver') || materialLower.includes('metal')) {
            frameColor = '#C0C0C0'; // Silver
          } else if (nameLower.includes('white') || materialLower.includes('white')) {
            frameColor = '#F5F5F5'; // White
          } else if (nameLower.includes('walnut') || materialLower.includes('walnut')) {
            frameColor = '#5C4033'; // Walnut
          } else if (nameLower.includes('cherry') || materialLower.includes('cherry')) {
            frameColor = '#722F37'; // Cherry
          } else if (nameLower.includes('oak') || materialLower.includes('oak')) {
            frameColor = '#D8BE75'; // Oak
          }
        }
        
        // Use any explicit color from the frame data if available
        if (frame.color) {
          frameColor = frame.color;
        }
        
        // Create a gradient for wood-like appearance
        const gradient = frameCtx.createLinearGradient(0, 0, 100, 0);
        gradient.addColorStop(0, frameColor);
        gradient.addColorStop(0.5, lightenColor(frameColor, 20));
        gradient.addColorStop(1, frameColor);
        frameCtx.fillStyle = gradient;
        frameCtx.fillRect(0, 0, frameCanvas.width, frameCanvas.height);
        
        // Add some grain texture
        for (let i = 0; i < 1000; i++) {
          const x = Math.random() * frameCanvas.width;
          const y = Math.random() * frameCanvas.height;
          const r = Math.random() * 1;
          frameCtx.fillStyle = `rgba(0,0,0,${Math.random() * 0.1})`;
          frameCtx.fillRect(x, y, r, r);
        }
        
        // Set the generated texture as the frame image source
        frameImg.src = frameCanvas.toDataURL();
      }
      
      return { frameImg, frameItem };
    });
    
    // Wait for all images to load
    const loadPromises = [
      new Promise<void>(resolve => {
        artworkImg.onload = () => {
          console.log('Artwork image loaded successfully');
          resolve();
        };
        artworkImg.onerror = () => {
          console.error('Failed to load artwork image');
          // Create a fallback image with text
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = 400;
            canvas.height = 300;
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#888';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Artwork preview not available', canvas.width/2, canvas.height/2);
            artworkImg.src = canvas.toDataURL();
          }
          resolve();
        };
      }),
      ...frameImages.map(({ frameImg, frameItem }) => 
        new Promise<void>(resolve => {
          frameImg.onload = () => {
            console.log(`Successfully loaded frame image for ${frameItem.frame.id}`);
            resolve();
          };
          frameImg.onerror = () => {
            console.error(`Failed to load frame image for frame: ${frameItem.frame.id}`);
            resolve();
          };
        })
      )
    ];
    
    Promise.all(loadPromises).then(() => {
      // Set canvas dimensions to maintain aspect ratio
      const aspectRatio = artworkWidth / artworkHeight;
      
      // Ensure aspect ratio is respected (square if artwork is square)
      const isSquarish = Math.abs(aspectRatio - 1) < 0.1;
      
      // Calculate display dimensions while preserving aspect ratio
      const maxDimension = Math.min(600, window.innerWidth * 0.9, window.innerHeight * 0.7);
      const displayWidth = isSquarish ? maxDimension : Math.min(maxDimension, maxDimension * aspectRatio);
      const displayHeight = isSquarish ? maxDimension : displayWidth / aspectRatio;
      
      // Calculate total mat width
      let totalMatWidth = 0;
      sortedMats.forEach(mat => {
        totalMatWidth += mat.width;
      });
      
      // Calculate total frame width 
      let totalFrameWidth = 0;
      let totalFrameDistance = 0;
      sortedFrames.forEach(frameItem => {
        totalFrameWidth += Number(frameItem.frame.width);
        if (frameItem.position > 1) {
          totalFrameDistance += frameItem.distance;
        }
      });
      
      // Set the canvas dimensions to include frames, mats, and distances
      const scaleFactor = 16; // Pixels per inch for display
      const totalMatWidthPx = totalMatWidth * scaleFactor;
      const totalFrameWidthPx = totalFrameWidth * scaleFactor;
      const totalFrameDistancePx = totalFrameDistance * scaleFactor;
      
      // Set canvas size
      canvas.width = displayWidth + (totalMatWidthPx + totalFrameWidthPx + totalFrameDistancePx) * 2;
      canvas.height = displayHeight + (totalMatWidthPx + totalFrameWidthPx + totalFrameDistancePx) * 2;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Track current position as we draw from outside in
      let currentX = 0;
      let currentY = 0;
      let currentWidth = canvas.width;
      let currentHeight = canvas.height;
      
      // Draw frames from outside to inside
      if (useMultipleFrames) {
        // Draw all frames in reverse order (outer to inner)
        for (let i = sortedFrames.length - 1; i >= 0; i--) {
          const { frameImg, frameItem } = frameImages[i];
          const frameWidthPx = Number(frameItem.frame.width) * scaleFactor;
          
          // Draw frame
          // Top edge
          ctx.drawImage(
            frameImg, 
            currentX, currentY, 
            currentWidth, frameWidthPx
          );
          
          // Bottom edge
          ctx.drawImage(
            frameImg, 
            currentX, currentY + currentHeight - frameWidthPx, 
            currentWidth, frameWidthPx
          );
          
          // Left edge
          ctx.drawImage(
            frameImg, 
            currentX, currentY + frameWidthPx, 
            frameWidthPx, currentHeight - frameWidthPx * 2
          );
          
          // Right edge
          ctx.drawImage(
            frameImg, 
            currentX + currentWidth - frameWidthPx, currentY + frameWidthPx, 
            frameWidthPx, currentHeight - frameWidthPx * 2
          );
          
          // Move inward for the next frame or mat
          currentX += frameWidthPx;
          currentY += frameWidthPx;
          currentWidth -= frameWidthPx * 2;
          currentHeight -= frameWidthPx * 2;
          
          // Add distance between frames if this isn't the innermost frame
          if (i > 0 && frameItem.distance > 0) {
            const distancePx = frameItem.distance * scaleFactor;
            // Draw the gap as a basic color (could be customized)
            ctx.fillStyle = "#f5f5f5";
            ctx.fillRect(currentX, currentY, currentWidth, currentHeight);
            
            // Move inward by the distance
            currentX += distancePx;
            currentY += distancePx;
            currentWidth -= distancePx * 2;
            currentHeight -= distancePx * 2;
          }
        }
      } else {
        // Draw only the innermost frame
        if (sortedFrames.length > 0) {
          const { frameImg, frameItem } = frameImages[0];
          const frameWidthPx = Number(frameItem.frame.width) * scaleFactor;
          
          // Draw frame
          // Top edge
          ctx.drawImage(
            frameImg, 
            currentX, currentY, 
            currentWidth, frameWidthPx
          );
          
          // Bottom edge
          ctx.drawImage(
            frameImg, 
            currentX, currentY + currentHeight - frameWidthPx, 
            currentWidth, frameWidthPx
          );
          
          // Left edge
          ctx.drawImage(
            frameImg, 
            currentX, currentY + frameWidthPx, 
            frameWidthPx, currentHeight - frameWidthPx * 2
          );
          
          // Right edge
          ctx.drawImage(
            frameImg, 
            currentX + currentWidth - frameWidthPx, currentY + frameWidthPx, 
            frameWidthPx, currentHeight - frameWidthPx * 2
          );
          
          // Move inward for the mats
          currentX += frameWidthPx;
          currentY += frameWidthPx;
          currentWidth -= frameWidthPx * 2;
          currentHeight -= frameWidthPx * 2;
        }
      }
      
      // Draw mats from top to bottom (outermost to innermost)
      // The bottom mat (position=bottom) should be closest to the artwork (innermost)
      if (useMultipleMats) {
        // Draw all mats in reverse order (outermost to innermost)
        for (let i = sortedMats.length - 1; i >= 0; i--) {
          const mat = sortedMats[i];
          const matWidthPx = mat.width * scaleFactor;
          
          // Draw mat
          ctx.fillStyle = mat.matboard.color;
          ctx.fillRect(
            currentX, 
            currentY, 
            currentWidth, 
            currentHeight
          );
          
          // Move inward for the next mat or artwork
          // Add offset for all mats except the topmost one
          const offsetPx = (i < sortedMats.length - 1 && mat.offset > 0) ? mat.offset * scaleFactor : 0;
          
          // Store the current position before moving inward (for drawing inner line)
          const innerX = currentX + matWidthPx + offsetPx;
          const innerY = currentY + matWidthPx + offsetPx;
          const innerWidth = currentWidth - (matWidthPx + offsetPx) * 2;
          const innerHeight = currentHeight - (matWidthPx + offsetPx) * 2;
          
          // Move position for next mat
          currentX += matWidthPx + offsetPx;
          currentY += matWidthPx + offsetPx;
          currentWidth -= (matWidthPx + offsetPx) * 2;
          currentHeight -= (matWidthPx + offsetPx) * 2;
          
          // Draw a thin contrasting line along the inside edge of the mat
          // This makes it easier to see where each mat ends
          const lineWidth = Math.max(1, scaleFactor * 0.05); // Thin line that scales with the display
          ctx.strokeStyle = mat.matboard.color === '#FFFFFF' || mat.matboard.color === '#FFF' 
            ? '#888888' // Use gray for white mats
            : '#FFFFFF'; // Use white for colored mats
          ctx.lineWidth = lineWidth;
          ctx.strokeRect(
            innerX - lineWidth/2, 
            innerY - lineWidth/2, 
            innerWidth + lineWidth, 
            innerHeight + lineWidth
          );
        }
      } else {
        // Draw only the innermost mat (bottom position, closest to artwork)
        if (sortedMats.length > 0) {
          const mat = sortedMats[sortedMats.length - 1];
          const matWidthPx = mat.width * scaleFactor;
          
          // Draw mat
          ctx.fillStyle = mat.matboard.color;
          ctx.fillRect(
            currentX, 
            currentY, 
            currentWidth, 
            currentHeight
          );
          
          // Store the current position before moving inward (for drawing inner line)
          const innerX = currentX + matWidthPx;
          const innerY = currentY + matWidthPx;
          const innerWidth = currentWidth - matWidthPx * 2;
          const innerHeight = currentHeight - matWidthPx * 2;
          
          // Move inward for the artwork
          currentX += matWidthPx;
          currentY += matWidthPx;
          currentWidth -= matWidthPx * 2;
          currentHeight -= matWidthPx * 2;
          
          // Draw a thin contrasting line along the inside edge of the mat
          const lineWidth = Math.max(1, scaleFactor * 0.05);
          ctx.strokeStyle = mat.matboard.color === '#FFFFFF' || mat.matboard.color === '#FFF' 
            ? '#888888' // Use gray for white mats
            : '#FFFFFF'; // Use white for colored mats
          ctx.lineWidth = lineWidth;
          ctx.strokeRect(
            innerX - lineWidth/2, 
            innerY - lineWidth/2, 
            innerWidth + lineWidth, 
            innerHeight + lineWidth
          );
        }
      }
      
      // Draw artwork in center
      ctx.drawImage(
        artworkImg, 
        currentX, 
        currentY, 
        currentWidth, 
        currentHeight
      );
    });
  }, [frames, mats, artworkWidth, artworkHeight, artworkImage, useMultipleMats, useMultipleFrames]);

  return (
    <div className="frame-visualizer-container flex flex-col items-center justify-center p-4 w-full h-full">
      <div className="flex-1 w-full flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="border border-border shadow-md object-contain"
          style={{ 
            maxWidth: '100%', 
            maxHeight: '100%', 
            aspectRatio: artworkWidth && artworkHeight ? `${artworkWidth}/${artworkHeight}` : '1/1',
            width: 'auto', 
            height: 'auto' 
          }}
        />
      </div>
      <div className="text-center text-sm text-muted-foreground mt-2 w-full">
        {frames.length > 0 && mats.length > 0 ? (
          <p>
            {useMultipleFrames ? `${frames.length} frames` : 'Single frame'} | 
            {useMultipleMats ? `${mats.length} mats` : 'Single mat'} | 
            Artwork: {artworkWidth}" × {artworkHeight}"
          </p>
        ) : (
          <p>Select frames and mats to visualize your framed artwork</p>
        )}
      </div>
    </div>
  );
};

export default FrameVisualizer;