import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, ChevronDown, CheckCircle, XCircle, X, Download, Clock, RefreshCw } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const statusColors = {
  'Requested': 'bg-gray-100 text-gray-700 border border-gray-200',
  'Under Review': 'bg-blue-50 text-blue-700 border border-blue-100',
  'Approved': 'bg-green-50 text-green-700 border border-green-100',
  'Rejected': 'bg-red-50 text-red-700 border border-red-100',
  'Processing': 'bg-orange-50 text-orange-700 border border-orange-100',
  'Completed': 'bg-emerald-50 text-emerald-700 border border-emerald-100',
};

const statusFlow = ['Requested', 'Under Review', 'Approved', 'Processing', 'Completed'];

const Refunds = () => {
  if (!checkPermission('View Fee Reports') && !checkPermission('Collect Fees')) {
    return <AccessDenied />;
  }
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [viewRefund, setViewRefund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '', reason: 'Admission Cancellation', refundAmount: '', deduction: '', payMode: 'Bank Transfer', bankDetails: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStatus !== 'All') params.status = filterStatus;
      const res = await axiosInstance.get('/fees/refunds', { params });
      setData(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Failed to fetch refunds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, filterStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId) return toast.error('Please enter enrollment number');
    if (!formData.refundAmount || Number(formData.refundAmount) <= 0) return toast.error('Please enter a valid refund amount');
    setSubmitting(true);
    try {
      await axiosInstance.post('/fees/refunds', formData);
      toast.success('Refund request submitted successfully');
      setShowModal(false);
      setFormData({ studentId: '', reason: 'Admission Cancellation', refundAmount: '', deduction: '', payMode: 'Bank Transfer', bankDetails: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit refund request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/fees/refunds/${id}`, { status });
      toast.success(`Refund marked as "${status}"`);
      fetchData();
      if (viewRefund && (viewRefund._id === id || viewRefund.id === id)) {
        setViewRefund(prev => ({ ...prev, status }));
      }
    } catch (error) {
      toast.error('Failed to update refund status');
    }
  };

  const totalRefundAmount = data.reduce((sum, r) => sum + (r.refundAmount || 0), 0);
  const pendingCount = data.filter(r => ['Requested', 'Under Review', 'Approved', 'Processing'].includes(r.status)).length;
  const completedCount = data.filter(r => r.status === 'Completed').length;
  const rejectedCount = data.filter(r => r.status === 'Rejected').length;

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-GB') : '—';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Refund Management</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Process and track student fee refunds end-to-end</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold transition-colors">
            <Plus size={15} /> New Refund Request
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Refund Amount', value: `₹${totalRefundAmount.toLocaleString()}`, color: 'bg-orange-50 text-orange-700', sub: 'Across all requests' },
          { label: 'Pending Refunds', value: pendingCount, color: 'bg-red-50 text-red-700', sub: 'Awaiting action' },
          { label: 'Completed', value: completedCount, color: 'bg-green-50 text-green-700', sub: 'Successfully processed' },
          { label: 'Rejected', value: rejectedCount, color: 'bg-gray-50 text-gray-700', sub: 'Declined requests' },
        ].map(card => (
          <div key={card.label} className={`${card.color} rounded-xl p-4`}>
            <p className="text-[11px] font-medium mb-1 opacity-70">{card.label}</p>
            <p className="text-[22px] font-black">{card.value}</p>
            <p className="text-[10px] opacity-60 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by name or refund no..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
        <div className="relative">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
            <option>All</option>
            {Object.keys(statusColors).map(s => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={10} />
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
              <RefreshCw size={22} className="text-gray-300" />
            </div>
            <p className="text-gray-500 text-[14px] font-medium">No refund requests found</p>
            <p className="text-gray-400 text-[12px] mt-1">Click "New Refund Request" to create one</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                {['Refund No.', 'Student', 'Course', 'Reason', 'Request Date', 'Total Paid', 'Deduction', 'Refund Amt', 'Pay Mode', 'Status', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(r => (
                <tr key={r._id || r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-[13px] font-bold text-[#0A6C54] whitespace-nowrap">{r.refundNo}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <p className="text-[13px] font-semibold text-gray-800">{r.name}</p>
                    <p className="text-[11px] text-gray-500">{r.enrollNo}</p>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 whitespace-nowrap">{r.course}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-700 whitespace-nowrap max-w-[160px] overflow-hidden text-ellipsis" title={r.reason}>{r.reason}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 whitespace-nowrap">{formatDate(r.requestDate)}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-700 font-medium whitespace-nowrap">₹{(r.totalPaid || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] text-red-500 font-medium whitespace-nowrap">-₹{(r.deduction || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] font-bold text-green-700 whitespace-nowrap">₹{(r.refundAmount || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 whitespace-nowrap">{r.payMode}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[r.status] || 'bg-gray-100 text-gray-600'}`}>{r.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => setViewRefund(r)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="View Details">
                        <Eye size={14} className="text-gray-500" />
                      </button>
                      {r.status === 'Requested' && (
                        <>
                          <button onClick={() => handleUpdateStatus(r._id || r.id, 'Under Review')} className="p-1.5 hover:bg-blue-50 rounded-lg" title="Mark Under Review">
                            <Clock size={14} className="text-blue-500" />
                          </button>
                          <button onClick={() => handleUpdateStatus(r._id || r.id, 'Rejected')} className="p-1.5 hover:bg-red-50 rounded-lg" title="Reject">
                            <XCircle size={14} className="text-red-500" />
                          </button>
                        </>
                      )}
                      {r.status === 'Under Review' && (
                        <>
                          <button onClick={() => handleUpdateStatus(r._id || r.id, 'Approved')} className="p-1.5 hover:bg-green-50 rounded-lg" title="Approve">
                            <CheckCircle size={14} className="text-green-600" />
                          </button>
                          <button onClick={() => handleUpdateStatus(r._id || r.id, 'Rejected')} className="p-1.5 hover:bg-red-50 rounded-lg" title="Reject">
                            <XCircle size={14} className="text-red-500" />
                          </button>
                        </>
                      )}
                      {r.status === 'Approved' && (
                        <button onClick={() => handleUpdateStatus(r._id || r.id, 'Processing')} className="p-1.5 hover:bg-orange-50 rounded-lg" title="Start Processing">
                          <RefreshCw size={14} className="text-orange-500" />
                        </button>
                      )}
                      {r.status === 'Processing' && (
                        <button onClick={() => handleUpdateStatus(r._id || r.id, 'Completed')} className="p-1.5 hover:bg-emerald-50 rounded-lg" title="Mark Completed">
                          <CheckCircle size={14} className="text-emerald-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New Refund Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-gray-800">New Refund Request</h3>
                <p className="text-[12px] text-gray-500 mt-0.5">Student's fee ledger will be auto-fetched using enrollment number</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Student Enrollment No. <span className="text-red-500">*</span></label>
                <input type="text" placeholder="e.g. OP/24/CE/001" required value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Refund Reason</label>
                <div className="relative">
                  <select value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })}
                    className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {['Admission Cancellation', 'Duplicate Payment', 'Excess Payment', 'Hostel Cancellation', 'Transport Cancellation', 'Security Deposit', 'Other'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Refund Amount (₹) <span className="text-red-500">*</span></label>
                <input type="number" min="0" placeholder="Enter refund amount" required value={formData.refundAmount} onChange={e => setFormData({ ...formData, refundAmount: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Deduction Amount (₹)</label>
                <input type="number" min="0" placeholder="Enter deduction (if any)" value={formData.deduction} onChange={e => setFormData({ ...formData, deduction: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Payment Mode</label>
                <div className="relative">
                  <select value={formData.payMode} onChange={e => setFormData({ ...formData, payMode: e.target.value })}
                    className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {['Bank Transfer', 'UPI', 'Cash', 'Cheque', 'DD'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Bank / UPI Details</label>
                <input type="text" placeholder="Bank name, account no. or UPI ID" value={formData.bankDetails} onChange={e => setFormData({ ...formData, bankDetails: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              {formData.refundAmount && formData.deduction && (
                <div className="md:col-span-2 bg-green-50 rounded-xl p-3 border border-green-100">
                  <p className="text-[12px] text-green-700 font-semibold">
                    Net Refund: ₹{Math.max(0, Number(formData.refundAmount) - Number(formData.deduction)).toLocaleString()}
                    <span className="text-green-500 font-normal ml-2">(after ₹{Number(formData.deduction).toLocaleString()} deduction)</span>
                  </p>
                </div>
              )}
              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-[#0A6C54] hover:bg-[#085a46] disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-colors">
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Refund Details Modal */}
      {viewRefund && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-gray-800">Refund Details</h3>
                <p className="text-[12px] text-[#0A6C54] font-semibold mt-0.5">{viewRefund.refundNo}</p>
              </div>
              <button onClick={() => setViewRefund(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Status bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {statusFlow.map((st, i) => {
                  const currentIdx = statusFlow.indexOf(viewRefund.status);
                  const isActive = st === viewRefund.status;
                  const isDone = i < currentIdx;
                  return (
                    <React.Fragment key={st}>
                      <div className={`flex-shrink-0 flex flex-col items-center gap-1`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold
                          ${isActive ? 'bg-[#0A6C54] text-white' : isDone ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                          {isDone ? '✓' : i + 1}
                        </div>
                        <span className={`text-[9px] font-semibold whitespace-nowrap ${isActive ? 'text-[#0A6C54]' : isDone ? 'text-green-600' : 'text-gray-400'}`}>{st}</span>
                      </div>
                      {i < statusFlow.length - 1 && <div className={`flex-1 h-0.5 min-w-[12px] ${i < currentIdx ? 'bg-green-300' : 'bg-gray-100'}`} />}
                    </React.Fragment>
                  );
                })}
                {viewRefund.status === 'Rejected' && (
                  <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold bg-red-100 text-red-600">✕</div>
                    <span className="text-[9px] font-semibold text-red-500">Rejected</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Student Name', viewRefund.name],
                  ['Enrollment No.', viewRefund.enrollNo],
                  ['Course', viewRefund.course],
                  ['Reason', viewRefund.reason],
                  ['Request Date', formatDate(viewRefund.requestDate)],
                  ['Payment Mode', viewRefund.payMode],
                  ['Bank / UPI Details', viewRefund.bankDetails || 'N/A'],
                  ['Txn Reference', viewRefund.txnRef || 'N/A'],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
                    <p className="text-[13px] font-semibold text-gray-800 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Total Paid</p>
                  <p className="text-[18px] font-black text-gray-800 mt-1">₹{(viewRefund.totalPaid || 0).toLocaleString()}</p>
                </div>
                <div className="text-center border-x border-green-100">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Deduction</p>
                  <p className="text-[18px] font-black text-red-500 mt-1">-₹{(viewRefund.deduction || 0).toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Refund Amount</p>
                  <p className="text-[18px] font-black text-[#0A6C54] mt-1">₹{(viewRefund.refundAmount || 0).toLocaleString()}</p>
                </div>
              </div>

              {/* Quick action buttons in view modal */}
              {viewRefund.status !== 'Completed' && viewRefund.status !== 'Rejected' && (
                <div className="flex gap-2 pt-1">
                  {viewRefund.status === 'Requested' && (
                    <>
                      <button onClick={() => handleUpdateStatus(viewRefund._id, 'Under Review')} className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[12px] font-semibold rounded-lg transition-colors">
                        Mark Under Review
                      </button>
                      <button onClick={() => handleUpdateStatus(viewRefund._id, 'Rejected')} className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-[12px] font-semibold rounded-lg transition-colors">
                        Reject
                      </button>
                    </>
                  )}
                  {viewRefund.status === 'Under Review' && (
                    <>
                      <button onClick={() => handleUpdateStatus(viewRefund._id, 'Approved')} className="flex-1 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 text-[12px] font-semibold rounded-lg transition-colors">
                        Approve Refund
                      </button>
                      <button onClick={() => handleUpdateStatus(viewRefund._id, 'Rejected')} className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-[12px] font-semibold rounded-lg transition-colors">
                        Reject
                      </button>
                    </>
                  )}
                  {viewRefund.status === 'Approved' && (
                    <button onClick={() => handleUpdateStatus(viewRefund._id, 'Processing')} className="flex-1 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-[12px] font-semibold rounded-lg transition-colors">
                      Start Processing
                    </button>
                  )}
                  {viewRefund.status === 'Processing' && (
                    <button onClick={() => handleUpdateStatus(viewRefund._id, 'Completed')} className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[12px] font-semibold rounded-lg transition-colors">
                      ✓ Mark Completed (Refund Disbursed)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Refunds;
