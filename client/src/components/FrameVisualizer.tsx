import React from 'react';
import { Frame, MatColor } from '@shared/schema';

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
  if (!frame) {
    return (
      <div className="preview-placeholder">
        <div className="flex flex-col items-center justify-center py-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-light-textSecondary dark:text-dark-textSecondary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-light-textSecondary dark:text-dark-textSecondary">Select a frame to see preview</p>
        </div>
      </div>
    );
  }

  // Calculate frame dimensions
  const frameEdgeSize = Math.max(30, frame.width * 10); // Scale the frame edge size based on the frame width
  
  // If no artwork is uploaded, use a placeholder
  const artworkSrc = artworkImage || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFydHdvcmt8ZW58MHx8MHx8fDA%3D';
  
  return (
    <div className="frame-preview-container">
      <div className="frame-with-corners">
        {/* Top-left corner */}
        <div 
          className="frame-corner frame-corner-tl" 
          style={{
            width: `${frameEdgeSize}px`,
            height: `${frameEdgeSize}px`,
            backgroundImage: `url(${frame.corner || frame.catalogImage})`,
            backgroundSize: 'cover'
          }}
        ></div>
        
        {/* Top edge */}
        <div 
          className="frame-edge frame-edge-top" 
          style={{
            height: `${frameEdgeSize}px`,
            backgroundImage: `url(${frame.edgeTexture || frame.catalogImage})`
          }}
        ></div>
        
        {/* Top-right corner */}
        <div 
          className="frame-corner frame-corner-tr" 
          style={{
            width: `${frameEdgeSize}px`,
            height: `${frameEdgeSize}px`,
            backgroundImage: `url(${frame.corner || frame.catalogImage})`,
            backgroundSize: 'cover'
          }}
        ></div>
        
        {/* Left edge */}
        <div 
          className="frame-edge frame-edge-left" 
          style={{
            width: `${frameEdgeSize}px`,
            backgroundImage: `url(${frame.edgeTexture || frame.catalogImage})`
          }}
        ></div>
        
        {/* Center - actual artwork with mat */}
        <div 
          className="artwork-with-mat" 
          style={{
            backgroundColor: matColor?.color || 'white',
            padding: `${matWidth * 16}px` // Scale mat width for display
          }}
        >
          <img 
            src={artworkSrc} 
            alt="Your framed artwork" 
            className="artwork-image"
            style={{
              maxWidth: '100%',
              maxHeight: '300px',
              aspectRatio: `${artworkWidth} / ${artworkHeight}`
            }}
          />
        </div>
        
        {/* Right edge */}
        <div 
          className="frame-edge frame-edge-right" 
          style={{
            width: `${frameEdgeSize}px`,
            backgroundImage: `url(${frame.edgeTexture || frame.catalogImage})`
          }}
        ></div>
        
        {/* Bottom-left corner */}
        <div 
          className="frame-corner frame-corner-bl" 
          style={{
            width: `${frameEdgeSize}px`,
            height: `${frameEdgeSize}px`,
            backgroundImage: `url(${frame.corner || frame.catalogImage})`,
            backgroundSize: 'cover'
          }}
        ></div>
        
        {/* Bottom edge */}
        <div 
          className="frame-edge frame-edge-bottom" 
          style={{
            height: `${frameEdgeSize}px`,
            backgroundImage: `url(${frame.edgeTexture || frame.catalogImage})`
          }}
        ></div>
        
        {/* Bottom-right corner */}
        <div 
          className="frame-corner frame-corner-br" 
          style={{
            width: `${frameEdgeSize}px`,
            height: `${frameEdgeSize}px`,
            backgroundImage: `url(${frame.corner || frame.catalogImage})`,
            backgroundSize: 'cover'
          }}
        ></div>
      </div>
    </div>
  );
};

export default FrameVisualizer;
