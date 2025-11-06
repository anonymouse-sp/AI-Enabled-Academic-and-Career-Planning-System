import { Request, Response, NextFunction } from 'express';
import { Student, IStudent } from '../models/student';
import { CustomError, NotFoundError, ValidationError, AuthenticationError } from '../utils/errors';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import config from '../config/config';

export const studentController = {
  // Register new student
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const student = new Student(req.body);
      await student.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: student._id },
        config.jwt.secret as Secret,
        { expiresIn: config.jwt.expiresIn } as SignOptions
      );

      res.status(201).json({
        status: 'success',
        data: {
          student: {
            id: student._id,
            email: student.email,
            name: student.name,
          },
          token,
        },
      });
    } catch (error) {
      if ((error as any).code === 11000) {
        next(new ValidationError('Email already exists'));
      } else {
        next(new ValidationError('Invalid student data', [(error as Error).message]));
      }
    }
  },

  // Login student
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Check if student exists
      const student = await Student.findOne({ email });
      if (!student) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check password
      const isMatch = await student.comparePassword(password);
      if (!isMatch) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: student._id },
        config.jwt.secret as Secret,
        { expiresIn: config.jwt.expiresIn } as SignOptions
      );

      res.status(200).json({
        status: 'success',
        data: {
          student: {
            id: student._id,
            email: student.email,
            name: student.name,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get student profile
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await Student.findById(req.params.id)
        .select('-password')
        .populate('savedColleges')
        .populate('applications.college');

      if (!student) {
        throw new NotFoundError('Student not found');
      }

      res.status(200).json({ status: 'success', data: student });
    } catch (error) {
      next(error);
    }
  },

  // Update student profile
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      // Prevent password update through this endpoint
      if (req.body.password) {
        delete req.body.password;
      }

      const student = await Student.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).select('-password');

      if (!student) {
        throw new NotFoundError('Student not found');
      }

      res.status(200).json({ status: 'success', data: student });
    } catch (error) {
      if (error instanceof Error) {
        next(new ValidationError('Invalid update data', [error.message]));
      } else {
        next(error);
      }
    }
  },

  // Save/Unsave college
  async toggleSavedCollege(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId, collegeId } = req.params;
      const student = await Student.findById(studentId);

      if (!student) {
        throw new NotFoundError('Student not found');
      }

      const savedCollegeIndex = student.savedColleges.indexOf(collegeId as any);
      
      if (savedCollegeIndex === -1) {
        student.savedColleges.push(collegeId as any);
      } else {
        student.savedColleges.splice(savedCollegeIndex, 1);
      }

      await student.save();
      res.status(200).json({
        status: 'success',
        message: savedCollegeIndex === -1 ? 'College saved' : 'College unsaved',
        data: student.savedColleges,
      });
    } catch (error) {
      next(error);
    }
  },

  // Submit college application
  async submitApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId, collegeId } = req.params;
      const student = await Student.findById(studentId);

      if (!student) {
        throw new NotFoundError('Student not found');
      }

      // Check if application already exists
      const existingApplication = student.applications.find(
        (app) => app.college.toString() === collegeId
      );

      if (existingApplication) {
        throw new ValidationError('Application already submitted');
      }

      student.applications.push({
        college: collegeId as any,
        status: 'pending',
        appliedDate: new Date(),
      });

      await student.save();
      res.status(200).json({
        status: 'success',
        message: 'Application submitted successfully',
        data: student.applications,
      });
    } catch (error) {
      next(error);
    }
  },
};