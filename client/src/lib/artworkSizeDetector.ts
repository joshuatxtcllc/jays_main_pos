
/**
 * Artwork Size Detector for Jay's Frames
 * 
 * This module provides functionality to detect artwork size using 
 * reference markers in uploaded images.
 */

import { toast } from '@/hooks/use-toast';

export interface ArtworkDimensions {
  width: number;
  height: number;
  unit: 'in' | 'cm';
}

export interface ArtworkDetectorOptions {
  markerSizeCm?: number;
  minContourArea?: number;
  edgeDetectionThreshold?: number;
  allowManualOverride?: boolean;
}

export class ArtworkSizeDetector {
  private options: ArtworkDetectorOptions;
  private initialized: boolean = false;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor(options: ArtworkDetectorOptions = {}) {
    this.options = {
      markerSizeCm: options.markerSizeCm || 5,
      minContourArea: options.minContourArea || 1000,
      edgeDetectionThreshold: options.edgeDetectionThreshold || 100,
      allowManualOverride: options.allowManualOverride !== undefined ? options.allowManualOverride : true
    };
  }

  /**
   * Initialize the detector with required elements
   */
  async initialize(): Promise<void> {
    try {
      // Create canvas element for processing
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      
      if (!this.ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      this.initialized = true;
      
      console.log('Artwork size detector initialized successfully');
    } catch (error) {
      console.error('Failed to initialize artwork size detector:', error);
      throw error;
    }
  }

  /**
   * Generate a reference marker image
   * @param markerSize Size of the marker in pixels
   * @returns Canvas element with marker
   */
  generateMarker(markerSize: number = 500): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    // Set canvas size
    canvas.width = markerSize;
    canvas.height = markerSize;
    
    // Draw white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, markerSize, markerSize);
    
    // Draw black border
    const borderWidth = Math.floor(markerSize * 0.08);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, markerSize, borderWidth); // top
    ctx.fillRect(0, 0, borderWidth, markerSize); // left
    ctx.fillRect(markerSize - borderWidth, 0, borderWidth, markerSize); // right
    ctx.fillRect(0, markerSize - borderWidth, markerSize, borderWidth); // bottom
    
    // Draw internal pattern (improved marker with more prominent features)
    const patternSize = markerSize - (borderWidth * 2);
    const gridSize = 8; // Increased grid size for more detail
    const cellSize = patternSize / gridSize;
    
