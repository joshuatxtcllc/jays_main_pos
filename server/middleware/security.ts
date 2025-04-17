/**
 * Security Middleware for Jays Frames POS System
 * 
 * This middleware adds various security headers and protections to the application.
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

/**
 * Apply all security middleware to the Express application
 */
export function applySecurityMiddleware(app: any) {
  // Parse cookies for CSRF protection
  app.use(cookieParser());
  
  // Add security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "js.stripe.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "*.stripe.com", "res.cloudinary.com"],
          connectSrc: ["'self'", "api.stripe.com", "*.supabase.co", "api.openai.com"],
          fontSrc: ["'self'", "fonts.gstatic.com"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["js.stripe.com"],
        },
      },
      // Don't set Cross-Origin-Embedder-Policy so Stripe can work properly
      crossOriginEmbedderPolicy: false,
    })
  );
  
  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again after 15 minutes',
  });
  
  // Apply rate limiting to API routes
  app.use('/api/', apiLimiter);
  
  // More strict rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 failed attempts per hour
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Only count failed requests
    message: 'Too many login attempts from this IP, please try again after an hour',
  });
  
  // Apply stricter rate limiting to authentication routes
  app.use('/api/login', authLimiter);
  
  // CSRF protection
  // Only apply to routes that handle state changes
  const csrfProtection = csrf({ cookie: { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }});
  
  // Helper to apply CSRF to specific routes
  const protectStateChangingRoutes = (app: any) => {
    // Apply to all POST, PUT, PATCH, DELETE endpoints except /api/webhook
    app.post(/^\/api\/(?!webhook).+/, csrfProtection);
    app.put('/api/*', csrfProtection);
    app.patch('/api/*', csrfProtection);
    app.delete('/api/*', csrfProtection);
  };
  
  protectStateChangingRoutes(app);
  
  // CSRF Token provider
  app.get('/api/csrf-token', csrfProtection, (req: Request, res: Response) => {
    res.json({ csrfToken: req.csrfToken() });
  });
  
  // Add middleware to check for JWT expiration on protected routes
  app.use('/api/*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/login') || 
        req.path.startsWith('/api/register') ||
        req.path.startsWith('/api/webhook') ||
        req.path === '/api/csrf-token') {
      return next();
    }
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    next();
  });
  
  // Global error handler for security errors
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.code === 'EBADCSRFTOKEN') {
      // Handle CSRF token errors
      return res.status(403).json({
        error: 'Security validation failed. Please refresh the page and try again.'
      });
    }
    
    next(err);
  });
}

/**
 * Check if an IP address should be blocked (e.g., from a blocklist)
 */
export function isIPBlocked(ip: string): boolean {
  // Implement IP blocklist checking logic here
  const blockedIPs: string[] = [
    // Add known malicious IPs here
  ];
  
  return blockedIPs.includes(ip);
}

/**
 * Middleware to block requests from suspicious IPs
 */
export function blockSuspiciousIPs(req: Request, res: Response, next: NextFunction) {
  const clientIP = req.ip || req.socket.remoteAddress || '';
  
  if (isIPBlocked(clientIP)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  next();
}

/**
 * Middleware to prevent brute force attacks
 */
export function preventBruteForce(req: Request, res: Response, next: NextFunction) {
  // This is an additional layer on top of the rate limiter
  // You could implement more sophisticated brute force detection logic here
  
  next();
}