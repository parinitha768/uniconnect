# UniConnect REST API Documentation
### Nagarjuna University Academic Management Platform

**Base URL**: `http://localhost:5000/api`  
**Authentication**: Bearer Token in `Authorization` header (`Bearer <JWT_TOKEN>`)

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /auth/login`
Authenticates a user and returns a JWT token with profile information.
- **Request Body**:
  ```json
  {
    "email": "student.aarav@uniconnect.edu",
    "password": "Student@123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "...",
      "email": "student.aarav@uniconnect.edu",
      "name": "Aarav Sharma",
      "role": "STUDENT"
    }
  }
  ```

### `GET /auth/me`
Fetches current authenticated user with their respective role details.
- **Headers**: `Authorization: Bearer <TOKEN>`

---

## 2. Student Endpoints (`/api/student`)
*Protected: Requires `STUDENT` or `ADMIN` role.*

### `GET /student/dashboard`
Returns student statistics, registered courses, attendance breakdown, upcoming exams, fee summary, and notifications.

### `GET /student/profile`
Returns detailed student profile, department, parents, and past semester results.

### `GET /student/attendance`
Returns subject-wise attendance numbers, overall percentage, department threshold, and past condonation applications.

### `POST /student/condonation`
Submits an application for attendance shortage condonation.
- **Request Body**:
  ```json
  {
    "courseId": "course-uuid",
    "currentPercentage": 68.0,
    "reason": "Suffered from viral illness. Medical certificate attached.",
    "medicalCert": "https://example.com/certs/cert.pdf"
  }
  ```

### `GET /student/courses`
Returns current registered courses, available core/electives/interdisciplinary subjects, capacity limits, and allowable credits.

### `POST /student/courses/register`
Enrolls the student in an elective or interdisciplinary course. Enforces capacity and credit limits.
- **Request Body**: `{ "courseId": "course-uuid" }`

### `POST /student/courses/drop`
Drops an elective course during the active registration window.

### `GET /student/examinations`
Returns upcoming exam timetables, assessment scores, and published semester grade cards.

### `GET /student/fees`
Returns semester fee structure, total/paid/pending amounts, and payment history.

### `POST /student/fees/pay`
Processes a payment via the simulated university payment gateway.
- **Request Body**:
  ```json
  {
    "studentFeeId": "fee-uuid",
    "amount": 5000,
    "paymentMethod": "UPI"
  }
  ```

### `GET /student/grievances`
Returns all grievance tickets submitted by the student with current status and responses.

### `POST /student/grievances`
Submits a new grievance ticket.
- **Request Body**:
  ```json
  {
    "category": "HOSTEL",
    "subject": "Wi-Fi disruption in Block B",
    "description": "Internet connectivity is down on the 3rd floor."
  }
  ```

---

## 3. Faculty Endpoints (`/api/faculty`)
*Protected: Requires `FACULTY` or `ADMIN` role.*

### `GET /faculty/dashboard`
Returns faculty workload, assigned courses, student counts, and today's timetable.

### `GET /faculty/courses`
Returns courses taught by this faculty member.

### `GET /faculty/courses/:courseId/students`
Returns list of students enrolled in the course with cumulative attendance statistics and shortage indicators.

### `POST /faculty/attendance`
Records session attendance for enrolled students. Automatically flags low attendance.
- **Request Body**:
  ```json
  {
    "courseId": "course-uuid",
    "date": "2026-03-20",
    "sessionType": "LECTURE",
    "records": [
      { "studentId": "student-1", "status": "PRESENT" },
      { "studentId": "student-2", "status": "ABSENT", "remarks": "Unexcused" }
    ]
  }
  ```

### `POST /faculty/marks`
Enters continuous internal assessment marks for students.
- **Request Body**:
  ```json
  {
    "courseId": "course-uuid",
    "marksData": [
      { "studentId": "student-1", "marks": 28.5 },
      { "studentId": "student-2", "marks": 24.0 }
    ]
  }
  ```

### `POST /faculty/assignments`
Publishes a new course assignment. Dispatches in-app notifications to enrolled students.
- **Request Body**:
  ```json
  {
    "courseId": "course-uuid",
    "title": "Lab Exercise 2",
    "description": "Implement B+ tree indexing.",
    "dueDate": "2026-04-10",
    "maxMarks": 20
  }
  ```

---

## 4. Parent Endpoints (`/api/parent`)
*Protected: Requires `PARENT` or `ADMIN` role.*

### `GET /parent/dashboard`
Returns linked student profiles, real-time attendance percentages, warning alerts, exam results, and fee payment status.

---

## 5. Administrator Endpoints (`/api/admin`)
*Protected: Requires `ADMIN` role.*

### `GET /admin/dashboard`
Returns university-wide metrics: total students, faculty, departments, courses, revenue collection, pending grievances, and recent transactions.

### `GET /admin/users`
Lists all users with optional `?role=STUDENT|FACULTY|PARENT` filter.

### `POST /admin/users`
Creates a new student, faculty, or parent account.

### `PATCH /admin/users/:userId/toggle-status`
Toggles account status between active and deactivated.

### `GET /admin/departments`
Lists academic departments with their configurable attendance and condonation policies.

### `PATCH /admin/departments/:departmentId/policy`
Dynamically updates department attendance threshold (e.g. 75% vs 85%), condonation minimum, and fee without code alterations.

### `GET /admin/semesters`
Lists academic semesters.

### `PATCH /admin/semesters/:semesterId`
Toggles registration window open/closed and updates allowable credit limits.

### `GET /admin/courses` & `POST /admin/courses`
Manages university course catalog, syllabus, and seat capacities.

### `GET /admin/attendance-shortage`
Generates an audit report of all students across the university with attendance below their departmental requirement.

### `GET /admin/condonations` & `PATCH /admin/condonations/:condonationId`
Reviews and approves/rejects student attendance condonation applications.

### `POST /examinations/publish-results`
Computes official SGPA and cumulative CGPA for all students in the semester, publishes results, and dispatches notifications.

### `GET /admin/grievances` & `PATCH /admin/grievances/:grievanceId`
Reviews student complaints and records official administrative redressal.

### `GET /admin/fee-reports`
Audits total fee collections, payment methods, and pending arrears.

### `POST /admin/announcements`
Broadcasts notices to ALL, STUDENT, FACULTY, or PARENT users.

