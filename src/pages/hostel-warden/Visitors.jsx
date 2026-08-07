import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, Users, LogIn, LogOut, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';
import SkeletonLoader from '../../components/SkeletonLoader';

const RELATIONS = ['Father', 'Mother', 'Brother', 'Sister', 'Guardian', 'Friend', 'Other'];

const Visitors = () => {
  if (!checkPermission('View Hostels')) {
    return <AccessDenied />;
  }
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All'); // All | inside | out
  const [visitors, setVisitors] = useState([]);
  const [allocatedStudents, setAllocatedStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newVisitor, setNewVisitor] = useState({
    visitorName: '', contactNumber: '',
    studentId: '', relation: 'Father', purpose: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [visitorsRes, allocRes] = await Promise.all([
        axiosInstance.get('/hostel/visitors'),
        axiosInstance.get('/hostel/allocations')
      ]);
      setVisitors(visitorsRes.data || []);
      setAllocatedStudents(allocRes.data || []);
    } catch {
      toast.error('Failed to load visitor data');
    } finally {
      setLoading(false);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────
  const insideCount = visitors.filter(v => !v.outTime).length;
  const checkedOutCount = visitors.filter(v => !!v.outTime).length;
  const todayCount = visitors.filter(v => {
    const d = new Date(v.inTime);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  // ── Filter ─────────────────────────────────────────────────────────
  const filtered = visitors.filter(v => {
    const studentName = v.studentId?.studentName?.toLowerCase() || '';
    const studentEnroll = v.studentId?.studentId?.toLowerCase() || '';
    const visitorName = v.visitorName?.toLowerCase() || '';
    const relation = v.relation?.toLowerCase() || '';
    const matchSearch = visitorName.includes(search.toLowerCase()) ||
      studentName.includes(search.toLowerCase()) ||
      studentEnroll.includes(search.toLowerCase()) ||
      relation.includes(search.toLowerCase());
    const matchStatus =
      filterStatus === 'All' ||
      (filterStatus === 'inside' && !v.outTime) ||
      (filterStatus === 'out' && !!v.outTime);
    return matchSearch && matchStatus;
  });

  // ── Record Visitor Entry ───────────────────────────────────────────
  const handleAddVisitor = async (e) => {
    e.preventDefault();
    if (!newVisitor.studentId) return toast.error('Please select a student');
    try {
      setSubmitting(true);
      const res = await axiosInstance.post('/hostel/visitors', newVisitor);
      const created = res.data.visitor || res.data;
      setVisitors(prev => [created, ...prev]);
      toast.success(`✅ Entry recorded for ${newVisitor.visitorName}`);
      setShowAddModal(false);
      setNewVisitor({ visitorName: '', contactNumber: '', studentId: '', relation: 'Father', purpose: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error recording visitor');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Checkout ────────────────────────────────────────────────────────
  const handleCheckout = async (item) => {
    const result = await Swal.fire({
      title: 'Confirm Checkout?',
      html: `Mark <strong>${item.visitorName}</strong> as checked out from hostel?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Checkout',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0A6C54',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    });
    if (!result.isConfirmed) return;
    try {
      const res = await axiosInstance.put(`/hostel/visitors/${item._id}/checkout`);
      const updated = res.data.visitor || res.data;
      setVisitors(prev => prev.map(v => v._id === item._id ? { ...v, outTime: updated.outTime } : v));
      toast.success(`${item.visitorName} checked out`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed');
    }
  };

  // ── Export ──────────────────────────────────────────────────────────
  const handleExport = () => {
    if (filtered.length === 0) return toast.error('No data to export');
    const data = filtered.map(v => ({
      'Visitor Name': v.visitorName,
      'Contact': v.contactNumber,
      'Student': v.studentId?.studentName || 'N/A',
      'Enrollment No': v.studentId?.studentId || 'N/A',
      'Relation': v.relation || '',
      'Purpose': v.purpose || '',
      'Entry Time': v.inTime ? new Date(v.inTime).toLocaleString('en-IN') : '',
      'Exit Time': v.outTime ? new Date(v.outTime).toLocaleString('en-IN') : 'Still Inside',
      'Status': v.outTime ? 'Checked Out' : 'Inside'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Visitors');
    XLSX.writeFile(wb, `Hostel_Visitors_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.xlsx`);
  };

  const fmtTime = (d) => d ? new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true
  }) : '—';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Visitor Gate Registry</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Record visitor entries, track in/out times and generate gate logs</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={14} /> Export
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={15} /> Record Entry
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><Users size={16} /></div>
          <div><p className="text-[10px] text-gray-500 font-medium">Today's Visitors</p><p className="text-[17px] font-bold text-blue-700">{todayCount}</p></div>
        </div>
        <div className="bg-green-50 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600"><LogIn size={16} /></div>
          <div><p className="text-[10px] text-gray-500 font-medium">Currently Inside</p><p className="text-[17px] font-bold text-green-700">{insideCount}</p></div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600"><LogOut size={16} /></div>
          <div><p className="text-[10px] text-gray-500 font-medium">Checked Out</p><p className="text-[17px] font-bold text-gray-700">{checkedOutCount}</p></div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-5 border-b border-gray-100 flex gap-3 flex-wrap bg-gray-50/30">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search visitor, student name, enrollment or relation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
        >
          <option value="All">All Visitors</option>
          <option value="inside">Currently Inside</option>
          <option value="out">Checked Out</option>
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
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Visitor</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Contact</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Visiting Student</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Relation</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Purpose</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Entry Time</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Exit Time</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-6">
                    <p className="text-[13px] font-bold text-gray-800">{item.visitorName}</p>
                  </td>
                  <td className="py-3 px-6 text-[13px] text-gray-600">{item.contactNumber || '—'}</td>
                  <td className="py-3 px-6">
                    <p className="text-[13px] font-semibold text-gray-800">{item.studentId?.studentName || 'N/A'}</p>
                    <p className="text-[11px] text-[#0A6C54] font-semibold">{item.studentId?.studentId}</p>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-[12px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{item.relation || '—'}</span>
                  </td>
                  <td className="py-3 px-6 text-[12px] text-gray-500 max-w-[140px]">
                    <p className="truncate" title={item.purpose}>{item.purpose || '—'}</p>
                  </td>
                  <td className="py-3 px-6 text-[12px] text-gray-600">{fmtTime(item.inTime)}</td>
                  <td className="py-3 px-6 text-[12px] text-gray-500">{item.outTime ? fmtTime(item.outTime) : '—'}</td>
                  <td className="py-3 px-6 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${item.outTime ? 'bg-gray-50 text-gray-500 border-gray-200' : 'bg-green-50 text-green-700 border-green-100'}`}>
                      {item.outTime ? 'Checked Out' : 'Inside'}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    {!item.outTime ? (
                      <button
                        onClick={() => handleCheckout(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[12px] font-semibold transition-colors"
                      >
                        <LogOut size={12} /> Checkout
                      </button>
                    ) : (
                      <span className="text-[12px] text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="9" className="py-10 text-center text-gray-400 text-[13px]">
                    {visitors.length === 0 ? 'No visitor records yet. Use "Record Entry" to log a visitor.' : 'No visitors match your filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {visitors.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 text-[12px] text-gray-400">
          Showing {filtered.length} of {visitors.length} records
        </div>
      )}

      {/* ── Add Visitor Modal ────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-800 text-[15px]">Record Visitor Entry</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Entry time will be set to now automatically</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleAddVisitor} className="p-6 space-y-4">
              {/* Visitor Name */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Visitor Name *</label>
                <input
                  type="text" required
                  placeholder="e.g. Ramesh Kumar"
                  value={newVisitor.visitorName}
                  onChange={(e) => setNewVisitor({ ...newVisitor, visitorName: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              {/* Contact */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Mobile Number *</label>
                <input
                  type="tel" required
                  placeholder="10-digit mobile number"
                  value={newVisitor.contactNumber}
                  onChange={(e) => setNewVisitor({ ...newVisitor, contactNumber: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              {/* Student & Relation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Visiting Student *</label>
                  {allocatedStudents.length === 0 ? (
                    <div className="p-2.5 bg-yellow-50 border border-yellow-100 rounded-lg text-[12px] text-yellow-700">No allotted students</div>
                  ) : (
                    <select
                      required
                      value={newVisitor.studentId}
                      onChange={(e) => setNewVisitor({ ...newVisitor, studentId: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                    >
                      <option value="">Select student...</option>
                      {allocatedStudents.map(a => (
                        <option key={a.studentId?._id} value={a.studentId?._id}>
                          {a.studentId?.studentName} ({a.studentId?.studentId})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Relation</label>
                  <select
                    value={newVisitor.relation}
                    onChange={(e) => setNewVisitor({ ...newVisitor, relation: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Purpose of Visit</label>
                <textarea
                  value={newVisitor.purpose}
                  onChange={(e) => setNewVisitor({ ...newVisitor, purpose: e.target.value })}
                  placeholder="e.g. Family visit, delivery of items..."
                  rows={2}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] resize-none focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || allocatedStudents.length === 0}
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-[13px] font-semibold"
                >
                  {submitting ? 'Recording...' : 'Log Gate Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visitors;
