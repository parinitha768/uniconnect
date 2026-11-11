import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getFacultyDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { userId: req.user?.id },
      include: {
        user: true,
        department: true,
        courses: {
          include: {
            _count: { select: { registrations: true } },
          },
        },
      },
    });

    if (!faculty) {
      res.status(404).json({ error: 'Faculty profile not found.' });
      return;
    }

    const assignedCourseIds = faculty.courses.map((c) => c.id);

    // Total unique students across courses
    const registrations = await prisma.courseRegistration.findMany({
      where: {
        courseId: { in: assignedCourseIds },
        status: { in: ['REGISTERED', 'APPROVED'] },
      },
      select: { studentId: true },
    });
    const uniqueStudentsCount = new Set(registrations.map((r) => r.studentId)).size;

    // Timetable for today
    const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const currentDay = daysOfWeek[new Date().getDay()];

    const todayTimetable = await prisma.timetable.findMany({
      where: {
        facultyId: faculty.id,
        dayOfWeek: currentDay,
      },
      include: { course: true },
      orderBy: { startTime: 'asc' },
    });

    // Recent announcements
    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { targetRole: 'ALL' },
          { targetRole: 'FACULTY' },
          { departmentId: faculty.departmentId },
        ],
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: 4,
    });

    // Recent notifications
    const notifications = await prisma.notification.findMany({
      where: { userId: faculty.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Assignments
    const assignments = await prisma.assignment.findMany({
      where: { facultyId: faculty.id },
      include: {
        course: true,
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    res.json({
      success: true,
      dashboard: {
        faculty: {
          id: faculty.id,
          name: faculty.user.name,
          email: faculty.user.email,
          employeeId: faculty.employeeId,
          designation: faculty.designation,
          department: faculty.department.name,
          departmentCode: faculty.department.code,
          qualification: faculty.qualification,
          specialization: faculty.specialization,
          officeRoom: faculty.officeRoom,
          avatar: faculty.user.avatar,
        },
        stats: {
          assignedCoursesCount: faculty.courses.length,
          totalStudents: uniqueStudentsCount,
          activeAssignmentsCount: assignments.length,
          classesToday: todayTimetable.length,
        },
        assignedCourses: faculty.courses.map((c) => ({
          id: c.id,
          code: c.code,
          title: c.title,
          credits: c.credits,
          type: c.type,
          capacity: c.capacity,
          enrolledCount: c._count.registrations,
        })),
        todayTimetable,
        assignments,
        announcements,
        notifications,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching faculty dashboard.' });
  }
};

export const getAssignedCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { userId: req.user?.id },
    });

    if (!faculty) {
      res.status(404).json({ error: 'Faculty profile not found.' });
      return;
    }

    const courses = await prisma.course.findMany({
      where: { facultyId: faculty.id },
      include: {
        department: true,
        _count: { select: { registrations: true, attendance: true } },
      },
    });

    res.json({ success: true, courses });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching courses.' });
  }
};

export const getEnrolledStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { department: true },
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    const registrations = await prisma.courseRegistration.findMany({
      where: {
        courseId,
        status: { in: ['REGISTERED', 'APPROVED'] },
      },
      include: {
        student: {
          include: {
            user: true,
            department: true,
          },
        },
      },
      orderBy: { student: { rollNumber: 'asc' } },
    });

    // Fetch attendance statistics for each student in this course
    const allCourseAttendance = await prisma.attendanceRecord.findMany({
      where: { courseId },
    });

    const totalSessions = new Set(allCourseAttendance.map((a) => a.date.toISOString().split('T')[0])).size;

    const studentsWithAttendance = registrations.map((r) => {
      const studentRecords = allCourseAttendance.filter((a) => a.studentId === r.studentId);
      const presentCount = studentRecords.filter((a) => a.status === 'PRESENT').length;
      const totalRecorded = studentRecords.length;
      const percentage = totalRecorded > 0 ? Number(((presentCount / totalRecorded) * 100).toFixed(1)) : 100;

      return {
        registrationId: r.id,
        studentId: r.student.id,
        rollNumber: r.student.rollNumber,
        name: r.student.user.name,
        email: r.student.user.email,
        avatar: r.student.user.avatar,
        department: r.student.department.code,
        internalMarks: r.internalMarks,
        attendanceStats: {
          totalClasses: totalRecorded,
          presentClasses: presentCount,
          absentClasses: totalRecorded - presentCount,
          percentage,
          isShortage: percentage < course.department.attendanceThreshold,
        },
      };
    });

    res.json({
      success: true,
      course,
      totalSessions,
      students: studentsWithAttendance,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching students.' });
  }
};

export const markAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { userId: req.user?.id },
    });

    if (!faculty) {
      res.status(404).json({ error: 'Faculty profile not found.' });
      return;
    }

    const { courseId, date, sessionType, records } = req.body;
    // records: Array<{ studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE', remarks?: string }>

    if (!courseId || !date || !records || !Array.isArray(records)) {
      res.status(400).json({ error: 'courseId, date, and valid records array are required.' });
      return;
    }

    const targetDate = new Date(date);

    // Save or update each student's attendance record
    const createdRecords = [];
    for (const item of records) {
      // Check if already exists for this date and course
      const existing = await prisma.attendanceRecord.findFirst({
        where: {
          courseId,
          studentId: item.studentId,
          date: targetDate,
        },
      });

      if (existing) {
        const updated = await prisma.attendanceRecord.update({
          where: { id: existing.id },
          data: {
            status: item.status,
            sessionType: sessionType || 'LECTURE',
            remarks: item.remarks || null,
          },
        });
        createdRecords.push(updated);
      } else {
        const created = await prisma.attendanceRecord.create({
          data: {
            courseId,
            facultyId: faculty.id,
            studentId: item.studentId,
            date: targetDate,
            status: item.status,
            sessionType: sessionType || 'LECTURE',
            remarks: item.remarks || null,
          },
        });
        createdRecords.push(created);
      }

      // Check if student now has shortage and trigger automated alert!
      if (item.status === 'ABSENT') {
        const allStudentRecs = await prisma.attendanceRecord.findMany({
          where: { studentId: item.studentId, courseId },
        });
        const present = allStudentRecs.filter((r) => r.status === 'PRESENT').length;
        const total = allStudentRecs.length;
        const pct = (present / total) * 100;

        if (pct < 75.0) {
          const student = await prisma.student.findUnique({
            where: { id: item.studentId },
            include: { user: true },
          });
          const course = await prisma.course.findUnique({ where: { id: courseId } });

          if (student && course) {
            await prisma.notification.create({
              data: {
                userId: student.userId,
                title: 'Low Attendance Warning',
                message: `Your attendance in ${course.code}: ${course.title} has dropped to ${pct.toFixed(1)}%. Please meet faculty immediately.`,
                category: 'ATTENDANCE',
                link: '/student/attendance',
              },
            });
          }
        }
      }
    }

    res.json({
      success: true,
      message: `Successfully recorded attendance for ${createdRecords.length} students.`,
      recordsCount: createdRecords.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error recording attendance.' });
  }
};

export const enterInternalMarks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, marksData } = req.body;
    // marksData: Array<{ studentId: string, marks: number }>

    if (!courseId || !marksData || !Array.isArray(marksData)) {
      res.status(400).json({ error: 'courseId and marksData array are required.' });
      return;
    }

    for (const item of marksData) {
      await prisma.courseRegistration.updateMany({
        where: {
          courseId,
          studentId: item.studentId,
        },
        data: {
          internalMarks: Number(item.marks),
        },
      });
    }

    res.json({
      success: true,
      message: 'Internal assessment marks saved successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error entering internal marks.' });
  }
};

