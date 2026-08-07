import React, { useState, useEffect } from 'react';
import {
  Plus, Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  FileText, ChevronRight, X, Send, Loader2, ClipboardList,
  CalendarDays, BookOpen, Stethoscope, User, Timer, Info
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const STATUS_CONFIG = {
  Approved: {
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle,
    gradient: 'from-emerald-500/10 to-emerald-500/5',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  Pending: {
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-400',
    icon: Clock,
    gradient: 'from-amber-500/10 to-amber-500/5',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  Rejected: {
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
    icon: XCircle,
    gradient: 'from-red-500/10 to-red-500/5',
    badge: 'bg-red-100 text-red-700 border-red-200',
  },
};

const LEAVE_TYPES = [
  { value: 'Medical Leave', label: 'Medical Leave', icon: Stethoscope, desc: 'Illness or health-related absence' },
  { value: 'Personal Leave', label: 'Personal Leave', icon: User, desc: 'Personal or family matters' },
  { value: 'Academic Leave', label: 'Academic Leave', icon: BookOpen, desc: 'Seminars, workshops, events' },
  { value: 'Emergency Leave', label: 'Emergency Leave', icon: AlertCircle, desc: 'Urgent unforeseen circumstances' },
];

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

const getDays = (from, to) => {
  if (!from || !to) return 1;
  const diff = Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24));
  return diff >= 1 ? diff : 1;
};

const LeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedLeave, setSelectedLeave] = useState(null);

  const [newLeave, setNewLeave] = useState({
    type: 'Medical Leave',
    reason: '',
    fromDate: '',
    toDate: '',
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/student-portal/leaves');
      setLeaves(res.data || []);
    } catch {
      toast.error('Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!newLeave.reason.trim()) return toast.error('Please provide a reason');
    if (!newLeave.fromDate) return toast.error('Please select start date');
    setSubmitting(true);
    try {
      await axiosInstance.post('/student-portal/leaves', {
        reason: newLeave.reason,
        duration: newLeave.type,
        fromDate: newLeave.fromDate,
        toDate: newLeave.toDate || newLeave.fromDate,
      });
      setShowModal(false);
      setNewLeave({ type: 'Medical Leave', reason: '', fromDate: '', toDate: '' });
      toast.success('Leave application submitted successfully!');
      fetchLeaves();
    } catch {
      toast.error('Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const filters = ['All', 'Pending', 'Approved', 'Rejected'];
  const filtered = activeFilter === 'All' ? leaves : leaves.filter(l => l.status === activeFilter);

  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'Pending').length,
    approved: leaves.filter(l => l.status === 'Approved').length,
    rejected: leaves.filter(l => l.status === 'Rejected').length,
  };

  return (
    <div className="flex flex-col h-full font-['Inter'] bg-[#f8faf9]" style={{ minHeight: 0 }}>

      {/* ── Top Header ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 pt-5 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-[#0A6C54]/10 flex items-center justify-center">
                <ClipboardList size={16} className="text-[#0A6C54]" />
              </div>
              <h2 className="text-[17px] font-bold text-gray-900">My Leave Applications</h2>
            </div>
            <p className="text-[12px] text-gray-400 font-medium ml-10">Submit and track your academic leave requests</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-[#0A6C54] hover:bg-[#085a46] active:scale-95 text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold shadow-md shadow-[#0A6C54]/20 transition-all duration-150"
          >
            <Plus size={15} strokeWidth={2.5} />
            New Request
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 sm:mt-5">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-700', bg: 'bg-gray-50 border-gray-100' },
            { label: 'Pending', value: stats.pending, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' },
            { label: 'Approved', value: stats.approved, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-700', bg: 'bg-red-50 border-red-100' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border rounded-xl px-3 py-2.5 text-center`}>
              <div className={`text-[20px] font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[11px] text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-5">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 border ${
                activeFilter === f
                  ? 'bg-[#0A6C54] text-white border-[#0A6C54] shadow-sm'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-[#0A6C54]/40 hover:text-[#0A6C54]'
              }`}
            >
              {f}
              {f !== 'All' && stats[f.toLowerCase()] > 0 && (
                <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeFilter === f ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {stats[f.toLowerCase()]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
            <Loader2 size={28} className="text-[#0A6C54] animate-spin" />
            <SkeletonLoader type="table" rows={5} cols={5} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <FileText size={28} className="text-gray-300" />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-semibold text-gray-600">No applications found</p>
              <p className="text-[12px] text-gray-400 mt-1">
                {activeFilter === 'All' ? 'Submit your first leave request.' : `No ${activeFilter.toLowerCase()} requests.`}
              </p>
            </div>
            {activeFilter === 'All' && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-1 flex items-center gap-2 text-[13px] font-semibold text-[#0A6C54] border border-[#0A6C54]/30 px-4 py-2 rounded-lg hover:bg-[#0A6C54]/5 transition-colors"
              >
                <Plus size={14} /> Create Request
              </button>
            )}
          </div>
        ) : (
          filtered.map(item => {
            const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.Pending;
            const StatusIcon = cfg.icon;
            const days = getDays(item.fromDate, item.toDate);
            return (
              <div
                key={item._id}
                onClick={() => setSelectedLeave(item)}
                className="bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer hover:shadow-md hover:border-[#0A6C54]/20 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`mt-0.5 w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.gradient} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon size={18} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${cfg.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                          {item.status}
                        </span>
                        {item.leaveType && (
                          <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
                            {item.leaveType}
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] font-semibold text-gray-800 leading-snug line-clamp-2 mb-2">
                        {item.reason}
                      </p>
                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                          <CalendarDays size={12} />
                          {formatDate(item.fromDate)}
                          {item.toDate && item.toDate !== item.fromDate && (
                            <><span className="text-gray-300">→</span>{formatDate(item.toDate)}</>
                          )}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                          <Timer size={12} />
                          {days} day{days > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-[#0A6C54] transition-colors mt-3 flex-shrink-0" />
                </div>

                {item.status === 'Rejected' && item.rejectionReason && (
                  <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <Info size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-red-600 font-medium leading-snug">{item.rejectionReason}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── NEW LEAVE MODAL ──────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-[#0A6C54] to-[#0d8c6b] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <ClipboardList size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-white">New Leave Request</h3>
                  <p className="text-[11px] text-white/70 font-medium">Fill in the details below</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <X size={16} className="text-white" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleApply} className="p-5 space-y-4">
              {/* Leave Type */}
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-2">Leave Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {LEAVE_TYPES.map(lt => {
                    const LtIcon = lt.icon;
                    const selected = newLeave.type === lt.value;
                    return (
                      <button
                        key={lt.value}
                        type="button"
                        onClick={() => setNewLeave({ ...newLeave, type: lt.value })}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition-all duration-150 ${
                          selected ? 'border-[#0A6C54] bg-[#0A6C54]/5' : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          selected ? 'bg-[#0A6C54] text-white' : 'bg-white text-gray-400'
                        }`}>
                          <LtIcon size={14} />
                        </div>
                        <div>
                          <div className={`text-[11px] font-bold leading-tight ${selected ? 'text-[#0A6C54]' : 'text-gray-700'}`}>
                            {lt.label}
                          </div>
                          <div className="text-[10px] text-gray-400 font-medium mt-0.5 leading-tight">{lt.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1.5">From Date <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      required
                      value={newLeave.fromDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setNewLeave({ ...newLeave, fromDate: e.target.value })}
                      className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1.5">To Date</label>
                  <div className="relative">
                    <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={newLeave.toDate}
                      min={newLeave.fromDate || new Date().toISOString().split('T')[0]}
                      onChange={e => setNewLeave({ ...newLeave, toDate: e.target.value })}
                      className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Days preview */}
              {newLeave.fromDate && (
                <div className="flex items-center gap-2 bg-[#0A6C54]/5 border border-[#0A6C54]/15 rounded-xl px-3 py-2">
                  <Timer size={14} className="text-[#0A6C54]" />
                  <span className="text-[12px] font-semibold text-[#0A6C54]">
                    Duration: {getDays(newLeave.fromDate, newLeave.toDate || newLeave.fromDate)} day{getDays(newLeave.fromDate, newLeave.toDate || newLeave.fromDate) > 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Reason / Remarks <span className="text-red-400">*</span></label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the reason for your leave request..."
                  value={newLeave.reason}
                  onChange={e => setNewLeave({ ...newLeave, reason: e.target.value })}
                  className="w-full px-3.5 py-3 border border-gray-200 rounded-xl text-[13px] text-gray-700 placeholder:text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all leading-relaxed"
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-[10px] font-medium ${newLeave.reason.length > 200 ? 'text-red-400' : 'text-gray-300'}`}>
                    {newLeave.reason.length}/250
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] disabled:opacity-60 text-white rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#0A6C54]/20 transition-all active:scale-95"
                >
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DETAIL MODAL ──────────────────────────────────────── */}
      {selectedLeave && (() => {
        const cfg = STATUS_CONFIG[selectedLeave.status] || STATUS_CONFIG.Pending;
        const StatusIcon = cfg.icon;
        const days = getDays(selectedLeave.fromDate, selectedLeave.toDate);
        return (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
              <div className={`bg-gradient-to-br ${cfg.gradient} border-b ${cfg.border} px-5 py-5`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-white border ${cfg.border} flex items-center justify-center shadow-sm`}>
                      <StatusIcon size={20} className={cfg.color} />
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${cfg.color}`}>{selectedLeave.status}</span>
                      <p className="text-[14px] font-bold text-gray-900 mt-0.5">{selectedLeave.leaveType || 'Medical Leave'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLeave(null)}
                    className="w-8 h-8 rounded-lg bg-white/60 hover:bg-white flex items-center justify-center transition-colors"
                  >
                    <X size={15} className="text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Reason</p>
                    <p className="text-[13px] font-semibold text-gray-800 leading-relaxed">{selectedLeave.reason}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">From</p>
                      <p className="text-[13px] font-semibold text-gray-700">{formatDate(selectedLeave.fromDate)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">To</p>
                      <p className="text-[13px] font-semibold text-gray-700">{formatDate(selectedLeave.toDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2">
                    <Timer size={13} className="text-gray-400" />
                    <span className="text-[12px] font-semibold text-gray-600">{days} day{days > 1 ? 's' : ''} total</span>
                  </div>
                </div>

                {selectedLeave.status === 'Rejected' && selectedLeave.rejectionReason && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3">
                    <Info size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide mb-0.5">Rejection Reason</p>
                      <p className="text-[12px] text-red-600 font-medium">{selectedLeave.rejectionReason}</p>
                    </div>
                  </div>
                )}

                {selectedLeave.status === 'Approved' && selectedLeave.approvedBy && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-3">
                    <CheckCircle size={14} className="text-emerald-500" />
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Approved by</p>
                      <p className="text-[12px] text-emerald-700 font-semibold">{selectedLeave.approvedBy}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setSelectedLeave(null)}
                  className="w-full py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-xl text-[13px] font-semibold transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default LeaveRequests;

