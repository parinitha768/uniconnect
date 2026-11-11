import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  CheckSquare,
  AlertTriangle,
  FileCheck,
  FileText,
  Clock,
  Send,
  X,
  ShieldAlert,
  BookOpen,
  GraduationCap,
  UserCheck,
  Mail,
  MapPin,
  Layers,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

export const StudentAttendancePage: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourseForCondonation, setSelectedCourseForCondonation] = useState<any>(null);
  const [selectedSubjectDetails, setSelectedSubjectDetails] = useState<any>(null);
  const [condonationReason, setCondonationReason] = useState('');
  const [medicalCert, setMedicalCert] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const getSyllabusModules = (code: string) => {
    switch (code) {
      case 'CS401':
        return [
          { unit: 'Unit 1', title: 'Relational Model & Advanced SQL', desc: 'Relational algebra, ER diagrams, normal forms (1NF, 2NF, 3NF, BCNF).' },
          { unit: 'Unit 2', title: 'Transaction Processing & Concurrency', desc: 'ACID properties, serializability, two-phase locking, timestamp ordering.' },
          { unit: 'Unit 3', title: 'Indexing & Query Optimization', desc: 'B-Trees, B+ Trees, hashing, cost-based optimizer mechanics.' },
          { unit: 'Unit 4', title: 'NoSQL & Distributed DBs', desc: 'CAP theorem, document stores, key-value engines, data replication.' },
        ];
      case 'CS402':
        return [
          { unit: 'Unit 1', title: 'Asymptotic Analysis & Recurrences', desc: 'Big-O, Omega, Theta notation, Master Theorem, recursion trees.' },
          { unit: 'Unit 2', title: 'Divide and Conquer & Sorting', desc: 'Merge sort, quicksort, lower bounds for sorting, matrix multiplication.' },
          { unit: 'Unit 3', title: 'Dynamic Programming & Greedy', desc: '0/1 Knapsack, longest common subsequence, optimal BST, Huffman coding.' },
          { unit: 'Unit 4', title: 'Graph Algorithms & NP-Completeness', desc: 'Dijkstra, Bellman-Ford, Floyd-Warshall, P vs NP, Cook-Levin theorem.' },
        ];
      case 'CS403':
        return [
          { unit: 'Unit 1', title: 'Process Management & Scheduling', desc: 'Process control blocks, context switching, CPU scheduling algorithms.' },
          { unit: 'Unit 2', title: 'Synchronization & Deadlocks', desc: 'Mutex, semaphores, monitors, Banker’s algorithm, deadlock detection.' },
          { unit: 'Unit 3', title: 'Memory Management & Paging', desc: 'Virtual memory, page replacement algorithms, segmentation, thrashing.' },
          { unit: 'Unit 4', title: 'File Systems & Storage I/O', desc: 'File allocation methods, directory structures, disk scheduling.' },
        ];
      case 'CS404':
        return [
          { unit: 'Unit 1', title: 'Modern Frontend & Component Architecture', desc: 'Component lifecycle, hooks, state management, modern CSS frameworks.' },
          { unit: 'Unit 2', title: 'Backend REST & GraphQL APIs', desc: 'Node.js, Express, middleware pipelines, authentication tokens.' },
          { unit: 'Unit 3', title: 'Cloud Infrastructure & Containers', desc: 'Docker containerization, microservices, cloud storage, CI/CD pipelines.' },
          { unit: 'Unit 4', title: 'Security & Web Performance', desc: 'CORS, CSRF/XSS prevention, caching strategies, CDN delivery.' },
        ];
      case 'ID401':
        return [
          { unit: 'Unit 1', title: 'IoT Architecture & Sensor Types', desc: 'Sensors, actuators, analog/digital conversion, embedded processors.' },
          { unit: 'Unit 2', title: 'Connectivity Protocols', desc: 'MQTT, CoAP, Zigbee, BLE, LoRaWAN communication stacks.' },
          { unit: 'Unit 3', title: 'Edge Analytics & Cloud Gateways', desc: 'Data aggregation at edge devices, streaming telemetry to cloud.' },
          { unit: 'Unit 4', title: 'Smart Applications & Security', desc: 'Smart city grids, healthcare telemetry, device authentication.' },
        ];
      default:
        return [
          { unit: 'Unit 1', title: 'Foundations & Mathematical Modeling', desc: 'Fundamental theorems, system boundaries, core principles.' },
          { unit: 'Unit 2', title: 'Design & Analytical Methodologies', desc: 'System analysis, transformations, simulation techniques.' },
          { unit: 'Unit 3', title: 'Practical Implementations & Case Studies', desc: 'Industry standards, laboratory experimentation, performance metrics.' },
          { unit: 'Unit 4', title: 'Emerging Trends & Advanced Topics', desc: 'State of the art paradigms, modern design optimizations.' },
        ];
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/student/attendance');
      if (res.data.success) {
        setAttendanceData(res.data.attendance);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleApplyCondonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForCondonation || !condonationReason) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await api.post('/student/condonation', {
        courseId: selectedCourseForCondonation.courseId,
        currentPercentage: selectedCourseForCondonation.percentage,
        reason: condonationReason,
        medicalCert,
      });

      if (res.data.success) {
        setMessage('Condonation application submitted successfully! Under review by administrator.');
        setSelectedCourseForCondonation(null);
        setCondonationReason('');
        setMedicalCert('');
        fetchAttendance();
      }
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!attendanceData) return <div>Failed to load attendance records.</div>;

  const { overallPercentage, totalClasses, totalPresent, totalAbsent, departmentThreshold, condonationMin, courses, condonations } = attendanceData;

  const hasShortage = overallPercentage < departmentThreshold;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Monitoring & Shortage Management</h1>
          <p className="text-sm text-slate-500">
            Official department policy threshold: <span className="font-bold text-slate-800">{departmentThreshold}%</span> • Condonation lower limit: <span className="font-bold text-slate-800">{condonationMin}%</span>
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-sm flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Attendance</p>
          <p className={`text-3xl font-extrabold mt-1 ${hasShortage ? 'text-amber-600' : 'text-emerald-600'}`}>
            {overallPercentage}%
          </p>
          <span className={`text-[11px] font-semibold mt-1 inline-block ${hasShortage ? 'text-amber-700' : 'text-emerald-700'}`}>
            {hasShortage ? 'Shortage Detected' : 'Eligible for Exams'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Classes Held</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{totalClasses}</p>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">Conducted sessions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attended Classes</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">{totalPresent}</p>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">Sessions present</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Absences</p>
          <p className="text-3xl font-extrabold text-rose-600 mt-1">{totalAbsent}</p>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">Sessions missed</span>
        </div>
      </div>

      {/* Subject-wise Attendance Table */}

      {/* Subject-wise Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Subject-wise Attendance Breakdown</h2>
            <p className="text-xs text-slate-500">Live attendance calculated per session by course faculty</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Course Code & Title</th>
                <th className="px-6 py-3.5">Credits</th>
                <th className="px-6 py-3.5">Faculty In-Charge</th>
                <th className="px-6 py-3.5 text-center">Total</th>
                <th className="px-6 py-3.5 text-center">Attended</th>
                <th className="px-6 py-3.5 text-center">Missed</th>
                <th className="px-6 py-3.5 text-center">Percentage</th>
                <th className="px-6 py-3.5 text-right">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((c: any) => (
                <tr key={c.courseId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedSubjectDetails(c)}
                      className="text-left group cursor-pointer"
                      title="Click to view full course syllabus and faculty details"
                    >
                      <p className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors flex items-center gap-1.5">
                        <span>{c.courseCode}</span>
                        <span className="text-[10px] text-sky-600 font-semibold bg-sky-50 px-1.5 py-0.2 rounded border border-sky-100 opacity-0 group-hover:opacity-100 transition-opacity">
                          Details →
                        </span>
                      </p>
                      <p className="text-xs text-slate-500 group-hover:text-slate-700">{c.courseTitle}</p>
                    </button>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{c.credits}</td>
                  <td className="px-6 py-4 text-slate-600">{c.facultyName}</td>
                  <td className="px-6 py-4 text-center font-semibold text-slate-800">{c.total}</td>
                  <td className="px-6 py-4 text-center font-semibold text-emerald-600">{c.present}</td>
                  <td className="px-6 py-4 text-center font-semibold text-rose-600">{c.absent}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <span className={`font-bold ${c.isShortage ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {c.percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {c.isShortage ? (
                      <div className="inline-flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          Shortage (&lt;{c.requiredPercentage}%)
                        </span>
                        {c.condonationAllowed && (
                          <button
                            onClick={() => setSelectedCourseForCondonation(c)}
                            className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
                          >
                            Apply Condonation
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Regular
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Condonation History Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-indigo-600" /> Condonation Applications & Review Status
        </h2>
        {condonations.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No condonation applications submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {condonations.map((app: any) => (
              <div key={app.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{app.course.code}: {app.course.title}</span>
                    <span className="text-xs text-slate-500">({app.currentPercentage}%)</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1"><span className="font-semibold">Reason:</span> {app.reason}</p>
                  {app.adminRemarks && (
                    <p className="text-xs text-indigo-700 mt-0.5"><span className="font-semibold">Admin Remarks:</span> {app.adminRemarks}</p>
                  )}
                </div>
                <div className="sm:text-right shrink-0">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : app.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                    {app.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Submitted on {new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Subject Details Modal */}
      {selectedSubjectDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded-lg">
                    {selectedSubjectDetails.courseCode}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {selectedSubjectDetails.credits} Credits
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {selectedSubjectDetails.courseType || 'CORE'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedSubjectDetails.courseTitle}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Information Science & Engineering • Academic Term Spring 2026
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubjectDetails(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Attendance Status Callout */}
            {(() => {
              const isBelow85 = selectedSubjectDetails.percentage < 85;
              return (
                <div className={`mt-4 p-4 rounded-2xl border ${
                  isBelow85
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                }`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${isBelow85 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {isBelow85 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider">
                          Attendance & Examination Eligibility
                        </p>
                        <p className="text-sm font-semibold">
                          {isBelow85 ? 'Shortage Alert (< 85% Minimum Requirement)' : 'Satisfactory & Exam Eligible (≥ 85%)'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-black font-mono ${isBelow85 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {selectedSubjectDetails.percentage}%
                      </p>
                      <p className="text-[11px] text-slate-500">Threshold: 85.0%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/50 text-center text-xs">
                    <div className="bg-white/80 p-2 rounded-xl">
                      <p className="text-slate-500 text-[11px]">Sessions Held</p>
                      <p className="font-bold font-mono text-slate-900 mt-0.5">{selectedSubjectDetails.total}</p>
                    </div>
                    <div className="bg-white/80 p-2 rounded-xl">
                      <p className="text-emerald-700 text-[11px]">Attended</p>
                      <p className="font-bold font-mono text-emerald-700 mt-0.5">{selectedSubjectDetails.present}</p>
                    </div>
                    <div className="bg-white/80 p-2 rounded-xl">
                      <p className="text-rose-700 text-[11px]">Missed</p>
                      <p className="font-bold font-mono text-rose-700 mt-0.5">{selectedSubjectDetails.absent}</p>
                    </div>
                  </div>

                  {isBelow85 && (
                    <p className="text-xs text-rose-800 mt-2.5 leading-relaxed bg-white/60 p-2 rounded-xl border border-rose-200">
                      ⚠️ <strong>Examination Debarment Warning:</strong> Students with attendance below 85% in this course are not permitted to appear for final examinations unless condonation is formally submitted and approved by the department.
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Faculty Instructor Details */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-sky-600" />
                Assigned Faculty Instructor
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{selectedSubjectDetails.facultyName}</p>
                  <p className="text-xs text-slate-600">{selectedSubjectDetails.facultyDesignation || 'Faculty Instructor'}</p>
                </div>
                <div className="text-xs space-y-1 sm:text-right">
                  {selectedSubjectDetails.facultyEmail && (
                    <p className="text-slate-600 flex items-center sm:justify-end gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`mailto:${selectedSubjectDetails.facultyEmail}`} className="text-sky-600 hover:underline">
                        {selectedSubjectDetails.facultyEmail}
                      </a>
                    </p>
                  )}
                  <p className="text-slate-500 flex items-center sm:justify-end gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Office: {selectedSubjectDetails.officeRoom || 'Department Faculty Room 302'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Course Description & Syllabus Modules */}
            <div className="mt-4 space-y-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Course Overview & Description
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  {selectedSubjectDetails.courseDescription || 'Comprehensive curriculum covering theoretical foundations and practical laboratory work.'}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-600" />
                  Syllabus Units & Modules
                </h3>
                <div className="space-y-2">
                  {getSyllabusModules(selectedSubjectDetails.courseCode).map((m: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sky-700 font-mono bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                          {m.unit}
                        </span>
                        <span className="font-semibold text-slate-900">{m.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 pl-1">{m.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2.5">
              {selectedSubjectDetails.isShortage && selectedSubjectDetails.condonationAllowed && (
                <button
                  type="button"
                  onClick={() => {
                    const c = selectedSubjectDetails;
                    setSelectedSubjectDetails(null);
                    setSelectedCourseForCondonation(c);
                  }}
                  className="w-full sm:w-auto py-2.5 px-5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer"
                >
                  <span>Apply Condonation for {selectedSubjectDetails.courseCode}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedSubjectDetails(null)}
                className="w-full sm:w-auto py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors text-center cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedCourseForCondonation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" /> Apply for Attendance Condonation
              </h3>
              <button onClick={() => setSelectedCourseForCondonation(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleApplyCondonation} className="space-y-4 mt-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                <p className="font-semibold">{selectedCourseForCondonation.courseCode}: {selectedCourseForCondonation.courseTitle}</p>
                <p className="mt-0.5">Current Attendance: <span className="font-bold">{selectedCourseForCondonation.percentage}%</span> (Eligible for condonation since &gt;= {condonationMin}%)</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Absence / Medical Condition *
                </label>
                <textarea
                  required
                  rows={3}
                  value={condonationReason}
                  onChange={(e) => setCondonationReason(e.target.value)}
                  placeholder="Detail the circumstances (e.g., hospitalization, approved university athletic event, severe fever)..."
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supporting Medical Certificate / Proof URL (Optional)
                </label>
                <input
                  type="url"
                  value={medicalCert}
                  onChange={(e) => setMedicalCert(e.target.value)}
                  placeholder="https://hospital-records.com/certs/cert_102.pdf"
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedCourseForCondonation(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                >
                  {submitting ? 'Submitting...' : 'Submit to Academic Dean'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

