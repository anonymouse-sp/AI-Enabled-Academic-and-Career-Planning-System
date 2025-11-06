import { Router } from 'express';
import healthRouter from './health';
import studentRoutes from './studentRoutes';
import collegeRoutes from './collegeRoutes';
import authRoutes from './auth.routes';

const router = Router();

// Health check route
router.use('/health', healthRouter);

// Main routes
router.use('/auth', authRoutes);
router.use('/colleges', collegeRoutes);
router.use('/students', studentRoutes);

export default router;