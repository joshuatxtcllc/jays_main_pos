import { Request, Response, NextFunction } from 'express';

// Extend Request interface to include apiKey
declare global {
  namespace Express {
    interface Request {
      apiKey?: any;
    }
  }
}
import crypto from 'crypto';

// Generate a secure API key for the Kanban integration
export const KANBAN_API_KEY = 'jf_' + crypto.randomBytes(32).toString('hex');

// Store API keys and their permissions
const API_KEYS: Record<string, {
  name: string;
  permissions: string[];
  created: string;
  lastUsed: string | null;
}> = {
  [KANBAN_API_KEY]: {
    name: 'Production Kanban Integration',
    permissions: ['kanban:read', 'kanban:write', 'orders:read', 'orders:update'],
    created: new Date().toISOString(),
    lastUsed: null
  }
};

/**
 * Middleware to validate API key for Kanban endpoints
 */
export function validateApiKey(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      error: 'Missing Authorization header',
      message: 'API key required in Authorization header as: Bearer YOUR_API_KEY'
    });
  }

  const token = authHeader.replace('Bearer ', '');
  
  if (!API_KEYS[token]) {
    return res.status(401).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid or has been revoked'
    });
  }

  // Update last used timestamp
  API_KEYS[token].lastUsed = new Date().toISOString();
  
  // Add API key info to request for logging
  (req as any).apiKey = API_KEYS[token];
  
  next();
}

/**
 * Get API key information (for admin purposes)
 */
export function getApiKeyInfo(apiKey: string) {
  return API_KEYS[apiKey] || null;
}

/**
 * List all API keys (for admin purposes)
 */
export function listApiKeys() {
  return Object.entries(API_KEYS).map(([key, info]) => ({
    key: key.substring(0, 12) + '...',
    ...info
  }));
}