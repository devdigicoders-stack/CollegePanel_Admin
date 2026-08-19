import { useState, useEffect } from 'react';
import { Search, Download, Check, X, Plus, Clock, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { checkPermission } from '../../utils/checkPermission';
import SkeletonLoader from '../../components/SkeletonLoader';

const STATUS_COLORS = {
  Approved: 'bg-green-50 text-green-700 border-green-100',
  Rejected: 'bg-red-50 text-red-700 border-red-100',
  Pending: 'bg-yellow-50 text-yellow-700 border-yellow-100'
};

const LeaveOuting = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Allotted students for dropdown in Add modal
  const [allocatedStudents, setAllocatedStudents] = useState([]);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLeave, setNewLeave] = useState({
    studentId: '', type: 'Leave',
    fromDate: '', toDate: '', reason: ''
  });

  // Detail modal
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leavesRes, allocRes] = await Promise.all([
        axiosInstance.get('/hostel/leaves'),
        axiosInstance.get('/hostel/allocations')
      ]);
      setRequests(leavesRes.data || []);
      setAllocatedStudents(allocRes.data || []);
    } catch {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  // ── Stats ────────────────────────────────────────────────────────
  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;
  const rejectedCount = requests.filter(r => r.status === 'Rejected').length;

  // ── Filter ────────────────────────────────────────────────────────
  const filtered = requests.filter(r => {
    const name = r.studentId?.studentName?.toLowerCase() || '';
    const enrollNo = r.studentId?.studentId?.toLowerCase() || '';
    const matchSearch = name.includes(search.toLowerCase()) || enrollNo.includes(search.toLowerCase());
    const matchType = filterType === 'All' || r.type === filterType;
    const matchStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  // ── Approve / Reject ──────────────────────────────────────────────
  const handleStatusUpdate = async (id, status) => {
    const item = requests.find(r => r._id === id);
    if (status === 'Rejected') {
      const result = await Swal.fire({
        title: 'Reject Leave Request?',
        html: `Reject leave for <strong>${item?.studentId?.studentName}</strong>?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Reject',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        reverseButtons: true
      });
      if (!result.isConfirmed) return;
    }
    try {
      await axiosInstance.put(`/hostel/leaves/${id}/status`, { status });
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status } : r));
      toast.success(`Leave request ${status.toLowerCase()}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating status');
    }
  };

  // ── Add Leave ─────────────────────────────────────────────────────
  const handleAddLeave = async (e) => {
    e.preventDefault();
    if (!newLeave.studentId) return toast.error('Please select a student');
    if (!newLeave.fromDate || !newLeave.toDate) return toast.error('Please fill in dates');
    if (new Date(newLeave.toDate) < new Date(newLeave.fromDate)) return toast.error('To Date must be after From Date');
    try {
      const res = await axiosInstance.post('/hostel/leaves', newLeave);
      const created = res.data.leave || res.data;
      setRequests(prev => [created, ...prev]);
      toast.success('Leave request created successfully');
      setShowAddModal(false);
      setNewLeave({ studentId: '', type: 'Leave', fromDate: '', toDate: '', reason: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating leave request');
    }
  };

  // ── Export ─────────────────────────────────────────────────────────
  const handleExport = () => {
    if (filtered.length === 0) return toast.error('No data to export');
    const data = filtered.map(r => ({
      'Student Name': r.studentId?.studentName || 'N/A',
      'Enrollment No': r.studentId?.studentId || 'N/A',
      'Type': r.type,
      'From Date': r.fromDate ? new Date(r.fromDate).toLocaleDateString('en-IN') : '',
      'To Date': r.toDate ? new Date(r.toDate).toLocaleDateString('en-IN') : '',
      'Reason': r.reason || '',
      'Status': r.status,
      'Applied On': r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leave-Outing');
    XLSX.writeFile(wb, `Hostel_Leave_Outing_${filterStatus}.xlsx`);
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  // ── Permissions ───────────────────────────────────────────────────
  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const userRole = adminInfo.role || 'college_admin';
  const canEdit = checkPermission('Manage Allocations') || userRole === 'Hostel Warden' || userRole === 'Principal';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Leave & Outing Requests</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Review and approve student leave/outing requests</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export
          </button>
          {canEdit && (
            <button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
              <Plus size={15} /> Add Request
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-3 gap-3">
        <div className="bg-yellow-50 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600"><Clock size={16} /></div>
          <div><p className="text-[10px] text-gray-500 font-medium">Pending</p><p className="text-[17px] font-bold text-yellow-700">{pendingCount}</p></div>
        </div>
        <div className="bg-green-50 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600"><Check size={16} /></div>
          <div><p className="text-[10px] text-gray-500 font-medium">Approved</p><p className="text-[17px] font-bold text-green-700">{approvedCount}</p></div>
        </div>
        <div className="bg-red-50 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600"><X size={16} /></div>
          <div><p className="text-[10px] text-gray-500 font-medium">Rejected</p><p className="text-[17px] font-bold text-red-700">{rejectedCount}</p></div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-3 flex-wrap bg-gray-50/30">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search by student name or enrollment no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
          <option value="All">All Types</option>
          <option value="Leave">Leave Only</option>
          <option value="Outing">Outing Only</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={5} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Type</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">From</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">To</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Reason</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Applied</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-6">
                    <p className="text-[13px] font-bold text-gray-800">{item.studentId?.studentName || 'Unknown'}</p>
                    <p className="text-[11px] text-primary font-semibold">{item.studentId?.studentId}</p>
                  </td>
                  <td className="py-3 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${item.type === 'Leave' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-[13px] text-gray-600">{fmtDate(item.fromDate)}</td>
                  <td className="py-3 px-6 text-[13px] text-gray-600">{fmtDate(item.toDate)}</td>
                  <td className="py-3 px-6 text-[12px] text-gray-500 max-w-[180px]">
                    <p className="truncate" title={item.reason}>{item.reason || '—'}</p>
                  </td>
                  <td className="py-3 px-6 text-[12px] text-gray-400">{fmtDate(item.createdAt)}</td>
                  <td className="py-3 px-6 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${STATUS_COLORS[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex gap-1.5 items-center">
                      {/* View Details */}
                      <button onClick={() => setViewItem(item)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="View Details">
                        <FileText size={14} />
                      </button>
                      {/* Approve/Reject for Pending */}
                      {canEdit && item.status === 'Pending' && (
                        <>
                          <button onClick={() => handleStatusUpdate(item._id, 'Approved')} className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors" title="Approve">
                            <Check size={14} />
                          </button>
                          <button onClick={() => handleStatusUpdate(item._id, 'Rejected')} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors" title="Reject">
                            <X size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-gray-400 text-[13px]">
                    {requests.length === 0 ? 'No leave requests yet.' : 'No requests match your filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {requests.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 text-[12px] text-gray-400">
          Showing {filtered.length} of {requests.length} requests
        </div>
      )}

      {/* ── Add Leave/Outing Modal ──────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Add Leave / Outing Request</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleAddLeave} className="p-6 space-y-4">
              {/* Student select */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Student (Allotted Only) *</label>
                {allocatedStudents.length === 0 ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-[12px] text-yellow-700">
                    ⚠️ No active hostel students found.
                  </div>
                ) : (
                  <select
                    required
                    value={newLeave.studentId}
                    onChange={(e) => setNewLeave({ ...newLeave, studentId: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select student...</option>
                    {allocatedStudents.map(a => (
                      <option key={a.studentId?._id} value={a.studentId?._id}>
                        {a.studentId?.studentName} — {a.studentId?.studentId}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Request Type *</label>
                <div className="flex gap-3">
                  {['Leave', 'Outing'].map(t => (
                    <button
                      key={t} type="button"
                      onClick={() => setNewLeave({ ...newLeave, type: t })}
                      className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold border transition-colors ${newLeave.type === t ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">From Date *</label>
                  <input
                    type="date" required
                    value={newLeave.fromDate}
                    onChange={(e) => setNewLeave({ ...newLeave, fromDate: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">To Date *</label>
                  <input
                    type="date" required
                    min={newLeave.fromDate}
                    value={newLeave.toDate}
                    onChange={(e) => setNewLeave({ ...newLeave, toDate: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Reason *</label>
                <textarea
                  required
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  placeholder="Enter the reason for leave/outing..."
                  rows={3}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Detail Modal ───────────────────────────────────── */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Request Details</h3>
              <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-3 text-[13px]">
              {[
                { label: 'Student', value: viewItem.studentId?.studentName },
                { label: 'Enrollment No', value: viewItem.studentId?.studentId },
                { label: 'Request Type', value: viewItem.type },
                { label: 'From Date', value: fmtDate(viewItem.fromDate) },
                { label: 'To Date', value: fmtDate(viewItem.toDate) },
                { label: 'Applied On', value: fmtDate(viewItem.createdAt) },
                { label: 'Status', value: viewItem.status },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-gray-800">{value || '—'}</span>
                </div>
              ))}
              <div className="pt-1">
                <p className="text-gray-500 mb-1">Reason:</p>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg text-[12px] leading-relaxed">{viewItem.reason || '—'}</p>
              </div>
              {viewItem.status === 'Pending' && (
                <div className="flex gap-3 pt-2">
                  <button onClick={() => { handleStatusUpdate(viewItem._id, 'Rejected'); setViewItem(null); }}
                    className="flex-1 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-lg text-[13px] font-semibold">
                    Reject
                  </button>
                  <button onClick={() => { handleStatusUpdate(viewItem._id, 'Approved'); setViewItem(null); }}
                    className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold">
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveOuting;
