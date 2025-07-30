import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '@src/models/common/types';
import ENV from '@src/common/constants/ENV';

const JWT_SECRET = ENV.Jwt;


if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined');
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Access denied. Token is not in Bearer format.' });
  }

  const token = tokenParts[1];

  try {
    const decodedPayload = jwt.verify(token, JWT_SECRET);
    req.user = decodedPayload as { userId: string, username: string };
    next();
  } catch (error) {
    res.status(403).json({ message: 'Access denied. Invalid token.' });
  }
};