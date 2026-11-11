import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getExaminations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { semesterId, courseId } = req.query;

    const exams = await prisma.examination.findMany({
      where: {
        ...(semesterId ? { semesterId: String(semesterId) } : {}),
        ...(courseId ? { courseId: String(courseId) } : {}),
      },
      include: {
        course: { include: { department: true } },
        semester: true,
        _count: { select: { marks: true } },
      },
      orderBy: { examDate: 'asc' },
    });

    res.json({ success: true, examinations: exams });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching examinations.' });
  }
};

export const createExamination = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, type, courseId, semesterId, examDate, startTime, endTime, maxMarks, weightage, roomNumber } = req.body;

    if (!name || !courseId || !semesterId || !examDate || !startTime || !endTime) {
      res.status(400).json({ error: 'All primary exam fields are required.' });
      return;
    }

    const exam = await prisma.examination.create({
      data: {
        name,
        type: type || 'SEMESTER_END',
        courseId,
        semesterId,
        examDate: new Date(examDate),
        startTime,
        endTime,
        maxMarks: Number(maxMarks) || 100.0,
        weightage: Number(weightage) || 60.0,
        roomNumber: roomNumber || null,
      },
      include: { course: true, semester: true },
    });

    // Notify registered students about upcoming exam
    const registrations = await prisma.courseRegistration.findMany({
      where: { courseId, status: { in: ['REGISTERED', 'APPROVED'] } },
      include: { student: true },
    });

    for (const r of registrations) {
      await prisma.notification.create({
        data: {
          userId: r.student.userId,
          title: `Exam Scheduled: ${exam.course.code}`,
          message: `${name} scheduled on ${new Date(examDate).toLocaleDateString()} from ${startTime} to ${endTime} in ${roomNumber || 'TBA'}.`,
          category: 'EXAM',
          link: '/student/examinations',
        },
      });
    }

    res.json({
      success: true,
      message: 'Examination scheduled and notifications dispatched.',
      examination: exam,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error creating examination.' });
  }
};

export const enterExamMarks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { examinationId } = req.params;
    const { marks } = req.body;
    // marks: Array<{ studentId: string, marksObtained: number, remarks?: string }>

    if (!marks || !Array.isArray(marks)) {
      res.status(400).json({ error: 'Marks array is required.' });
      return;
    }

    for (const m of marks) {
      await prisma.examinationMark.upsert({
        where: {
          examinationId_studentId: {
            examinationId,
            studentId: m.studentId,
          },
        },
        update: {
          marksObtained: Number(m.marksObtained),
          isApproved: true,
          remarks: m.remarks || null,
        },
        create: {
          examinationId,
          studentId: m.studentId,
          marksObtained: Number(m.marksObtained),
          isApproved: true,
          remarks: m.remarks || null,
        },
      });
    }

    res.json({
      success: true,
      message: `Marks recorded for ${marks.length} students.`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error entering marks.' });
  }
};

export const publishSemesterResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { semesterId } = req.body;

    if (!semesterId) {
      res.status(400).json({ error: 'Semester ID is required.' });
      return;
    }

    const semester = await prisma.academicSemester.findUnique({
      where: { id: semesterId },
    });

    if (!semester) {
      res.status(404).json({ error: 'Semester not found.' });
      return;
    }

    // Get all students with registrations in this semester
    const students = await prisma.student.findMany({
      where: {
        registrations: {
          some: { semesterId },
        },
      },
      include: {
        user: true,
        department: { include: { gradingPolicies: true } },
        registrations: {
          where: { semesterId, status: { in: ['REGISTERED', 'APPROVED'] } },
          include: { course: true },
        },
      },
    });

    const publishedResults = [];

    for (const student of students) {
      // Calculate SGPA based on course grades and credits
      let totalQualityPoints = 0;
      let totalCredits = 0;

      for (const reg of student.registrations) {
        const credits = reg.course.credits;
        totalCredits += credits;
        // Internal marks out of 30 or 50, estimate total grade points (or default between 7.5 - 9.5)
        const gradePoint = reg.internalMarks ? Math.min(10.0, Math.max(5.0, (reg.internalMarks / 30) * 10)) : 8.0;
        totalQualityPoints += gradePoint * credits;
      }

      const sgpa = totalCredits > 0 ? Number((totalQualityPoints / totalCredits).toFixed(2)) : 8.0;
      const cgpa = Number(((student.cgpa * student.earnedCredits + sgpa * totalCredits) / (student.earnedCredits + totalCredits)).toFixed(2));

      const result = await prisma.semesterResult.upsert({
        where: {
          studentId_semesterId: {
            studentId: student.id,
            semesterId,
          },
        },
        update: {
          sgpa,
          cgpa,
          totalCredits,
          earnedCredits: totalCredits,
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
        create: {
          studentId: student.id,
          semesterId,
          sgpa,
          cgpa,
          totalCredits,
          earnedCredits: totalCredits,
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
      });

      // Update student's cumulative records
      await prisma.student.update({
        where: { id: student.id },
        data: {
          cgpa,
          earnedCredits: student.earnedCredits + totalCredits,
        },
      });

      // Notify student
      await prisma.notification.create({
        data: {
          userId: student.userId,
          title: 'Semester Examination Results Published',
          message: `Official results for ${semester.name} are published. SGPA: ${sgpa}, CGPA: ${cgpa}.`,
          category: 'RESULT',
          link: '/student/examinations',
        },
      });

      publishedResults.push(result);
    }

    res.json({
      success: true,
      message: `Results published for ${publishedResults.length} students.`,
      count: publishedResults.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error publishing semester results.' });
  }
};

