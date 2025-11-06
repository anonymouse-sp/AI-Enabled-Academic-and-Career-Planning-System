import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole, IUser } from '../models/User';

export class AuthController {
  static generateToken(user: IUser): string {
    return jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
  }

  static async register(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Create new user
      const user = new User({
        name,
        email,
        password,
        role
      });

      await user.save();

      // Generate token
      const token = AuthController.generateToken(user);

      res.status(201).json({
        message: 'Registration successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(400).json({ error: 'Registration failed' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = AuthController.generateToken(user);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(400).json({ error: 'Login failed' });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const user = await User.findById((req as any).user._id).select('-password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: 'Could not fetch profile' });
    }
  }
}