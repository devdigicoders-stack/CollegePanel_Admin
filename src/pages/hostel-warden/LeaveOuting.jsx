import React, { useState, useEffect } from 'react';
import { Search, Download, Check, X, Plus, Clock, FileText, CheckCircle2, XCircle, AlertTriangle, User, Calendar, MapPin, Phone, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { checkPermission } from '../../utils/checkPermission';
import SkeletonLoader from '../../components/SkeletonLoader';

const STATUS_COLORS = {
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200'
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
    studentId: '',
    type: 'Leave',
    fromDate: '',
    toDate: '',
    reason: '',
    destination: '',
    emergencyContact: ''
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
    const reason = (r.reason || '').toLowerCase();
    const destination = (r.destination || '').toLowerCase();
    const q = search.toLowerCase();

    const matchSearch = name.includes(q) || enrollNo.includes(q) || reason.includes(q) || destination.includes(q);
    const matchType = filterType === 'All' || r.type === filterType;
    const matchStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  // ── Approve Action with Optional Remarks ────────────────────────
  const handleApprove = async (item) => {
    const { value: remarks, isConfirmed } = await Swal.fire({
      title: 'Approve Leave Request?',
      html: `
        <div class="text-left text-[13px] space-y-2 mb-3">
          <p><strong>Student:</strong> ${item.studentId?.studentName || 'Student'} (${item.studentId?.studentId || ''})</p>
          <p><strong>Type:</strong> ${item.type} | <strong>From:</strong> ${fmtDate(item.fromDate)} to ${fmtDate(item.toDate)}</p>
          <p><strong>Purpose:</strong> ${item.reason || 'N/A'}</p>
        </div>
      `,
      input: 'text',
      inputPlaceholder: 'Optional warden instructions (e.g. Return before 8 PM, parent verified)...',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Approve',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280'
    });

    if (!isConfirmed) return;

    try {
      const res = await axiosInstance.put(`/hostel/leaves/${item._id}/status`, {
        status: 'Approved',
        remarks: remarks || ''
      });
      const updated = res.data.leave || { ...item, status: 'Approved', remarks };
      setRequests(prev => prev.map(r => r._id === item._id ? updated : r));
      if (viewItem && viewItem._id === item._id) setViewItem(updated);
      window.dispatchEvent(new Event('hostel_leave_updated'));
      toast.success(`Leave request approved for ${item.studentId?.studentName}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error approving leave');
    }
  };

  // ── Reject Action with Required Rejection Reason ─────────────────
  const handleReject = async (item) => {
    const { value: rejectionReason, isConfirmed } = await Swal.fire({
      title: 'Reject Leave Request?',
      html: `
        <div class="text-left text-[13px] space-y-2 mb-3">
          <p>Reject leave for <strong>${item.studentId?.studentName}</strong> (${item.studentId?.studentId || ''})</p>
          <p class="text-gray-500 text-[12px]">Please provide a reason so the student understands why it was rejected:</p>
        </div>
      `,
      input: 'textarea',
      inputPlaceholder: 'Reason for rejection (e.g. Upcoming exams, parent phone verification pending, curfew violation)...',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Please provide a rejection reason for the student!';
        }
      },
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Reject Request',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    });

    if (!isConfirmed) return;

    try {
      const res = await axiosInstance.put(`/hostel/leaves/${item._id}/status`, {
        status: 'Rejected',
        rejectionReason: rejectionReason.trim()
      });
      const updated = res.data.leave || { ...item, status: 'Rejected', rejectionReason: rejectionReason.trim() };
      setRequests(prev => prev.map(r => r._id === item._id ? updated : r));
      if (viewItem && viewItem._id === item._id) setViewItem(updated);
      window.dispatchEvent(new Event('hostel_leave_updated'));
      toast.success(`Leave request rejected for ${item.studentId?.studentName}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error rejecting leave');
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
      window.dispatchEvent(new Event('hostel_leave_updated'));
      toast.success('Leave request created successfully');
      setShowAddModal(false);
      setNewLeave({
        studentId: '',
        type: 'Leave',
        fromDate: '',
        toDate: '',
        reason: '',
        destination: '',
        emergencyContact: ''
      });
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
      'Course': r.studentId?.course || 'N/A',
      'Phone': r.studentId?.phone || 'N/A',
      'Type': r.type,
      'From Date': r.fromDate ? new Date(r.fromDate).toLocaleDateString('en-IN') : '',
      'To Date': r.toDate ? new Date(r.toDate).toLocaleDateString('en-IN') : '',
      'Destination': r.destination || '',
      'Emergency Contact': r.emergencyContact || '',
      'Reason': r.reason || '',
      'Status': r.status,
      'Warden Remarks': r.remarks || '',
      'Rejection Reason': r.rejectionReason || '',
      'Action By': r.actionBy || '',
      'Applied On': r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leave-Outing');
    XLSX.writeFile(wb, `Hostel_Leave_Outing_${filterStatus}.xlsx`);
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  // ── Permissions ───────────────────────────────────────────────────
  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const userRole = adminInfo.role || 'college_admin';
  const canEdit = checkPermission('Manage Allocations') || userRole === 'Hostel Warden' || userRole === 'Principal' || userRole === 'college_admin' || userRole === 'Admin';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-bold text-gray-800 font-['Outfit']">Hostel Leave & Outing Approvals</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Review, approve, or reject student night-out and daytime pass requests</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Excel
          </button>
          {canEdit && (
            <button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors shadow-sm">
              <Plus size={15} /> New Request
            </button>
          )}
        </div>
      </div>

      {/* Interactive KPI Stat Cards */}
      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50/20">
        <button
          onClick={() => setFilterStatus('All')}
          className={`p-3 rounded-xl border text-left transition-all ${filterStatus === 'All' ? 'bg-indigo-50/60 border-indigo-200 ring-2 ring-indigo-500/20' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Total Requests</p>
            <FileText size={16} className="text-indigo-500" />
          </div>
          <p className="text-[20px] font-bold text-gray-800 mt-1">{requests.length}</p>
        </button>

        <button
          onClick={() => setFilterStatus('Pending')}
          className={`p-3 rounded-xl border text-left transition-all ${filterStatus === 'Pending' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-amber-700 font-semibold uppercase tracking-wider">Pending Action</p>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-[20px] font-bold text-amber-700 mt-1">{pendingCount}</p>
        </button>

        <button
          onClick={() => setFilterStatus('Approved')}
          className={`p-3 rounded-xl border text-left transition-all ${filterStatus === 'Approved' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider">Approved</p>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-[20px] font-bold text-emerald-700 mt-1">{approvedCount}</p>
        </button>

        <button
          onClick={() => setFilterStatus('Rejected')}
          className={`p-3 rounded-xl border text-left transition-all ${filterStatus === 'Rejected' ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-rose-700 font-semibold uppercase tracking-wider">Rejected</p>
            <XCircle size={16} className="text-rose-500" />
          </div>
          <p className="text-[20px] font-bold text-rose-700 mt-1">{rejectedCount}</p>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-3 bg-gray-50/40">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, enrollment no, purpose, destination..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-2 border border-gray-200 rounded-lg text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
          >
            <option value="All">All Types</option>
            <option value="Leave">Leave (Days)</option>
            <option value="Outing">Outing (Hours)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border border-gray-200 rounded-lg text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Only</option>
            <option value="Approved">Approved Only</option>
            <option value="Rejected">Rejected Only</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-6">
            <SkeletonLoader type="table" rows={6} cols={7} />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-6">Student Details</th>
                <th className="py-3 px-4">Pass Type</th>
                <th className="py-3 px-4">Leave Duration</th>
                <th className="py-3 px-4">Reason & Destination</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Review Details</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[13px]">
              {filtered.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[12px]">
                        {(item.studentId?.studentName || 'S').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{item.studentId?.studentName || 'Student'}</p>
                        <p className="text-[11px] text-gray-400 font-mono">{item.studentId?.studentId || '—'} {item.studentId?.course ? `• ${item.studentId.course}` : ''}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${item.type === 'Leave' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                      {item.type}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-medium text-gray-800 text-[12px]">{fmtDate(item.fromDate)} → {fmtDate(item.toDate)}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Applied: {fmtDate(item.createdAt)}</p>
                  </td>

                  <td className="py-3.5 px-4 max-w-[240px]">
                    <p className="text-[12px] text-gray-800 line-clamp-1 font-medium">{item.reason}</p>
                    {item.destination ? (
                      <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-gray-400 shrink-0" />
                        <span className="truncate">{item.destination}</span>
                      </p>
                    ) : null}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${STATUS_COLORS[item.status]}`}>
                      {item.status === 'Approved' && <Check size={12} />}
                      {item.status === 'Rejected' && <X size={12} />}
                      {item.status === 'Pending' && <Clock size={12} />}
                      {item.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 max-w-[200px]">
                    {item.status === 'Rejected' && item.rejectionReason ? (
                      <div className="text-[11px] text-rose-700 bg-rose-50/80 px-2 py-1 rounded border border-rose-100 line-clamp-2" title={item.rejectionReason}>
                        <strong>Reason:</strong> {item.rejectionReason}
                      </div>
                    ) : item.status === 'Approved' && item.remarks ? (
                      <div className="text-[11px] text-emerald-700 bg-emerald-50/80 px-2 py-1 rounded border border-emerald-100 line-clamp-2" title={item.remarks}>
                        <strong>Remark:</strong> {item.remarks}
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400">{item.actionBy ? `By ${item.actionBy}` : 'Pending review'}</span>
                    )}
                  </td>

                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Details button */}
                      <button
                        onClick={() => setViewItem(item)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                        title="View Full Details"
                      >
                        <FileText size={15} />
                      </button>

                      {/* Quick Approve / Reject for Pending */}
                      {canEdit && item.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(item)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[12px] font-semibold flex items-center gap-1 transition-colors"
                            title="Approve Request"
                          >
                            <Check size={13} /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(item)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[12px] font-semibold flex items-center gap-1 transition-colors"
                            title="Reject Request"
                          >
                            <X size={13} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400 text-[13px]">
                    {requests.length === 0 ? 'No leave requests recorded yet.' : 'No requests match your current filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {requests.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 text-[12px] text-gray-400 flex items-center justify-between">
          <span>Showing {filtered.length} of {requests.length} total requests</span>
          <span className="text-[11px]">Tip: Click "Approve" or "Reject" to review requests directly</span>
        </div>
      )}

      {/* ── Add Leave/Outing Modal ──────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Create Leave / Outing Request</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleAddLeave} className="p-6 space-y-4">
              {/* Student select */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Student (Hostel Allotted) *</label>
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
                        {a.studentId?.studentName} — {a.studentId?.studentId} ({a.roomId?.blockName} {a.roomId?.roomNumber})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Pass Type *</label>
                <div className="flex gap-3">
                  {['Leave', 'Outing'].map(t => (
                    <button
                      key={t} type="button"
                      onClick={() => setNewLeave({ ...newLeave, type: t })}
                      className={`flex-1 py-2 rounded-lg text-[13px] font-semibold border transition-colors ${newLeave.type === t ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {t} {t === 'Leave' ? '(Multi-day/Home)' : '(Daytime/Hours)'}
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

              {/* Destination & Emergency Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Destination / Place</label>
                  <input
                    type="text"
                    value={newLeave.destination}
                    onChange={(e) => setNewLeave({ ...newLeave, destination: e.target.value })}
                    placeholder="e.g. Home, Lucknow"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Emergency Contact</label>
                  <input
                    type="tel"
                    value={newLeave.emergencyContact}
                    onChange={(e) => setNewLeave({ ...newLeave, emergencyContact: e.target.value })}
                    placeholder="Parent mobile no."
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Detailed Reason / Purpose *</label>
                <textarea
                  required
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  placeholder="Reason for outing/leave..."
                  rows={3}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold shadow-sm">
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Detail Modal ───────────────────────────────────── */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                <h3 className="font-bold text-gray-800 text-[15px]">Leave Application Review</h3>
              </div>
              <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>

            <div className="p-6 space-y-4 text-[13px] max-h-[80vh] overflow-y-auto">
              {/* Student header card */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-800 text-[14px]">{viewItem.studentId?.studentName}</h4>
                  <p className="text-[12px] text-gray-500 font-mono mt-0.5">
                    {viewItem.studentId?.studentId} • {viewItem.studentId?.course || 'Student'}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${STATUS_COLORS[viewItem.status]}`}>
                  {viewItem.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Pass Type</span>
                  <span className="font-bold text-gray-800 text-[13px]">{viewItem.type}</span>
                </div>
                <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Applied On</span>
                  <span className="font-semibold text-gray-800">{fmtDate(viewItem.createdAt)}</span>
                </div>
                <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Departure Date</span>
                  <span className="font-semibold text-gray-800">{fmtDate(viewItem.fromDate)}</span>
                </div>
                <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Return Date</span>
                  <span className="font-semibold text-gray-800">{fmtDate(viewItem.toDate)}</span>
                </div>
              </div>

              {/* Destination & Emergency contact */}
              {(viewItem.destination || viewItem.emergencyContact) && (
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 space-y-1 text-[12px]">
                  {viewItem.destination && (
                    <p className="text-gray-700 flex items-center gap-1.5">
                      <MapPin size={13} className="text-blue-600 shrink-0" />
                      <strong>Destination:</strong> {viewItem.destination}
                    </p>
                  )}
                  {viewItem.emergencyContact && (
                    <p className="text-gray-700 flex items-center gap-1.5">
                      <Phone size={13} className="text-blue-600 shrink-0" />
                      <strong>Emergency Phone:</strong> {viewItem.emergencyContact}
                    </p>
                  )}
                </div>
              )}

              {/* Reason */}
              <div>
                <p className="text-gray-500 font-medium text-[11px] mb-1 uppercase tracking-wider">Purpose / Reason</p>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg text-[12px] leading-relaxed border border-gray-100">
                  {viewItem.reason || '—'}
                </p>
              </div>

              {/* Review status feedback */}
              {viewItem.status === 'Approved' && (
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[12px] mb-1">
                    <CheckCircle2 size={15} /> Approved by {viewItem.actionBy || 'Hostel Warden'}
                  </div>
                  {viewItem.remarks && (
                    <p className="text-emerald-700 text-[12px] mt-1">
                      <strong>Instructions:</strong> {viewItem.remarks}
                    </p>
                  )}
                  {viewItem.actionDate && (
                    <p className="text-emerald-600/70 text-[10px] mt-1">Reviewed on {fmtDateTime(viewItem.actionDate)}</p>
                  )}
                </div>
              )}

              {viewItem.status === 'Rejected' && (
                <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200">
                  <div className="flex items-center gap-1.5 text-rose-800 font-bold text-[12px] mb-1">
                    <XCircle size={15} /> Rejected by {viewItem.actionBy || 'Hostel Warden'}
                  </div>
                  {viewItem.rejectionReason && (
                    <p className="text-rose-700 text-[12px] mt-1">
                      <strong>Rejection Reason:</strong> {viewItem.rejectionReason}
                    </p>
                  )}
                  {viewItem.actionDate && (
                    <p className="text-rose-600/70 text-[10px] mt-1">Reviewed on {fmtDateTime(viewItem.actionDate)}</p>
                  )}
                </div>
              )}

              {/* Pending Action Buttons inside modal */}
              {canEdit && viewItem.status === 'Pending' && (
                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleReject(viewItem)}
                    className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <X size={15} /> Reject Request
                  </button>
                  <button
                    onClick={() => handleApprove(viewItem)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Check size={15} /> Approve Request
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
