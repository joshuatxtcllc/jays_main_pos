# Jays Frames POS System - User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [POS System](#pos-system)
4. [Customer Management](#customer-management)
5. [Order Management](#order-management)
6. [Production Kanban](#production-kanban)
7. [Materials Management](#materials-management)
8. [Payments](#payments)
9. [Hub Integration](#hub-integration)
10. [Troubleshooting](#troubleshooting)

## Introduction

Welcome to the Jays Frames POS System, a comprehensive point-of-sale and shop management application designed specifically for custom framing businesses. This guide will help you understand how to use the system effectively.

## Getting Started

### Logging In
1. Navigate to the application URL in your web browser
2. Use your provided username and password to log in
3. If you've forgotten your password, contact your system administrator

### System Overview
The POS System consists of several integrated components:
- **POS System**: Create custom framing orders
- **Orders**: View and manage existing orders
- **Production**: Track orders through the production process
- **Materials**: Manage material orders and inventory
- **Hub Integration**: Connect with the Jays Frames Hub
- **Customers**: Manage customer accounts and information
- **Dashboard**: View business analytics and reports

## POS System

The POS System is the core component for creating new custom framing orders.

### Creating a New Order
1. Enter customer information (name, email, phone)
2. Specify artwork details (width, height, type, description)
3. Upload an artwork image (optional)
4. Select a frame from the catalog
   - Use search to find frames by item number or name
   - Filter by material, manufacturer, width, or price
   - Select from vendor catalog search results
5. Choose a mat color
   - Filter by color category or manufacturer
   - Preview how it looks with your frame
6. Select a glass option
   - Choose from regular, non-glare, conservation, or museum glass
7. Add any special services (float mounting, shadowbox, etc.)
8. Review the order summary
   - Check "Add To Wholesale Order" if materials need to be ordered
9. Click "Create Order" to save the order

### Order Visualization
- Toggle between 2D and 3D view to see how the finished product will look
- Adjust dimensions to see real-time updates to the visualization

## Customer Management

### Adding a New Customer
1. Navigate to the Customers page
2. Click "New Customer"
3. Fill in the customer's details:
   - Name (required)
   - Email
   - Phone
   - Address
4. Click "Save" to create the customer record

### Finding Existing Customers
1. Use the search bar to find customers by name or email
2. Click on a customer to view their details and order history

### Customer History
For each customer, you can view:
- All past orders
- Pending orders
- Quotes
- Special preferences

## Order Management

### Viewing Orders
1. Navigate to the Orders page
2. Use filters to view specific orders:
   - By date range
   - By status
   - By customer

### Order Details
Click on any order to view detailed information:
- Customer information
- Order specifications
- Production status
- Payment status
- Special notes

### Editing Orders
1. Open the order you want to edit
2. Click "Edit Order"
3. Make the necessary changes
4. Click "Save Changes"

### Order Groups
Multiple orders can be grouped together for a single customer and single payment:
1. Create the first order as normal
2. When creating additional orders for the same customer, they will be added to the same order group
3. Process payment for the entire group at once

## Production Kanban

The Production Kanban board gives you a visual overview of all orders in production.

### Kanban Columns
- **Pending**: Orders that have been created but not started
- **In Design**: Orders currently being designed
- **Awaiting Materials**: Orders waiting for materials to arrive
- **In Production**: Orders currently being built
- **Ready for Pickup**: Completed orders ready for customer pickup
- **Completed**: Delivered orders

### Managing Order Production
1. Drag orders between columns to update their status
2. Click on an order card to view details
3. Add notes or update estimated completion dates

### Production Scheduling
1. Click "Schedule" on any order
2. Set the estimated production days
3. The system will automatically calculate the due date based on production capacity

## Materials Management

### Viewing Material Orders
1. Navigate to the Materials page
2. View all pending material orders

### Creating Material Orders
Material orders can be created automatically when checking "Add To Wholesale Order" during order creation, or manually:
1. Click "New Material Order"
2. Select the material type (frame, mat, glass)
3. Enter the material details
4. Set quantity and priority
5. Click "Create"

### Updating Material Order Status
1. Select a material order
2. Change the status (pending, ordered, shipped, received)
3. Add tracking information if available

## Payments

### Processing Payments
1. Navigate to an order or order group
2. Click "Proceed to Checkout"
3. Select payment method:
   - Credit Card (processed through Stripe)
   - Cash
   - Check
4. For credit card payments:
   - Enter card details securely
   - Process payment
5. For cash or check:
   - Enter amount received
   - Calculate change (if applicable)
   - Mark as paid

### Viewing Payment History
1. Navigate to an order
2. View the payment information section
3. See full payment details including method, amount, and date

## Hub Integration

The Hub Integration connects the POS system with Jays Frames Hub.

### Synchronizing Orders
1. Navigate to the Hub Integration page
2. Click "Sync Orders" to send new orders to the Hub
3. Click "Pull Updates" to get status updates from the Hub

### Managing Hub Connection
1. View connection status
2. Configure synchronization settings
3. View synchronization history

## Troubleshooting

### Common Issues

#### Order Creation Problems
- **Issue**: Cannot select a frame or mat
- **Solution**: Refresh the catalog by clicking the reload button

#### Payment Processing Issues
- **Issue**: Payment is declined
- **Solution**: Verify the card information and try again, or try a different payment method

#### System Performance
- **Issue**: System is running slowly
- **Solution**: Try clearing your browser cache or using a different browser

### Getting Help
If you encounter any issues not covered in this guide:
1. Check for error messages and note them down
2. Contact technical support with the specific error message and steps to reproduce the issue
3. Email support@jaysframes.com or call (555) 123-4567 for assistance