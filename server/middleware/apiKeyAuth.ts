
import { Request, Response, NextFunction } from 'express';

// Extend Request interface to include apiKey
declare global {
  namespace Express {
    interface Request {
      apiKey?: any;
      apiKeyType?: 'jwt' | 'static';
    }
  }
}

// Static API keys for external integrations
const API_KEYS: Record<string, {
  name: string;
  permissions: string[];
  created: string;
  lastUsed: string | null;
}> = {
  'kanban_admin_key_2025_full_access': {
    name: '3D Designer Integration',
    permissions: ['orders:create', 'orders:read', 'orders:update', 'pricing:read', 'files:upload'],
    created: new Date().toISOString(),
    lastUsed: null
  },
  'jf_houston_heights_framing_2025_master_api_key_secure_access': {
    name: 'Houston Heights Framing API Integration',
    permissions: ['orders:read', 'orders:write', 'integration:webhook', 'pricing:read', 'catalog:read'],
    created: new Date().toISOString(),
    lastUsed: null
  }
};

/**
 * Middleware to validate API key for 3D Designer endpoints
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
  
  // Check if it's a static API key
  if (API_KEYS[token]) {
    // Update last used timestamp
    API_KEYS[token].lastUsed = new Date().toISOString();
    
    // Add API key info to request for logging
    req.apiKey = API_KEYS[token];
    req.apiKeyType = 'static';
    
    return next();
  }

  // If not a static key, try JWT validation
  try {
    // For now, we'll accept the JWT validation from the existing auth middleware
    // You can import and use your existing JWT validation here
    req.apiKeyType = 'jwt';
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid API key or JWT token',
      message: 'The provided authentication token is not valid'
    });
  }
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
