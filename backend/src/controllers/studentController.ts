import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getStudentDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user?.id },
      include: {
        user: true,
        department: true,
      },
    });

    if (!student) {
      res.status(404).json({ error: 'Student record not found.' });
      return;
    }

    const currentSemester = await prisma.academicSemester.findFirst({
      where: { isCurrent: true },
    });

    // 1. Registered Courses
    const registrations = await prisma.courseRegistration.findMany({
      where: {
        studentId: student.id,
        status: { in: ['REGISTERED', 'APPROVED'] },
        ...(currentSemester ? { semesterId: currentSemester.id } : {}),
      },
      include: {
        course: {
          include: {
            faculty: { include: { user: true } },
          },
        },
      },
    });

    // 2. Attendance Statistics
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { studentId: student.id },
      include: { course: true },
    });

    const totalClasses = attendanceRecords.length;
    const presentClasses = attendanceRecords.filter((r) => r.status === 'PRESENT').length;
    const overallAttendance = totalClasses > 0 ? Number(((presentClasses / totalClasses) * 100).toFixed(1)) : 100;

    // Course-wise attendance
    const courseAttendanceMap: Record<string, { total: number; present: number; course: any }> = {};
    for (const r of attendanceRecords) {
      if (!courseAttendanceMap[r.courseId]) {
        courseAttendanceMap[r.courseId] = { total: 0, present: 0, course: r.course };
      }
      courseAttendanceMap[r.courseId].total += 1;
      if (r.status === 'PRESENT') {
        courseAttendanceMap[r.courseId].present += 1;
      }
    }

    const courseAttendance = Object.keys(courseAttendanceMap).map((cId) => {
      const item = courseAttendanceMap[cId];
      const percentage = item.total > 0 ? Number(((item.present / item.total) * 100).toFixed(1)) : 100;
      const isShortage = percentage < (student.department.attendanceThreshold || 85.0);
      return {
        courseId: cId,
        courseCode: item.course.code,
        courseTitle: item.course.title,
        credits: item.course.credits,
        totalClasses: item.total,
        presentClasses: item.present,
        total: item.total,
        present: item.present,
        absentClasses: item.total - item.present,
        percentage,
        isShortage,
      };
    });

    const shortageCourses = courseAttendance.filter((c) => c.isShortage);

    // 3. Upcoming Examinations
    const examinations = await prisma.examination.findMany({
      where: {
        ...(currentSemester ? { semesterId: currentSemester.id } : {}),
        examDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // within current term
      },
      include: {
        course: true,
        marks: {
          where: { studentId: student.id },
        },
      },
      orderBy: { examDate: 'asc' },
      take: 6,
    });

    // 4. Fee Status
    const feeRecord = await prisma.studentFee.findFirst({
      where: {
        studentId: student.id,
        ...(currentSemester ? { semesterId: currentSemester.id } : {}),
      },
      include: { payments: true },
    });

    // 5. Recent Announcements
    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { targetRole: 'ALL' },
          { targetRole: 'STUDENT' },
          { departmentId: student.departmentId },
        ],
      },
      include: { author: { select: { name: true, role: true } } },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: 5,
    });

    // 6. Recent Notifications
    const notifications = await prisma.notification.findMany({
      where: { userId: student.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // 7. Active Grievances
    const grievanceCount = await prisma.grievance.count({
      where: { studentId: student.id },
    });

    res.json({
      success: true,
      dashboard: {
        student: {
          id: student.id,
          name: student.user.name,
          email: student.user.email,
          avatar: student.user.avatar,
          rollNumber: student.rollNumber,
          department: student.department.name,
          departmentCode: student.department.code,
          currentSemester: student.currentSemester,
          cgpa: student.cgpa,
          earnedCredits: student.earnedCredits,
          attendanceThreshold: student.department.attendanceThreshold,
        },
        currentSemester,
        summary: {
          overallAttendance,
          totalRegisteredCourses: registrations.length,
          totalCreditsRegistered: registrations.reduce((sum, r) => sum + r.course.credits, 0),
          hasAttendanceShortage: shortageCourses.length > 0,
          shortageCoursesCount: shortageCourses.length,
          feeStatus: feeRecord?.status || 'NO_RECORD',
          pendingFee: feeRecord?.pendingFee || 0,
          totalFee: feeRecord?.totalFee || 0,
          activeGrievances: grievanceCount,
        },
        registeredCourses: registrations.map((r) => {
          const att = courseAttendanceMap[r.course.id];
          const attPercentage =
            att && att.total > 0 ? Number(((att.present / att.total) * 100).toFixed(1)) : 100;
          return {
            registrationId: r.id,
            courseId: r.course.id,
            code: r.course.code,
            title: r.course.title,
            description: r.course.description,
            credits: r.course.credits,
            type: r.course.type,
            semesterNumber: r.course.semesterNumber,
            facultyName: r.course.faculty?.user.name || 'Assigned Faculty',
            facultyDesignation: r.course.faculty?.designation || 'Faculty Instructor',
            facultyEmail: r.course.faculty?.user.email || '',
            officeRoom: r.course.faculty?.officeRoom || 'Room 302',
            internalMarks: r.internalMarks,
            attendance: {
              total: att?.total || 0,
              present: att?.present || 0,
              absent: (att?.total || 0) - (att?.present || 0),
              percentage: attPercentage,
              isShortage: attPercentage < (student.department.attendanceThreshold || 85.0),
            },
          };
        }),
        attendanceOverview: {
          overallPercentage: overallAttendance,
          totalClasses,
          presentClasses,
          absentClasses: totalClasses - presentClasses,
          byCourse: courseAttendance,
          shortages: shortageCourses,
        },
        examinations: examinations.map((e) => ({
          id: e.id,
          name: e.name,
          type: e.type,
          courseTitle: e.course.title,
          courseCode: e.course.code,
          date: e.examDate,
          time: `${e.startTime} - ${e.endTime}`,
          room: e.roomNumber,
          maxMarks: e.maxMarks,
          marksObtained: e.marks[0]?.marksObtained ?? null,
        })),
        feeSummary: feeRecord,
        announcements,
        notifications,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching student dashboard.' });
  }
};

export const getStudentProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user?.id },
      include: {
        user: true,
        department: true,
        parentLinks: {
          include: {
            parent: {
              include: { user: true },
            },
          },
        },
        semesterResults: {
          include: { semester: true },
          orderBy: { publishedAt: 'desc' },
        },
      },
    });

    if (!student) {
      res.status(404).json({ error: 'Student record not found.' });
      return;
    }

    res.json({ success: true, profile: student });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching student profile.' });
  }
};

