import React, { useState, useEffect } from 'react';
import { Search, Save, CheckSquare, Download, Users, UserCheck, UserX, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import * as XLSX from 'xlsx';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';
import SkeletonLoader from '../../components/SkeletonLoader';

const STATUS_CONFIG = {
  Present:  { color: 'bg-green-50 text-green-700 border-green-200', activeColor: 'ring-2 ring-green-400' },
  Absent:   { color: 'bg-red-50 text-red-700 border-red-200', activeColor: 'ring-2 ring-red-400' },
  'On Leave': { color: 'bg-orange-50 text-orange-700 border-orange-200', activeColor: 'ring-2 ring-orange-400' }
};

const Attendance = () => {
  if (!checkPermission('View Hostels')) {
    return <AccessDenied />;
  }
  const [filterBlock, setFilterBlock] = useState('All');
  const [search, setSearch] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [blocks, setBlocks] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setIsAlreadySaved(false);

      const [allocRes, attRes] = await Promise.all([
        axiosInstance.get('/hostel/allocations'),
        axiosInstance.get(`/hostel/attendance?date=${date}`)
      ]);

      const activeAllocs = allocRes.data || [];
      const attendanceLogs = attRes.data || [];

      if (attendanceLogs.length > 0) setIsAlreadySaved(true);

      const merged = activeAllocs.map(alloc => {
        const log = attendanceLogs.find(
          a => (a.studentId?._id || a.studentId) === (alloc.studentId?._id || alloc.studentId)
        );
        return {
          id: alloc.studentId?._id,
          studentName: alloc.studentId?.studentName || 'Unknown',
          studentId: alloc.studentId?.studentId || '',
          roomId: alloc.roomId?._id,
          block: alloc.roomId?.blockName || '',
          room: alloc.roomId?.roomNumber || '',
          status: log ? log.status : 'Absent',
          remarks: log ? log.remarks || '' : ''
        };
      });

      setStudents(merged);
      const uniqueBlocks = ['All', ...new Set(activeAllocs.map(a => a.roomId?.blockName).filter(Boolean))];
      setBlocks(uniqueBlocks);
    } catch {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  // ── Stats ───────────────────────────────────────────────────────────
  const presentCount = students.filter(s => s.status === 'Present').length;
  const absentCount = students.filter(s => s.status === 'Absent').length;
  const leaveCount = students.filter(s => s.status === 'On Leave').length;

  // ── Filter ──────────────────────────────────────────────────────────
  const filtered = students.filter(s => {
    const matchBlock = filterBlock === 'All' || s.block === filterBlock;
    const matchSearch = !search.trim() ||
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase());
    return matchBlock && matchSearch;
  });

  // ── Per-student status/remarks change ───────────────────────────────
  const handleStatusChange = (id, newStatus) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const handleRemarksChange = (id, remarks) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, remarks } : s));
  };

  // ── Bulk mark ────────────────────────────────────────────────────────
  const handleBulkMark = (status) => {
    const targetIds = new Set(filtered.map(s => s.id));
    setStudents(prev => prev.map(s => {
      if (!targetIds.has(s.id)) return s;
      if (status === 'Present' && s.status === 'On Leave') return s; // keep leave
      return { ...s, status };
    }));
    toast.success(`Marked ${filtered.length} visible students as ${status}`);
  };

  // ── Save Attendance ──────────────────────────────────────────────────
  const handleSaveAttendance = async () => {
    if (students.length === 0) return toast.error('No students to save attendance for');
    try {
      setSaving(true);
      const records = students.map(s => ({
        studentId: s.id,
        roomId: s.roomId,
        status: s.status,
        remarks: s.remarks || ''
      }));
      await axiosInstance.post('/hostel/attendance', { date, records });
      toast.success(`✅ Attendance saved for ${date} (${students.length} students)`);
      setIsAlreadySaved(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  // ── Export ────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (students.length === 0) return toast.error('No data to export');
    const data = filtered.map(s => ({
      'Student Name': s.studentName,
      'Enrollment No': s.studentId,
      'Block': s.block,
      'Room No': s.room,
      'Status': s.status,
      'Remarks': s.remarks || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(wb, `Hostel_Attendance_${date}.xlsx`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Daily Night Attendance</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">
            Perform nightly roll-call by block and room
            {isAlreadySaved && <span className="ml-2 text-green-600 font-semibold">· Already saved for this date</span>}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleExport} className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={14} /> Export
          </button>
          <button onClick={() => handleBulkMark('Present')} className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors">
            <CheckSquare size={14} /> All Present
          </button>
          <button onClick={() => handleBulkMark('Absent')} className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors">
            <UserX size={14} /> All Absent
          </button>
          <button
            onClick={handleSaveAttendance}
            disabled={saving || students.length === 0}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-colors ${saving || students.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#0A6C54] hover:bg-[#085a46]'}`}
          >
            <Save size={14} /> {saving ? 'Saving...' : isAlreadySaved ? 'Update Attendance' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><Users size={16} /></div>
          <div><p className="text-[10px] text-gray-500 font-medium">Total Students</p><p className="text-[17px] font-bold text-blue-700">{students.length}</p></div>
        </div>
        <div className="bg-green-50 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600"><UserCheck size={16} /></div>
          <div><p className="text-[10px] text-gray-500 font-medium">Present</p><p className="text-[17px] font-bold text-green-700">{presentCount}</p></div>
        </div>
        <div className="bg-red-50 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600"><UserX size={16} /></div>
          <div><p className="text-[10px] text-gray-500 font-medium">Absent</p><p className="text-[17px] font-bold text-red-700">{absentCount}</p></div>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600"><Clock size={16} /></div>
          <div><p className="text-[10px] text-gray-500 font-medium">On Leave</p><p className="text-[17px] font-bold text-orange-700">{leaveCount}</p></div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-3 flex-wrap bg-gray-50/30">
        {/* Search */}
        <div className="flex-1 min-w-[180px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search student name or enrollment no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>
        {/* Block filter */}
        <select
          value={filterBlock}
          onChange={(e) => setFilterBlock(e.target.value)}
          className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
        >
          {blocks.map(b => <option key={b} value={b}>{b === 'All' ? 'All Blocks' : b}</option>)}
        </select>
        {/* Date picker */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
        />
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
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Block / Room</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Mark Attendance</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Remarks (optional)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-6">
                    <p className="text-[13px] font-bold text-gray-800">{item.studentName}</p>
                    <p className="text-[11px] text-[#0A6C54] font-semibold">{item.studentId}</p>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-[12px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{item.block}</span>
                    <span className="text-[12px] text-gray-500 ml-1.5">Room {item.room}</span>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex gap-1.5">
                      {Object.keys(STATUS_CONFIG).map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(item.id, status)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                            item.status === status
                              ? `${STATUS_CONFIG[status].color} shadow-sm scale-105`
                              : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <input
                      type="text"
                      value={item.remarks}
                      onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                      placeholder="Add note..."
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                    />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-gray-400 text-[13px]">
                    {students.length === 0
                      ? 'No active hostel students. Allot students to rooms first.'
                      : 'No students match the current filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {students.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-[12px] text-gray-400">
          <span>Showing {filtered.length} of {students.length} students</span>
          <span>
            Present: <strong className="text-green-600">{presentCount}</strong> ·
            Absent: <strong className="text-red-600"> {absentCount}</strong> ·
            On Leave: <strong className="text-orange-600"> {leaveCount}</strong>
          </span>
        </div>
      )}
    </div>
  );
};

export default Attendance;
