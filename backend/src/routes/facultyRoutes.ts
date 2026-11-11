import { Router } from 'express';
import {
  getFacultyDashboard,
  getAssignedCourses,
  getEnrolledStudents,
  markAttendance,
  enterInternalMarks,
  createAssignment,
} from '../controllers/facultyController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize(['FACULTY', 'ADMIN']));

router.get('/dashboard', getFacultyDashboard);
router.get('/courses', getAssignedCourses);
router.get('/courses/:courseId/students', getEnrolledStudents);
router.post('/attendance', markAttendance);
router.post('/marks', enterInternalMarks);
router.post('/assignments', createAssignment);

export default router;

