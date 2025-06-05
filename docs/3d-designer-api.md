
# 3D Designer Integration API

## Authentication

All API requests require authentication using one of the following methods:

### API Key Authentication (Recommended for external systems)
```
Authorization: Bearer kanban_admin_key_2025_full_access
```

### JWT Authentication (For integrated systems)
```
Authorization: Bearer <JWT_TOKEN>
```

## Base URL
```
https://your-replit-url.repl.co
```

## API Endpoints

### 1. Create Order from 3D Designer

**POST** `/api/3d-designer/orders`

Create a new order from the 3D designer application.

**Request Body:**
```json
{
  "customerInfo": {
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "555-123-4567"
  },
  "designSpecs": {
    "artworkWidth": 16,
    "artworkHeight": 20,
    "frameType": "wood_oak_1_5",
    "matColors": ["white_core"],
    "glassType": "museum_glass",
    "designType": "3d"
  },
  "designFiles": {
    "previewImage": "data:image/jpeg;base64,/9j/4AAQ...",
    "designFile": "https://example.com/design.3ds",
    "artworkImage": "data:image/jpeg;base64,/9j/4AAQ..."
  },
  "notes": "Customer wants rush delivery",
  "rush": true
}
```

**Response:**
```json
{
  "success": true,
  "trackingId": "123",
  "orderNumber": "ORD-1234567890-001",
  "order": {
    "id": 123,
    "trackingId": "123",
    "customerName": "John Smith",
    "status": "pending",
    "productionStatus": "order_processed",
    "total": 285.50,
    "estimatedCompletion": 3,
    "designType": "3d"
  }
}
```

### 2. Check Order Status

**GET** `/api/3d-designer/orders/{trackingId}`

Get the current status of an order using its tracking ID.

**Response:**
```json
{
  "success": true,
  "order": {
    "trackingId": "123",
    "orderNumber": "ORD-123",
    "customerName": "John Smith",
    "status": "pending",
    "productionStatus": "in_production",
    "total": 285.50,
    "createdAt": "2025-01-15T10:30:00Z",
    "estimatedCompletion": 3,
    "artworkWidth": 16,
    "artworkHeight": 20,
    "frameType": "wood_oak_1_5",
    "matColor": "white_core",
    "glassType": "museum_glass"
  }
}
```

### 3. Update Design Files

**PATCH** `/api/3d-designer/orders/{trackingId}/files`

Update the design files for an existing order.

**Request Body:**
```json
{
  "previewImage": "data:image/jpeg;base64,/9j/4AAQ...",
  "designFile": "https://example.com/updated-design.3ds",
  "artworkImage": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Design files updated successfully",
  "order": {
    "trackingId": "123",
    "frameDesignImage": "data:image/jpeg;base64,/9j/4AAQ...",
    "artworkImage": "data:image/jpeg;base64,/9j/4AAQ..."
  }
}
```

### 4. Get Pricing

**GET** `/api/3d-designer/pricing/{designType}?width=16&height=20&frameType=wood_oak_1_5&matColor=white_core&glassType=museum_glass&rush=true`

Get pricing information for a specific design configuration.

**Query Parameters:**
- `width` (required): Artwork width in inches
- `height` (required): Artwork height in inches
- `frameType` (optional): Frame type ID
- `matColor` (optional): Mat color ID
- `glassType` (optional): Glass type ID
- `rush` (optional): "true" for rush pricing

**Response:**
```json
{
  "success": true,
  "designType": "3d",
  "dimensions": {
    "width": 16,
    "height": 20
  },
  "pricing": {
    "subtotal": 235.50,
    "tax": 18.84,
    "total": 254.34,
    "breakdown": {
      "frame": 120.00,
      "mat": 45.50,
      "glass": 70.00,
      "specialServices": {
        "rush_service": 50.00,
        "3d_design_service": 75.00
      }
    }
  }
}
```

### 5. Get Frame Options

**GET** `/api/3d-designer/frames`

Get available frame options for the 3D designer.

**Response:**
```json
{
  "success": true,
  "frames": [
    {
      "id": "wood_oak_1_5",
      "name": "Oak Wood Frame 1.5\"",
      "material": "wood",
      "width": 1.5,
      "price": 12.50,
      "catalogImage": "https://example.com/oak-frame.jpg"
    }
  ]
}
```

### 6. Get Mat Options

**GET** `/api/3d-designer/mats`

Get available mat color options.

**Response:**
```json
{
  "success": true,
  "matColors": [
    {
      "id": "white_core",
      "name": "White Core",
      "color": "#FFFFFF",
      "price": 2.50
    }
  ]
}
```

## Design Types

- `2d`: Standard 2D artwork framing
- `3d`: 3D design with depth considerations
- `shadow_box`: Shadow box mounting
- `float`: Float mounting
- `canvas`: Canvas stretching and framing

## Production Status Values

- `order_processed`: Order received and processing
- `scheduled`: Scheduled for production
- `materials_ordered`: Materials ordered from suppliers
- `materials_arrived`: Materials received
- `frame_cut`: Frame cutting in progress
- `mat_cut`: Mat cutting in progress
- `prepped`: Components prepared for assembly
- `completed`: Order completed
- `delayed`: Production delayed

## Error Responses

All endpoints return standard HTTP status codes:

- `400`: Bad Request - Invalid parameters
- `401`: Unauthorized - Invalid or missing API key
- `404`: Not Found - Order not found
- `500`: Internal Server Error

Error response format:
```json
{
  "error": "Error description",
  "message": "Detailed error message"
}
```
