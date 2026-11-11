import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing records...');
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.timetable.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.grievance.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.studentFee.deleteMany();
  await prisma.feeStructure.deleteMany();
  await prisma.semesterResult.deleteMany();
  await prisma.gradingPolicy.deleteMany();
  await prisma.examinationMark.deleteMany();
  await prisma.examination.deleteMany();
  await prisma.attendanceCondonation.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.courseRegistration.deleteMany();
  await prisma.course.deleteMany();
  await prisma.parentStudentLink.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.student.deleteMany();
  await prisma.academicSemester.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding 4 academic departments...');
  const deptCSE = await prisma.department.create({
    data: {
      code: 'CSE',
      name: 'Computer Science and Engineering',
      description: 'Department of Computer Science & Engineering, Nagarjuna University',
      attendanceThreshold: 75.0,
      condonationMin: 65.0,
      condonationFee: 500.0,
    },
  });

  const deptIS = await prisma.department.create({
    data: {
      code: 'IS',
      name: 'Information Science and Engineering',
      description: 'Department of Information Science & Engineering, Nagarjuna University',
      attendanceThreshold: 75.0,
      condonationMin: 65.0,
      condonationFee: 500.0,
    },
  });

  const deptECE = await prisma.department.create({
    data: {
      code: 'ECE',
      name: 'Electronics and Communication Engineering',
      description: 'Department of Electronics & Communication Engineering',
      attendanceThreshold: 85.0,
      condonationMin: 75.0,
      condonationFee: 750.0,
    },
  });

  const deptMECH = await prisma.department.create({
    data: {
      code: 'MECH',
      name: 'Mechanical Engineering',
      description: 'Department of Mechanical Engineering',
      attendanceThreshold: 75.0,
      condonationMin: 65.0,
      condonationFee: 500.0,
    },
  });

  const departments = [deptCSE, deptIS, deptECE, deptMECH];

  console.log('Seeding grading policies...');
  for (const dept of departments) {
    const grades = [
      { grade: 'O', minScore: 90, maxScore: 100, gradePoints: 10.0, description: 'Outstanding' },
      { grade: 'A+', minScore: 80, maxScore: 89, gradePoints: 9.0, description: 'Excellent' },
      { grade: 'A', minScore: 70, maxScore: 79, gradePoints: 8.0, description: 'Very Good' },
      { grade: 'B+', minScore: 60, maxScore: 69, gradePoints: 7.0, description: 'Good' },
      { grade: 'B', minScore: 55, maxScore: 59, gradePoints: 6.0, description: 'Above Average' },
      { grade: 'C', minScore: 50, maxScore: 54, gradePoints: 5.0, description: 'Average' },
      { grade: 'P', minScore: 40, maxScore: 49, gradePoints: 4.0, description: 'Pass' },
      { grade: 'F', minScore: 0, maxScore: 39, gradePoints: 0.0, description: 'Fail' },
    ];
    for (const g of grades) {
      await prisma.gradingPolicy.create({
        data: {
          departmentId: dept.id,
          ...g,
        },
      });
    }
  }

  console.log('Seeding academic semesters...');
  const semSpring2026 = await prisma.academicSemester.create({
    data: {
      code: 'SPRING-2026',
      name: 'Spring Semester 2026',
      year: 2026,
      isCurrent: true,
      registrationOpen: true,
      registrationDeadline: new Date('2026-03-31'),
      minCredits: 16,
      maxCredits: 28,
      startDate: new Date('2026-01-05'),
      endDate: new Date('2026-05-20'),
    },
  });

  const semFall2025 = await prisma.academicSemester.create({
    data: {
      code: 'FALL-2025',
      name: 'Fall Semester 2025',
      year: 2025,
      isCurrent: false,
      registrationOpen: false,
      registrationDeadline: new Date('2025-08-30'),
      minCredits: 16,
      maxCredits: 28,
      startDate: new Date('2025-08-01'),
      endDate: new Date('2025-12-15'),
    },
  });

  for (const dept of departments) {
    await prisma.feeStructure.create({
      data: {
        departmentId: dept.id,
        semesterId: semSpring2026.id,
        tuitionFee: 45000.0,
        developmentFee: 5000.0,
        examinationFee: 2500.0,
        labFee: 4000.0,
        libraryFee: 1500.0,
        totalAmount: 58000.0,
      },
    });
  }

  console.log('Seeding Administrator...');
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@uniconnect.edu',
      password: adminPassword,
      name: 'Dr. K. V. Ramanathan',
      role: 'ADMIN',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  console.log('Seeding Exactly 8 Teachers / Faculty Members...');
  const teachersData = [
    {
      name: 'Dr. Ramesh Sharma',
      email: 'faculty.sharma@uniconnect.edu',
      dept: deptCSE,
      employeeId: 'NUFAC-001',
      designation: 'Professor & Head',
      qualification: 'Ph.D. in Computer Science (IIT Madras)',
      specialization: 'Database Systems & Distributed Storage',
      phone: '+91 98111 11001',
    },
    {
      name: 'Prof. Ananya Sen',
      email: 'faculty.ananya@uniconnect.edu',
      dept: deptCSE,
      employeeId: 'NUFAC-002',
      designation: 'Associate Professor',
      qualification: 'M.Tech, Ph.D. in AI & Robotics',
      specialization: 'Algorithms & Computational Complexity',
      phone: '+91 98111 11002',
    },
    {
      name: 'Dr. Karthik Raman',
      email: 'faculty.karthik@uniconnect.edu',
      dept: deptCSE,
      employeeId: 'NUFAC-003',
      designation: 'Associate Professor',
      qualification: 'Ph.D. in Systems Programming (IISc)',
      specialization: 'Operating Systems & Virtualization',
      phone: '+91 98111 11003',
    },
    {
      name: 'Dr. Sneha Kulkarni',
      email: 'faculty.sneha@uniconnect.edu',
      dept: deptCSE,
      employeeId: 'NUFAC-004',
      designation: 'Assistant Professor',
      qualification: 'Ph.D. in Cloud Computing',
      specialization: 'Full Stack & Cloud Native Applications',
      phone: '+91 98111 11004',
    },
    {
      name: 'Dr. Vikram Patel',
      email: 'faculty.vikram@uniconnect.edu',
      dept: deptECE,
      employeeId: 'NUFAC-005',
      designation: 'Professor',
      qualification: 'Ph.D. in Signal Processing',
      specialization: 'Digital Signal Processing & Image Analysis',
      phone: '+91 98111 11005',
    },
    {
      name: 'Dr. Meera Iyer',
      email: 'faculty.meera@uniconnect.edu',
      dept: deptECE,
      employeeId: 'NUFAC-006',
      designation: 'Assistant Professor',
      qualification: 'Ph.D. in Microelectronics',
      specialization: 'VLSI Circuit Design & CMOS',
      phone: '+91 98111 11006',
    },
    {
      name: 'Prof. Rajeshwar Rao',
      email: 'faculty.rao@uniconnect.edu',
      dept: deptMECH,
      employeeId: 'NUFAC-007',
      designation: 'Professor & Dean',
      qualification: 'Ph.D. in Thermal Sciences',
      specialization: 'Thermodynamics & Heat Transfer',
      phone: '+91 98111 11007',
    },
    {
      name: 'Dr. Pooja Deshmukh',
      email: 'faculty.pooja@uniconnect.edu',
      dept: deptECE,
      employeeId: 'NUFAC-008',
      designation: 'Associate Professor',
      qualification: 'Ph.D. in Embedded Systems & IoT',
      specialization: 'Internet of Things (IoT) & Smart Sensors',
      phone: '+91 98111 11008',
    },
  ];

  const facultyPassword = await bcrypt.hash('Faculty@123', 10);
  const facultyRecords: any[] = [];

  for (const t of teachersData) {
    const user = await prisma.user.create({
      data: {
        email: t.email,
        password: facultyPassword,
        name: t.name,
        role: 'FACULTY',
        phone: t.phone,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.employeeId}`,
      },
    });

    const fac = await prisma.faculty.create({
      data: {
        userId: user.id,
        employeeId: t.employeeId,
        departmentId: t.dept.id,
        designation: t.designation,
        qualification: t.qualification,
        specialization: t.specialization,
        joiningDate: new Date('2021-06-15'),
        officeRoom: `Tech Block ${t.dept.code}-204`,
      },
    });
    facultyRecords.push({ ...fac, user, dept: t.dept });
  }

  console.log('Seeding Exactly 8 Subjects (mapped 1-to-1 to each Teacher)...');
  const subjectsData = [
    {
      code: 'CS401',
      title: 'Database Management Systems',
      description: 'Relational algebra, SQL, indexing structures, transactions, and ACID properties.',
      departmentId: deptCSE.id,
      facultyId: facultyRecords[0].id, // Dr. Ramesh Sharma
      semesterNumber: 4,
      credits: 4,
      type: 'CORE',
      capacity: 60,
    },
    {
      code: 'CS402',
      title: 'Design & Analysis of Algorithms',
      description: 'Asymptotic notation, divide and conquer, greedy methods, dynamic programming, and NP-completeness.',
      departmentId: deptCSE.id,
      facultyId: facultyRecords[1].id, // Prof. Ananya Sen
      semesterNumber: 4,
      credits: 4,
      type: 'CORE',
      capacity: 60,
    },
    {
      code: 'CS403',
      title: 'Operating Systems & System Programming',
      description: 'Process scheduling, concurrency, semaphores, deadlocks, and virtual memory virtualization.',
      departmentId: deptCSE.id,
      facultyId: facultyRecords[2].id, // Dr. Karthik Raman
      semesterNumber: 4,
      credits: 4,
      type: 'CORE',
      capacity: 60,
    },
    {
      code: 'CS404',
      title: 'Full Stack Web & Cloud Architectures',
      description: 'Modern RESTful web services, React TypeScript single-page apps, containerization, and cloud deployment.',
      departmentId: deptCSE.id,
      facultyId: facultyRecords[3].id, // Dr. Sneha Kulkarni
      semesterNumber: 4,
      credits: 3,
      type: 'ELECTIVE',
      capacity: 45,
    },
    {
      code: 'EC401',
      title: 'Digital Signal Processing & Filters',
      description: 'Discrete-time signals, Z-transforms, discrete Fourier transform (DFT), and FIR/IIR filter design.',
      departmentId: deptECE.id,
      facultyId: facultyRecords[4].id, // Dr. Vikram Patel
      semesterNumber: 4,
      credits: 4,
      type: 'CORE',
      capacity: 60,
    },
    {
      code: 'EC402',
      title: 'VLSI Design & Microelectronics',
      description: 'CMOS logic circuits, stick diagrams, propagation delay analysis, and ASIC design methodologies.',
      departmentId: deptECE.id,
      facultyId: facultyRecords[5].id, // Dr. Meera Iyer
      semesterNumber: 4,
      credits: 4,
      type: 'CORE',
      capacity: 60,
    },
    {
      code: 'ME401',
      title: 'Applied Thermodynamics & Heat Transfer',
      description: 'First and second laws, power cycles, conduction, convection, radiation, and heat exchangers.',
      departmentId: deptMECH.id,
      facultyId: facultyRecords[6].id, // Prof. Rajeshwar Rao
      semesterNumber: 4,
      credits: 4,
      type: 'CORE',
      capacity: 60,
    },
    {
      code: 'ID401',
      title: 'Internet of Things (IoT) & Smart Sensors',
      description: 'Interdisciplinary course bridging Computer Science, Embedded Electronics, and Sensor Networks.',
      departmentId: deptECE.id,
      facultyId: facultyRecords[7].id, // Dr. Pooja Deshmukh
      semesterNumber: 4,
      credits: 3,
      type: 'INTERDISCIPLINARY',
      capacity: 40,
    },
  ];

  const courseRecords: any[] = [];
  for (const s of subjectsData) {
    const course = await prisma.course.create({ data: s });
    courseRecords.push(course);
  }

  console.log('Seeding Exactly 30 Students with USN 1NC24IS001 to 1NC24IS030...');
  const studentNamesList = [
    { first: 'Aarav', last: 'Sharma', gender: 'Male', blood: 'O+' },
    { first: 'Priya', last: 'Nair', gender: 'Female', blood: 'A+' },
    { first: 'Rohan', last: 'Deshmukh', gender: 'Male', blood: 'B+' },
    { first: 'Sneha', last: 'Reddy', gender: 'Female', blood: 'AB+' },
    { first: 'Kavya', last: 'Krishnan', gender: 'Female', blood: 'O-' },
    { first: 'Vikram', last: 'Singhania', gender: 'Male', blood: 'A-' },
    { first: 'Ananya', last: 'Verma', gender: 'Female', blood: 'B+' },
    { first: 'Aditya', last: 'Chopra', gender: 'Male', blood: 'O+' },
    { first: 'Ishita', last: 'Banerjee', gender: 'Female', blood: 'A+' },
    { first: 'Varun', last: 'Mehta', gender: 'Male', blood: 'B-' },
    { first: 'Tanvi', last: 'Joshi', gender: 'Female', blood: 'O+' },
    { first: 'Rahul', last: 'Bhardwaj', gender: 'Male', blood: 'A+' },
    { first: 'Pooja', last: 'Hegde', gender: 'Female', blood: 'AB-' },
    { first: 'Siddharth', last: 'Menon', gender: 'Male', blood: 'B+' },
    { first: 'Neha', last: 'Gupta', gender: 'Female', blood: 'O+' },
    { first: 'Gaurav', last: 'Mishra', gender: 'Male', blood: 'A+' },
    { first: 'Divya', last: 'Pillai', gender: 'Female', blood: 'O+' },
    { first: 'Karthik', last: 'Sundaram', gender: 'Male', blood: 'B+' },
    { first: 'Anjali', last: 'Tripathi', gender: 'Female', blood: 'A+' },
    { first: 'Manish', last: 'Rao', gender: 'Male', blood: 'O+' },
    { first: 'Riya', last: 'Kapoor', gender: 'Female', blood: 'B+' },
    { first: 'Arjun', last: 'Nambiar', gender: 'Male', blood: 'A-' },
    { first: 'Shreya', last: 'Ghosh', gender: 'Female', blood: 'O+' },
    { first: 'Nikhil', last: 'Saxena', gender: 'Male', blood: 'B+' },
    { first: 'Megha', last: 'Bhat', gender: 'Female', blood: 'A+' },
    { first: 'Pranav', last: 'Kulkarni', gender: 'Male', blood: 'AB+' },
    { first: 'Tarun', last: 'Varma', gender: 'Male', blood: 'O-' },
    { first: 'Swati', last: 'Pandey', gender: 'Female', blood: 'A+' },
    { first: 'Harsh', last: 'Vardhan', gender: 'Male', blood: 'B+' },
    { first: 'Kriti', last: 'Sanon', gender: 'Female', blood: 'O+' },
  ];

  const studentPassword = await bcrypt.hash('Student@123', 10);
  const studentRecords: any[] = [];

  for (let i = 0; i < studentNamesList.length; i++) {
    const s = studentNamesList[i];
    const seq = String(i + 1).padStart(3, '0');
    const rollNumber = `1NC24IS${seq}`;
    const email = `1nc24is${seq.toLowerCase()}@uniconnect.edu`;

    const user = await prisma.user.create({
      data: {
        email,
        password: studentPassword,
        name: `${s.first} ${s.last}`,
        role: 'STUDENT',
        phone: `+91 99${String(i).padStart(2, '0')}1 22334`,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${rollNumber}`,
      },
    });

    const cgpa =
      i === 0 ? 9.25 : i === 1 ? 8.92 : i === 2 ? 6.55 : Number((7.0 + (i % 7) * 0.35).toFixed(2));

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        rollNumber,
        admissionYear: 2024,
        departmentId: deptIS.id,
        currentSemester: 4,
        cgpa,
        earnedCredits: 64,
        dateOfBirth: '2004-05-18',
        gender: s.gender,
        bloodGroup: s.blood,
        address: `${201 + i}, Student Residency Hall, Nagarjuna University Campus, Guntur, AP`,
        emergencyContact: '+91 98765 00000',
      },
    });

    studentRecords.push({ ...student, user, dept: deptIS });
  }

  console.log('Seeding Linked Parent accounts...');
  const parentPassword = await bcrypt.hash('Parent@123', 10);

  const parentUser1 = await prisma.user.create({
    data: {
      email: 'parent.rajesh@uniconnect.edu',
      password: parentPassword,
      name: 'Rajesh Sharma',
      role: 'PARENT',
      phone: '+91 97654 32109',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  });

  const parent1 = await prisma.parent.create({
    data: {
      userId: parentUser1.id,
      occupation: 'Senior Director, Tech Mahindra',
      relationship: 'Father',
      address: 'Flat 402, Green Glen Layout, Bangalore',
    },
  });

  await prisma.parentStudentLink.create({
    data: {
      parentId: parent1.id,
      studentId: studentRecords[0].id, // Aarav
      relationship: 'Father',
      isVerified: true,
    },
  });

  const parentUser2 = await prisma.user.create({
    data: {
      email: 'parent.sunita@uniconnect.edu',
      password: parentPassword,
      name: 'Sunita Nair',
      role: 'PARENT',
      phone: '+91 97123 45678',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    },
  });

  const parent2 = await prisma.parent.create({
    data: {
      userId: parentUser2.id,
      occupation: 'Chief Medical Officer',
      relationship: 'Mother',
      address: '22 Palm Grove Avenue, Ernakulam',
    },
  });

  await prisma.parentStudentLink.create({
    data: {
      parentId: parent2.id,
      studentId: studentRecords[1].id, // Priya
      relationship: 'Mother',
      isVerified: true,
    },
  });

  console.log('Enrolling all 30 students across the 8 subjects...');
  // All IS students take core CS/IS subjects + Open Elective (IoT)
  // Additional electives (EC401, EC402, ME401) distributed across students so every faculty has enrolled students
  for (let i = 0; i < studentRecords.length; i++) {
    const s = studentRecords[i];
    const registeredCodes = ['CS401', 'CS402', 'CS403', 'CS404', 'ID401'];
    if (i % 3 === 0) registeredCodes.push('EC401');
    if (i % 3 === 1) registeredCodes.push('EC402');
    if (i % 3 === 2) registeredCodes.push('ME401');

    const enrolledCourses = courseRecords.filter((c) => registeredCodes.includes(c.code));
    for (const course of enrolledCourses) {
      await prisma.courseRegistration.create({
        data: {
          studentId: s.id,
          courseId: course.id,
          semesterId: semSpring2026.id,
          status: 'REGISTERED',
          internalMarks: 23.0 + Math.floor(Math.random() * 7),
        },
      });
    }
  }

  console.log('Seeding attendance records for all 30 students across the subjects...');
  const sessionDates: Date[] = [];
  for (let d = 25; d >= 1; d--) {
    const dt = new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    if (dt.getDay() !== 0 && dt.getDay() !== 6) {
      sessionDates.push(dt);
    }
  }

  const dbmsCourse = courseRecords.find((c) => c.code === 'CS401')!;
  const algoCourse = courseRecords.find((c) => c.code === 'CS402')!;
  const cseStudents = studentRecords.filter((s) => s.dept.code === 'CSE');

  for (const date of sessionDates) {
    for (let i = 0; i < cseStudents.length; i++) {
      const student = cseStudents[i];
      // Student 2 (Rohan): low attendance (<75%)
      let statusDBMS = 'PRESENT';
      let statusAlgo = 'PRESENT';

      if (i === 2) {
        if (Math.random() > 0.62) statusDBMS = 'ABSENT';
        if (Math.random() > 0.65) statusAlgo = 'ABSENT';
      } else {
        if (Math.random() > 0.90) statusDBMS = 'ABSENT';
        if (Math.random() > 0.88) statusAlgo = 'ABSENT';
      }

      await prisma.attendanceRecord.create({
        data: {
          courseId: dbmsCourse.id,
          facultyId: facultyRecords[0].id,
          studentId: student.id,
          date,
          status: statusDBMS,
          sessionType: 'LECTURE',
        },
      });

      await prisma.attendanceRecord.create({
        data: {
          courseId: algoCourse.id,
          facultyId: facultyRecords[1].id,
          studentId: student.id,
          date,
          status: statusAlgo,
          sessionType: 'LECTURE',
        },
      });
    }
  }

  console.log('Seeding Examinations across the 8 subjects...');
  for (let i = 0; i < courseRecords.length; i++) {
    const c = courseRecords[i];
    const examDate = new Date(Date.now() + (i + 2) * 24 * 60 * 60 * 1000);
    await prisma.examination.create({
      data: {
        name: `Mid-Semester Assessment: ${c.title}`,
        type: 'MID_SEM',
        courseId: c.id,
        semesterId: semSpring2026.id,
        examDate,
        startTime: '10:00 AM',
        endTime: '12:00 PM',
        maxMarks: 50.0,
        weightage: 30.0,
        roomNumber: `Hall ${301 + (i % 5)}`,
      },
    });
  }

  console.log('Seeding Semester Fees for all 30 students...');
  for (let i = 0; i < studentRecords.length; i++) {
    const s = studentRecords[i];
    const totalFee = 58000.0;
    let paidFee = 0.0;
    let status = 'PENDING';

    if (i % 3 === 0) {
      paidFee = 58000.0;
      status = 'PAID';
    } else if (i % 3 === 1) {
      paidFee = 35000.0;
      status = 'PARTIAL';
    }

    const fee = await prisma.studentFee.create({
      data: {
        studentId: s.id,
        semesterId: semSpring2026.id,
        totalFee,
        paidFee,
        pendingFee: totalFee - paidFee,
        dueDate: new Date('2026-03-31'),
        status,
      },
    });

    if (paidFee > 0) {
      await prisma.payment.create({
        data: {
          studentFeeId: fee.id,
          studentId: s.id,
          amount: paidFee,
          transactionId: `TXN-NU-${Date.now()}-${i}`,
          paymentMethod: i % 2 === 0 ? 'UPI' : 'NETBANKING',
          gateway: 'SIMULATED_RAZORPAY',
          status: 'SUCCESS',
          receiptNumber: `RCP-2026-${String(2000 + i)}`,
          paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log('Seeding Grievances...');
  await prisma.grievance.create({
    data: {
      studentId: studentRecords[0].id,
      category: 'ACADEMIC',
      subject: 'Clarification regarding Elective Credit calculation in portal',
      description: 'The elective credit count for ID401 course was initially showing 3 instead of 4.',
      status: 'RESOLVED',
      adminResponse: 'Resolved: The course credit policy has been re-indexed. IoT course provides 3 lecture credits.',
      resolvedBy: 'Dr. K. V. Ramanathan (Admin)',
      resolvedAt: new Date(),
    },
  });

  await prisma.grievance.create({
    data: {
      studentId: studentRecords[2].id, // Rohan
      category: 'EXAMINATION',
      subject: 'Re-evaluation request for Mid-Semester Algorithms test',
      description: 'I would like to apply for review of Question 3 in the dynamic programming section.',
      status: 'IN_PROGRESS',
      adminResponse: 'Forwarded to Prof. Ananya Sen for verification of answer script.',
    },
  });

  console.log('Seeding Announcements...');
  await prisma.announcement.create({
    data: {
      title: 'Spring 2026 Course Elective Change Window Open',
      content: 'Students of 4th Semester can modify their chosen elective or interdisciplinary subjects until March 31, 2026 through the portal.',
      targetRole: 'ALL',
      authorId: adminUser.id,
      isPinned: true,
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'Mandatory Attendance Policy Reminder',
      content: 'Students with attendance below your department threshold (75% for CSE/MECH, 85% for ECE) must file for condonation immediately.',
      targetRole: 'STUDENT',
      authorId: adminUser.id,
      isPinned: true,
    },
  });

  console.log('Seeding Notifications...');
  await prisma.notification.create({
    data: {
      userId: studentRecords[0].userId,
      title: 'Fee Payment Received',
      message: 'Your Spring Semester 2026 tuition fee receipt (RCP-2026-2000) has been generated.',
      category: 'FEE',
      link: '/student/fees',
    },
  });

  await prisma.notification.create({
    data: {
      userId: studentRecords[2].userId, // Rohan
      title: 'Attendance Shortage Alert!',
      message: 'Your attendance in Algorithms (CS402) has fallen to 68%. This is below the mandatory 75% threshold.',
      category: 'ATTENDANCE',
      link: '/student/attendance',
    },
  });

  console.log('\n=============================================');
  console.log('✅ DATABASE RE-SEEDED WITH:');
  console.log('  • 30 Students');
  console.log('  • 8 Teachers');
  console.log('  • 8 Subjects');
  console.log('  • 1 Administrator, 2 Parents');
  console.log('=============================================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
