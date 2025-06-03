# Kanban Integration API Documentation
## Jays Frames POS System

### Base URL
```
https://your-replit-app-domain.replit.app
```

### Authentication
All API requests require an API key in the Authorization header:
```
Authorization: Bearer YOUR_API_KEY
```

### Available Endpoints

#### 1. Get All Orders for Kanban Board
**GET** `/api/kanban/orders`

Returns all orders with production status and timeline information for display on the Kanban board.

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "orderId": "ORD-2025-001",
      "customerName": "John Smith",
      "artworkTitle": "Mountain Landscape",
      "frameSize": "16x20",
      "status": "in_production",
      "stage": "cutting",
      "priority": "standard",
      "dueDate": "2025-06-15",
      "createdAt": "2025-05-30T10:00:00Z",
      "estimatedCompletion": "2025-06-10",
      "materials": {
        "frameType": "Wood Oak",
        "matColor": "White Core",
        "glass": "Museum Glass"
      }
    }
  ]
}
```

#### 2. Update Order Production Status
**POST** `/api/kanban/orders/:orderId/status`

Updates the production status of an order from the Kanban board.

**Request Body:**
```json
{
  "status": "in_production",
  "stage": "assembly",
  "notes": "Frame assembly completed, moving to glass installation",
  "estimatedCompletion": "2025-06-08",
  "technician": "Mike Johnson"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "ORD-2025-001",
  "updatedStatus": "in_production",
  "stage": "assembly",
  "notes": "Frame assembly completed, moving to glass installation",
  "timestamp": "2025-05-30T14:30:00Z"
}
```

#### 3. Health Check
**GET** `/api/kanban/status`

Verifies the API connection and returns system information.

**Response:**
```json
{
  "status": "active",
  "service": "Jays Frames POS System",
  "version": "1.0.0",
  "endpoints": {
    "orders": "/api/kanban/orders",
    "updateStatus": "/api/kanban/orders/:orderId/status",
    "health": "/api/kanban/status"
  },
  "authentication": "API Key required in Authorization header",
  "timestamp": "2025-05-30T15:00:00Z"
}
```

### Order Status Values
- `pending` - Order received, not yet started
- `in_production` - Currently being worked on
- `completed` - Production finished
- `ready_for_pickup` - Ready for customer pickup
- `delivered` - Delivered to customer

### Production Stages
- `material_prep` - Preparing materials
- `cutting` - Cutting frame and mat
- `assembly` - Assembling frame
- `glass_installation` - Installing glass
- `quality_check` - Final quality inspection
- `packaging` - Packaging for pickup/delivery

### Error Responses
```json
{
  "success": false,
  "error": "Order not found",
  "code": "ORDER_NOT_FOUND",
  "timestamp": "2025-05-30T15:00:00Z"
}
```

### Rate Limiting
- 100 requests per minute per API key
- 1000 requests per hour per API key

### Webhooks (Optional)
You can configure webhooks to receive real-time updates when order status changes:

**Webhook Endpoint:** Configure in your Kanban app settings
**Method:** POST
**Payload:**
```json
{
  "event": "order_status_changed",
  "orderId": "ORD-2025-001",
  "previousStatus": "cutting",
  "newStatus": "assembly",
  "timestamp": "2025-05-30T15:00:00Z"
}
```