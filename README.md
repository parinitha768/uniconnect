# UniConnect – Intelligent University Management Portal
### Centralized University Management Platform for Nagarjuna University

[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20TypeScript%20%7C%20Node.js%20%7C%20Express%20%7C%20Prisma%20%7C%20TailwindCSS-navy)](https://github.com)
[![Scrum Sprint Lifecycle](https://img.shields.io/badge/Methodology-Agile%20Scrum%20(Sprints%201--9)-blue)](https://github.com)
[![Database](https://img.shields.io/badge/Database-MySQL%20%2F%20SQLite%20(Prisma)-emerald)](https://github.com)

---

## 📌 Project Overview

**UniConnect** is a modern, responsive, modular University ERP and Academic Management System designed and built for **Nagarjuna University**. It addresses the challenges highlighted in the university case study (`CCE1.docx`), including transitioning from a rigid Waterfall approach to an Agile Scrum model to deliver:

1. **Flexible Credit-Based Academic System**: Course & elective registration (Core, Electives, Interdisciplinary), dynamic credit calculation, capacity quotas, and change period enforcement.
2. **Integrated Multi-Stakeholder Interfaces**: Dedicated portals and workflows for **Students**, **Faculty Members**, **Parents**, and **Administrators**.
3. **Configurable University Policies**: Department-specific attendance thresholds (75% vs 85%), medical condonation workflows with administrative review, and configurable assessment grading schemes.
4. **Digital Financial Management**: Semester fee structures, pending balance tracking, and simulated payment gateway with receipt generation.
5. **Grievance Redressal Cell**: End-to-end student complaint submission, status tracking (Pending, In Progress, Resolved, Rejected), and administrative responses.
6. **Automated Notification Engine**: In-app notifications and alerts for attendance shortages, exam dates, published results, and broadcast circulars.

---

## 👥 Demo Login Credentials (All 4 Roles)

UniConnect comes pre-seeded with 20 realistic student accounts, 5 faculty members, 3 academic departments, courses, and linked parent profiles. The login page also provides **1-Click Quick Demo Login buttons** for immediate evaluator testing:

| Role | Name | Email Address | Password | Focus / Features |
| :--- | :--- | :--- | :--- | :--- |
| 👑 **Administrator** | Dr. K. V. Ramanathan | `admin@uniconnect.edu` | `Admin@123` | System stats, policy rules (75% vs 85%), user management, course catalog, condonation review, fee reports, publish results |
| 👨‍🏫 **Faculty** | Dr. Ramesh Sharma | `faculty.sharma@uniconnect.edu` | `Faculty@123` | Assigned subjects, daily schedule, mark student attendance, enter CIA marks, post assignments |
| 👨‍🏫 **Faculty (AI/ML)** | Prof. Ananya Sen | `faculty.ananya@uniconnect.edu` | `Faculty@123` | AI & Algorithms subjects, roster management, attendance logging |
| 🎓 **Student (High Att.)** | Aarav Sharma | `student.aarav@uniconnect.edu` | `Student@123` | Roll: `NU2024CSE001`, 91.2% attendance, CGPA: 9.15, elective enrollments, fees paid |
| 🎓 **Student (Warning)** | Rohan Deshmukh | `student.rohan@uniconnect.edu` | `Student@123` | Roll: `NU2024CSE003`, 70.6% attendance (< 75% threshold), **live attendance shortage warning banner**, apply for condonation |
| 🎓 **Student (Partial Fee)**| Priya Nair | `student.priya@uniconnect.edu` | `Student@123` | Roll: `NU2024CSE002`, partial fee balance, simulated online fee payment gateway |
| 👨‍👩‍👦 **Parent** | Rajesh Sharma | `parent.rajesh@uniconnect.edu` | `Parent@123` | Father of Aarav Sharma (monitors Aarav's 91.2% attendance, grades, results, receipts) |
| 👨‍👩‍👦 **Parent** | Sunita Nair | `parent.sunita@uniconnect.edu` | `Parent@123` | Mother of Priya Nair |

---

## 🛠️ Technology Stack

- **Frontend**:
  - React.js 19 with TypeScript
  - Vite for ultra-fast bundling
  - Tailwind CSS for responsive styling
  - Lucide React for consistent icons
  - Recharts for attendance and performance visualization
  - React Router DOM for role-protected client-side routing
  - Axios for HTTP communication with token interceptor
- **Backend**:
  - Node.js & Express.js with TypeScript
  - Prisma ORM (supports SQLite out-of-the-box and MySQL 8.0)
  - JWT (JSON Web Tokens) for stateless authentication
  - `bcryptjs` for secure password hashing
  - Role-Based Access Control (RBAC) middleware (`authenticate`, `authorize`)
- **Database Architecture**:
  - Properly normalized schema with 25 relational models (Users, Students, Faculty, Parents, ParentStudentLinks, Departments, Courses, CourseRegistrations, AttendanceRecords, AttendanceCondonations, Examinations, ExaminationMarks, SemesterResults, FeeStructures, StudentFees, Payments, Grievances, Notifications, Timetables, Assignments, Submissions).

---

## 📁 Project Structure

```
uniconnect/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Prisma schema (SQLite dev / MySQL production)
│   │   ├── schema.mysql.prisma     # Explicit MySQL schema reference
│   │   ├── seed.ts                 # Database seed script (20 students, 5 faculty, courses, attendance)
│   │   └── dev.db                  # Synchronized local database
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.ts           # Prisma client singleton
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── studentController.ts
│   │   │   ├── facultyController.ts
│   │   │   ├── parentController.ts
│   │   │   ├── adminController.ts
│   │   │   ├── examController.ts
│   │   │   └── notificationController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT authentication & RBAC check
│   │   │   └── errorHandler.ts     # Global centralized error handling
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── studentRoutes.ts
│   │   │   ├── facultyRoutes.ts
│   │   │   ├── parentRoutes.ts
│   │   │   ├── adminRoutes.ts
│   │   │   ├── examRoutes.ts
│   │   │   └── notificationRoutes.ts
│   │   └── index.ts                # Express server entry point
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Universal top nav with search & notification dropdown
│   │   │   └── Sidebar.tsx         # Role-based sidebar navigation
│   │   ├── context/
│   │   │   └── AuthContext.tsx     # Authentication context provider
│   │   ├── layouts/
│   │   │   └── DashboardLayout.tsx # Protected layout wrapper
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   └── LoginPage.tsx   # Login screen with 1-Click demo account triggers
│   │   │   ├── student/
│   │   │   │   ├── StudentDashboard.tsx
│   │   │   │   ├── StudentProfilePage.tsx
│   │   │   │   ├── StudentAttendancePage.tsx
│   │   │   │   ├── StudentCoursesPage.tsx
│   │   │   │   ├── StudentExaminationsPage.tsx
│   │   │   │   ├── StudentFeesPage.tsx
│   │   │   │   └── StudentGrievancesPage.tsx
│   │   │   ├── faculty/
│   │   │   │   ├── FacultyDashboard.tsx
│   │   │   │   ├── FacultyAttendancePage.tsx
│   │   │   │   ├── FacultyCoursesPage.tsx
│   │   │   │   ├── FacultyMarksPage.tsx
│   │   │   │   └── FacultyAssignmentsPage.tsx
│   │   │   ├── parent/
│   │   │   │   └── ParentDashboard.tsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── AdminUsersPage.tsx
│   │   │       ├── AdminDepartmentsPage.tsx
│   │   │       ├── AdminSemestersPage.tsx
│   │   │       ├── AdminCoursesPage.tsx
│   │   │       ├── AdminAttendancePage.tsx
│   │   │       ├── AdminExaminationsPage.tsx
│   │   │       ├── AdminFeesPage.tsx
│   │   │       ├── AdminGrievancesPage.tsx
│   │   │       └── AdminAnnouncementsPage.tsx
│   │   ├── services/
│   │   │   └── api.ts              # Axios instance with auth interceptor
│   │   ├── types/
│   │   │   └── index.ts            # Frontend TypeScript type declarations
│   │   ├── App.tsx                 # Route definitions and access guards
│   │   └── index.css               # Tailwind directives and styling
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── API_DOCUMENTATION.md            # Comprehensive REST API Documentation
└── README.md
```

---

## 🚀 Installation & Setup Instructions

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)
- (Optional) MySQL Server 8.0 (SQLite is configured by default for zero-friction setup)

### 1. Backend Setup
```bash
cd uniconnect/backend

# Install dependencies
npm install

# Push Prisma schema to create tables
npx prisma db push

# Seed realistic university database
npx tsx prisma/seed.ts

# Start the Backend API server (runs on http://localhost:5000)
npm run dev
```

### 2. Frontend Setup
In a new terminal window:
```bash
cd uniconnect/frontend

# Install dependencies
npm install

# Start the Vite development server (runs on http://localhost:5173)
npm run dev
```

Visit **http://localhost:5173** in your web browser.

---

## 🔄 Switching to MySQL 8.0

UniConnect is built with Prisma ORM and is 100% compatible with MySQL 8.0.
To connect directly to your local MySQL instance:

1. Open `uniconnect/backend/prisma/schema.prisma` and change:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```
2. In `uniconnect/backend/.env`, set your MySQL connection string:
   ```env
   DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/uniconnect"
   ```
3. Run migrations and re-seed:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

---

## 🧪 Functional Verification Guide

1. **Role Login & Dashboard Redirection**:
   - Navigate to `/login`.
   - Students can log in using either their **USN** (e.g. `1NC24IS001`) or their institutional email (`1nc24is001@uniconnect.edu`) with password `Student@123`.
   - Faculty can log in with their email (e.g. `faculty.sharma@uniconnect.edu`) with password `Faculty@123`.
   - Admin can log in with `admin@uniconnect.edu` / `Admin@123`.
   - Parents can log in with `parent.rajesh@uniconnect.edu` / `Parent@123`.
   - Or click on any profile card in the interactive 1-click directory on the login page.

2. **Automated Attendance Shortage Detection**:
   - Log in as **Rohan Deshmukh** (USN `1NC24IS003` / `Student@123`).
   - Notice the prominent **Attendance Shortage Warning Alert** indicating attendance is below 75%.
   - Click **Apply Condonation**, enter medical reasons, and submit.
   - Switch to **Admin** (`admin@uniconnect.edu`), open **Shortage & Condonations**, click **Review & Approve**, and submit approval. Verify Rohan's notification updates.

3. **Flexible Credit-Based Registration**:
   - Log in as student Aarav Sharma, go to **Course Registration**.
   - Review registered credits (18 / max 28).
   - Switch to **Department Electives** or **Interdisciplinary Open Courses**. Click **Enroll Subject**.
   - Notice live credit recalculation and duplicate enrollment prevention. Click **Drop Subject** to remove an elective.

4. **Faculty Attendance Entry**:
   - Log in as **Dr. Ramesh Sharma** (`faculty.sharma@uniconnect.edu`).
   - Go to **Mark Attendance**, pick course **CS401**, date, and session type.
   - Mark students present or absent. Click **Save & Submit Attendance**.
   - Live attendance recalculates and students below the threshold trigger alert notifications.

5. **Simulated Online Fee Payment**:
   - Log in as **Priya Nair** (`student.priya@uniconnect.edu`).
   - Go to **Fees & Payments**. Note pending balance of ₹23,000.
   - Click **Pay Pending Fee Now**, choose payment instrument (UPI / Card / NetBanking), and confirm.
   - Verified digital receipt (`RCP-2026-XXXXX`) is generated and balance decreases instantly.

6. **Grievance Redressal**:
   - As a student, navigate to **Grievance Portal**, click **Log New Grievance Ticket**, select category (e.g., Hostel/Exam), and submit.
   - As Admin, navigate to **Grievance Desk**, review ticket, add administrative redressal, and update status to **RESOLVED**.

7. **Parent Monitoring**:
   - Log in as **Rajesh Sharma** (`parent.rajesh@uniconnect.edu`).
   - View Aarav's live attendance percentage, course scores, and fee payment receipts.

---

## 🏆 Agile Scrum Sprints Delivered

- **Sprint 1**: Database design (25 models), Prisma migrations, JWT auth with bcrypt, demo seeds.
- **Sprint 2**: Student & Faculty personal dashboards and profile management.
- **Sprint 3**: Real-time attendance logging, subject-wise statistics, and course registration.
- **Sprint 4**: Flexible academic credit system (Core, Electives, Interdisciplinary, capacity check).
- **Sprint 5**: Examination timetables, marks entry, and official SGPA/CGPA result publication.
- **Sprint 6**: Fee management, pending balance tracking, and simulated payment gateway.
- **Sprint 7**: Student grievance portal with administrative redressal, and notification engine.
- **Sprint 8**: Parent dashboard with linked ward monitoring, and university administration console.
- **Sprint 9**: End-to-end integration testing, type-checking, build validation, and API documentation.

