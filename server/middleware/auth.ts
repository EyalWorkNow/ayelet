import type { Request, Response, NextFunction } from 'express';
import { getAdminAuth } from '../services/firebaseAdmin.js';

const ADMIN_EMAILS = new Set([
  'admin@admin.com',
  'eyalatiyawork@gmail.com',
  'admin@ayala.com',
]);

export interface AuthRequest extends Request {
  uid?: string;
  userEmail?: string;
  isAdmin?: boolean;
}

/**
 * Verifies Firebase ID token from Authorization: Bearer <token> header.
 * Sets req.uid, req.userEmail, req.isAdmin.
 */
export async function verifyToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing Authorization header' });
    return;
  }

  const token = header.slice(7);
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    req.uid = decoded.uid;
    req.userEmail = decoded.email ?? '';
    req.isAdmin = ADMIN_EMAILS.has(req.userEmail);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Requires admin role. Must be used after verifyToken.
 */
export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.isAdmin) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}
