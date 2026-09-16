import { Request, Response, NextFunction } from 'express';
import { db } from './db.ts';
import { User } from '../src/types.ts';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

// In-memory session store (or token encoder)
const sessions = new Map<string, { userId: string; expiresAt: number }>();

export function generateToken(userId: string): string {
  const token = `tok_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  // 7 days expiration
  sessions.set(token, {
    userId,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });
  return token;
}

export function verifyToken(token: string): User | null {
  const session = sessions.get(token);
  if (!session) {
    // If server restarted, we can also allow the token if it matches the format `tok_<userId>_...`
    // for seamless dev experience
    const match = token.match(/^tok_([a-zA-Z0-9_-]+)_/);
    if (match) {
      const user = db.findUserById(match[1]);
      if (user && user.is_active) {
        sessions.set(token, { userId: user.id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
        return user;
      }
    }
    return null;
  }

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }

  const user = db.findUserById(session.userId);
  if (!user || !user.is_active) {
    sessions.delete(token);
    return null;
  }

  return user;
}

export function revokeToken(token: string) {
  sessions.delete(token);
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  req.user = user;
  next();
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Administrator privilege required.' });
  }
  next();
};

export const requireCoordinatorOrAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'coordinator')) {
    return res.status(403).json({ error: 'Access denied: Authorized personnel only.' });
  }
  next();
};

export const requireStudent = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ error: 'Access denied: Student access only.' });
  }
  next();
};

