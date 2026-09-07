import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, CheckCircle2, XCircle, Clock, Home, Calendar, MapPin, Phone, AlertCircle, Filter, Sparkles, ArrowRight, RefreshCw, MessageSquare } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const STATUS_CONFIG = {
  Approved: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
    text: 'Approved by Warden'
  },
  Rejected: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: XCircle,
    text: 'Rejected'
  },
  Pending: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
    text: 'Awaiting Warden Approval'
  }
};

const Hostel = () => {
  const [allocation, setAllocation] = useState(null);
  const [outings, setOutings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterTab, setFilterTab] = useState('All');

  const [newOuting, setNewOuting] = useState({
    type: 'Outing',
    purpose: '',
    destination: '',
    emergencyContact: '',
    fromDate: '',
    toDate: ''
  });

  useEffect(() => {
    fetchHostelDetails();
  }, []);

  const fetchHostelDetails = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/student-portal/hostel');
      setAllocation(res.data.allocation || null);

      const combined = [
        ...(res.data.leaves || []).map(l => ({ ...l, recordType: 'Leave' })),
        ...(res.data.gatepasses || []).map(g => ({ ...g, recordType: 'Gatepass' }))
      ].sort((a, b) => new Date(b.createdAt || b.fromDate || b.passDate) - new Date(a.createdAt || a.fromDate || a.passDate));

      setOutings(combined);
    } catch (error) {
      toast.error('Failed to fetch hostel details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!newOuting.purpose.trim()) {
      return toast.error('Please enter a detailed reason or purpose');
    }
    if (!newOuting.fromDate || !newOuting.toDate) {
      return toast.error('Please select both departure and return dates/times');
    }
    if (new Date(newOuting.toDate) <= new Date(newOuting.fromDate)) {
      return toast.error('Return date/time must be after departure date/time');
    }

    try {
      setSubmitting(true);
      const res = await axiosInstance.post('/student-portal/hostel/leaves', {
        type: newOuting.type,
        duration: newOuting.type,
        reason: newOuting.purpose.trim(),
        destination: newOuting.destination ? newOuting.destination.trim() : '',
        emergencyContact: newOuting.emergencyContact ? newOuting.emergencyContact.trim() : '',
        fromDate: newOuting.fromDate,
        toDate: newOuting.toDate
      });

      toast.success(res.data?.message || 'Outing/Leave request submitted to Warden for approval!');
      setShowModal(false);
      setNewOuting({
        type: 'Outing',
        purpose: '',
        destination: '',
        emergencyContact: '',
        fromDate: '',
        toDate: ''
      });
      fetchHostelDetails();
      window.dispatchEvent(new Event('hostel_leave_updated'));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit leave application');
    } finally {
      setSubmitting(false);
    }
  };

  const fmtDateTime = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Stats
  const totalCount = outings.length;
  const pendingCount = outings.filter(o => o.status === 'Pending').length;
  const approvedCount = outings.filter(o => o.status === 'Approved' || o.status === 'Returned').length;
  const rejectedCount = outings.filter(o => o.status === 'Rejected').length;

  // Filtered List
  const filteredOutings = outings.filter(item => {
    if (filterTab === 'All') return true;
    if (filterTab === 'Pending') return item.status === 'Pending';
    if (filterTab === 'Approved') return item.status === 'Approved' || item.status === 'Returned';
    if (filterTab === 'Rejected') return item.status === 'Rejected';
    if (filterTab === 'Leave') return item.type === 'Leave';
    if (filterTab === 'Outing') return item.type === 'Outing';
    return true;
  });

  if (loading) {
    return (
      <div className="p-6">
        <SkeletonLoader type="table" rows={6} cols={5} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] font-bold text-gray-800 font-['Outfit']">My Hostel Room & Outing Passes</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
              Active Hostelite
            </span>
          </div>
          <p className="text-[12px] text-gray-500 mt-1 font-medium">
            Verify allocated room details, apply for leave or outing passes, and track live warden approval status
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-95"
        >
          <Plus size={16} /> Apply for Outing / Leave Pass
        </button>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
        {/* Room Allocation Info Banner */}
        <div className="p-5 border border-primary/15 rounded-2xl bg-gradient-to-r from-primary/[0.04] to-indigo-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
              <Home size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-gray-900 text-[15px] font-['Outfit']">Allocated Hostel Residence</h4>
                {allocation && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                    {allocation.status || 'Active'}
                  </span>
                )}
              </div>
              {allocation ? (
                <p className="text-[13px] text-gray-600 mt-1">
                  <strong>Block:</strong> {allocation.roomId?.blockName || 'N/A'} • <strong>Room No:</strong> {allocation.roomId?.roomNumber || 'N/A'} • <strong>Type:</strong> {allocation.roomId?.type || 'Standard'}
                </p>
              ) : (
                <p className="text-[13px] text-gray-500 mt-0.5">
                  No active hostel room allocation found. Please contact the Chief Warden for allotment.
                </p>
              )}
            </div>
          </div>

          {allocation && (
            <div className="text-right sm:border-l sm:border-gray-200/80 sm:pl-6">
              <span className="text-[11px] text-gray-400 font-semibold block uppercase">Allotted Date</span>
              <span className="text-[13px] font-bold text-gray-700">{fmtDate(allocation.allotmentDate)}</span>
            </div>
          )}
        </div>

        {/* KPI Counter Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Total Passes</p>
              <p className="text-[18px] font-bold text-gray-800 mt-0.5">{totalCount}</p>
            </div>
            <Calendar size={18} className="text-gray-400" />
          </div>

          <div className="p-3.5 bg-amber-50/70 border border-amber-200/70 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[11px] text-amber-800 font-medium uppercase tracking-wider">Awaiting Review</p>
              <p className="text-[18px] font-bold text-amber-700 mt-0.5">{pendingCount}</p>
            </div>
            <Clock size={18} className="text-amber-500" />
          </div>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[11px] text-emerald-800 font-medium uppercase tracking-wider">Approved Passes</p>
              <p className="text-[18px] font-bold text-emerald-700 mt-0.5">{approvedCount}</p>
            </div>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>

          <div className="p-3.5 bg-rose-50/70 border border-rose-200/70 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[11px] text-rose-800 font-medium uppercase tracking-wider">Rejected Passes</p>
              <p className="text-[18px] font-bold text-rose-700 mt-0.5">{rejectedCount}</p>
            </div>
            <XCircle size={18} className="text-rose-500" />
          </div>
        </div>

        {/* Outing & Leave History Section */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <h3 className="font-bold text-gray-800 text-[15px] flex items-center gap-2">
              <span>My Outing & Leave History</span>
              <span className="text-[12px] font-normal text-gray-400">({filteredOutings.length})</span>
            </h3>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-gray-100/80 p-1 rounded-xl">
              {['All', 'Pending', 'Approved', 'Rejected', 'Outing', 'Leave'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all ${filterTab === tab ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {filteredOutings.length > 0 ? (
            <div className="space-y-3">
              {filteredOutings.map((item, idx) => {
                const cfg = STATUS_CONFIG[item.status] || {
                  badge: 'bg-gray-50 text-gray-600 border-gray-200',
                  icon: AlertCircle,
                  text: item.status
                };
                const StatusIcon = cfg.icon;

                return (
                  <div
                    key={item._id || idx}
                    className="p-5 border border-gray-100 rounded-2xl bg-white hover:border-gray-200 transition-all shadow-sm space-y-3"
                  >
                    {/* Top Row: Type & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2.5 py-1 rounded-lg text-[12px] font-bold ${item.type === 'Leave' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                          {item.type || item.recordType || 'Pass'}
                        </span>
                        <h4 className="font-bold text-gray-800 text-[14px]">
                          {item.reason || item.purpose}
                        </h4>
                      </div>

                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border self-start sm:self-auto ${cfg.badge}`}>
                        <StatusIcon size={13} />
                        {cfg.text}
                      </span>
                    </div>

                    {/* Middle Row: Duration & Destination */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-[12px] text-gray-600 pt-1">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400 shrink-0" />
                        <span><strong>Departure:</strong> {fmtDateTime(item.fromDate || item.passDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400 shrink-0" />
                        <span><strong>Return:</strong> {fmtDateTime(item.toDate)}</span>
                      </div>
                      {item.destination && (
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-400 shrink-0" />
                          <span className="truncate"><strong>Destination:</strong> {item.destination}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Row: Warden Feedback Alert */}
                    {item.status === 'Rejected' && item.rejectionReason && (
                      <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-[12px] flex items-start gap-2.5 text-rose-800">
                        <XCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Warden Rejection Reason:</p>
                          <p className="text-rose-700 mt-0.5">{item.rejectionReason}</p>
                          {item.actionDate && (
                            <p className="text-rose-500/80 text-[10px] mt-1">Reviewed on {fmtDateTime(item.actionDate)}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {item.status === 'Approved' && item.remarks && (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[12px] flex items-start gap-2.5 text-emerald-800">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Warden Instructions / Remarks:</p>
                          <p className="text-emerald-700 mt-0.5">{item.remarks}</p>
                          {item.actionDate && (
                            <p className="text-emerald-500/80 text-[10px] mt-1">Approved on {fmtDateTime(item.actionDate)}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {item.status === 'Pending' && (
                      <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-100 text-[11px] text-amber-700 flex items-center gap-2">
                        <Clock size={13} className="shrink-0" />
                        <span>Your application has been received and is waiting for Chief Warden sign-off.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-gray-400">
              <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-[13px] font-medium text-gray-600">No requests found</p>
              <p className="text-[11px] text-gray-400 mt-0.5">You haven't submitted any requests under this filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Apply Modal ─────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-800 text-[16px] font-['Outfit']">Apply for Hostel Pass</h3>
                <p className="text-[11px] text-gray-500">Request will be sent to the Warden for verification</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleApply} className="p-6 space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Pass Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewOuting({ ...newOuting, type: 'Outing' })}
                    className={`p-3 rounded-xl border text-left transition-all ${newOuting.type === 'Outing' ? 'bg-primary/5 border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <p className={`font-bold text-[13px] ${newOuting.type === 'Outing' ? 'text-primary' : 'text-gray-800'}`}>
                      Daytime Outing
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Short hours (Shopping, Doctor, Coaching)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewOuting({ ...newOuting, type: 'Leave' })}
                    className={`p-3 rounded-xl border text-left transition-all ${newOuting.type === 'Leave' ? 'bg-primary/5 border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <p className={`font-bold text-[13px] ${newOuting.type === 'Leave' ? 'text-primary' : 'text-gray-800'}`}>
                      Night / Home Leave
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Multi-day or overnight stay at hometown</p>
                  </button>
                </div>
              </div>

              {/* Departure & Return Timings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">Departure Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newOuting.fromDate}
                    onChange={(e) => setNewOuting({ ...newOuting, fromDate: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">Expected Return Time *</label>
                  <input
                    type="datetime-local"
                    required
                    min={newOuting.fromDate}
                    value={newOuting.toDate}
                    onChange={(e) => setNewOuting({ ...newOuting, toDate: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Destination & Parent Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">Destination / Place of Visit</label>
                  <input
                    type="text"
                    value={newOuting.destination}
                    onChange={(e) => setNewOuting({ ...newOuting, destination: e.target.value })}
                    placeholder="e.g. Home, Kanpur / South X Market"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">Parent / Emergency Mobile</label>
                  <input
                    type="tel"
                    value={newOuting.emergencyContact}
                    onChange={(e) => setNewOuting({ ...newOuting, emergencyContact: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Detailed Reason */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1">Detailed Purpose / Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={newOuting.purpose}
                  onChange={(e) => setNewOuting({ ...newOuting, purpose: e.target.value })}
                  placeholder="Explain clearly why you need this leave/outing pass..."
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit to Warden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hostel;
