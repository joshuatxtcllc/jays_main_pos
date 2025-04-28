# Code Reference for Jays Frames POS System

## Key Components and Files

### Client-Side Components

#### FrameVisualizer Component
**File:** `client/src/components/FrameVisualizer.tsx`

This component renders a 2D visualization of the framed artwork using HTML Canvas. It accepts the following props:
- `frame`: The selected frame object
- `matColor`: The selected mat color object
- `matWidth`: The width of the mat in inches
- `artworkWidth`: The width of the artwork in inches
- `artworkHeight`: The height of the artwork in inches
- `artworkImage`: A data URL containing the uploaded artwork image

Key features:
- Fallbacks for missing frames or images
- Dynamic rendering of frame textures
- Color selection based on frame material/name
- Automatic resizing to maintain aspect ratio

#### POS System Page
**File:** `client/src/pages/PosSystem.tsx`

The main POS interface for creating new custom framing orders. Key features:
- Customer information form
- Artwork upload and webcam capture
- Frame selection with filtering
- Mat selection with color preview
- Glass options
- Special services selection
- Order pricing calculation
- Cart functionality

#### Orders Page
**File:** `client/src/pages/Orders.tsx`

Lists all orders and provides management capabilities:
- Filtering and sorting orders
- Order status updates
- Payment processing
- Invoice generation

#### Production Kanban Component
**File:** `client/src/components/ProductionKanban.tsx`

A drag-and-drop kanban board for production workflow management:
- Visual workflow stages
- Drag-and-drop order movement
- Status updates
- Due date tracking
- Production capacity management

#### Materials Pick List Component
**File:** `client/src/components/materials/MaterialsPickList.tsx`

Tracks materials needed for orders:
- Material type filtering
- Order status tracking
- Vendor grouping
- Quantity calculations
- Reorder alerts

### Server-Side Services

#### Vendor API Service
**File:** `server/services/vendorApiService.ts`

Connects to frame vendor APIs with fallback mechanisms:
- Larson Juhl API integration
- Roma API integration
- Nielsen Bainbridge API integration
- Fallback to static data when APIs are unavailable
- Caching for improved performance

#### Pricing Service
**File:** `server/services/pricingService.ts`

Calculates pricing based on dimensions and materials:
- United inch calculations
- Sliding scale markup implementation
- Special service pricing
- Tax calculation
- Discount application
- Wholesale vs. retail pricing

#### Storage Service
**File:** `server/storage.ts`

Handles database operations:
- Customer CRUD operations
- Order management
- Inventory tracking
- Material order management
- Production status updates

#### API Routes
**File:** `server/routes.ts`

Defines all API endpoints:
- Customer management
- Order creation and management
- Inventory control
- Production workflow
- Material ordering
- Payment processing
- Reporting and analytics

## Database Schema

### Key Tables

#### customers
- id: Primary key
- name: Customer name
- email: Email address
- phone: Phone number
- address: Physical address
- taxExempt: Boolean for tax exemption status

#### frames
- id: Primary key
- name: Frame name
- manufacturer: Vendor name
- itemNumber: Vendor SKU/item number
- material: Frame material
- finish: Surface finish
- color: Color hex code
- price: Base price per foot
- width: Frame width in inches
- depth: Frame depth in inches
- rebate: Rebate depth in inches
- catalogImage: URL to image from vendor
- collection: Collection/series name

#### mat_colors
- id: Primary key
- name: Mat name
- color: Color hex code
- manufacturer: Vendor (typically Crescent)
- price: Base price per sheet
- category: Core type (Conservation, etc.)
- itemNumber: Vendor SKU/item number

#### glass_options
- id: Primary key
- name: Glass type name
- description: Detailed description
- price: Base price per square foot
- features: Array of features (UV protection, anti-glare, etc.)

#### orders
- id: Primary key
- customerId: Foreign key to customers
- orderGroupId: Group ID for multiple items in one order
- frameId: Foreign key to frames
- matColorId: Foreign key to mat_colors
- glassOptionId: Foreign key to glass_options
- artworkWidth: Width in inches
- artworkHeight: Height in inches
- matWidth: Mat width in inches
- artworkDescription: Description text
- artworkType: Type of artwork
- subtotal: Price before tax
- tax: Tax amount
- total: Total price
- artworkImage: Data URL of artwork image
- status: Current production status
- createdAt: Creation timestamp
- updatedAt: Last update timestamp
- dueDate: Due date

#### order_groups
- id: Primary key
- customerId: Foreign key to customers
- subtotal: Sum of order subtotals
- tax: Sum of order taxes
- total: Sum of order totals
- status: Payment status
- paymentMethod: Method used
- createdAt: Creation timestamp
- updatedAt: Last update timestamp

#### material_orders
- id: Primary key
- materialType: Type (frame, mat, glass, etc.)
- materialId: ID in corresponding material table
- materialName: Display name
- quantity: Quantity needed
- status: Order status
- notes: Additional notes
- vendor: Vendor name
- priority: Priority level
- createdAt: Creation timestamp
- updatedAt: Last update timestamp

## Common Workflows

### Creating a New Frame Order
1. Customer information is entered in the POS system
2. Artwork is uploaded or captured via webcam
3. Frame, mat, and glass are selected
4. Special services are added if needed
5. Order is priced automatically using the pricing service
6. Order is added to cart (order group)
7. Payment is processed
8. Material orders are created for necessary supplies
9. Order is added to production workflow

### Processing Production
1. New orders appear in the "Design" column of the Kanban board
2. Orders are moved to "Cutting" when ready
3. Orders progress through "Assembly", "Fitting", "Finishing", and "Quality Check"
4. Completed orders are moved to "Ready for Pickup"
5. Customers receive automated notifications at key stages

### Managing Inventory
1. Material orders are created from the POS system
2. Materials Pick List shows all needed materials
3. Orders are placed with vendors
4. Received materials are marked as "Received"
5. Inventory is automatically updated

## Error Handling Approaches

### Image Processing Errors
- Provide fallback images when uploads fail
- Log detailed error information
- Use toast notifications to inform users
- Automatically retry failed operations

### API Connection Failures
- Use fallback static data when vendor APIs are unavailable
- Implement retry mechanisms with exponential backoff
- Cache previous successful responses
- Provide clear error messages to users

### Database Errors
- Implement transaction rollback for failed operations
- Log detailed error information
- Use toast notifications with friendly error messages
- Provide data recovery options where possible

## Important Code Patterns

### State Management
- Use React context for global state (auth, theme, etc.)
- Use TanStack Query for remote data fetching
- Use local state for component-specific data
- Use URL parameters for sharable state

### API Integration
- Consistent error handling
- Response caching
- Retry logic
- Fallback to static data when needed

### UI Components
- Responsive design using Tailwind CSS
- Accessible UI components
- Consistent error states
- Loading indicators for async operations

### Performance Optimizations
- Memoization of expensive calculations
- Virtualized lists for large datasets
- Image optimization
- Code splitting and lazy loading