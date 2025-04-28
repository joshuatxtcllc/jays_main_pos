# Jays Frames POS System Implementation Log

## Project Overview
A sophisticated custom framing Point of Sale (POS) system designed to streamline the frame customization process for professional framers and design enthusiasts. The system connects to Supabase for database management and integrates with wholesale pricing and sample catalogs.

## Key Technologies
- Vite frontend framework
- Supabase for database management
- TypeScript for type-safe development
- Drizzle ORM for database operations
- React DnD for interactive drag-and-drop interfaces
- TanStack Query for efficient data fetching
- Enhanced order progress tracking
- Robust vendor integration system

## Implementation History

### Frame Pricing and Visualization Functionality
- Fixed matboard pricing calculation to achieve the target cost of around $34 instead of $0.17
- Adjusted frame pricing to be more accurate for the Houston market (reduced to 1/6th of original calculation)
- Made "Add to Wholesale Order" a mandatory action in the pricing workflow
- Integrated with Larson Juhl, Roma, and Nielsen catalogs with fallback mechanisms

### Visualization Component Improvements
- Removed 3D visualizer component and simplified to only use the 2D visualizer
- Fixed frame image loading with reliable fallbacks for textures
- Added placeholder for missing artwork images
- Enhanced the FrameVisualizer component to accurately render frames with correct colors
- Fixed black frames displaying properly as black instead of gray

### Material and Pricing Functionality
- Implemented sliding scale retail markups for frames, mats, and glass
- Used united inch (width + height) for pricing calculations
- Updated glass pricing (reduced by 55% from original calculation)
- Renamed "UV" glass option to "Museum Glass" and adjusted pricing higher
- Made Museum glass the default option
- Set optimized backing pricing to reflect real-life production costs

### Order and Inventory Management
- Implemented production Kanban board with order scheduling
- Added drag-and-drop functionality to Kanban board
- Added due date calculation (7+ days ahead, max 5 orders per day)
- Created automated customer notifications for order status changes
- Implemented personalized order progress notifications
- Added ability to create new customers
- Created a Material Pick-List page to track needed materials and order status
- Updated material order statuses to match production workflow
- Added edit button on Kanban board to modify order specs that updates across the system
- Ensured order size changes update pricing and dimensions everywhere in the system
- Generated proper invoices that can be printed

### UI/UX Improvements
- Made cart icon white text on dark background
- Made menu icon dark text for mobile view
- Changed "Create New Customer" button text to light color
- Removed "Mat Test" from header navigation
- Added bottom mat option that shows as thin line inside top mat
- Fixed glass information displaying properly on Production Kanban board
- Fixed frame search functionality to better handle exact item number matching
- Removed "Crescent" and "Basic" variants from mat options as all mats are Crescent
- Fixed text in the Inventory form to be light colored

### Integration with Jays Frames Hub
- Integrated the system with Jays Frames Hub
- Created UI for Hub integration
- App now functions as the POS in HUB, with Kanban page linked to Production

### Fix Implementation for Image Upload
- Added more detailed logging to the image upload process
- Fixed state update sequence in image upload process to ensure state is updated before the image source is set
- Added similar improvements to webcam image capturing
- Added extensive debugging for image loading in FrameVisualizer
- Added validation of data URLs in image processing
- Added detailed error handling for failed image loads
- Improved feedback when images are captured from webcam

### Payment Processing
- Implemented integrated payment processing with Stripe
- Added support for cash and check payment methods for in-person transactions

### Current Progress on Requested Features
- Moving away from mock data to real data for all components (in progress)
- Implementing customer account management and history (in progress)
- Email invoice functionality after payment is received (in progress)
- Implementing AI tools to help with material ordering management (in progress with OpenAI integration)
- Implementing personalized frame recommendation AI (in progress)
- Implementing advanced inventory management system (in progress)
- Implementing a chat widget for system navigation and searching (pending)
- Connecting chatbot to Kanban board for order status lookups (pending)

## Code Organization
The application is structured with a clear separation of concerns between client and server:

### Client-side Components
- **FrameVisualizer.tsx**: Renders artwork with selected frame, mat, and glass
- **OrderDetailsPage.tsx**: Shows and allows editing of order details
- **Orders.tsx**: Lists all orders and allows management
- **PosSystem.tsx**: Main POS interface for creating new orders
- **OrderProgress.tsx**: Shows progress of each order
- **ProductionKanban.tsx**: Production workflow management
- **MaterialsPickList.tsx**: Tracks materials needed for orders
- **InventoryTable.tsx**: Manages inventory of frames, mats, and glass
- **Header.tsx**: Navigation header component

### Server-side Services
- **vendorApiService.ts**: Connects to frame vendor APIs
- **pricingService.ts**: Calculates pricing based on dimensions and materials
- **storage.ts**: Handles database operations
- **routes.ts**: API endpoint definitions

## Critical Issues Fixed
- Fixed black frames displaying as gray in preview
- Fixed error when trying to search vendor catalogs
- Fixed Larson Academie frame (#210286) showing incorrect color
- Fixed wholesale orders not being created properly from POS system
- Fixed bottom mat option not visible in UI
- Fixed inventory page not accessible in navigation
- Fixed uploaded images not displaying in visualizer (partial fix - debugging in progress)

## Current Issues Under Investigation
- Uploaded images not consistently appearing in preview - debugging in progress

## Design Decisions
- Using React with TypeScript for frontend
- Recharts for business analytics and reporting
- Using Stripe for payment processing integration
- Using SendGrid for email notifications
- Implemented fallback to static data if API calls fail
- Created dedicated pricing service for accurate calculations using sliding scale markups
- Simplified visualization by removing 3D view and focusing on 2D only
- Added canvas-based placeholders when artwork images are missing

This log serves as a comprehensive record of the development and current state of the Jays Frames POS System.