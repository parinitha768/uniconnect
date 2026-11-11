import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getAdminDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalStudents = await prisma.student.count();
    const totalFaculty = await prisma.faculty.count();
    const totalDepartments = await prisma.department.count();
    const totalCourses = await prisma.course.count();

    // Fees overview
    const feeRecords = await prisma.studentFee.findMany();
    const totalFeeExpected = feeRecords.reduce((sum, f) => sum + f.totalFee, 0);
    const totalFeeCollected = feeRecords.reduce((sum, f) => sum + f.paidFee, 0);
    const totalFeePending = feeRecords.reduce((sum, f) => sum + f.pendingFee, 0);

    // Grievances overview
    const pendingGrievances = await prisma.grievance.count({
      where: { status: 'PENDING' },
    });
    const inProgressGrievances = await prisma.grievance.count({
      where: { status: 'IN_PROGRESS' },
    });
    const resolvedGrievances = await prisma.grievance.count({
      where: { status: 'RESOLVED' },
    });

    // Departments stats
    const departments = await prisma.department.findMany({
      include: {
        _count: { select: { students: true, faculties: true, courses: true } },
      },
    });

    // Recent payments
    const recentPayments = await prisma.payment.findMany({
      take: 6,
      orderBy: { paidAt: 'desc' },
      include: {
        student: {
          include: { user: true, department: true },
        },
      },
    });

    // Recent Grievances
    const recentGrievances = await prisma.grievance.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { include: { user: true } },
      },
    });

    // Pending Condonations count
    const pendingCondonations = await prisma.attendanceCondonation.count({
      where: { status: 'PENDING' },
    });

    // Current Semester
    const currentSemester = await prisma.academicSemester.findFirst({
      where: { isCurrent: true },
    });

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalFaculty,
        totalDepartments,
        totalCourses,
        totalFeeExpected,
        totalFeeCollected,
        totalFeePending,
        pendingGrievances,
        inProgressGrievances,
        resolvedGrievances,
        pendingCondonations,
      },
      departments,
      currentSemester,
      recentPayments,
      recentGrievances,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching admin dashboard.' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.query;
    const users = await prisma.user.findMany({
      where: role ? { role: String(role).toUpperCase() } : undefined,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        student: {
          include: { department: true },
        },
        faculty: {
          include: { department: true },
        },
        parent: {
          include: {
            studentLinks: {
              include: { student: { include: { user: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching users.' });
  }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, name, role, phone, departmentId, rollNumber, employeeId, relationship, linkedStudentId } = req.body;

    if (!email || !password || !name || !role) {
      res.status(400).json({ error: 'Email, password, name, and role are required.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'A user with this email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role.toUpperCase();

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name,
        role: userRole,
        phone: phone || null,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${email}`,
      },
    });

    if (userRole === 'STUDENT') {
      if (!departmentId) {
        res.status(400).json({ error: 'Department ID is required for student creation.' });
        return;
      }
      const studentRoll = rollNumber || `NU2026${Math.floor(Math.random() * 9000 + 1000)}`;
      await prisma.student.create({
        data: {
          userId: user.id,
          rollNumber: studentRoll,
          admissionYear: new Date().getFullYear(),
          departmentId,
          currentSemester: 1,
        },
      });
    } else if (userRole === 'FACULTY') {
      if (!departmentId) {
        res.status(400).json({ error: 'Department ID is required for faculty creation.' });
        return;
      }
      const facultyEmpId = employeeId || `NUFAC-${Math.floor(Math.random() * 9000 + 1000)}`;
      await prisma.faculty.create({
        data: {
          userId: user.id,
          employeeId: facultyEmpId,
          departmentId,
          designation: req.body.designation || 'Assistant Professor',
          qualification: req.body.qualification || 'M.Tech / Ph.D',
        },
      });
    } else if (userRole === 'PARENT') {
      const parent = await prisma.parent.create({
        data: {
          userId: user.id,
          relationship: relationship || 'Guardian',
          occupation: req.body.occupation || 'Professional',
        },
      });

      if (linkedStudentId) {
        await prisma.parentStudentLink.create({
          data: {
            parentId: parent.id,
            studentId: linkedStudentId,
            relationship: relationship || 'Guardian',
            isVerified: true,
          },
        });
      }
    }

    res.json({
      success: true,
      message: `User created successfully as ${userRole}.`,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error creating user.' });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });

    res.json({
      success: true,
      message: `Account has been ${updated.isActive ? 'activated' : 'deactivated'}.`,
      isActive: updated.isActive,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error updating user status.' });
  }
};

export const getDepartments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        gradingPolicies: true,
        _count: { select: { students: true, faculties: true, courses: true } },
      },
    });
    res.json({ success: true, departments });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching departments.' });
  }
};

export const updateDepartmentPolicy = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { departmentId } = req.params;
    const { attendanceThreshold, condonationMin, condonationFee, name, description } = req.body;

    const updated = await prisma.department.update({
      where: { id: departmentId },
      data: {
        ...(attendanceThreshold !== undefined ? { attendanceThreshold: Number(attendanceThreshold) } : {}),
        ...(condonationMin !== undefined ? { condonationMin: Number(condonationMin) } : {}),
        ...(condonationFee !== undefined ? { condonationFee: Number(condonationFee) } : {}),
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
      },
    });

    res.json({
      success: true,
      message: 'Department attendance & academic policy updated.',
      department: updated,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error updating department policy.' });
  }
};

export const getSemesters = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const semesters = await prisma.academicSemester.findMany({
      include: {
        _count: { select: { registrations: true, examinations: true } },
      },
      orderBy: { year: 'desc' },
    });
    res.json({ success: true, semesters });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching semesters.' });
  }
};

export const updateSemester = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { semesterId } = req.params;
    const { registrationOpen, minCredits, maxCredits, registrationDeadline, isCurrent } = req.body;

    if (isCurrent) {
      await prisma.academicSemester.updateMany({
        data: { isCurrent: false },
      });
    }

    const updated = await prisma.academicSemester.update({
      where: { id: semesterId },
      data: {
        ...(registrationOpen !== undefined ? { registrationOpen: Boolean(registrationOpen) } : {}),
        ...(minCredits !== undefined ? { minCredits: Number(minCredits) } : {}),
        ...(maxCredits !== undefined ? { maxCredits: Number(maxCredits) } : {}),
        ...(registrationDeadline ? { registrationDeadline: new Date(registrationDeadline) } : {}),
        ...(isCurrent !== undefined ? { isCurrent: Boolean(isCurrent) } : {}),
      },
    });

    res.json({
      success: true,
      message: 'Academic semester rules updated successfully.',
      semester: updated,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error updating semester.' });
  }
};

export const getAllCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        department: true,
        faculty: { include: { user: true } },
        _count: { select: { registrations: true } },
      },
      orderBy: [{ department: { code: 'asc' } }, { semesterNumber: 'asc' }],
    });
    res.json({ success: true, courses });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching courses.' });
  }
};

export const createCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, title, description, departmentId, facultyId, semesterNumber, credits, type, capacity } = req.body;

    if (!code || !title || !departmentId) {
      res.status(400).json({ error: 'Course code, title, and department are required.' });
      return;
    }

    const course = await prisma.course.create({
      data: {
        code: code.trim().toUpperCase(),
        title,
        description: description || null,
        departmentId,
        facultyId: facultyId || null,
        semesterNumber: Number(semesterNumber) || 1,
        credits: Number(credits) || 3,
        type: type || 'CORE',
        capacity: Number(capacity) || 60,
      },
      include: {
        department: true,
        faculty: { include: { user: true } },
      },
    });

    res.json({
      success: true,
      message: 'Course created successfully.',
      course,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error creating course.' });
  }
};

export const getAllGrievances = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, category } = req.query;

    const grievances = await prisma.grievance.findMany({
      where: {
        ...(status ? { status: String(status) } : {}),
        ...(category ? { category: String(category) } : {}),
      },
      include: {
        student: {
          include: {
            user: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, grievances });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching grievances.' });
  }
};

export const updateGrievanceStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { grievanceId } = req.params;
    const { status, adminResponse } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Status is required.' });
      return;
    }

    const grievance = await prisma.grievance.findUnique({
      where: { id: grievanceId },
      include: { student: { include: { user: true } } },
    });

    if (!grievance) {
      res.status(404).json({ error: 'Grievance not found.' });
      return;
    }

    const updated = await prisma.grievance.update({
      where: { id: grievanceId },
      data: {
        status,
        adminResponse: adminResponse || grievance.adminResponse,
        resolvedBy: req.user?.name,
        resolvedAt: status === 'RESOLVED' ? new Date() : undefined,
      },
    });

    // Notify the student
    await prisma.notification.create({
      data: {
        userId: grievance.student.userId,
        title: `Grievance Status Updated: ${status}`,
        message: `Your grievance regarding "${grievance.subject}" has been updated to ${status}. Response: ${adminResponse || 'Updated by admin.'}`,
        category: 'GRIEVANCE',
        link: '/student/grievances',
      },
    });

    res.json({
      success: true,
      message: `Grievance status updated to ${status}.`,
      grievance: updated,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error updating grievance.' });
  }
};

export const getCondonationApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const condonations = await prisma.attendanceCondonation.findMany({
      include: {
        course: true,
        student: {
          include: {
            user: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, condonations });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching condonations.' });
  }
};

export const reviewCondonation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { condonationId } = req.params;
    const { status, adminRemarks } = req.body;

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({ error: 'Status must be APPROVED or REJECTED.' });
      return;
    }

    const condonation = await prisma.attendanceCondonation.findUnique({
      where: { id: condonationId },
      include: {
        student: { include: { user: true } },
        course: true,
      },
    });

    if (!condonation) {
      res.status(404).json({ error: 'Condonation application not found.' });
      return;
    }

    const updated = await prisma.attendanceCondonation.update({
      where: { id: condonationId },
      data: {
        status,
        adminRemarks: adminRemarks || null,
        reviewedAt: new Date(),
      },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: condonation.student.userId,
        title: `Attendance Condonation ${status}`,
        message: `Your attendance condonation application for ${condonation.course.code} has been ${status}. Remarks: ${adminRemarks || 'None'}.`,
        category: 'ATTENDANCE',
        link: '/student/attendance',
      },
    });

    res.json({
      success: true,
      message: `Condonation application has been ${status}.`,
      condonation: updated,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error reviewing condonation.' });
  }
};

export const getAttendanceShortageReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: true,
        department: true,
        registrations: {
          where: { status: { in: ['REGISTERED', 'APPROVED'] } },
          include: { course: true },
        },
      },
    });

    const shortageReport = [];

    for (const student of students) {
      const records = await prisma.attendanceRecord.findMany({
        where: { studentId: student.id },
      });

      const totalClasses = records.length;
      const presentClasses = records.filter((r) => r.status === 'PRESENT').length;
      const overallPercentage = totalClasses > 0 ? Number(((presentClasses / totalClasses) * 100).toFixed(1)) : 100;

      if (overallPercentage < student.department.attendanceThreshold) {
        shortageReport.push({
          studentId: student.id,
          rollNumber: student.rollNumber,
          name: student.user.name,
          department: student.department.name,
          departmentThreshold: student.department.attendanceThreshold,
          totalClasses,
          presentClasses,
          overallPercentage,
          eligibleForCondonation: overallPercentage >= student.department.condonationMin,
          condonationFee: student.department.condonationFee,
        });
      }
    }

    res.json({
      success: true,
      totalShortages: shortageReport.length,
      report: shortageReport,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error generating shortage report.' });
  }
};

export const broadcastAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, targetRole, departmentId, isPinned } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required.' });
      return;
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        targetRole: targetRole || 'ALL',
        departmentId: departmentId || null,
        authorId: req.user?.id || '',
        isPinned: isPinned || false,
      },
      include: { author: { select: { name: true, role: true } } },
    });

    res.json({
      success: true,
      message: 'Announcement broadcasted successfully.',
      announcement,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error creating announcement.' });
  }
};

export const getFeeReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const feeRecords = await prisma.studentFee.findMany({
      include: {
        student: {
          include: {
            user: true,
            department: true,
          },
        },
        semester: true,
        payments: true,
      },
      orderBy: { dueDate: 'desc' },
    });

    const totalCollected = feeRecords.reduce((sum, f) => sum + f.paidFee, 0);
    const totalPending = feeRecords.reduce((sum, f) => sum + f.pendingFee, 0);
    const totalExpected = feeRecords.reduce((sum, f) => sum + f.totalFee, 0);

    res.json({
      success: true,
      summary: {
        totalCollected,
        totalPending,
        totalExpected,
        paidCount: feeRecords.filter((f) => f.status === 'PAID').length,
        pendingCount: feeRecords.filter((f) => f.status === 'PENDING').length,
        partialCount: feeRecords.filter((f) => f.status === 'PARTIAL').length,
      },
      records: feeRecords,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching fee reports.' });
  }
};

