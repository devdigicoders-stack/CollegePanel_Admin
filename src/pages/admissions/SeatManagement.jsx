import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, Save, X, RefreshCw, ChevronDown, AlertTriangle, CheckCircle, Clock, BookOpen } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const CATEGORY_LABELS = {
  generalSeats: 'General',
  obcSeats: 'OBC',
  scSeats: 'SC',
  stSeats: 'ST',
  ewsSeats: 'EWS',
  mgmtSeats: 'Management',
};

const CATEGORY_COLORS = {
  generalSeats: 'bg-blue-50 text-blue-700',
  obcSeats: 'bg-indigo-50 text-indigo-700',
  scSeats: 'bg-purple-50 text-purple-700',
  stSeats: 'bg-pink-50 text-pink-700',
  ewsSeats: 'bg-amber-50 text-amber-700',
  mgmtSeats: 'bg-teal-50 text-teal-700',
};

const SeatManagement = () => {
  if (!checkPermission('View Admissions')) {
    return <AccessDenied />;
  }
  const currentYear = new Date().getFullYear();
  const dynamicSessions = [
    `${currentYear - 1}-${(currentYear).toString().slice(-2)}`,
    `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
    `${currentYear + 1}-${(currentYear + 2).toString().slice(-2)}`,
    `${currentYear + 2}-${(currentYear + 3).toString().slice(-2)}`
  ];

  const [seatData, setSeatData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ totalSeats: 0, filled: 0, available: 0, courses: 0 });
  const [sessions, setSessions] = useState([]);
  
  // Dynamic Data States
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [selectedSession, setSelectedSession] = useState('');
  const [search, setSearch] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingSeat, setEditingSeat] = useState(null);
  const [configForm, setConfigForm] = useState({
    courseName: '',
    department: '',
    academicSession: '',
    totalSeats: 60,
    generalSeats: 30,
    obcSeats: 16,
    scSeats: 9,
    stSeats: 5,
    ewsSeats: 0,
    mgmtSeats: 0,
    waitingListCapacity: 10,
  });
  const [configLoading, setConfigLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchSeatData = useCallback(async () => {
    try {
      setLoading(true);
      const params = selectedSession ? { session: selectedSession } : {};
      const res = await axiosInstance.get('/seats', { params });
      const data = res.data;
      setSeatData(data.seats || []);
      setSummary(data.summary || { totalSeats: 0, filled: 0, available: 0, courses: 0 });
    } catch (error) {
      console.error('Error fetching seat data', error);
      toast.error('Failed to fetch seat data');
    } finally {
      setLoading(false);
    }
  }, [selectedSession]);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/seats/sessions');
      setSessions(res.data || []);
    } catch (error) {
      console.error('Error fetching sessions', error);
    }
  }, []);

  const fetchDynamicData = useCallback(async () => {
    try {
      const [courseRes, deptRes] = await Promise.all([
        axiosInstance.get('/academics/courses'),
        axiosInstance.get('/academics/departments')
      ]);
      setCourses(courseRes.data || []);
      setDepartments(deptRes.data || []);
    } catch (error) {
      console.error('Error fetching dynamic data', error);
    }
  }, []);

  useEffect(() => {
    fetchSeatData();
    fetchSessions();
    fetchDynamicData();
  }, [fetchSeatData, fetchSessions, fetchDynamicData]);

  const openConfigModal = (seat = null) => {
    if (seat) {
      setEditingSeat(seat);
      setConfigForm({
        courseName: seat.courseName || '',
        department: seat.department || '',
        academicSession: seat.academicSession || '',
        totalSeats: seat.totalSeats || 60,
        generalSeats: seat.generalSeats || 30,
        obcSeats: seat.obcSeats || 16,
        scSeats: seat.scSeats || 9,
        stSeats: seat.stSeats || 5,
        ewsSeats: seat.ewsSeats || 0,
        mgmtSeats: seat.mgmtSeats || 0,
        waitingListCapacity: seat.waitingListCapacity || 10,
      });
    } else {
      setEditingSeat(null);
      setConfigForm({
        courseName: '',
        department: '',
        academicSession: selectedSession || '',
        totalSeats: 60,
        generalSeats: 30,
        obcSeats: 16,
        scSeats: 9,
        stSeats: 5,
        ewsSeats: 0,
        mgmtSeats: 0,
        waitingListCapacity: 10,
      });
    }
    setShowConfigModal(true);
  };

  const closeConfigModal = () => {
    setShowConfigModal(false);
    setEditingSeat(null);
  };

  const handleConfigSubmit = async () => {
    const { courseName, academicSession, totalSeats } = configForm;
    if (!courseName || !academicSession || !totalSeats) {
      toast.error('Course name, academic session and total seats are required');
      return;
    }

    setConfigLoading(true);
    try {
      if (editingSeat && editingSeat._id) {
        await axiosInstance.put(`/seats/${editingSeat._id}`, configForm);
        toast.success('Seat configuration updated');
      } else {
        await axiosInstance.post('/seats', configForm);
        toast.success('Seat configuration saved');
      }
      closeConfigModal();
      fetchSeatData();
      fetchSessions();
    } catch (error) {
      console.error('Error saving seat config', error);
      toast.error(error.response?.data?.message || 'Failed to save seat configuration');
    } finally {
      setConfigLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/seats/${id}`);
      toast.success('Seat configuration deleted');
      setDeleteConfirm(null);
      fetchSeatData();
      fetchSessions();
    } catch (error) {
      console.error('Error deleting seat config', error);
      toast.error('Failed to delete seat configuration');
    }
  };

  const filteredSeatData = seatData.filter(s =>
    s.courseName?.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase())
  );

  const summaryCards = [
    { label: 'Total Seats', value: summary.totalSeats, color: 'bg-blue-50 text-blue-700', icon: BookOpen },
    { label: 'Filled Seats', value: summary.filled, color: 'bg-orange-50 text-orange-700', icon: Clock },
    { label: 'Available Seats', value: summary.available, color: 'bg-green-50 text-green-700', icon: CheckCircle },
    { label: 'Courses', value: summary.courses, color: 'bg-purple-50 text-purple-700', icon: AlertTriangle },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Seat Management</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Configure and track course-wise seat allocations</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={fetchSeatData} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">
            <RefreshCw size={15} /> Refresh
          </button>
          <button onClick={() => openConfigModal()} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2">
            <Plus size={16} /> Configure Seats
          </button>
        </div>
      </div>

      {/* Session Filter */}
      <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap gap-3 items-center">
        <label className="text-[12px] font-semibold text-gray-600">Session:</label>
        <select
          value={selectedSession}
          onChange={e => setSelectedSession(e.target.value)}
          className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-3 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
        >
          <option value="">All Sessions</option>
          {sessions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
      </div>

      {/* Summary Cards */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-gray-100">
        {summaryCards.map(card => (
          <div key={card.label} className={`${card.color} rounded-xl p-4 text-center`}>
            <p className="text-[12px] font-medium mb-1">{card.label}</p>
            <p className="text-[24px] font-bold">{loading ? '...' : card.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by course name or department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={6} />
        ) : filteredSeatData.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-[13px]">
            No seat configurations found. Click "Configure Seats" to add seat allocations.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSeatData.map((seat) => {
              const occupancyPercent = seat.totalSeats > 0 ? Math.round((seat.filledTotal / seat.totalSeats) * 100) : 0;
              const isFull = seat.available === 0;
              return (
                <div key={seat._id} className="border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-[14px] font-bold text-gray-800">{seat.courseName}</h4>
                      <p className="text-[12px] text-gray-500 mt-0.5">
                        {seat.department && `${seat.department} \u2022 `}
                        Session: {seat.academicSession}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-[12px] text-gray-500">Occupancy</p>
                        <p className={`text-[16px] font-bold ${isFull ? 'text-red-600' : 'text-gray-800'}`}>
                          {seat.filledTotal} / {seat.totalSeats}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openConfigModal(seat)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg"
                          title="Edit"
                        >
                          <Edit2 size={14} className="text-gray-500" />
                        </button>
                        {seat._id && (
                          <>
                            {deleteConfirm === seat._id ? (
                              <button
                                onClick={() => handleDelete(seat._id)}
                                className="p-1.5 hover:bg-red-50 rounded-lg"
                                title="Confirm Delete"
                              >
                                <Trash2 size={14} className="text-red-600" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(seat._id)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg"
                                title="Delete"
                              >
                                <Trash2 size={14} className="text-gray-400" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className={`h-2 rounded-full transition-all ${isFull ? 'bg-red-500' : occupancyPercent > 80 ? 'bg-orange-500' : 'bg-[#0A6C54]'}`}
                      style={{ width: `${Math.min(100, occupancyPercent)}%` }}
                    ></div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                      const configured = seat[key] || 0;
                      const filledKey = key.replace('Seats', '').toLowerCase();
                      const filled = seat.filled?.[filledKey] || 0;
                      const available = Math.max(0, configured - filled);
                      return (
                        <div key={key} className={`text-center p-3 rounded-lg ${CATEGORY_COLORS[key]}`}>
                          <p className="text-[11px] text-gray-600 mb-1">{label}</p>
                          <p className="text-[14px] font-bold text-gray-800">{configured}</p>
                          <p className="text-[11px] text-gray-500">Filled: {filled} | Avail: {available}</p>
                        </div>
                      );
                    })}
                    <div className="text-center p-3 rounded-lg bg-green-50">
                      <p className="text-[11px] text-gray-600 mb-1">Available</p>
                      <p className="text-[14px] font-bold text-green-700">{seat.available}</p>
                      <p className="text-[11px] text-gray-500">{occupancyPercent}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Configure Seats Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-800">
                {editingSeat ? 'Edit Seat Configuration' : 'Configure Seat Allocation'}
              </h3>
              <button onClick={closeConfigModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Course Name *</label>
                <select 
                  value={configForm.courseName} 
                  onChange={e => {
                    const selectedCourseName = e.target.value;
                    const courseObj = courses.find(c => c.name === selectedCourseName);
                    
                    setConfigForm(prev => ({ 
                      ...prev, 
                      courseName: selectedCourseName,
                      // Auto-fill department if course has it and it's populated
                      ...(courseObj?.department?.name && { department: courseObj.department.name })
                    }));
                  }} 
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                >
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c._id || c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Department</label>
                <select 
                  value={configForm.department} 
                  onChange={e => setConfigForm({ ...configForm, department: e.target.value })} 
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                >
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d._id || d.name} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Academic Session *</label>
                <select 
                  value={configForm.academicSession} 
                  onChange={e => setConfigForm({ ...configForm, academicSession: e.target.value })} 
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                >
                  <option value="">Select Session</option>
                  {dynamicSessions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Total Seats *</label>
                <input type="number" value={configForm.totalSeats} onChange={e => setConfigForm({ ...configForm, totalSeats: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">General Seats</label>
                <input type="number" value={configForm.generalSeats} onChange={e => setConfigForm({ ...configForm, generalSeats: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">OBC Seats</label>
                <input type="number" value={configForm.obcSeats} onChange={e => setConfigForm({ ...configForm, obcSeats: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">SC Seats</label>
                <input type="number" value={configForm.scSeats} onChange={e => setConfigForm({ ...configForm, scSeats: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">ST Seats</label>
                <input type="number" value={configForm.stSeats} onChange={e => setConfigForm({ ...configForm, stSeats: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">EWS Seats</label>
                <input type="number" value={configForm.ewsSeats} onChange={e => setConfigForm({ ...configForm, ewsSeats: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Management Seats</label>
                <input type="number" value={configForm.mgmtSeats} onChange={e => setConfigForm({ ...configForm, mgmtSeats: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Waiting List Capacity</label>
                <input type="number" value={configForm.waitingListCapacity} onChange={e => setConfigForm({ ...configForm, waitingListCapacity: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 mt-auto">
              <button onClick={closeConfigModal} className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleConfigSubmit} disabled={configLoading} className="bg-[#0A6C54] hover:bg-[#085a46] disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2">
                <Save size={15} />
                {configLoading ? 'Saving...' : editingSeat ? 'Update' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatManagement;