
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
      
      // Get image data for processing
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const markerDetectionResult = this.detectReferenceMarker(imageData);
      
      if (markerDetectionResult.found) {
        console.log('Reference marker detected:', markerDetectionResult);
        
        // Calculate dimensions based on the marker size
        const markerSizeCm = this.options.markerSizeCm || 5; // 5cm default marker size
        const markerSizeInches = markerSizeCm / 2.54; // Convert cm to inches
        
        // Calculate scaling factor based on marker's detected vs actual size
        const scalingFactor = markerSizeInches / markerDetectionResult.sizeInPixels * markerDetectionResult.detectedSizeInPixels;
        
        // Calculate artwork dimensions using the scaling factor and image size
        // We subtract marker area from the measurement
        const artworkWidthPixels = image.width - markerDetectionResult.detectedSizeInPixels;
        const artworkHeightPixels = image.height - markerDetectionResult.detectedSizeInPixels;
        
        let estimatedWidth = artworkWidthPixels * scalingFactor;
        let estimatedHeight = artworkHeightPixels * scalingFactor;
        
        // If the marker was detected along one of the artwork edges, adjust the calculation
        if (markerDetectionResult.position === 'top' || markerDetectionResult.position === 'bottom') {
          estimatedHeight = artworkHeightPixels * scalingFactor;
        } else if (markerDetectionResult.position === 'left' || markerDetectionResult.position === 'right') {
          estimatedWidth = artworkWidthPixels * scalingFactor;
        }
        
        // Round to reasonable framing dimensions (nearest 0.25 inch)
        estimatedWidth = Math.round(estimatedWidth * 4) / 4;
        estimatedHeight = Math.round(estimatedHeight * 4) / 4;
        
        // Enforce minimum and maximum sizes for framing
        const minSize = 5; // 5 inches minimum
        const maxSize = 40; // 40 inches maximum
        
        estimatedWidth = Math.max(minSize, Math.min(maxSize, estimatedWidth));
        estimatedHeight = Math.max(minSize, Math.min(maxSize, estimatedHeight));
        
        console.log('Marker-based dimensions:', estimatedWidth, 'x', estimatedHeight, 'inches');
        
        return {
          width: estimatedWidth,
          height: estimatedHeight,
          unit: 'in'
        };
      } else {
        console.log('No reference marker detected, using estimation method');
        
        // Fall back to aspect ratio estimation if no marker is detected
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
      }
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
   * Detect reference marker in the image
   * @param imageData Image data from canvas
   * @returns Object containing detection results
   */
  private detectReferenceMarker(imageData: ImageData): {
    found: boolean;
    sizeInPixels: number;
    detectedSizeInPixels: number;
    confidence: number;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  } {
    try {
      const { data, width, height } = imageData;
      
      // Default marker properties
      const markerSignature = {
        // Marker has black border
        hasDarkBorder: true,
        // Marker has specific pattern inside
        hasInternalPattern: true,
        // Marker has red corners
        hasColoredCorners: true
      };
      
      // Basic edge detection to find potential marker borders
      const edgeThreshold = this.options.edgeDetectionThreshold || 100;
      const potentialMarkers = this.findPotentialMarkers(data, width, height, edgeThreshold);
      
      if (potentialMarkers.length === 0) {
        console.log('No potential markers found');
        return {
          found: false,
          sizeInPixels: 0,
          detectedSizeInPixels: 0,
          confidence: 0,
          position: 'center'
        };
      }
      
      // Evaluate each potential marker
      let bestMatchScore = 0;
      let bestMatch = null;
      
      for (const marker of potentialMarkers) {
        const { x, y, width: markerWidth, height: markerHeight } = marker;
        
        // Check for marker features
        const hasBlackBorder = this.checkForBlackBorder(data, width, x, y, markerWidth, markerHeight);
        const hasPattern = this.checkForInternalPattern(data, width, x, y, markerWidth, markerHeight);
        const hasRedCorners = this.checkForRedCorners(data, width, x, y, markerWidth, markerHeight);
        
        // Calculate match score (simple weighted sum)
        const matchScore = 
          (hasBlackBorder ? 0.4 : 0) + 
          (hasPattern ? 0.4 : 0) + 
          (hasRedCorners ? 0.2 : 0);
        
        if (matchScore > bestMatchScore) {
          bestMatchScore = matchScore;
          bestMatch = marker;
        }
      }
      
      // Determine if we found a marker with sufficient confidence
      if (bestMatch && bestMatchScore > 0.5) {
        // Determine position relative to the artwork
        const position = this.determineMarkerPosition(bestMatch, width, height);
        
        // Use the detected marker for size calculations
        return {
          found: true,
          sizeInPixels: 500, // Reference size used when generating the marker
          detectedSizeInPixels: Math.max(bestMatch.width, bestMatch.height),
          confidence: bestMatchScore,
          position
        };
      }
      
      return {
        found: false,
        sizeInPixels: 0,
        detectedSizeInPixels: 0,
        confidence: 0,
        position: 'center'
      };
    } catch (error) {
      console.error('Error detecting reference marker:', error);
      return {
        found: false,
        sizeInPixels: 0,
        detectedSizeInPixels: 0,
        confidence: 0,
        position: 'center'
      };
    }
  }
  
  /**
   * Find potential markers in the image by looking for square/rectangular shapes
   */
  private findPotentialMarkers(data: Uint8ClampedArray, width: number, height: number, edgeThreshold: number): Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }> {
    const potentialMarkers = [];
    const minSize = Math.min(width, height) * 0.05; // Minimum marker size (5% of image)
    const maxSize = Math.min(width, height) * 0.4; // Maximum marker size (40% of image)
    
    // Simple edge detection to find rectangular regions
    // For a real implementation, we would use a more sophisticated approach
    // like contour detection or Hough transform
    
    // For now, we'll use a simple grid-based approach to detect potential markers
    const gridSize = 10;
    const cellWidth = Math.floor(width / gridSize);
    const cellHeight = Math.floor(height / gridSize);
    
    for (let gridY = 0; gridY < gridSize - 1; gridY++) {
      for (let gridX = 0; gridX < gridSize - 1; gridX++) {
        const x = gridX * cellWidth;
        const y = gridY * cellHeight;
        
        // Check different potential marker sizes
        for (let sizeMultiplier = 1; sizeMultiplier <= 3; sizeMultiplier++) {
          const markerWidth = cellWidth * sizeMultiplier;
          const markerHeight = cellHeight * sizeMultiplier;
          
          // Skip if beyond image bounds or outside size constraints
          if (x + markerWidth >= width || y + markerHeight >= height ||
              markerWidth < minSize || markerWidth > maxSize ||
              markerHeight < minSize || markerHeight > maxSize) {
            continue;
          }
          
          // Check if this region might be a marker
          if (this.checkRegionEdges(data, width, x, y, markerWidth, markerHeight, edgeThreshold)) {
            potentialMarkers.push({
              x,
              y,
              width: markerWidth,
              height: markerHeight
            });
          }
        }
      }
    }
    
    console.log('Found', potentialMarkers.length, 'potential markers');
    return potentialMarkers;
  }
  
  /**
   * Check if a region has strong edge characteristics indicating a potential marker
   */
  private checkRegionEdges(
    data: Uint8ClampedArray, 
    imageWidth: number, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    threshold: number
  ): boolean {
    // Sample points along the perimeter of the region
    const sampleCount = 20;
    let edgePointCount = 0;
    
    // Check top and bottom edges
    for (let i = 0; i < sampleCount; i++) {
      const sampleX = x + Math.floor(width * (i / sampleCount));
      
      // Top edge
      if (this.isEdgePoint(data, imageWidth, sampleX, y, threshold)) {
        edgePointCount++;
      }
      
      // Bottom edge
      if (this.isEdgePoint(data, imageWidth, sampleX, y + height - 1, threshold)) {
        edgePointCount++;
      }
    }
    
    // Check left and right edges
    for (let i = 0; i < sampleCount; i++) {
      const sampleY = y + Math.floor(height * (i / sampleCount));
      
      // Left edge
      if (this.isEdgePoint(data, imageWidth, x, sampleY, threshold)) {
        edgePointCount++;
      }
      
      // Right edge
      if (this.isEdgePoint(data, imageWidth, x + width - 1, sampleY, threshold)) {
        edgePointCount++;
      }
    }
    
    // If at least 50% of sample points are edge points, consider it a potential marker
    return edgePointCount >= sampleCount;
  }
  
  /**
   * Check if a pixel is an edge point based on color difference with neighbors
   */
  private isEdgePoint(
    data: Uint8ClampedArray, 
    imageWidth: number, 
    x: number, 
    y: number, 
    threshold: number
  ): boolean {
    if (x <= 0 || y <= 0 || x >= imageWidth - 1) {
      return false;
    }
    
    const pixelIndex = (y * imageWidth + x) * 4;
    const leftPixelIndex = pixelIndex - 4;
    const rightPixelIndex = pixelIndex + 4;
    
    // Calculate color difference with left and right neighbors
    const rDiff = Math.abs(data[pixelIndex] - data[leftPixelIndex]) + 
                  Math.abs(data[pixelIndex] - data[rightPixelIndex]);
    const gDiff = Math.abs(data[pixelIndex + 1] - data[leftPixelIndex + 1]) + 
                  Math.abs(data[pixelIndex + 1] - data[rightPixelIndex + 1]);
    const bDiff = Math.abs(data[pixelIndex + 2] - data[leftPixelIndex + 2]) + 
                  Math.abs(data[pixelIndex + 2] - data[rightPixelIndex + 2]);
    
    // Total color difference
    const totalDiff = rDiff + gDiff + bDiff;
    
    return totalDiff > threshold;
  }
  
  /**
   * Check if the region has a black border (marker characteristic)
   */
  private checkForBlackBorder(
    data: Uint8ClampedArray, 
    imageWidth: number, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ): boolean {
    const borderWidth = Math.floor(Math.min(width, height) * 0.08);
    const sampleCount = 10;
    let darkPixelCount = 0;
    let totalSamples = 0;
    
    // Sample points on the border
    for (let i = 0; i < sampleCount; i++) {
      // Top border
      const topX = x + Math.floor(width * (i / sampleCount));
      for (let offset = 0; offset < borderWidth; offset++) {
        if (this.isDarkPixel(data, imageWidth, topX, y + offset)) {
          darkPixelCount++;
        }
        totalSamples++;
      }
      
      // Bottom border
      const bottomX = x + Math.floor(width * (i / sampleCount));
      for (let offset = 0; offset < borderWidth; offset++) {
        if (this.isDarkPixel(data, imageWidth, bottomX, y + height - 1 - offset)) {
          darkPixelCount++;
        }
        totalSamples++;
      }
      
      // Left border
      const leftY = y + Math.floor(height * (i / sampleCount));
      for (let offset = 0; offset < borderWidth; offset++) {
        if (this.isDarkPixel(data, imageWidth, x + offset, leftY)) {
          darkPixelCount++;
        }
        totalSamples++;
      }
      
      // Right border
      const rightY = y + Math.floor(height * (i / sampleCount));
      for (let offset = 0; offset < borderWidth; offset++) {
        if (this.isDarkPixel(data, imageWidth, x + width - 1 - offset, rightY)) {
          darkPixelCount++;
        }
        totalSamples++;
      }
    }
    
    // Check if at least 60% of border pixels are dark
    return darkPixelCount / totalSamples > 0.6;
  }
  
  /**
   * Check if the region has the internal pattern of the marker
   */
  private checkForInternalPattern(
    data: Uint8ClampedArray, 
    imageWidth: number, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ): boolean {
    // This is a simplified check for the marker's pattern
    // In a real implementation, we would use more sophisticated pattern matching
    
    const borderWidth = Math.floor(Math.min(width, height) * 0.08);
    const innerX = x + borderWidth;
    const innerY = y + borderWidth;
    const innerWidth = width - borderWidth * 2;
    const innerHeight = height - borderWidth * 2;
    
    // Sample grid of points in the inner area
    const gridSize = 3;
    let blackPixelCount = 0;
    let whitePixelCount = 0;
    
    for (let gridY = 0; gridY < gridSize; gridY++) {
      for (let gridX = 0; gridX < gridSize; gridX++) {
        const sampleX = innerX + Math.floor(innerWidth * (gridX + 0.5) / gridSize);
        const sampleY = innerY + Math.floor(innerHeight * (gridY + 0.5) / gridSize);
        
        if (this.isDarkPixel(data, imageWidth, sampleX, sampleY)) {
          blackPixelCount++;
        } else {
          whitePixelCount++;
        }
      }
    }
    
    // Check if we have both black and white pixels in a reasonable proportion
    // Our marker pattern should have both dark and light areas
    const totalPixels = blackPixelCount + whitePixelCount;
    const blackRatio = blackPixelCount / totalPixels;
    
    return blackRatio > 0.2 && blackRatio < 0.8;
  }
  
  /**
   * Check if the region has red corners (marker characteristic)
   */
  private checkForRedCorners(
    data: Uint8ClampedArray, 
    imageWidth: number, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ): boolean {
    const cornerSize = Math.floor(Math.min(width, height) * 0.15);
    let redCornerCount = 0;
    
    // Check top-left corner
    if (this.hasRedCorner(data, imageWidth, x, y, cornerSize, 'top-left')) {
      redCornerCount++;
    }
    
    // Check top-right corner
    if (this.hasRedCorner(data, imageWidth, x + width - cornerSize, y, cornerSize, 'top-right')) {
      redCornerCount++;
    }
    
    // Check bottom-left corner
    if (this.hasRedCorner(data, imageWidth, x, y + height - cornerSize, cornerSize, 'bottom-left')) {
      redCornerCount++;
    }
    
    // Check bottom-right corner
    if (this.hasRedCorner(data, imageWidth, x + width - cornerSize, y + height - cornerSize, cornerSize, 'bottom-right')) {
      redCornerCount++;
    }
    
    // If at least 2 corners are detected as red, consider it a match
    return redCornerCount >= 2;
  }
  
  /**
   * Check if a corner region has red color characteristics
   */
  private hasRedCorner(
    data: Uint8ClampedArray, 
    imageWidth: number, 
    x: number, 
    y: number, 
    size: number, 
    corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  ): boolean {
    let redPixelCount = 0;
    let totalPixelCount = 0;
    
    // Define triangle area to check based on corner type
    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        let checkPixel = false;
        
        switch (corner) {
          case 'top-left':
            checkPixel = dx + dy < size;
            break;
          case 'top-right':
            checkPixel = size - dx + dy < size;
            break;
          case 'bottom-left':
            checkPixel = dx + size - dy < size;
            break;
          case 'bottom-right':
            checkPixel = size - dx + size - dy < size;
            break;
        }
        
        if (checkPixel) {
          const sampleX = x + dx;
          const sampleY = y + dy;
          if (this.isRedPixel(data, imageWidth, sampleX, sampleY)) {
            redPixelCount++;
          }
          totalPixelCount++;
        }
      }
    }
    
    // If at least 40% of pixels in the corner area are red, consider it a match
    return totalPixelCount > 0 && redPixelCount / totalPixelCount > 0.4;
  }
  
  /**
   * Check if a pixel is dark (close to black)
   */
  private isDarkPixel(data: Uint8ClampedArray, imageWidth: number, x: number, y: number): boolean {
    const pixelIndex = (y * imageWidth + x) * 4;
    const r = data[pixelIndex];
    const g = data[pixelIndex + 1];
    const b = data[pixelIndex + 2];
    
    // Calculate brightness (simple average)
    const brightness = (r + g + b) / 3;
    
    // Consider dark if brightness is below 80 (out of 255)
    return brightness < 80;
  }
  
  /**
   * Check if a pixel is predominantly red
   */
  private isRedPixel(data: Uint8ClampedArray, imageWidth: number, x: number, y: number): boolean {
    const pixelIndex = (y * imageWidth + x) * 4;
    const r = data[pixelIndex];
    const g = data[pixelIndex + 1];
    const b = data[pixelIndex + 2];
    
    // Check if red channel is significantly higher than others
    return r > 150 && r > g * 1.5 && r > b * 1.5;
  }
  
  /**
   * Determine the marker's position relative to the artwork
   */
  private determineMarkerPosition(
    marker: { x: number; y: number; width: number; height: number },
    imageWidth: number,
    imageHeight: number
  ): 'top' | 'bottom' | 'left' | 'right' | 'center' {
    const { x, y, width, height } = marker;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    // Calculate normalized position (0-1)
    const normalizedX = centerX / imageWidth;
    const normalizedY = centerY / imageHeight;
    
    // Determine position based on where the marker is located
    if (normalizedY < 0.33) {
      return 'top';
    } else if (normalizedY > 0.66) {
      return 'bottom';
    } else if (normalizedX < 0.33) {
      return 'left';
    } else if (normalizedX > 0.66) {
      return 'right';
    } else {
      return 'center';
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
