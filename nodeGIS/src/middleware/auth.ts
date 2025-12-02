import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';

export interface AuthRequest extends Request {
  userId?: bigint;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 'UNAUTHENTICATED',
      message: '需要提供有效的认证Token'
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = verifyToken(token);
    req.userId = BigInt(decoded.sub);
    next();
  } catch (error) {
    return res.status(401).json({
      code: 'UNAUTHENTICATED',
      message: '需要提供有效的认证Token'
    });
  }
}

