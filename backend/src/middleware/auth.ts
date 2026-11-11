import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
  studentId?: string;
  facultyId?: string;
  parentId?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access denied. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'uniconnect-secret-key-2026';

    const decoded = jwt.verify(token, secret) as any;
    if (!decoded || !decoded.id) {
      res.status(401).json({ error: 'Invalid authentication token.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        student: true,
        faculty: true,
        parent: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'User not found or account is deactivated.' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      studentId: user.student?.id,
      facultyId: user.faculty?.id,
      parentId: user.parent?.id,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is invalid or expired.' });
  }
};

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized. Please log in.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access forbidden: requires one of [${allowedRoles.join(', ')}] role.`,
      });
      return;
    }

    next();
  };
};