export const getStudentAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user?.id },
      include: { department: true },
    });

    if (!student) {
      res.status(404).json({ error: 'Student record not found.' });
      return;
    }

    const records = await prisma.attendanceRecord.findMany({
      where: { studentId: student.id },
      include: {
        course: true,
        faculty: { include: { user: true } },
      },
      orderBy: { date: 'desc' },
    });

    const condonations = await prisma.attendanceCondonation.findMany({
      where: { studentId: student.id },
      include: { course: true },
      orderBy: { createdAt: 'desc' },
    });

    // Breakdown per course
    const courseStats: Record<string, any> = {};
    for (const r of records) {
      if (!courseStats[r.courseId]) {
        courseStats[r.courseId] = {
          courseId: r.course.id,
          courseCode: r.course.code,
          courseTitle: r.course.title,
          courseDescription: r.course.description,
          courseType: r.course.type,
          credits: r.course.credits,
          facultyName: r.faculty.user.name,
          facultyDesignation: r.faculty.designation || 'Faculty Instructor',
          facultyEmail: r.faculty.user.email,
          officeRoom: r.faculty.officeRoom || 'Room 302',
          total: 0,
          present: 0,
          absent: 0,
          records: [],
        };
      }
      courseStats[r.courseId].total += 1;
      if (r.status === 'PRESENT') courseStats[r.courseId].present += 1;
      else courseStats[r.courseId].absent += 1;
      courseStats[r.courseId].records.push({
        id: r.id,
        date: r.date,
        status: r.status,
        sessionType: r.sessionType,
        remarks: r.remarks,
      });
    }

    const coursesArray = Object.values(courseStats).map((c: any) => {
      const percentage = c.total > 0 ? Number(((c.present / c.total) * 100).toFixed(1)) : 100;
      return {
        ...c,
        percentage,
        isShortage: percentage < student.department.attendanceThreshold,
        requiredPercentage: student.department.attendanceThreshold,
        condonationAllowed: percentage >= student.department.condonationMin,
      };
    });

    const totalClasses = records.length;
    const totalPresent = records.filter((r) => r.status === 'PRESENT').length;
    const overallPercentage = totalClasses > 0 ? Number(((totalPresent / totalClasses) * 100).toFixed(1)) : 100;

    res.json({
      success: true,
      attendance: {
        overallPercentage,
        totalClasses,
        totalPresent,
        totalAbsent: totalClasses - totalPresent,
        departmentThreshold: student.department.attendanceThreshold,
        condonationMin: student.department.condonationMin,
        courses: coursesArray,
        condonations,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching attendance records.' });
  }
};

export const applyCondonation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user?.id },
      include: { department: true },
    });

    if (!student) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const { courseId, currentPercentage, reason, medicalCert } = req.body;

    if (!courseId || !reason) {
      res.status(400).json({ error: 'Course ID and valid reason are required.' });
      return;
    }

    const currentSemester = await prisma.academicSemester.findFirst({
      where: { isCurrent: true },
    });

    const condonation = await prisma.attendanceCondonation.create({
      data: {
        studentId: student.id,
        courseId,
        semesterId: currentSemester?.id || '',
        currentPercentage: Number(currentPercentage) || 0,
        reason,
        medicalCert: medicalCert || null,
        status: 'PENDING',
      },
    });

    // Also notify admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const a of admins) {
      await prisma.notification.create({
        data: {
          userId: a.id,
          title: 'New Attendance Condonation Request',
          message: `${req.user?.name} (${student.rollNumber}) requested attendance condonation: ${reason.substring(0, 50)}...`,
          category: 'ATTENDANCE',
          link: '/admin/attendance',
        },
      });
    }

    res.json({
      success: true,
      message: 'Condonation application submitted for administrator review.',
      condonation,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error applying for condonation.' });
  }
};

