import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  CreditCard,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  ShieldCheck,
  X,
  FileText,
  AlertCircle,
  Receipt,
} from 'lucide-react';

export const StudentFeesPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchFees = async () => {
    try {
      const res = await api.get('/student/fees');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const openPaymentModal = (fee: any) => {
    setSelectedFee(fee);
    setPayAmount(fee.pendingFee);
    setShowPayModal(true);
    setReceiptData(null);
  };

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee || payAmount <= 0) return;
    setProcessing(true);
    setMessage(null);

    try {
      const res = await api.post('/student/fees/pay', {
        studentFeeId: selectedFee.id,
        amount: payAmount,
        paymentMethod,
      });

      if (res.data.success) {
        setReceiptData(res.data.payment);
        fetchFees();
      }
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Payment transaction failed.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return <div>Failed to load fee information.</div>;

  const { fees, feeStructures } = data;
  const currentFee = fees[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fee Management & Online Receipts</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Semester fees, simulated payment gateway transactions, and instant digital receipts.
          </p>
        </div>
      </div>

      {/* Top Summary Cards */}
      {currentFee && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Semester Fee</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              ₹{currentFee.totalFee.toLocaleString('en-IN')}
            </p>
            <span className="text-xs text-slate-400 mt-1 block">{currentFee.semester.name}</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Paid Amount</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">
              ₹{currentFee.paidFee.toLocaleString('en-IN')}
            </p>
            <span className="text-xs text-emerald-600 font-semibold mt-1 block">Verified In Account</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Balance</p>
              <div className="flex items-baseline justify-between mt-1">
                <p className={`text-3xl font-extrabold ${currentFee.pendingFee > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                  ₹{currentFee.pendingFee.toLocaleString('en-IN')}
                </p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${currentFee.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {currentFee.status}
                </span>
              </div>
            </div>

            {currentFee.pendingFee > 0 && (
              <button
                onClick={() => openPaymentModal(currentFee)}
                className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" /> Pay Pending Fee Now
              </button>
            )}
          </div>
        </div>
      )}

      {/* Department Fee Structure Breakdown */}
      {feeStructures && feeStructures.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" /> Official Fee Structure Breakdown
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500">Tuition Fee</p>
              <p className="text-sm font-bold text-slate-800 mt-1">₹{feeStructures[0].tuitionFee.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500">Development</p>
              <p className="text-sm font-bold text-slate-800 mt-1">₹{feeStructures[0].developmentFee.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500">Examination</p>
              <p className="text-sm font-bold text-slate-800 mt-1">₹{feeStructures[0].examinationFee.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500">Lab & Workshops</p>
              <p className="text-sm font-bold text-slate-800 mt-1">₹{feeStructures[0].labFee.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500">Library & Amenities</p>
              <p className="text-sm font-bold text-slate-800 mt-1">₹{feeStructures[0].libraryFee.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment History & Receipts */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Payment Transactions & Receipts</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Receipt Number</th>
                <th className="px-6 py-3.5">Transaction ID</th>
                <th className="px-6 py-3.5">Date Paid</th>
                <th className="px-6 py-3.5">Method</th>
                <th className="px-6 py-3.5">Amount Paid</th>
                <th className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fees.flatMap((f: any) => f.payments).length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400 text-xs">
                    No payment transactions recorded yet.
                  </td>
                </tr>
              ) : (
                fees.flatMap((f: any) => f.payments).map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-sky-600">{p.receiptNumber}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{p.transactionId}</td>
                    <td className="px-6 py-4 text-slate-700">{new Date(p.paidAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{p.paymentMethod}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> SUCCESS
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulated Payment Gateway Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {receiptData ? (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Payment Successful!</h3>
                <p className="text-xs text-slate-500">Your simulated university payment has been processed.</p>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Receipt No:</span>
                    <span className="font-mono font-bold text-slate-900">{receiptData.receiptNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction ID:</span>
                    <span className="font-mono text-slate-700">{receiptData.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount Paid:</span>
                    <span className="font-bold text-emerald-600 text-sm">₹{receiptData.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Method:</span>
                    <span className="font-semibold text-slate-800">{receiptData.paymentMethod}</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowPayModal(false)}
                  className="w-full bg-slate-900 text-white font-semibold text-xs py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Close Receipt
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" /> Simulated University Payment Gateway
                  </h3>
                  <button onClick={() => setShowPayModal(false)}>
                    <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                  </button>
                </div>

                {message && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl mt-3">
                    {message}
                  </div>
                )}

                <form onSubmit={handleSimulatePayment} className="space-y-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Payment Amount (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      max={selectedFee.pendingFee}
                      value={payAmount}
                      onChange={(e) => setPayAmount(Number(e.target.value))}
                      className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Pending Balance: ₹{selectedFee.pendingFee.toLocaleString('en-IN')}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Select Payment Instrument
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['UPI', 'CARD', 'NETBANKING'].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                            paymentMethod === method
                              ? 'border-sky-600 bg-sky-50 text-sky-800'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>256-bit encrypted simulated transaction gateway. No real money deducted.</span>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowPayModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={processing || payAmount <= 0}
                      className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                    >
                      {processing ? 'Processing Payment...' : `Confirm & Pay ₹${payAmount.toLocaleString('en-IN')}`}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

