import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BarChart3,
  Search,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Filter,
} from 'lucide-react';

export const AdminFeesPage: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchFeeReports = async () => {
      try {
        const res = await api.get('/admin/fee-reports');
        if (res.data.success) {
          setReport(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeeReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!report) return <div>Failed to load fee reports.</div>;

  const { summary, records } = report;

  const filteredRecords = records.filter((r: any) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesSearch =
      r.student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">University Fee Collection Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Detailed financial audit of tuition fees, paid collections, and outstanding dues.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Billed</p>
          <p className="text-2xl font-black text-slate-900 mt-1">₹{summary.totalExpected.toLocaleString('en-IN')}</p>
          <span className="text-xs text-slate-400 mt-1 block">Expected university revenue</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Collected</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">₹{summary.totalCollected.toLocaleString('en-IN')}</p>
          <span className="text-xs text-emerald-700 font-semibold mt-1 block">{summary.paidCount} Fully Paid</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Outstanding Dues</p>
          <p className="text-2xl font-black text-rose-600 mt-1">₹{summary.totalPending.toLocaleString('en-IN')}</p>
          <span className="text-xs text-rose-700 font-semibold mt-1 block">{summary.pendingCount} Pending</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Partial Payments</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{summary.partialCount}</p>
          <span className="text-xs text-amber-700 font-semibold mt-1 block">Installments remaining</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PAID', 'PARTIAL', 'PENDING'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Student Fee Accounts ({filteredRecords.length} Records)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Student & Roll No</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Semester</th>
                <th className="px-6 py-3.5">Total Fee</th>
                <th className="px-6 py-3.5">Paid</th>
                <th className="px-6 py-3.5">Pending</th>
                <th className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{r.student.user.name}</p>
                    <p className="font-mono text-xs text-slate-500">{r.student.rollNumber}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-700">{r.student.department.code}</td>
                  <td className="px-6 py-4 text-xs text-slate-600">{r.semester.name}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">₹{r.totalFee.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">₹{r.paidFee.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 font-bold text-rose-600">₹{r.pendingFee.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      r.status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : r.status === 'PARTIAL'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

