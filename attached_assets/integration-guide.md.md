# Artwork Size Detection Integration Guide

This guide explains how to integrate the artwork size detection technology into your existing custom framing website and POS system.

## Overview

The solution uses computer vision techniques with ArUco markers to automatically detect artwork dimensions when customers upload photos. This eliminates the need for customers to manually measure and input dimensions, reducing errors and improving user experience.

## Files in this Package

- `artwork-size-detector.js` - Core detection functionality
- `artwork-detector-integration.js` - Integration with your existing system
- `artwork-detector-styles.css` - Styling for the size detection UI
- `reference-markers/` - Folder containing printable reference markers

## Prerequisites

The solution requires the following libraries:

1. **OpenCV.js** - For image processing and computer vision
2. **js-aruco2** - For marker detection

## Installation Steps

1. Add the required libraries to your website:

```html
<!-- OpenCV.js -->
<script src="https://docs.opencv.org/4.6.0/opencv.js"></script>

<!-- js-aruco2 -->
<script src="js/js-aruco2.min.js"></script>

<!-- Our detection scripts -->
<script src="js/artwork-size-detector.js"></script>
<script src="js/artwork-detector-integration.js"></script>

<!-- CSS -->
<link rel="stylesheet" href="css/artwork-detector-styles.css">
```

2. Add necessary HTML elements to your upload form:

```html
<form id="artwork-upload-form" method="post" enctype="multipart/form-data">
  <!-- Your existing form elements -->
  
  <!-- File input for artwork image -->
  <div class="form-group">
    <label for="artwork-file-input">Upload Your Artwork</label>
    <input type="file" id="artwork-file-input" name="artwork" accept="image/*" required>
  </div>
  
  <!-- Preview area -->
  <div id="artwork-preview"></div>
  
  <!-- Size information will be displayed here -->
  <div id="artwork-size-info"></div>
  
  <!-- Hidden fields to store dimensions -->
  <input type="hidden" id="artwork-width" name="width">
  <input type="hidden" id="artwork-height" name="height">
  <input type="hidden" id="artwork-unit" name="unit" value="cm">
  
  <!-- Submit button -->
  <button type="submit" class="btn btn-primary">Continue to Frame Selection</button>
</form>

<!-- Download marker button (can be placed anywhere) -->
<div class="reference-marker-download">
  <p>For accurate size measurement, please print this reference marker and place it next to your artwork when taking the photo.</p>
  <button id="download-marker-btn" class="btn btn-secondary">Download Reference Marker</button>
</div>
```

3. Initialize the integration in your JavaScript:

```javascript
document.addEventListener('DOMContentLoaded', async function() {
  // Initialize the integration
  const sizeIntegration = new ArtworkSizeIntegration({
    // Core selectors
    selectorUploadForm: '#artwork-upload-form',
    selectorImagePreview: '#artwork-preview',
    selectorImageInput: '#artwork-file-input',
    selectorSizeInfoContainer: '#artwork-size-info',
    
    // Fields
    selectorWidthField: '#artwork-width',
    selectorHeightField: '#artwork-height',
    selectorUnitField: '#artwork-unit',
    
    // Options
    markerSizeCm: 5, // Size of the reference marker in cm
    enableAutoDetect: true,
    allowManualOverride: true,
    
    // Callbacks
    onSizeDetected: function(dimensions) {
      console.log('Detected dimensions:', dimensions);
      // You can add custom logic here
    }
  });
  
  await sizeIntegration.init();
  
  // Set up marker download button
  const downloadBtn = document.getElementById('download-marker-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function() {
      sizeIntegration.downloadMarker(0, 500); // ID 0, 500px size
    });
  }
});
```

## Integration with Your POS System

The size detection system is designed to integrate with your existing POS and order processing system:

1. When a user uploads an image, the integration attempts to automatically detect the artwork size
2. The detected dimensions are stored in hidden form fields (width, height, unit)
3. When the form is submitted, these values are sent to your server along with other form data
4. Use these values in your framing calculator and order processing system

### Sample Server-Side Processing (PHP)

```php
<?php
// Get uploaded image and size data
$artwork = $_FILES['artwork'];
$width = floatval($_POST['width']);
$height = floatval($_POST['height']);
$unit = $_POST['unit'];

// Convert to inches if needed for your system
if ($unit === 'cm') {
    $width = $width / 2.54;
    $height = $height / 2.54;
    $unit = 'in';
}

// Store in your database
$order_id = create_new_order();
store_artwork_dimensions($order_id, $width, $height, $unit);

// Process the uploaded image
$upload_path = 'uploads/' . $order_id . '/';
move_uploaded_file($artwork['tmp_name'], $upload_path . 'artwork.jpg');

// Redirect to frame selection page
header('Location: frame_selection.php?order_id=' . $order_id);
?>
```

## Printing Reference Markers

For the system to work, customers need to include a reference marker in their photos:

1. Generate markers using the `downloadMarker()` function
2. Provide clear instructions to customers on how to use the markers:
   - Print at exactly 5x5 cm (or your chosen size)
   - Place next to artwork when taking photo
   - Ensure the marker is fully visible and not warped/bent
   - Avoid covering the black border of the marker

## Troubleshooting

Common issues and solutions:

1. **No markers detected**
   - Ensure the marker is clearly visible in the image
   - Check lighting conditions - avoid glare or very dark images
   - Verify the marker was printed at the correct size

2. **Inaccurate measurements**
   - Verify the marker size setting matches the actual printed size
   - Ensure the artwork and marker are in the same plane (flat)
   - Check that the marker isn't warped or bent

3. **Library loading issues**
   - Verify all required libraries are loaded in the correct order
   - Check browser console for errors

## Customization

You can customize the appearance by modifying the CSS file. The system is designed to blend with your existing website design.

## Support Resources

For technical support or customization assistance, please contact your developer or refer to the following resources:

- OpenCV.js documentation: https://docs.opencv.org/4.6.0/
- js-aruco2 repository: https://github.com/damianofalcioni/js-aruco2