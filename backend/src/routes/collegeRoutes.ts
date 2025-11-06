import { Router } from 'express';
import { collegeController } from '../controllers/collegeController';

const router = Router();

// GET /api/colleges
router.get('/', collegeController.getAll);

// GET /api/colleges/search/location
router.get('/search/location', collegeController.searchByLocation);

// GET /api/colleges/:id
router.get('/:id', collegeController.getById);

// POST /api/colleges
router.post('/', collegeController.create);

// PUT /api/colleges/:id
router.put('/:id', collegeController.update);

// DELETE /api/colleges/:id
router.delete('/:id', collegeController.delete);

export default router;