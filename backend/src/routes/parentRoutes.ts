import { Router } from 'express';
import { getParentDashboard } from '../controllers/parentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize(['PARENT', 'ADMIN']));

router.get('/dashboard', getParentDashboard);

export default router;

