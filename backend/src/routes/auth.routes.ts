import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { auth } from '../middleware/auth';

const router = Router();

// Authentication routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/profile', auth, AuthController.getProfile);

export default router;