import { Router } from 'express';
import {
  getExaminations,
  createExamination,
  enterExamMarks,
  publishSemesterResults,
} from '../controllers/examController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getExaminations);
router.post('/', authorize(['ADMIN']), createExamination);
router.post('/:examinationId/marks', authorize(['FACULTY', 'ADMIN']), enterExamMarks);
router.post('/publish-results', authorize(['ADMIN']), publishSemesterResults);

export default router;

