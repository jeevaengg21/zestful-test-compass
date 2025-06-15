import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import type { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import type { User } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthenticatedRequest extends Request {
  user?: User & { tenantId: string };
  tenantId?: string;
}

export interface JWTPayload {
  userId: string;
  tenantId: string;
  email: string;
  roles: string[];
}

export const generateToken = (user: User): string => {
  const payload: JWTPayload = {
    userId: user.id,
    tenantId: user.tenantId!,
    email: user.email!,
    roles: user.roles || [],
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  try {
    // Get user with tenant information
    const user = await storage.getUser(payload.userId);
    if (!user || !user.tenantId) {
      return res.status(403).json({ message: 'User not found or not associated with tenant' });
    }

    // Verify tenant is active
    const tenant = await storage.getTenant(user.tenantId);
    if (!tenant || !tenant.isActive || tenant.subscriptionStatus !== 'active') {
      return res.status(403).json({ message: 'Tenant subscription inactive' });
    }

    req.user = user as User & { tenantId: string };
    req.tenantId = user.tenantId;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userRoles = req.user.roles || [];
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

// Super admin middleware for tenant management
export const requireSuperAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.roles?.includes('super_admin')) {
    return res.status(403).json({ message: 'Super admin access required' });
  }
  next();
};