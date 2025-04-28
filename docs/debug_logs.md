# Debug Logs for Jays Frames POS System

## Image Upload Functionality Debugging

### Problem Statement
The uploaded images aren't consistently displaying in the frame visualizer component.

### Debugging Steps

1. **Added console logging to fileToDataUrl function**
```javascript
// Handle file upload
const handleFileUpload = async (file: File) => {
  try {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Processing image upload:', file.name, file.type, file.size);
    
    // Convert file to data URL
    const dataUrl = await fileToDataUrl(file);
    console.log('File converted to data URL, length:', dataUrl.length);
    
    // Resize image if it's too large
    const resizedImage = await resizeImage(dataUrl, 1200, 1200);
    console.log('Image resized, new data URL length:', resizedImage.length);
    
    // Create an image element to get dimensions
    const img = new Image();
    img.onload = () => {
      console.log('Image loaded with dimensions:', img.width, 'x', img.height);
      const imgAspectRatio = img.width / img.height;
      setAspectRatio(imgAspectRatio);
      
      // Update width based on the height and aspect ratio
      const newWidth = parseFloat((artworkHeight * imgAspectRatio).toFixed(2));
      console.log('Setting artwork width to:', newWidth);
      setArtworkWidth(newWidth);
    };
    
    // IMPORTANT: We need to set the artworkImage state before setting the img.src
    // This ensures the state is updated immediately
    setArtworkImage(resizedImage);
    console.log('Setting artwork image in state');
    
    // Now set the image source for dimension calculation
    img.src = resizedImage;
    
    toast({
      title: "Image Uploaded",
      description: "Your artwork image has been uploaded and is ready for framing."
    });
  } catch (error) {
    console.error('Error processing image:', error);
    toast({
      title: "Error processing image",
      description: "There was a problem processing your image. Please try again.",
      variant: "destructive"
    });
  }
};
```

2. **Added similar debugging to processWebcamImage function**
```javascript
// Process webcam image
const processWebcamImage = async (dataUrl: string) => {
  try {
    console.log('Processing webcam image, data URL length:', dataUrl.length);
    
    // Resize image if it's too large
    const resizedImage = await resizeImage(dataUrl, 1200, 1200);
    console.log('Webcam image resized, new data URL length:', resizedImage.length);
    
    // Create an image element to get dimensions
    const img = new Image();
    img.onload = () => {
      console.log('Webcam image loaded with dimensions:', img.width, 'x', img.height);
      const imgAspectRatio = img.width / img.height;
      setAspectRatio(imgAspectRatio);
      
      // Update width based on the height and aspect ratio
      const newWidth = parseFloat((artworkHeight * imgAspectRatio).toFixed(2));
      console.log('Setting artwork width to:', newWidth);
      setArtworkWidth(newWidth);
    };
    
    // IMPORTANT: Set the state before setting the img.src
    setArtworkImage(resizedImage);
    console.log('Setting artwork image from webcam in state');
    
    // Now set the image source for dimension calculation
    img.src = resizedImage;
    
    toast({
      title: "Image Captured",
      description: "Artwork image has been captured from webcam.",
    });
  } catch (error) {
    console.error('Error processing webcam image:', error);
    toast({
      title: "Error Processing Image",
      description: "There was a problem processing your webcam image. Please try again.",
      variant: "destructive"
    });
  }
};
```

3. **Enhanced FrameVisualizer component to validate and debug image loading**
```javascript
// Create a default placeholder image if no artwork is provided
if (!artworkImage) {
  console.log('No artwork image provided, creating placeholder');
  const placeholderCanvas = document.createElement('canvas');
  const ctx = placeholderCanvas.getContext('2d');
  if (ctx) {
    placeholderCanvas.width = 400;
    placeholderCanvas.height = 300;
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, placeholderCanvas.width, placeholderCanvas.height);
    ctx.fillStyle = '#888';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Upload an image', placeholderCanvas.width/2, placeholderCanvas.height/2);
    artworkImg.src = placeholderCanvas.toDataURL();
  }
} else {
  console.log('Using provided artwork image, data URL length:', artworkImage.length);
  // Data URLs can be really long, let's check if it looks valid
  if (artworkImage.startsWith('data:image')) {
    console.log('Artwork image appears to be a valid data URL');
  } else {
    console.warn('Artwork image does not appear to be a data URL:', artworkImage.substring(0, 50) + '...');
  }
  artworkImg.src = artworkImage;
}
```

4. **Added improved error handling for artwork image loading**
```javascript
// Draw everything once both images are loaded
Promise.all([
  new Promise<void>(resolve => {
    artworkImg.onload = () => {
      console.log('Artwork image loaded successfully, dimensions:', artworkImg.width, 'x', artworkImg.height);
      resolve();
    };
    artworkImg.onerror = (e) => {
      console.error('Failed to load artwork image, error:', e);
      console.error('Image source that failed:', artworkImg.src.substring(0, 50) + '...');
      
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
        console.log('Created fallback image for artwork');
        artworkImg.src = canvas.toDataURL();
      }
      resolve();
    };
  }),
  // ... frame image loading promise
])
```

### Key Issue Identified
1. The sequence of operations in the image upload process was problematic - we were setting the image source before updating the state, which led to race conditions.
2. The fix involves ensuring the state is updated before setting the source of any image elements.

### Remaining Debugging
1. Monitor the console logs to see if any errors occur during image loading
2. Check if data URLs are being properly passed between components
3. Verify that the FrameVisualizer component is re-rendering when the artworkImage state changes

### Future Improvements
1. Add more robust error handling for image processing
2. Consider converting the FrameVisualizer to use WebGL for better performance
3. Add progress indicators during image uploads
4. Implement image caching to improve performance with frequently used images