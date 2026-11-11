import { Router } from 'express';
import {
  getAdminDashboard,
  getUsers,
  createUser,
  toggleUserStatus,
  getDepartments,
  updateDepartmentPolicy,
  getSemesters,
  updateSemester,
  getAllCourses,
  createCourse,
  getAllGrievances,
  updateGrievanceStatus,
  getCondonationApplications,
  reviewCondonation,
  getAttendanceShortageReport,
  broadcastAnnouncement,
  getFeeReports,
} from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:userId/toggle-status', toggleUserStatus);

router.get('/departments', getDepartments);
router.patch('/departments/:departmentId/policy', updateDepartmentPolicy);

router.get('/semesters', getSemesters);
router.patch('/semesters/:semesterId', updateSemester);

router.get('/courses', getAllCourses);
router.post('/courses', createCourse);

router.get('/grievances', getAllGrievances);
router.patch('/grievances/:grievanceId', updateGrievanceStatus);

router.get('/condonations', getCondonationApplications);
router.patch('/condonations/:condonationId', reviewCondonation);

router.get('/attendance-shortage', getAttendanceShortageReport);
router.post('/announcements', broadcastAnnouncement);
router.get('/fee-reports', getFeeReports);

export default router;

