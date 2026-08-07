import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, AlertCircle, CheckCircle, Trash2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';
import SkeletonLoader from '../../components/SkeletonLoader';

const INCIDENT_TYPES = ['Late return', 'Unauthorized absence', 'Property damage', 'Rule violation', 'Substance abuse', 'Other'];

const Incidents = () => {
  if (!checkPermission('View Hostels')) {
    return <AccessDenied />;
  }
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [incidents, setIncidents] = useState([]);
  const [allocatedStudents, setAllocatedStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newIncident, setNewIncident] = useState({
    studentId: '',
    incidentType: 'Late return',
    description: '',
    actionTaken: 'Under Investigation / Review',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incRes, allocRes] = await Promise.all([
        axiosInstance.get('/hostel/incidents'),
        axiosInstance.get('/hostel/allocations')
      ]);
      setIncidents(incRes.data || []);
      setAllocatedStudents(allocRes.data || []);
    } catch {
      toast.error('Failed to load incident data');
    } finally {
      setLoading(false);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────
  const openCount = incidents.filter(i => i.status === 'Open').length;
  const closedCount = incidents.filter(i => i.status === 'Closed').length;

  // ── Filter ─────────────────────────────────────────────────────────
  const filtered = incidents.filter(i => {
    const name = i.studentId?.studentName?.toLowerCase() || '';
    const enroll = i.studentId?.studentId?.toLowerCase() || '';
    const matchSearch = name.includes(search.toLowerCase()) || enroll.includes(search.toLowerCase());
    const matchType = filterType === 'All' || i.incidentType === filterType;
    const matchStatus = filterStatus === 'All' || i.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  // ── Add Incident ───────────────────────────────────────────────────
  const handleAddIncident = async (e) => {
    e.preventDefault();
    if (!newIncident.studentId) return toast.error('Please select a student');
    try {
      setSubmitting(true);
      const res = await axiosInstance.post('/hostel/incidents', newIncident);
      const created = res.data.incident || res.data;
      setIncidents(prev => [created, ...prev]);
      toast.success('Disciplinary incident logged successfully');
      setShowAddModal(false);
      setNewIncident({
        studentId: '', incidentType: 'Late return', description: '',
        actionTaken: 'Under Investigation / Review', date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error logging incident');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Status Update ──────────────────────────────────────────────────
  const handleStatusUpdate = async (id, status) => {
    const item = incidents.find(i => i._id === id);
    if (status === 'Closed') {
      const result = await Swal.fire({
        title: 'Close Incident?',
        html: `Mark the incident for <strong>${item.studentId?.studentName}</strong> as resolved/closed?`,
        icon: 'question',
        input: 'text',
        inputLabel: 'Final Action Taken (Optional)',
        inputPlaceholder: 'e.g. Warning issued, Fine paid...',
        showCancelButton: true,
        confirmButtonText: 'Yes, Close',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#0A6C54',
        cancelButtonColor: '#6b7280',
        reverseButtons: true
      });
      if (!result.isConfirmed) return;
      
      try {
        const payload = { status };
        if (result.value) payload.actionTaken = result.value;
        
        const res = await axiosInstance.put(`/hostel/incidents/${id}/status`, payload);
        const updated = res.data.incident || res.data;
        setIncidents(prev => prev.map(i => i._id === id ? { ...i, ...updated } : i));
        toast.success('Incident closed successfully');
      } catch {
        toast.error('Failed to close incident');
      }
    } else {
      // Re-opening
      try {
        const res = await axiosInstance.put(`/hostel/incidents/${id}/status`, { status });
        const updated = res.data.incident || res.data;
        setIncidents(prev => prev.map(i => i._id === id ? { ...i, ...updated } : i));
        toast.success('Incident re-opened');
      } catch {
        toast.error('Failed to update incident');
      }
    }
  };

  // ── Delete Incident ────────────────────────────────────────────────
  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: 'Delete Incident Record?',
      html: `Delete the incident record for <strong>${item.studentId?.studentName}</strong>? This cannot be undone.`,
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
      await axiosInstance.delete(`/hostel/incidents/${item._id}`);
      setIncidents(prev => prev.filter(i => i._id !== item._id));
      toast.success('Incident record deleted');
    } catch {
      toast.error('Failed to delete incident');
    }
  };

  // ── Export ─────────────────────────────────────────────────────────
  const handleExport = () => {
    if (filtered.length === 0) return toast.error('No incidents to export');
    const data = filtered.map(i => ({
      'Student Name': i.studentId?.studentName || 'N/A',
      'Enrollment No': i.studentId?.studentId || 'N/A',
      'Date': i.date ? new Date(i.date).toLocaleDateString('en-IN') : '',
      'Incident Type': i.incidentType,
      'Details / Description': i.description || '',
      'Status': i.status,
      'Action Taken': i.actionTaken || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Incidents');
    XLSX.writeFile(wb, `Hostel_Incidents_${filterStatus}.xlsx`);
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Discipline & Incident Registry</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Log curfew delays, property damages, and rule violations</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={14} /> Export
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors shadow-sm shadow-red-200">
            <ShieldAlert size={15} /> Log Incident
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 gap-3">
        <div className="bg-red-50 rounded-xl p-3 flex items-center gap-3 border border-red-100/50">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600"><AlertCircle size={16} /></div>
          <div><p className="text-[10px] text-red-500 font-semibold uppercase tracking-wider">Open / Under Investigation</p><p className="text-[17px] font-bold text-red-700">{openCount}</p></div>
        </div>
        <div className="bg-green-50 rounded-xl p-3 flex items-center gap-3 border border-green-100/50">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600"><CheckCircle size={16} /></div>
          <div><p className="text-[10px] text-green-600 font-semibold uppercase tracking-wider">Resolved / Closed</p><p className="text-[17px] font-bold text-green-700">{closedCount}</p></div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-5 border-b border-gray-100 flex gap-3 flex-wrap bg-gray-50/30">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search by student name or enrollment no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-red-600"
          />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-red-600 cursor-pointer">
          <option value="All">All Types</option>
          {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-red-600 cursor-pointer">
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={5} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Type & Date</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Description</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Action Taken</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-6">
                    <p className="text-[13px] font-bold text-gray-800">{item.studentId?.studentName || 'Unknown'}</p>
                    <p className="text-[11px] text-gray-500 font-semibold">{item.studentId?.studentId}</p>
                  </td>
                  <td className="py-3 px-6">
                    <p className="text-[12px] font-semibold text-gray-800">{item.incidentType}</p>
                    <p className="text-[11px] text-gray-500">{fmtDate(item.date)}</p>
                  </td>
                  <td className="py-3 px-6 text-[12px] text-gray-600 max-w-[200px]">
                    <p className="truncate" title={item.description}>{item.description}</p>
                  </td>
                  <td className="py-3 px-6 text-[12px] font-medium text-gray-600 italic">
                    <p className="truncate max-w-[150px]" title={item.actionTaken}>{item.actionTaken}</p>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${item.status === 'Closed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {item.status || 'Open'}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex justify-end gap-1.5 items-center">
                      {item.status !== 'Closed' ? (
                        <button onClick={() => handleStatusUpdate(item._id, 'Closed')} className="flex items-center gap-1 px-2.5 py-1.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[11px] font-bold transition-colors shadow-sm" title="Mark Closed/Resolved">
                          <CheckCircle size={12} /> Close
                        </button>
                      ) : (
                        <button onClick={() => handleStatusUpdate(item._id, 'Open')} className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-[11px] font-bold transition-colors" title="Re-open Incident">
                          Re-open
                        </button>
                      )}
                      <button onClick={() => handleDelete(item)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-gray-400 text-[13px]">
                    {incidents.length === 0 ? 'No disciplinary incidents recorded.' : 'No incidents match your filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {incidents.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 text-[12px] text-gray-400">
          Showing {filtered.length} of {incidents.length} records
        </div>
      )}

      {/* ── Log Incident Modal ────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-red-100 flex justify-between items-center bg-red-50/50">
              <h3 className="font-bold text-red-800 text-[15px] flex items-center gap-2"><ShieldAlert size={16} /> Log Disciplinary Incident</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleAddIncident} className="p-6 space-y-4">
              {/* Student */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Student (Allotted Only) *</label>
                {allocatedStudents.length === 0 ? (
                  <div className="p-2.5 bg-yellow-50 border border-yellow-100 rounded-lg text-[12px] text-yellow-700">No active hostel students found.</div>
                ) : (
                  <select required value={newIncident.studentId} onChange={(e) => setNewIncident({ ...newIncident, studentId: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-red-600">
                    <option value="">Select Student...</option>
                    {allocatedStudents.map(a => (
                      <option key={a.studentId?._id} value={a.studentId?._id}>
                        {a.studentId?.studentName} ({a.studentId?.studentId})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Date & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Date of Incident *</label>
                  <input type="date" required value={newIncident.date} max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setNewIncident({ ...newIncident, date: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-red-600" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Incident Type *</label>
                  <select required value={newIncident.incidentType} onChange={(e) => setNewIncident({ ...newIncident, incidentType: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-red-600">
                    {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Details / Description *</label>
                <textarea required rows={3} placeholder="Provide specific details about the incident..."
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] resize-none focus:outline-none focus:ring-1 focus:ring-red-600" />
              </div>

              {/* Action Taken */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Initial Action Taken</label>
                <input type="text" placeholder="e.g. Under Investigation, Warning Issued"
                  value={newIncident.actionTaken}
                  onChange={(e) => setNewIncident({ ...newIncident, actionTaken: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-red-600" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting || allocatedStudents.length === 0}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-[13px] font-semibold shadow-sm shadow-red-200">
                  {submitting ? 'Logging...' : 'Post Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incidents;
