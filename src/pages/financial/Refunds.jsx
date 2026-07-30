import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, ChevronDown, CheckCircle, XCircle, X, Download } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const statusColors = {
  'Requested': 'bg-gray-100 text-gray-700',
  'Under Review': 'bg-blue-100 text-blue-700',
  'Approved': 'bg-green-100 text-green-700',
  'Rejected': 'bg-red-100 text-red-700',
  'Processing': 'bg-orange-100 text-orange-700',
  'Completed': 'bg-emerald-100 text-emerald-700',
};

const Refunds = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [viewRefund, setViewRefund] = useState(null);
  const [loading, setLoading] = useState(true);
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
    try {
      await axiosInstance.post('/fees/refunds', formData);
      toast.success('Refund request submitted successfully');
      setShowModal(false);
      setFormData({ studentId: '', reason: 'Admission Cancellation', refundAmount: '', deduction: '', payMode: 'Bank Transfer', bankDetails: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit refund request');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/fees/refunds/${id}`, { status });
      toast.success(`Refund ${status.toLowerCase()} successfully`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update refund status');
    }
  };

  const totalRefundAmount = data.reduce((sum, r) => sum + (r.refundAmount || 0), 0);
  const pendingCount = data.filter(r => ['Requested', 'Under Review', 'Approved', 'Processing'].includes(r.status)).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Refund Management</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Process and track student fee refunds</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => toast.success('Exporting...')} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">
            <Download size={15} /> Export
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold">
            <Plus size={15} /> New Refund Request
          </button>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Refund Amount', value: `₹${totalRefundAmount.toLocaleString()}`, color: 'bg-orange-50 text-orange-700' },
          { label: 'Pending Refunds', value: pendingCount, color: 'bg-red-50 text-red-700' },
          { label: 'Completed', value: data.filter(r => r.status === 'Completed').length, color: 'bg-green-50 text-green-700' },
          { label: 'Total Requests', value: data.length, color: 'bg-blue-50 text-blue-700' },
        ].map(card => (
          <div key={card.label} className={`${card.color} rounded-xl p-4`}>
            <p className="text-[11px] font-medium mb-1 opacity-80">{card.label}</p>
            <p className="text-[20px] font-bold">{card.value}</p>
          </div>
        ))}
      </div>

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

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={11} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                {['Refund No.', 'Student Name', 'Course', 'Reason', 'Request Date', 'Total Paid', 'Deduction', 'Refund Amount', 'Pay Mode', 'Status', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(r => (
                <tr key={r._id || r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{r.refundNo}</td>
                  <td className="py-3 px-4">
                    <p className="text-[13px] font-medium text-gray-800">{r.name}</p>
                    <p className="text-[11px] text-gray-500">{r.enrollNo}</p>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{r.course}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-700">{r.reason}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{r.requestDate}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-700">₹{(r.totalPaid || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] text-red-600">₹{(r.deduction || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] font-semibold text-green-700">₹{(r.refundAmount || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{r.payMode}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => setViewRefund(r)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye size={14} className="text-gray-500" /></button>
                      {r.status === 'Requested' && (
                        <>
                          <button onClick={() => handleUpdateStatus(r._id || r.id, 'Approved')} className="p-1.5 hover:bg-green-100 rounded-lg"><CheckCircle size={14} className="text-green-600" /></button>
                          <button onClick={() => handleUpdateStatus(r._id || r.id, 'Rejected')} className="p-1.5 hover:bg-red-100 rounded-lg"><XCircle size={14} className="text-red-600" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && data.length === 0 && (
                <tr><td colSpan={11} className="py-8 text-center text-gray-500 text-[13px]">No refunds found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-800">New Refund Request</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Student Enrollment No.</label>
                <input type="text" placeholder="e.g. OP/24/CE/001" value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Refund Reason</label>
                <div className="relative">
                  <select value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value})} className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {['Admission Cancellation', 'Duplicate Payment', 'Excess Payment', 'Hostel Cancellation', 'Transport Cancellation', 'Security Deposit', 'Other'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Refund Amount (₹)</label>
                <input type="number" placeholder="Enter amount" value={formData.refundAmount} onChange={e => setFormData({ ...formData, refundAmount: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Deduction Amount (₹)</label>
                <input type="number" placeholder="Enter deduction" value={formData.deduction} onChange={e => setFormData({ ...formData, deduction: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Payment Mode</label>
                <div className="relative">
                  <select value={formData.payMode} onChange={e => setFormData({ ...formData, payMode: e.target.value})} className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {['Bank Transfer', 'UPI', 'Cheque', 'Cash', 'DD'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Bank / UPI Details</label>
                <input type="text" placeholder="Bank name, account no. or UPI ID" value={formData.bankDetails} onChange={e => setFormData({ ...formData, bankDetails: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewRefund && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-800">Refund Details - {viewRefund.refundNo}</h3>
              <button onClick={() => setViewRefund(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Student', viewRefund.name], ['Enrollment No.', viewRefund.enrollNo],
                  ['Course', viewRefund.course], ['Reason', viewRefund.reason],
                  ['Request Date', viewRefund.requestDate], ['Payment Mode', viewRefund.payMode],
                  ['Bank Details', viewRefund.bankDetails], ['Txn Reference', viewRefund.txnRef || 'N/A'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[11px] text-gray-500">{label}</p>
                    <p className="text-[13px] font-semibold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-[11px] text-gray-500">Total Paid</p>
                  <p className="text-[16px] font-bold text-gray-800">₹{(viewRefund.totalPaid || 0).toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-gray-500">Deduction</p>
                  <p className="text-[16px] font-bold text-red-600">₹{(viewRefund.deduction || 0).toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-gray-500">Refund Amount</p>
                  <p className="text-[16px] font-bold text-green-700">₹{(viewRefund.refundAmount || 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-gray-700">Status:</span>
                <span className={`px-3 py-1 rounded-full text-[12px] font-semibold ${statusColors[viewRefund.status]}`}>{viewRefund.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Refunds;


