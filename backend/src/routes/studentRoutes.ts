import { Router } from 'express';
import { studentController } from '../controllers/studentController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/register', studentController.register);
router.post('/login', studentController.login);

// Protected routes
router.get('/:id', authMiddleware, studentController.getProfile);
router.put('/:id', authMiddleware, studentController.updateProfile);
router.post('/:studentId/colleges/:collegeId/save', authMiddleware, studentController.toggleSavedCollege);
router.post('/:studentId/colleges/:collegeId/apply', authMiddleware, studentController.submitApplication);

export default router;