export const getStudentCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user?.id },
      include: { department: true },
    });

    if (!student) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const currentSemester = await prisma.academicSemester.findFirst({
      where: { isCurrent: true },
    });

    // Registered Courses
    const registered = await prisma.courseRegistration.findMany({
      where: {
        studentId: student.id,
        status: { in: ['REGISTERED', 'APPROVED'] },
        ...(currentSemester ? { semesterId: currentSemester.id } : {}),
      },
      include: {
        course: {
          include: {
            department: true,
            faculty: { include: { user: true } },
            _count: { select: { registrations: true } },
          },
        },
      },
    });

    const registeredIds = registered.map((r) => r.courseId);

    // Available Courses (Core, Elective, Interdisciplinary)
    const available = await prisma.course.findMany({
      where: {
        OR: [
          { departmentId: student.departmentId },
          { type: 'INTERDISCIPLINARY' },
        ],
        id: { notIn: registeredIds },
      },
      include: {
        department: true,
        faculty: { include: { user: true } },
        _count: { select: { registrations: true } },
      },
    });

    const totalCreditsRegistered = registered.reduce((sum, r) => sum + r.course.credits, 0);

    res.json({
      success: true,
      currentSemester,
      totalCreditsRegistered,
      minCredits: currentSemester?.minCredits || 16,
      maxCredits: currentSemester?.maxCredits || 28,
      isRegistrationOpen: currentSemester?.registrationOpen ?? true,
      registrationDeadline: currentSemester?.registrationDeadline,
      registeredCourses: registered.map((r) => ({
        registrationId: r.id,
        registeredAt: r.registeredAt,
        status: r.status,
        ...r.course,
        enrolledCount: r.course._count.registrations,
      })),
      availableCourses: available.map((c) => ({
        ...c,
        enrolledCount: c._count.registrations,
        isFull: c._count.registrations >= c.capacity,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching course information.' });
  }
};

export const registerCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user?.id },
    });

    if (!student) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const { courseId } = req.body;
    if (!courseId) {
      res.status(400).json({ error: 'Course ID is required.' });
      return;
    }

    const currentSemester = await prisma.academicSemester.findFirst({
      where: { isCurrent: true },
    });

    if (!currentSemester) {
      res.status(400).json({ error: 'No active academic semester found.' });
      return;
    }

    if (!currentSemester.registrationOpen) {
      res.status(400).json({ error: 'Course registration is currently closed.' });
      return;
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: { select: { registrations: true } },
      },
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    // Capacity Check
    if (course._count.registrations >= course.capacity) {
      res.status(400).json({ error: 'Course capacity has been reached. Please choose another subject.' });
      return;
    }

    // Check duplicate
    const existing = await prisma.courseRegistration.findUnique({
      where: {
        studentId_courseId_semesterId: {
          studentId: student.id,
          courseId,
          semesterId: currentSemester.id,
        },
      },
    });

    if (existing && existing.status !== 'DROPPED') {
      res.status(400).json({ error: 'You are already registered for this course.' });
      return;
    }

    // Check credit limit
    const currentRegs = await prisma.courseRegistration.findMany({
      where: {
        studentId: student.id,
        semesterId: currentSemester.id,
        status: { in: ['REGISTERED', 'APPROVED'] },
      },
      include: { course: true },
    });

    const currentCredits = currentRegs.reduce((sum, r) => sum + r.course.credits, 0);
    if (currentCredits + course.credits > currentSemester.maxCredits) {
      res.status(400).json({
        error: `Credit limit exceeded. Maximum allowable credits: ${currentSemester.maxCredits}. Current: ${currentCredits}, Attempting: +${course.credits}.`,
      });
      return;
    }

    let reg;
    if (existing) {
      reg = await prisma.courseRegistration.update({
        where: { id: existing.id },
        data: { status: 'REGISTERED', registeredAt: new Date() },
        include: { course: true },
      });
    } else {
      reg = await prisma.courseRegistration.create({
        data: {
          studentId: student.id,
          courseId,
          semesterId: currentSemester.id,
          status: 'REGISTERED',
        },
        include: { course: true },
      });
    }

    // Notification
    await prisma.notification.create({
      data: {
        userId: student.userId,
        title: 'Course Registration Confirmed',
        message: `Successfully registered for ${course.code}: ${course.title} (${course.credits} Credits).`,
        category: 'COURSE',
        link: '/student/courses',
      },
    });

    res.json({
      success: true,
      message: `Successfully registered for ${course.title}.`,
      registration: reg,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error registering for course.' });
  }
};

