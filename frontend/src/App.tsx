import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/auth/LoginPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentAttendancePage } from './pages/student/StudentAttendancePage';
import { StudentCoursesPage } from './pages/student/StudentCoursesPage';
import { StudentExaminationsPage } from './pages/student/StudentExaminationsPage';
import { StudentFeesPage } from './pages/student/StudentFeesPage';
import { StudentGrievancesPage } from './pages/student/StudentGrievancesPage';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { FacultyAttendancePage } from './pages/faculty/FacultyAttendancePage';
import { FacultyCoursesPage } from './pages/faculty/FacultyCoursesPage';
import { FacultyMarksPage } from './pages/faculty/FacultyMarksPage';
import { FacultyAssignmentsPage } from './pages/faculty/FacultyAssignmentsPage';

// Parent Pages
import { ParentDashboard } from './pages/parent/ParentDashboard';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminDepartmentsPage } from './pages/admin/AdminDepartmentsPage';
import { AdminSemestersPage } from './pages/admin/AdminSemestersPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminAttendancePage } from './pages/admin/AdminAttendancePage';
import { AdminExaminationsPage } from './pages/admin/AdminExaminationsPage';
import { AdminFeesPage } from './pages/admin/AdminFeesPage';
import { AdminGrievancesPage } from './pages/admin/AdminGrievancesPage';
import { AdminAnnouncementsPage } from './pages/admin/AdminAnnouncementsPage';

const RootRedirect: React.FC = () => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'STUDENT':
      return <Navigate to="/student/dashboard" replace />;
    case 'FACULTY':
      return <Navigate to="/faculty/dashboard" replace />;
    case 'PARENT':
      return <Navigate to="/parent/dashboard" replace />;
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Student Routes */}
          <Route element={<DashboardLayout allowedRoles={['STUDENT', 'ADMIN']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
            <Route path="/student/attendance" element={<StudentAttendancePage />} />
            <Route path="/student/courses" element={<StudentCoursesPage />} />
            <Route path="/student/examinations" element={<StudentExaminationsPage />} />
            <Route path="/student/fees" element={<StudentFeesPage />} />
            <Route path="/student/grievances" element={<StudentGrievancesPage />} />
          </Route>

          {/* Faculty Routes */}
          <Route element={<DashboardLayout allowedRoles={['FACULTY', 'ADMIN']} />}>
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/faculty/attendance" element={<FacultyAttendancePage />} />
            <Route path="/faculty/courses" element={<FacultyCoursesPage />} />
            <Route path="/faculty/marks" element={<FacultyMarksPage />} />
            <Route path="/faculty/assignments" element={<FacultyAssignmentsPage />} />
          </Route>

          {/* Parent Routes */}
          <Route element={<DashboardLayout allowedRoles={['PARENT', 'ADMIN']} />}>
            <Route path="/parent/dashboard" element={<ParentDashboard />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<DashboardLayout allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/departments" element={<AdminDepartmentsPage />} />
            <Route path="/admin/semesters" element={<AdminSemestersPage />} />
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route path="/admin/attendance" element={<AdminAttendancePage />} />
            <Route path="/admin/examinations" element={<AdminExaminationsPage />} />
            <Route path="/admin/fees" element={<AdminFeesPage />} />
            <Route path="/admin/grievances" element={<AdminGrievancesPage />} />
            <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
