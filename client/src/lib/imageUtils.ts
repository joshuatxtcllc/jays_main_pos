// Convert file to data URL
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Resize image to max dimensions
export const resizeImage = (
  dataUrl: string,
  maxWidth: number = 1200,
  maxHeight: number = 1200
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }
      
      // Create canvas for resizing
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Draw resized image
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to data URL
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    
    img.onerror = () => reject(new Error('Error loading image'));
    img.src = dataUrl;
  });
};

// Extract frame edge from catalog image for CSS border-image
export const extractFrameEdge = (
  catalogImageUrl: string,
  frameWidth: number
): string => {
  // In a production app, this would use canvas to extract
  // a strip from the catalog image or use a pre-extracted image
  return `url(${catalogImageUrl}) ${frameWidth * 30}px stretch`;
};

// Create a thumbnail version of the catalog image
export const createThumbnail = (
  catalogImageUrl: string
): string => {
  // In production, use a server-side image processing service
  // For now, we'll return the original image
  return catalogImageUrl;
};

// Calculate aspect ratio from dimensions
export const calculateAspectRatio = (
  width: number,
  height: number
): number => {
  return width / height;
};

// Calculate dimensions based on aspect ratio
export const calculateDimensions = (
  width: number | null,
  height: number | null,
  aspectRatio: number
): { width: number, height: number } => {
  if (width !== null && height !== null) {
    return { width, height };
  }
  
  if (width !== null) {
    return {
      width,
      height: Math.round((width / aspectRatio) * 100) / 100
    };
  }
  
  if (height !== null) {
    return {
      width: Math.round((height * aspectRatio) * 100) / 100,
      height
    };
  }
  
  // Default dimensions if both are null
  return {
    width: 16,
    height: 20
  };
};