export const dropCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user?.id },
    });

    if (!student) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const { courseId } = req.body;
    const currentSemester = await prisma.academicSemester.findFirst({
      where: { isCurrent: true },
    });

    if (!currentSemester?.registrationOpen) {
      res.status(400).json({ error: 'Registration period has ended. Cannot drop course.' });
      return;
    }

    const reg = await prisma.courseRegistration.findFirst({
      where: {
        studentId: student.id,
        courseId,
        semesterId: currentSemester.id,
      },
      include: { course: true },
    });

    if (!reg) {
      res.status(404).json({ error: 'Course registration not found.' });
      return;
    }

    if (reg.course.type === 'CORE') {
      res.status(400).json({ error: 'Core courses are mandatory and cannot be dropped.' });
      return;
    }

    await prisma.courseRegistration.delete({
      where: { id: reg.id },
    });

    res.json({
      success: true,
      message: `Successfully dropped course: ${reg.course.title}.`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error dropping course.' });
  }
};

export const getStudentExaminations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user?.id },
    });

    if (!student) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const exams = await prisma.examination.findMany({
      include: {
        course: true,
        semester: true,
        marks: {
          where: { studentId: student.id },
        },
      },
      orderBy: { examDate: 'asc' },
    });

    const results = await prisma.semesterResult.findMany({
      where: { studentId: student.id, status: 'PUBLISHED' },
      include: { semester: true },
      orderBy: { publishedAt: 'desc' },
    });

    res.json({
      success: true,
      examinations: exams.map((e) => ({
        id: e.id,
        name: e.name,
        type: e.type,
        courseCode: e.course.code,
        courseTitle: e.course.title,
        semester: e.semester.name,
        date: e.examDate,
        startTime: e.startTime,
        endTime: e.endTime,
        roomNumber: e.roomNumber,
        maxMarks: e.maxMarks,
        marksObtained: e.marks[0]?.marksObtained ?? null,
        isApproved: e.marks[0]?.isApproved ?? false,
        remarks: e.marks[0]?.remarks ?? null,
      })),
      semesterResults: results,
      cgpa: student.cgpa,
      earnedCredits: student.earnedCredits,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching examination records.' });
  }
};

