import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../utils/errors';
import config from '../config/config';
import { Student } from '../models/student';

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string };

    const student = await Student.findById(decoded.id).select('-password');
    if (!student) {
      throw new AuthenticationError('Invalid token');
    }

    req.user = student;
    next();
  } catch (error) {
    next(new AuthenticationError('Authentication failed'));
  }
};