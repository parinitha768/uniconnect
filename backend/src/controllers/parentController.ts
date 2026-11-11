import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getParentDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parent = await prisma.parent.findUnique({
      where: { userId: req.user?.id },
      include: {
        user: true,
        studentLinks: {
          where: { isVerified: true },
          include: {
            student: {
              include: {
                user: true,
                department: true,
                registrations: {
                  where: { status: { in: ['REGISTERED', 'APPROVED'] } },
                  include: {
                    course: {
                      include: { faculty: { include: { user: true } } },
                    },
                  },
                },
                fees: {
                  include: { semester: true, payments: true },
                  orderBy: { dueDate: 'desc' },
                },
                semesterResults: {
                  where: { status: 'PUBLISHED' },
                  include: { semester: true },
                  orderBy: { publishedAt: 'desc' },
                },
              },
            },
          },
        },
      },
    });

    if (!parent) {
      res.status(404).json({ error: 'Parent record not found.' });
      return;
    }

    if (parent.studentLinks.length === 0) {
      res.json({
        success: true,
        parent: {
          id: parent.id,
          name: parent.user.name,
          email: parent.user.email,
        },
        linkedStudents: [],
        message: 'No verified linked student accounts found.',
      });
      return;
    }

    // For each linked student, calculate attendance and gather full academic summary
    const studentSummaries = [];

    for (const link of parent.studentLinks) {
      const student = link.student;

      // Attendance
      const attendanceRecords = await prisma.attendanceRecord.findMany({
        where: { studentId: student.id },
        include: { course: true },
      });

      const totalClasses = attendanceRecords.length;
      const presentClasses = attendanceRecords.filter((r) => r.status === 'PRESENT').length;
      const overallAttendance = totalClasses > 0 ? Number(((presentClasses / totalClasses) * 100).toFixed(1)) : 100;

      // Course-wise attendance
      const courseMap: Record<string, any> = {};
      for (const r of attendanceRecords) {
        if (!courseMap[r.courseId]) {
          courseMap[r.courseId] = {
            courseCode: r.course.code,
            courseTitle: r.course.title,
            credits: r.course.credits,
            total: 0,
            present: 0,
          };
        }
        courseMap[r.courseId].total += 1;
        if (r.status === 'PRESENT') courseMap[r.courseId].present += 1;
      }

      const coursesAttendance = Object.values(courseMap).map((c: any) => {
        const pct = c.total > 0 ? Number(((c.present / c.total) * 100).toFixed(1)) : 100;
        return {
          ...c,
          percentage: pct,
          isShortage: pct < student.department.attendanceThreshold,
        };
      });

      const shortages = coursesAttendance.filter((c) => c.isShortage);

      // Latest fee
      const currentFee = student.fees[0] || null;

      studentSummaries.push({
        studentId: student.id,
        relationship: link.relationship || parent.relationship,
        profile: {
          name: student.user.name,
          email: student.user.email,
          avatar: student.user.avatar,
          rollNumber: student.rollNumber,
          department: student.department.name,
          currentSemester: student.currentSemester,
          cgpa: student.cgpa,
          earnedCredits: student.earnedCredits,
        },
        attendance: {
          overallPercentage: overallAttendance,
          totalClasses,
          presentClasses,
          absentClasses: totalClasses - presentClasses,
          shortages,
          isWarningActive: shortages.length > 0,
          byCourse: coursesAttendance,
        },
        examinations: student.semesterResults,
        fees: {
          currentFee,
          allFees: student.fees,
        },
        registeredCourses: student.registrations.map((r) => ({
          code: r.course.code,
          title: r.course.title,
          credits: r.course.credits,
          facultyName: r.course.faculty?.user.name || 'TBA',
          internalMarks: r.internalMarks,
        })),
      });
    }

    // Announcements
    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [{ targetRole: 'ALL' }, { targetRole: 'PARENT' }],
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: 4,
    });

    res.json({
      success: true,
      parent: {
        id: parent.id,
        name: parent.user.name,
        email: parent.user.email,
        phone: parent.user.phone,
        avatar: parent.user.avatar,
        occupation: parent.occupation,
        relationship: parent.relationship,
        address: parent.address,
      },
      linkedStudents: studentSummaries,
      announcements,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching parent dashboard.' });
  }
};

