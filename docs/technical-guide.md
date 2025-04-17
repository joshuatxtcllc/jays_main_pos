# Jays Frames POS System - Technical Documentation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Development Setup](#development-setup)
3. [Database Schema](#database-schema)
4. [API Documentation](#api-documentation)
5. [Authentication](#authentication)
6. [Deployment](#deployment)
7. [Performance Optimization](#performance-optimization)
8. [Error Handling](#error-handling)
9. [Testing](#testing)
10. [Security Considerations](#security-considerations)
11. [Backup & Recovery](#backup--recovery)
12. [Third-Party Integrations](#third-party-integrations)

## System Architecture

The Jays Frames POS System is built as a full-stack JavaScript application:

### Frontend
- **Framework**: React with TypeScript
- **State Management**: React Query (TanStack Query)
- **Routing**: Wouter
- **UI Components**: Custom components with Tailwind CSS and shadcn/ui
- **3D Rendering**: Three.js for frame visualization
- **Drag & Drop**: React DnD for the Kanban board
- **Charting**: Recharts for analytics

### Backend
- **Server**: Express.js with TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle
- **API**: RESTful endpoints
- **Authentication**: Express sessions with Passport.js
- **Payment Processing**: Stripe Integration
- **Email Notifications**: SendGrid

### Infrastructure
- **Hosting**: [Deployment platform details]
- **Database Hosting**: [Database hosting details]
- **CI/CD**: [CI/CD pipeline details]
- **Version Control**: Git

## Development Setup

### Prerequisites
- Node.js (v18+)
- npm (v8+)
- PostgreSQL (v14+)

### Local Setup
1. Clone the repository
   ```
   git clone [repository URL]
   cd jays-frames-pos
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file with the following:
   ```
   # Database
   DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
   
   # Authentication
   SESSION_SECRET=[random secret]
   
   # Stripe
   STRIPE_SECRET_KEY=[your stripe secret key]
   VITE_STRIPE_PUBLIC_KEY=[your stripe publishable key]
   
   # SendGrid
   SENDGRID_API_KEY=[your sendgrid key]
   
   # Supabase
   VITE_SUPABASE_URL=[your supabase url]
   VITE_SUPABASE_KEY=[your supabase key]
   
   # OpenAI (for AI features)
   OPENAI_API_KEY=[your openai key]
   ```

4. Set up the database
   ```
   npm run db:push
   ```

5. Start the development server
   ```
   npm run dev
   ```

6. Run automated tests
   ```
   npm test
   ```

## Database Schema

### Core Tables
- **customers** - Customer information
- **frames** - Frame catalog
- **mat_colors** - Mat color catalog
- **glass_options** - Glass options catalog
- **special_services** - Special services catalog
- **orders** - Customer orders
- **order_groups** - Groups of orders for single payment
- **order_special_services** - Join table for orders and special services
- **material_orders** - Wholesale material orders
- **customer_notifications** - Customer notifications for order status

### Entity Relationships
- A **customer** can have many **order_groups**
- An **order_group** contains many **orders**
- An **order** belongs to a **customer** and references a **frame**, **mat_color**, and **glass_option**
- An **order** can have many **special_services** through **order_special_services**
- A **material_order** can be associated with a specific **order**

## API Documentation

### Core Endpoints

#### Customer Endpoints
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get a specific customer
- `POST /api/customers` - Create a new customer
- `PATCH /api/customers/:id` - Update a customer
- `GET /api/customers/:id/orders` - Get all orders for a customer

#### Order Endpoints
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get a specific order
- `POST /api/orders` - Create a new order
- `PATCH /api/orders/:id` - Update an order
- `DELETE /api/orders/:id` - Delete an order
- `POST /api/order-special-services` - Add special service to an order

#### Frame Catalog Endpoints
- `GET /api/frames` - Get all frames
- `GET /api/frames/:id` - Get a specific frame
- `PATCH /api/frames/:id` - Update a frame (admin only)

#### Vendor Catalog Endpoints
- `GET /api/vendor-catalog/all` - Get frames from all vendors
- `GET /api/vendor-catalog/:vendor` - Get frames from a specific vendor

#### Material Order Endpoints
- `GET /api/material-orders` - Get all material orders
- `GET /api/material-orders/:id` - Get a specific material order
- `POST /api/material-orders` - Create a new material order
- `PATCH /api/material-orders/:id` - Update a material order
- `DELETE /api/material-orders/:id` - Delete a material order

#### Production Endpoints
- `GET /api/production/kanban` - Get orders for kanban board
- `PATCH /api/production/status/:id` - Update order production status
- `POST /api/production/schedule/:id` - Schedule an order for production

#### Payment Endpoints
- `POST /api/create-payment-intent` - Create a Stripe payment intent
- `POST /api/update-payment-status` - Update payment status (for cash/check)

## Authentication

The system uses session-based authentication with Passport.js:

### Auth Flow
1. User logs in with username/password
2. Sessions are stored in PostgreSQL
3. Auth middleware protects sensitive routes

### Security Measures
- Password hashing with scrypt
- CSRF protection
- Rate limiting
- Session expiration

## Deployment

### Production Requirements
- Node.js server environment
- PostgreSQL database
- Environment variables properly set

### Deployment Steps
1. Build the application
   ```
   npm run build
   ```

2. Deploy the built files to your hosting environment

3. Set up environment variables in the production environment

4. Configure a process manager (e.g., PM2)
   ```
   pm2 start server/index.js --name jays-frames-pos
   ```

### Staging Environment
Consider setting up a staging environment that mirrors production for testing.

## Performance Optimization

### Frontend Optimizations
- React Query for efficient data fetching and caching
- Lazy-loading of components
- Code splitting
- Image optimization
- Bundle size analysis and reduction

### Backend Optimizations
- Database query optimization
- Database indexing
- Caching where appropriate
- Server-side rendering for initial page load

### Monitoring
- Track API response times
- Monitor database performance
- Set up alerts for performance issues

## Error Handling

The system uses a comprehensive error handling approach:

### Client-side Error Handling
- React Query error handling
- React Error Boundaries
- Centralized error handling with the ErrorHandler utility
- User-friendly error messages

### Server-side Error Handling
- Express error middleware
- Structured error responses
- Logging of all errors
- Graceful handling of database connection issues

## Testing

### Unit Testing
- Testing of utility functions and core business logic
- Testing of component rendering

### Integration Testing
- API endpoint testing
- Database operation testing

### End-to-End Testing
- Full user flow testing
- Cross-browser testing

### Running Tests
```
npm test          # Run all tests
npm run test:unit # Run unit tests only
npm run test:e2e  # Run end-to-end tests only
```

## Security Considerations

### Data Protection
- All sensitive data should be encrypted at rest
- Use HTTPS in production
- Implement proper access controls
- Regularly update dependencies

### Security Headers
- Set appropriate security headers:
  - Content-Security-Policy
  - X-XSS-Protection
  - X-Frame-Options
  - X-Content-Type-Options

### Security Testing
- Regular penetration testing
- Automated vulnerability scanning
- Code reviews focused on security

## Backup & Recovery

### Database Backups
- Use the provided backup script in `scripts/backup-database.js`
- Set up a cron job to run backups regularly
- Store backups in a secure, off-site location
- Test restoration procedure regularly

### Disaster Recovery Plan
1. Identify critical systems and data
2. Document recovery procedures
3. Assign responsibilities for recovery tasks
4. Regularly test recovery scenarios

## Third-Party Integrations

### Stripe
- Used for payment processing
- Configured with webhooks for payment event handling
- Test mode available for development

### SendGrid
- Used for email notifications
- Templates for different notification types
- Email delivery tracking

### Supabase
- Used for additional data storage
- File storage for artwork images
- Configured with proper security rules

### OpenAI
- Used for AI-assisted material ordering
- Configured with rate limits to control costs
- Fallback mechanisms if AI service is unavailable