    // Enhanced pattern - more distinctive for better detection
    const pattern = [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1]
    ];
    
    // Draw the pattern
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (pattern[y] && pattern[y][x] === 1) {
          ctx.fillRect(
            borderWidth + (x * cellSize),
            borderWidth + (y * cellSize),
            cellSize,
            cellSize
          );
        }
      }
    }
    
    // Draw crosshair in center for better alignment
    const centerX = markerSize / 2;
    const centerY = markerSize / 2;
    const crossSize = markerSize * 0.1;
    
    ctx.strokeStyle = 'red';
    ctx.lineWidth = Math.max(3, markerSize / 100);
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(centerX - crossSize, centerY);
    ctx.lineTo(centerX + crossSize, centerY);
    ctx.stroke();
    
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - crossSize);
    ctx.lineTo(centerX, centerY + crossSize);
    ctx.stroke();
    
    // Add text with dimensions
    const markerFooterHeight = Math.floor(markerSize * 0.15);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, markerSize - markerFooterHeight, markerSize, markerFooterHeight);
    
    ctx.fillStyle = 'black';
    const fontSize = Math.floor(markerSize/16);
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    
    const markerSizeCm = this.options.markerSizeCm || 5;
    ctx.fillText(`${markerSizeCm} CM × ${markerSizeCm} CM`, markerSize/2, markerSize - markerFooterHeight/2);
    
    // Add decorative corners to help with size detection
    const cornerSize = Math.floor(markerSize * 0.15);
    ctx.fillStyle = 'red';
    
    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(cornerSize, 0);
    ctx.lineTo(0, cornerSize);
    ctx.fill();
    
    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(markerSize, 0);
    ctx.lineTo(markerSize - cornerSize, 0);
    ctx.lineTo(markerSize, cornerSize);
    ctx.fill();
    
    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(0, markerSize);
    ctx.lineTo(cornerSize, markerSize);
    ctx.lineTo(0, markerSize - cornerSize);
    ctx.fill();
    
    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(markerSize, markerSize);
    ctx.lineTo(markerSize - cornerSize, markerSize);
    ctx.lineTo(markerSize, markerSize - cornerSize);
    ctx.fill();
    
    return canvas;
  }
  
  /**
   * Download the reference marker as PNG
   */
  downloadMarker(): void {
    const markerCanvas = this.generateMarker(500);
    const link = document.createElement('a');
    link.download = 'reference-marker.png';
    link.href = markerCanvas.toDataURL('image/png');
    link.click();
  }

  /**
   * Estimate artwork dimensions from an image
   * In a real implementation, this would use computer vision libraries
   * to detect the marker and calculate dimensions
   * 
   * @param image The artwork image
   * @returns Promise resolving to artwork dimensions
   */
  async estimateDimensions(image: HTMLImageElement): Promise<ArtworkDimensions> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.canvas || !this.ctx) {
      throw new Error('Canvas not initialized');
    }
    
    try {
      // Set canvas to image dimensions
      this.canvas.width = image.width;
      this.canvas.height = image.height;
      
      // Draw the image
      this.ctx.drawImage(image, 0, 0, image.width, image.height);
      
      // Calculate aspect ratio
      const aspectRatio = image.width / image.height;
      
      // This is where actual marker detection would occur in a production implementation
      // For now, we'll use a conservative estimation approach based on typical artwork sizes
      
      // Common standard frame sizes in inches (width x height)
      const standardSizes = [
        { width: 5, height: 7 },
        { width: 8, height: 10 },
        { width: 11, height: 14 },
        { width: 16, height: 20 },
        { width: 18, height: 24 },
        { width: 20, height: 24 },
        { width: 24, height: 36 }
      ];
      
      // Find the closest standard size based on aspect ratio
      let closestSize = standardSizes[0];
      let closestRatioDiff = Math.abs((closestSize.width / closestSize.height) - aspectRatio);
      
      for (const size of standardSizes) {
        const sizeRatio = size.width / size.height;
        const ratioDiff = Math.abs(sizeRatio - aspectRatio);
        
        if (ratioDiff < closestRatioDiff) {
          closestRatioDiff = ratioDiff;
          closestSize = size;
        }
      }
      
      // If the aspect ratio is very different from all standard sizes, adjust based on image resolution
      const sizeAdjustmentFactor = Math.min(1.5, Math.max(0.7, image.width / 2000));
      
      // Determine the base size dimensions
      let estimatedWidth = closestSize.width * sizeAdjustmentFactor;
      let estimatedHeight = closestSize.height * sizeAdjustmentFactor;
      
      // For images with unusual aspect ratios, adjust to maintain the image's original proportions
      if (closestRatioDiff > 0.2) {
        // Use a medium standard size as a baseline
        const baseSize = 16; // inches - typical medium artwork dimension
        
        // Calculate dimensions that preserve the image's aspect ratio
        if (aspectRatio >= 1) { // Landscape or square
          estimatedWidth = baseSize;
          estimatedHeight = baseSize / aspectRatio;
        } else { // Portrait
          estimatedHeight = baseSize;
          estimatedWidth = baseSize * aspectRatio;
        }
      }
      
      // Round to reasonable framing dimensions (nearest 0.5 inch)
      estimatedWidth = Math.round(estimatedWidth * 2) / 2;
      estimatedHeight = Math.round(estimatedHeight * 2) / 2;
      
      // Enforce minimum and maximum sizes for framing
      const minSize = 5; // 5 inches minimum
      const maxSize = 40; // 40 inches maximum
      
      estimatedWidth = Math.max(minSize, Math.min(maxSize, estimatedWidth));
      estimatedHeight = Math.max(minSize, Math.min(maxSize, estimatedHeight));
      
      // Log detailed information for debugging
      console.log('Image dimensions:', image.width, 'x', image.height, 'pixels');
      console.log('Aspect ratio:', aspectRatio);
      console.log('Closest standard size:', closestSize.width, 'x', closestSize.height);
      console.log('Size adjustment factor:', sizeAdjustmentFactor);
      console.log('Estimated dimensions:', estimatedWidth, 'x', estimatedHeight, 'inches');
      
      // Return the estimated dimensions
      return {
        width: estimatedWidth,
        height: estimatedHeight,
        unit: 'in'
      };
    } catch (error) {
      console.error('Error estimating artwork dimensions:', error);
      // Fallback to a reasonable default size if detection fails
      return {
        width: 16,
        height: 20,
        unit: 'in'
      };
    }
  }
  
  /**
   * Create a visualization of the detected artwork and marker
   * This would show the detected marker and artwork outlines in a real implementation
   * 
   * @param image The original artwork image
   * @param dimensions The detected dimensions
   * @returns Canvas element with visualization
   */
  createVisualization(image: HTMLImageElement, dimensions: ArtworkDimensions): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    // Set canvas dimensions
    canvas.width = image.width;
    canvas.height = image.height;
    
    // Draw the original image
    ctx.drawImage(image, 0, 0, image.width, image.height);
    
    // Draw a border around where we detected the artwork
    // In a real implementation, this would be based on actual detection results
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.lineWidth = 3;
    
    // For demonstration, draw a rectangle around most of the image
    const margin = Math.min(image.width, image.height) * 0.1;
    ctx.strokeRect(
      margin, 
      margin, 
      image.width - (margin * 2), 
      image.height - (margin * 2)
    );
    
    // Add dimensions text
    const text = `${dimensions.width}" × ${dimensions.height}"`;
    ctx.font = `bold ${Math.max(16, Math.floor(image.width / 20))}px Arial, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    const textWidth = ctx.measureText(text).width + 20;
    const textHeight = Math.max(24, Math.floor(image.width / 15));
    
    ctx.fillRect(
      (image.width - textWidth) / 2,
      image.height - margin - textHeight - 10,
      textWidth,
      textHeight
    );
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.textAlign = 'center';
    ctx.fillText(
      text,
      image.width / 2,
      image.height - margin - 20
    );
    
    return canvas;
  }
}

/**
 * Create an image element from a file
 * @param file The image file
 * @returns Promise resolving to an Image element
 */
export function createImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (!e.target || !e.target.result) {
        reject(new Error('Failed to read file data'));
        return;
      }
      
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to load image'));
      image.src = e.target!.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Download a reference marker for artwork size detection
 */
export function downloadReferenceMarker(): void {
  const detector = new ArtworkSizeDetector();
  detector.downloadMarker();
}