export const getStudentFees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user?.id },
      include: { department: true },
    });

    if (!student) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const fees = await prisma.studentFee.findMany({
      where: { studentId: student.id },
      include: {
        semester: true,
        payments: { orderBy: { paidAt: 'desc' } },
      },
      orderBy: { dueDate: 'desc' },
    });

    const feeStructures = await prisma.feeStructure.findMany({
      where: { departmentId: student.departmentId },
      include: { semester: true },
    });

    res.json({
      success: true,
      fees,
      feeStructures,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching fees.' });
  }
};

export const makeFeePayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user?.id },
    });

    if (!student) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const { studentFeeId, amount, paymentMethod } = req.body;

    if (!studentFeeId || !amount || amount <= 0) {
      res.status(400).json({ error: 'Valid fee record ID and payment amount are required.' });
      return;
    }

    const fee = await prisma.studentFee.findUnique({
      where: { id: studentFeeId },
    });

    if (!fee) {
      res.status(404).json({ error: 'Student fee record not found.' });
      return;
    }

    const payAmount = Number(amount);
    if (payAmount > fee.pendingFee) {
      res.status(400).json({ error: `Amount cannot exceed pending fee of ₹${fee.pendingFee}.` });
      return;
    }

    const newPaid = fee.paidFee + payAmount;
    const newPending = fee.totalFee - newPaid;
    const newStatus = newPending <= 0 ? 'PAID' : 'PARTIAL';

    // Simulated Payment Transaction
    const txnId = `TXN-NU-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const receiptNum = `RCP-2026-${Math.floor(Math.random() * 90000 + 10000)}`;

    const payment = await prisma.payment.create({
      data: {
        studentFeeId: fee.id,
        studentId: student.id,
        amount: payAmount,
        transactionId: txnId,
        paymentMethod: paymentMethod || 'ONLINE_UPI',
        gateway: 'SIMULATED_RAZORPAY',
        status: 'SUCCESS',
        receiptNumber: receiptNum,
        paidAt: new Date(),
      },
    });

    const updatedFee = await prisma.studentFee.update({
      where: { id: fee.id },
      data: {
        paidFee: newPaid,
        pendingFee: newPending,
        status: newStatus,
      },
    });

    // Send in-app notification
    await prisma.notification.create({
      data: {
        userId: student.userId,
        title: 'Fee Payment Successful',
        message: `Your payment of ₹${payAmount.toLocaleString('en-IN')} has been processed. Receipt: ${receiptNum}.`,
        category: 'FEE',
        link: '/student/fees',
      },
    });

    res.json({
      success: true,
      message: 'Payment processed successfully via simulated payment gateway.',
      payment,
      fee: updatedFee,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error processing fee payment.' });
  }
};

export const getStudentGrievances = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user?.id },
    });

    if (!student) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const grievances = await prisma.grievance.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, grievances });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching grievances.' });
  }
};

export const createStudentGrievance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user?.id },
    });

    if (!student) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const { category, subject, description } = req.body;

    if (!category || !subject || !description) {
      res.status(400).json({ error: 'Category, subject, and description are required.' });
      return;
    }

    const grievance = await prisma.grievance.create({
      data: {
        studentId: student.id,
        category,
        subject,
        description,
        status: 'PENDING',
      },
    });

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const a of admins) {
      await prisma.notification.create({
        data: {
          userId: a.id,
          title: `New Grievance Submitted [${category}]`,
          message: `${req.user?.name}: ${subject}`,
          category: 'GRIEVANCE',
          link: '/admin/grievances',
        },
      });
    }

    res.json({
      success: true,
      message: 'Grievance ticket created successfully. Track status on this portal.',
      grievance,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error creating grievance.' });
  }
};

