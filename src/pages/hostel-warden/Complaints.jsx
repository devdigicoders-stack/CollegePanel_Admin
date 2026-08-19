import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, CheckCircle, Clock, XCircle, Wrench, Plus, Trash2, FileText, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';
import SkeletonLoader from '../../components/SkeletonLoader';

const STATUS_COLORS = {
  Pending:      'bg-yellow-50 text-yellow-700 border-yellow-100',
  'In Progress':'bg-blue-50 text-blue-700 border-blue-100',
  Resolved:     'bg-green-50 text-green-700 border-green-100',
  Rejected:     'bg-red-50 text-red-700 border-red-100'
};

const PRIORITY_COLORS = {
  Low:    'bg-gray-50 text-gray-600 border-gray-200',
  Medium: 'bg-orange-50 text-orange-600 border-orange-100',
  High:   'bg-red-50 text-red-600 border-red-100',
  Urgent: 'bg-red-100 text-red-800 border-red-200'
};

const CATEGORIES = ['Hostel', 'Maintenance', 'Academics', 'Library', 'IT', 'Transport', 'Food', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const genComplaintId = () => `CMP-${Date.now().toString().slice(-6)}`;

const Complaints = () => {
  if (!checkPermission('View Hostels')) {
    return <AccessDenied />;
  }
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    complaintId: genComplaintId(),
    subject: '', category: 'Hostel',
    submittedBy: '', description: '', priority: 'Medium'
  });

  // Detail/Reply modal
  const [viewItem, setViewItem] = useState(null);
  const [replyText, setReplyText] = useState('');

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ category: 'Hostel', limit: 100 });
      if (filterStatus !== 'All') params.append('status', filterStatus);
      if (filterPriority !== 'All') params.append('priority', filterPriority);
      if (search.trim()) params.append('search', search.trim());

      const [compRes, statsRes] = await Promise.all([
        axiosInstance.get(`/complaints?${params}`),
        axiosInstance.get('/complaints/stats?category=Hostel')
      ]);
      setComplaints(compRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority, search]);

  useEffect(() => {
    const delay = setTimeout(fetchComplaints, 350); // debounce search
    return () => clearTimeout(delay);
  }, [fetchComplaints]);

  // ── Status Update ──────────────────────────────────────────────────
  const handleUpdateStatus = async (id, status, adminReply = '') => {
    try {
      await axiosInstance.put(`/complaints/${id}`, { status, adminReply });
      setComplaints(prev => prev.map(c => c._id === id ? { ...c, status, adminReply } : c));
      toast.success(`Complaint marked as ${status}`);
    } catch {
      toast.error('Failed to update complaint');
    }
  };

  // ── Reply & Update from detail modal ──────────────────────────────
  const handleReplySubmit = async (id, newStatus) => {
    try {
      await axiosInstance.put(`/complaints/${id}`, { status: newStatus, adminReply: replyText });
      setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: newStatus, adminReply: replyText } : c));
      toast.success(`Status updated to ${newStatus}`);
      setViewItem(null);
      setReplyText('');
    } catch {
      toast.error('Failed to update');
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────
  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: 'Delete Complaint?',
      html: `Delete ticket <strong>${item.complaintId}</strong>? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    });
    if (!result.isConfirmed) return;
    try {
      await axiosInstance.delete(`/complaints/${item._id}`);
      setComplaints(prev => prev.filter(c => c._id !== item._id));
      toast.success('Complaint deleted');
    } catch {
      toast.error('Failed to delete complaint');
    }
  };

  // ── Add Complaint ─────────────────────────────────────────────────
  const handleAddComplaint = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/complaints', newComplaint);
      const created = res.data;
      setComplaints(prev => [created, ...prev]);
      toast.success(`Complaint ${newComplaint.complaintId} raised`);
      setShowAddModal(false);
      setNewComplaint({ complaintId: genComplaintId(), subject: '', category: 'Hostel', submittedBy: '', description: '', priority: 'Medium' });
      fetchComplaints();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating complaint');
    }
  };

  // ── Export ─────────────────────────────────────────────────────────
  const handleExport = () => {
    if (complaints.length === 0) return toast.error('No data to export');
    const data = complaints.map(c => ({
      'Ticket No': c.complaintId,
      'Submitted By': c.submittedBy,
      'Subject': c.subject,
      'Category': c.category,
      'Priority': c.priority,
      'Description': c.description,
      'Status': c.status,
      'Admin Reply': c.adminReply || '',
      'Date': c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Complaints');
    XLSX.writeFile(wb, `Hostel_Complaints_${filterStatus}.xlsx`);
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Room Complaints & Maintenance</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Track, prioritize and resolve hostel maintenance tickets</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={14} /> Export
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={15} /> Raise Complaint
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-yellow-50 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600"><Clock size={15} /></div>
          <div><p className="text-[10px] text-gray-500 font-medium">Pending</p><p className="text-[17px] font-bold text-yellow-700">{stats.pending ?? 0}</p></div>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><Wrench size={15} /></div>
          <div><p className="text-[10px] text-gray-500 font-medium">In Progress</p><p className="text-[17px] font-bold text-blue-700">{stats.inProgress ?? 0}</p></div>
        </div>
        <div className="bg-green-50 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600"><CheckCircle size={15} /></div>
          <div><p className="text-[10px] text-gray-500 font-medium">Resolved</p><p className="text-[17px] font-bold text-green-700">{stats.resolved ?? 0}</p></div>
        </div>
        <div className="bg-red-50 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600"><XCircle size={15} /></div>
          <div><p className="text-[10px] text-gray-500 font-medium">Rejected</p><p className="text-[17px] font-bold text-red-700">{stats.rejected ?? 0}</p></div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-5 border-b border-gray-100 flex gap-3 flex-wrap bg-gray-50/30">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search ticket no, subject, student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
          className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
          <option value="All">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
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
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Ticket No</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Submitted By</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Subject</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Priority</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Date</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-6 text-[13px] font-semibold text-primary">{item.complaintId}</td>
                  <td className="py-3 px-6 text-[13px] font-bold text-gray-800">{item.submittedBy}</td>
                  <td className="py-3 px-6">
                    <p className="text-[13px] font-semibold text-gray-700">{item.subject}</p>
                    <p className="text-[11px] text-gray-400 truncate max-w-[180px]" title={item.description}>{item.description}</p>
                  </td>
                  <td className="py-3 px-6">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.Medium}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-[12px] text-gray-500">{fmtDate(item.createdAt)}</td>
                  <td className="py-3 px-6 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${STATUS_COLORS[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex gap-1.5 items-center">
                      {/* View Detail */}
                      <button onClick={() => { setViewItem(item); setReplyText(item.adminReply || ''); }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="View Details">
                        <FileText size={14} />
                      </button>
                      {/* Assign (Pending → In Progress) */}
                      {item.status === 'Pending' && (
                        <button
                          onClick={() => handleUpdateStatus(item._id, 'In Progress', 'Assigned to maintenance team')}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-colors"
                          title="Assign to maintenance">
                          <Wrench size={11} /> Assign
                        </button>
                      )}
                      {/* Resolve (In Progress → Resolved) */}
                      {item.status === 'In Progress' && (
                        <button
                          onClick={() => handleUpdateStatus(item._id, 'Resolved')}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-[11px] font-bold transition-colors"
                          title="Mark Resolved">
                          <CheckCircle size={11} /> Resolve
                        </button>
                      )}
                      {/* Reject (Pending only) */}
                      {item.status === 'Pending' && (
                        <button
                          onClick={() => handleUpdateStatus(item._id, 'Rejected')}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Reject">
                          <XCircle size={14} />
                        </button>
                      )}
                      {/* Delete */}
                      <button onClick={() => handleDelete(item)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors" title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {complaints.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-400 text-[13px]">
                    {search || filterStatus !== 'All' || filterPriority !== 'All'
                      ? 'No complaints match your current filters.'
                      : 'No hostel complaints raised yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {complaints.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 text-[12px] text-gray-400">
          {complaints.length} complaint{complaints.length !== 1 ? 's' : ''} loaded
        </div>
      )}

      {/* ── Add Complaint Modal ─────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-800 text-[15px]">Raise New Complaint</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Ticket ID: <span className="font-semibold text-primary">{newComplaint.complaintId}</span></p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleAddComplaint} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Category</label>
                  <select required value={newComplaint.category} onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Priority</label>
                  <select required value={newComplaint.priority} onChange={(e) => setNewComplaint({ ...newComplaint, priority: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary">
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Submitted By (Name / Room No) *</label>
                <input required type="text" placeholder="e.g. Rahul Sharma / Room 201"
                  value={newComplaint.submittedBy}
                  onChange={(e) => setNewComplaint({ ...newComplaint, submittedBy: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Subject *</label>
                <input required type="text" placeholder="Brief complaint subject"
                  value={newComplaint.subject}
                  onChange={(e) => setNewComplaint({ ...newComplaint, subject: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Description *</label>
                <textarea required rows={3}
                  placeholder="Describe the issue in detail..."
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] resize-none focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold">Submit Complaint</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Detail / Reply Modal ────────────────────────────────── */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-800 text-[15px]">{viewItem.complaintId}</h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[viewItem.status]}`}>{viewItem.status}</span>
              </div>
              <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Submitted By', value: viewItem.submittedBy },
                { label: 'Category', value: viewItem.category },
                { label: 'Priority', value: viewItem.priority },
                { label: 'Date', value: fmtDate(viewItem.createdAt) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-[13px]">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-gray-800">{value}</span>
                </div>
              ))}
              <div>
                <p className="text-[12px] font-semibold text-gray-600 mb-1">Subject</p>
                <p className="text-[13px] font-bold text-gray-800">{viewItem.subject}</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-gray-600 mb-1">Description</p>
                <p className="text-[12px] text-gray-600 bg-gray-50 p-3 rounded-lg leading-relaxed">{viewItem.description}</p>
              </div>
              {viewItem.status !== 'Resolved' && viewItem.status !== 'Rejected' && (
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Admin Reply / Notes</label>
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Add a note or reply for this complaint..."
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[12px] resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}
              {viewItem.adminReply && (viewItem.status === 'Resolved' || viewItem.status === 'Rejected') && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-[11px] text-gray-400 font-semibold mb-1">Admin Reply:</p>
                  <p className="text-[12px] text-gray-700">{viewItem.adminReply}</p>
                </div>
              )}
              {viewItem.status === 'Pending' && (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => handleReplySubmit(viewItem._id, 'In Progress')}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[13px] font-semibold">
                    Assign & Save
                  </button>
                  <button onClick={() => handleReplySubmit(viewItem._id, 'Rejected')}
                    className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-lg text-[13px] font-semibold">
                    Reject
                  </button>
                </div>
              )}
              {viewItem.status === 'In Progress' && (
                <button onClick={() => handleReplySubmit(viewItem._id, 'Resolved')}
                  className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold">
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
