export type Role = 'STUDENT' | 'FACULTY' | 'PARENT' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  phone?: string;
  student?: Student;
  faculty?: Faculty;
  parent?: Parent;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  attendanceThreshold: number;
  condonationMin: number;
  condonationFee: number;
}

export interface Student {
  id: string;
  userId: string;
  rollNumber: string;
  admissionYear: number;
  departmentId: string;
  department: Department;
  currentSemester: number;
  cgpa: number;
  earnedCredits: number;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  user: User;
}

export interface Faculty {
  id: string;
  userId: string;
  employeeId: string;
  departmentId: string;
  department: Department;
  designation: string;
  qualification?: string;
  specialization?: string;
  officeRoom?: string;
  user: User;
}

export interface Parent {
  id: string;
  userId: string;
  occupation?: string;
  relationship: string;
  address?: string;
  user: User;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description?: string;
  departmentId: string;
  department?: Department;
  facultyId?: string;
  faculty?: { user: { name: string } };
  semesterNumber: number;
  credits: number;
  type: 'CORE' | 'ELECTIVE' | 'INTERDISCIPLINARY';
  capacity: number;
  enrolledCount?: number;
  isFull?: boolean;
}

export interface AttendanceRecord {
  id: string;
  courseId: string;
  course: Course;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  sessionType: 'LECTURE' | 'LAB' | 'TUTORIAL';
  remarks?: string;
}

export interface Grievance {
  id: string;
  studentId: string;
  student?: {
    rollNumber: string;
    user: { name: string; email: string };
    department: { name: string; code: string };
  };
  category: string;
  subject: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  adminResponse?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: string;
  isPinned: boolean;
  createdAt: string;
  author: { name: string; role: string };
}

