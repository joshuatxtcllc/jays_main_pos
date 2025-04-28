# Pricing Logic Documentation

## Overview
The Jays Frames POS system uses a sophisticated pricing model based on industry-standard practices for custom framing. This document outlines the core pricing logic, calculations, and markup strategies.

## United Inch Calculation
The fundamental measurement unit for custom framing is the "united inch," which is the sum of the width and height of the item being framed.

```javascript
const unitedInches = artworkWidth + artworkHeight + (matWidth * 4);
```

This includes:
- The width of the artwork
- The height of the artwork
- The total mat border (mat width × 4 sides)

## Sliding Scale Markup System
The system uses a sliding scale markup that varies based on the size of the framing project:

### Frame Markup Scale
```
Smaller frames (up to 20 united inches): 6× wholesale
Medium frames (21-40 united inches): 5× wholesale
Large frames (41-60 united inches): 4× wholesale
Extra large frames (60+ united inches): 3× wholesale
```

### Mat Markup Scale
```
Small mats (up to 32 united inches): Base price + 100%
Medium mats (33-60 united inches): Base price + 80%
Large mats (61-80 united inches): Base price + 60%
Extra large mats (80+ united inches): Base price + 40%
```

### Glass Markup Scale
```
Small glass (up to 40 united inches): Base price + 100%
Medium glass (41-60 united inches): Base price + 75%
Large glass (61-80 united inches): Base price + 50%
Extra large glass (80+ united inches): Base price + 25%
```

## Core Pricing Calculation

### Frame Pricing
The frame price is calculated based on the length of frame required and the price per foot:

```javascript
// Calculate the perimeter of the frame in feet
const framePerimeterInches = 2 * (artworkWidth + artworkHeight + matWidth * 4);
const framePerimeterFeet = framePerimeterInches / 12;

// Calculate price using base price and sliding scale markup
const frameMarkupFactor = getFrameMarkupFactor(unitedInches);
const framePrice = framePerimeterFeet * frame.price * frameMarkupFactor;

// Apply the 16.67% reduction for Houston Heights market (i.e., 1/6th of the original calculation)
const adjustedFramePrice = framePrice * 0.1667;
```

### Mat Pricing
Mat pricing is based on the size, core type, and color:

```javascript
// Get base price from mat object
const baseMatPrice = mat.price;

// Apply sliding scale markup based on united inches
const matMarkupFactor = getMatMarkupFactor(unitedInches);
const matPrice = baseMatPrice * matMarkupFactor;
```

### Glass Pricing
Glass pricing is based on size and quality:

```javascript
// Calculate glass area in square feet
const glassAreaInches = artworkWidth * artworkHeight;
const glassAreaFeet = glassAreaInches / 144;

// Apply base price per square foot
const baseGlassPrice = glass.price * glassAreaFeet;

// Apply sliding scale markup
const glassMarkupFactor = getGlassMarkupFactor(unitedInches);
const glassPrice = baseGlassPrice * glassMarkupFactor;

// Apply the 45% reduction for the Houston Heights market (i.e., reduced by 55%)
const adjustedGlassPrice = glassPrice * 0.45;
```

### Special Services Pricing
Special services have fixed prices that are added to the base price:

```javascript
// Add any special service costs
const specialServicesPrice = specialServices.reduce((total, service) => {
  return total + service.price;
}, 0);
```

### Total Price Calculation
The final price is the sum of all components plus tax (if applicable):

```javascript
// Calculate subtotal
const subtotal = adjustedFramePrice + matPrice + adjustedGlassPrice + specialServicesPrice;

// Apply any discounts
const discountedSubtotal = applyDiscounts(subtotal, discounts);

// Calculate tax (if customer is not tax exempt)
const taxAmount = customer.taxExempt ? 0 : discountedSubtotal * TAX_RATE;

// Calculate total
const total = discountedSubtotal + taxAmount;
```

## Special Case: Double Matting
When double matting is selected, additional pricing applies:

```javascript
// Add cost for bottom mat
if (useBottomMat) {
  const bottomMatPrice = bottomMat.price * (getMatMarkupFactor(unitedInches) * 0.7); // 70% of regular mat markup
  matPrice += bottomMatPrice;
}
```

## Wholesale Order Pricing
For wholesale orders, raw costs are used without retail markup:

```javascript
// Frame wholesale price
const wholesaleFramePrice = framePerimeterFeet * frame.price;

// Mat wholesale price
const wholesaleMatPrice = mat.price;

// Glass wholesale price
const wholesaleGlassPrice = glass.price * glassAreaFeet;
```

## Location-Specific Pricing Adjustments
The system includes adjustments specific to the Houston Heights, Texas location:

```javascript
// Houston Heights market adjustments
const FRAME_PRICE_ADJUSTMENT = 0.1667; // Reduce to 1/6th
const GLASS_PRICE_ADJUSTMENT = 0.45;   // Reduce by 55%
```

## Implemented Fixes
- Fixed matboard pricing to achieve the target cost of around $34 instead of $0.17
- Adjusted frame pricing to 16.67% of original calculation (reduced to 1/6th)
- Updated glass pricing to 45% of original calculation (reduced by 55%)
- Adjusted Museum Glass pricing higher than standard glass options

## Example Calculations

### Standard 16x20 Piece (Typical Customer Order)
```
Artwork size: 16" × 20"
Mat width: 2"
Frame: Larson Academie
Mat: White Conservation
Glass: Museum Glass

United inches: 16 + 20 + (2 × 4) = 44

Frame: 
  - Perimeter: 2 × (16 + 20 + 2×4) = 88 inches = 7.33 feet
  - Base price: $18/foot
  - Markup factor (44 united inches): 4×
  - Initial price: 7.33 × $18 × 4 = $527.76
  - Houston adjustment: $527.76 × 0.1667 = $87.98

Mat:
  - Base price: $17
  - Markup factor (44 united inches): 1.8
  - Price: $17 × 1.8 = $30.60

Glass:
  - Area: 16" × 20" = 320 square inches = 2.22 square feet
  - Base price: $39/square foot
  - Markup factor (44 united inches): 1.75
  - Initial price: 2.22 × $39 × 1.75 = $151.73
  - Houston adjustment: $151.73 × 0.45 = $68.28

Subtotal: $87.98 + $30.60 + $68.28 = $186.86
Tax (8.25%): $15.42
Total: $202.28
```

This pricing structure ensures that the target retail prices are achieved while maintaining appropriate profit margins and competitive pricing for the Houston market.