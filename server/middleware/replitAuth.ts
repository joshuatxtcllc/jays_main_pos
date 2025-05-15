
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to handle Replit Auth
 * It verifies the Replit user headers and attaches the user info to the request
 */
export function replitAuth(req: Request, res: Response, next: NextFunction) {
  // Check for Replit Auth headers
  const userId = req.headers['x-replit-user-id'];
  const userName = req.headers['x-replit-user-name'];
  const userRoles = req.headers['x-replit-user-roles'];
  const userProfileImage = req.headers['x-replit-user-profile-image'];
  
  // If we have a user ID, they're authenticated
  if (userId) {
    // Attach the Replit user info to the request
    req.user = {
      id: userId as string,
      name: userName as string,
      profileImage: userProfileImage as string,
      roles: userRoles ? (userRoles as string).split(',') : [],
      isReplitUser: true
    };
    
    return next();
  }
  
  // No Replit Auth headers found
  return res.status(401).json({ error: 'Authentication required' });
}

/**
 * Middleware that only checks for Replit Auth but doesn't require it
 * This is useful for routes that can be accessed by both authenticated and anonymous users
 */
export function optionalReplitAuth(req: Request, res: Response, next: NextFunction) {
  // Check for Replit Auth headers
  const userId = req.headers['x-replit-user-id'];
  const userName = req.headers['x-replit-user-name'];
  const userRoles = req.headers['x-replit-user-roles'];
  const userProfileImage = req.headers['x-replit-user-profile-image'];
  
  // If we have a user ID, they're authenticated
  if (userId) {
    // Attach the Replit user info to the request
    req.user = {
      id: userId as string,
      name: userName as string,
      profileImage: userProfileImage as string,
      roles: userRoles ? (userRoles as string).split(',') : [],
      isReplitUser: true
    };
  }
  
  // Continue regardless of authentication
  next();
}