export const createAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { userId: req.user?.id },
    });

    if (!faculty) {
      res.status(404).json({ error: 'Faculty profile not found.' });
      return;
    }

    const { courseId, title, description, dueDate, maxMarks, fileUrl } = req.body;

    if (!courseId || !title || !dueDate) {
      res.status(400).json({ error: 'courseId, title, and dueDate are required.' });
      return;
    }

    const assignment = await prisma.assignment.create({
      data: {
        courseId,
        facultyId: faculty.id,
        title,
        description: description || '',
        dueDate: new Date(dueDate),
        maxMarks: Number(maxMarks) || 20.0,
        fileUrl: fileUrl || null,
      },
      include: { course: true },
    });

    // Notify all enrolled students
    const regs = await prisma.courseRegistration.findMany({
      where: { courseId, status: { in: ['REGISTERED', 'APPROVED'] } },
      include: { student: true },
    });

    for (const r of regs) {
      await prisma.notification.create({
        data: {
          userId: r.student.userId,
          title: `New Assignment: ${title}`,
          message: `Prof. ${req.user?.name} posted a new assignment for ${assignment.course.code}. Due: ${new Date(dueDate).toLocaleDateString()}.`,
          category: 'COURSE',
          link: '/student/dashboard',
        },
      });
    }

    res.json({
      success: true,
      message: 'Assignment published and students notified.',
      assignment,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error creating assignment.' });
  }
};

