/**
 * Authentication Middleware for Jays Frames POS System
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Verify that the user is authenticated and is an admin
 */
export const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
  // For now, allow all requests to pass through admin check
  // TODO: Implement proper authentication when Passport.js is set up
  console.log('Admin auth middleware: Allowing request (authentication not implemented)');
  next();
};

/**
 * Verify that the user is authenticated
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  next();
}