import { Router } from 'express';
import {
  getStudentDashboard,
  getStudentProfile,
  getStudentAttendance,
  applyCondonation,
  getStudentCourses,
  registerCourse,
  dropCourse,
  getStudentExaminations,
  getStudentFees,
  makeFeePayment,
  getStudentGrievances,
  createStudentGrievance,
} from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Protect all routes under student module
router.use(authenticate);
router.use(authorize(['STUDENT', 'ADMIN']));

router.get('/dashboard', getStudentDashboard);
router.get('/profile', getStudentProfile);
router.get('/attendance', getStudentAttendance);
router.post('/condonation', applyCondonation);
router.get('/courses', getStudentCourses);
router.post('/courses/register', registerCourse);
router.post('/courses/drop', dropCourse);
router.get('/examinations', getStudentExaminations);
router.get('/fees', getStudentFees);
router.post('/fees/pay', makeFeePayment);
router.get('/grievances', getStudentGrievances);
router.post('/grievances', createStudentGrievance);

export default router;

