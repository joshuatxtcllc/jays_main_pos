/**
 * Authentication Middleware for Jays Frames POS System
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Verify that the user is authenticated and is an admin
 */
export function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check if the user has admin privileges
  // This depends on how your user object is structured
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }

  next();
}

/**
 * Verify that the user is authenticated
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  next();
}