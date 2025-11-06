import { Request, Response, NextFunction } from 'express';
import { College, ICollege } from '../models/college';
import { CustomError, NotFoundError, ValidationError } from '../utils/errors';

export const collegeController = {
  // Create a new college
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const college = new College(req.body);
      await college.save();
      res.status(201).json({ status: 'success', data: college });
    } catch (error) {
      next(new ValidationError('Invalid college data', [(error as Error).message]));
    }
  },

  // Get all colleges with pagination and filters
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const query = College.find();

      // Apply filters if provided
      if (req.query.state) {
        query.where('location.state').equals(req.query.state);
      }
      if (req.query.courses) {
        query.where('courses').in([req.query.courses]);
      }

      const [colleges, total] = await Promise.all([
        query.skip(skip).limit(limit).exec(),
        College.countDocuments(query.getQuery()),
      ]);

      res.status(200).json({
        status: 'success',
        data: colleges,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: colleges.length,
          total_records: total,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get college by ID
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const college = await College.findById(req.params.id);
      if (!college) {
        throw new NotFoundError('College not found');
      }
      res.status(200).json({ status: 'success', data: college });
    } catch (error) {
      next(error);
    }
  },

  // Update college
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const college = await College.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!college) {
        throw new NotFoundError('College not found');
      }
      res.status(200).json({ status: 'success', data: college });
    } catch (error) {
      if (error instanceof Error) {
        next(new ValidationError('Invalid update data', [error.message]));
      } else {
        next(error);
      }
    }
  },

  // Delete college
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const college = await College.findByIdAndDelete(req.params.id);
      if (!college) {
        throw new NotFoundError('College not found');
      }
      res.status(200).json({
        status: 'success',
        message: 'College deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Search colleges by location (within radius)
  async searchByLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { longitude, latitude, radius = 10 } = req.query;
      
      if (!longitude || !latitude) {
        throw new ValidationError('Longitude and latitude are required');
      }

      const colleges = await College.find({
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: Number(radius) * 1000, // Convert km to meters
          },
        },
      });

      res.status(200).json({ status: 'success', data: colleges });
    } catch (error) {
      next(error);
    }
  },
};