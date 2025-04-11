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
  frame: Frame | null;
  matColor: MatColor | null;
  matWidth: number;
  artworkWidth: number;
  artworkHeight: number;
  artworkImage: string | null;
}

const FrameVisualizer: React.FC<FrameVisualizerProps> = ({
  frame,
  matColor,
  matWidth,
  artworkWidth,
  artworkHeight,
  artworkImage
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // If no artwork is uploaded, use a placeholder
  const artworkSrc = artworkImage || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFydHdvcmt8ZW58MHx8MHx8fDA%3D';

  useEffect(() => {
    if (!frame || !matColor || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load the artwork image
    const artworkImg = new Image();
    artworkImg.crossOrigin = "Anonymous";
    artworkImg.src = artworkSrc;

    // Load the frame image
    const frameImg = new Image();
    frameImg.crossOrigin = "Anonymous";
    frameImg.src = frame.catalogImage;
    
    // Log for debugging
    console.log('Loading frame image:', frame.catalogImage);
    
    // Draw everything once both images are loaded
    Promise.all([
      new Promise<void>(resolve => {
        artworkImg.onload = () => resolve();
        artworkImg.onerror = () => {
          console.error('Failed to load artwork image, using fallback');
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
      new Promise<void>(resolve => {
        frameImg.onload = () => resolve();
        frameImg.onerror = () => {
          console.error('Failed to load frame image, using fallback');
          // Create a fallback frame texture
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = 100;
            canvas.height = 100;
            // Create a wood-like texture pattern
            const gradient = ctx.createLinearGradient(0, 0, 100, 0);
            gradient.addColorStop(0, frame.color || '#8B4513');
            gradient.addColorStop(0.5, frame.color ? lightenColor(frame.color, 20) : '#A0522D');
            gradient.addColorStop(1, frame.color || '#8B4513');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add some grain texture
            for (let i = 0; i < 1000; i++) {
              const x = Math.random() * canvas.width;
              const y = Math.random() * canvas.height;
              const r = Math.random() * 1;
              ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.1})`;
              ctx.fillRect(x, y, r, r);
            }
            
            frameImg.src = canvas.toDataURL();
          }
          resolve();
        };
      })
    ]).then(() => {
      // Set canvas dimensions to maintain aspect ratio
      const aspectRatio = artworkWidth / artworkHeight;
      
      // Calculate display dimensions while preserving aspect ratio
      const displayWidth = Math.min(500, window.innerWidth * 0.8);
      const displayHeight = displayWidth / aspectRatio;
      
      // Calculate frame width based on frame's actual dimensions
      const frameWidthPx = Math.max(16, Number(frame.width) * 12); // Scale the real frame width to pixels
      
      // Calculate mat width in pixels
      const matWidthPx = matWidth * 16; // Scale the mat width for display
      
      // Set the canvas dimensions to include frame and mat
      canvas.width = displayWidth + (frameWidthPx + matWidthPx) * 2;
      canvas.height = displayHeight + (frameWidthPx + matWidthPx) * 2;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw mat background
      ctx.fillStyle = matColor.color;
      ctx.fillRect(
        frameWidthPx, 
        frameWidthPx, 
        canvas.width - frameWidthPx * 2, 
        canvas.height - frameWidthPx * 2
      );
      
      // Draw artwork in center of mat
      const artworkLeft = frameWidthPx + matWidthPx;
      const artworkTop = frameWidthPx + matWidthPx;
      const artworkDisplayWidth = canvas.width - (frameWidthPx + matWidthPx) * 2;
      const artworkDisplayHeight = canvas.height - (frameWidthPx + matWidthPx) * 2;
      
      ctx.drawImage(
        artworkImg, 
        artworkLeft, 
        artworkTop, 
        artworkDisplayWidth, 
        artworkDisplayHeight
      );
      
      // Draw frame
      // Top edge
      ctx.drawImage(
        frameImg, 
        frameWidthPx, 0, 
        canvas.width - frameWidthPx * 2, frameWidthPx
      );
      
      // Bottom edge
      ctx.drawImage(
        frameImg, 
        frameWidthPx, canvas.height - frameWidthPx, 
        canvas.width - frameWidthPx * 2, frameWidthPx
      );
      
      // Left edge
      ctx.drawImage(
        frameImg, 
        0, frameWidthPx, 
        frameWidthPx, canvas.height - frameWidthPx * 2
      );
      
      // Right edge
      ctx.drawImage(
        frameImg, 
        canvas.width - frameWidthPx, frameWidthPx, 
        frameWidthPx, canvas.height - frameWidthPx * 2
      );
      
      // Top-left corner
      ctx.drawImage(
        frameImg, 
        0, 0, 
        frameWidthPx, frameWidthPx
      );
      
      // Top-right corner
      ctx.drawImage(
        frameImg, 
        canvas.width - frameWidthPx, 0, 
        frameWidthPx, frameWidthPx
      );
      
      // Bottom-left corner
      ctx.drawImage(
        frameImg, 
        0, canvas.height - frameWidthPx, 
        frameWidthPx, frameWidthPx
      );
      
      // Bottom-right corner
      ctx.drawImage(
        frameImg, 
        canvas.width - frameWidthPx, canvas.height - frameWidthPx, 
        frameWidthPx, frameWidthPx
      );
      
      // Add subtle inner shadow to mat
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        frameWidthPx + 1, 
        frameWidthPx + 1, 
        canvas.width - frameWidthPx * 2 - 2, 
        canvas.height - frameWidthPx * 2 - 2
      );
      ctx.restore();
    });
  }, [frame, matColor, matWidth, artworkWidth, artworkHeight, artworkSrc]);

  if (!frame || !matColor) {
    const missingItem = !frame ? "frame" : "mat color";
    return (
      <div className="preview-placeholder">
        <div className="flex flex-col items-center justify-center py-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-muted-foreground">Select a {missingItem} to see preview</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="frame-preview-container flex justify-center items-center p-4 bg-gray-50 rounded-lg shadow-inner">
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto shadow-md"
        style={{ maxHeight: '500px' }}
      />
      <div className="frame-details mt-4 text-sm text-muted-foreground">
        <p className="text-center">
          Frame: {frame.name} • Mat: {matColor.name} • 
          Mat Width: {matWidth}" • Size: {artworkWidth}" × {artworkHeight}"
        </p>
      </div>
    </div>
  );
};

export default FrameVisualizer;
