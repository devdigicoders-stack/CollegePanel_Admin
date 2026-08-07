import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Bed, Users, UserCheck, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';
import SkeletonLoader from '../../components/SkeletonLoader';

const Allotment = () => {
  if (!checkPermission('Manage Allocations')) {
    return <AccessDenied />;
  }
  const [search, setSearch] = useState('');
  const [filterBlock, setFilterBlock] = useState('All');
  const [filterStatus, setFilterStatus] = useState('Active');
  const [allotments, setAllotments] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [blocks, setBlocks] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [showAllotModal, setShowAllotModal] = useState(false);
  const [newAllot, setNewAllot] = useState({ studentId: '', roomId: '' });

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allocRes, studentsRes, roomsRes] = await Promise.all([
        axiosInstance.get(`/hostel/allocations?status=${filterStatus}`),
        axiosInstance.get('/students'),
        axiosInstance.get('/hostel/rooms')
      ]);

      const allots = allocRes.data || [];
      const allStudents = studentsRes.data.data || studentsRes.data || [];
      const allRooms = roomsRes.data.rooms || [];

      setAllotments(allots);
      setStudents(allStudents);
      setRooms(allRooms);

      // Build dynamic block list from allotments
      const uniqueBlocks = ['All', ...new Set(allots.map(a => a.roomId?.blockName).filter(Boolean))];
      setBlocks(uniqueBlocks);
    } catch (error) {
      toast.error('Failed to load allotment data');
    } finally {
      setLoading(false);
    }
  };

  // ── Derived data ───────────────────────────────────────────────────
  // Students not yet allocated to any active room
  const allocatedStudentIds = new Set(
    allotments.filter(a => a.status === 'Active').map(a => a.studentId?._id?.toString())
  );
  const unallocatedStudents = students.filter(s => !allocatedStudentIds.has(s._id?.toString()));

  // Available rooms: has beds left + not in Maintenance
  const availableRooms = rooms.filter(r => r.capacity > r.occupancy && r.status !== 'Maintenance');

  // Stats
  const totalAllotments = allotments.length;
  const activeCount = allotments.filter(a => a.status === 'Active').length;
  const vacatedCount = allotments.filter(a => a.status === 'Vacated').length;

  // ── Filter ─────────────────────────────────────────────────────────
  const filtered = allotments.filter(item => {
    const studentName = item.studentId?.studentName?.toLowerCase() || '';
    const enrollNo = item.studentId?.studentId?.toLowerCase() || '';
    const block = item.roomId?.blockName || '';
    const matchSearch = studentName.includes(search.toLowerCase()) || enrollNo.includes(search.toLowerCase());
    const matchBlock = filterBlock === 'All' || block === filterBlock;
    return matchSearch && matchBlock;
  });

  // ── Export ─────────────────────────────────────────────────────────
  const handleExport = () => {
    if (filtered.length === 0) return toast.error('No data to export');
    const data = filtered.map(item => ({
      'Enrollment No': item.studentId?.studentId || 'N/A',
      'Student Name': item.studentId?.studentName || 'N/A',
      'Course': item.studentId?.course || 'N/A',
      'Block': item.roomId?.blockName || 'N/A',
      'Room No': item.roomId?.roomNumber || 'N/A',
      'Allotment Date': item.allotmentDate ? new Date(item.allotmentDate).toLocaleDateString() : 'N/A',
      'Status': item.status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Allotments');
    XLSX.writeFile(wb, `Hostel_Allotments_${filterStatus}.xlsx`);
  };

  // ── New Allotment ─────────────────────────────────────────────────
  const handleAllot = async (e) => {
    e.preventDefault();
    if (!newAllot.studentId || !newAllot.roomId) {
      return toast.error('Please select both Student and Room');
    }
    try {
      await axiosInstance.post('/hostel/allocate', newAllot);
      toast.success('Room allocated successfully!');
      setShowAllotModal(false);
      setNewAllot({ studentId: '', roomId: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error allocating room');
    }
  };

  // ── Vacate ─────────────────────────────────────────────────────────
  const handleVacate = async (item) => {
    const result = await Swal.fire({
      title: 'Vacate Student?',
      html: `Remove <strong>${item.studentId?.studentName}</strong> from <strong>${item.roomId?.blockName} — Room ${item.roomId?.roomNumber}</strong>?<br/><span style="color:#6b7280;font-size:13px">Room occupancy will be decremented automatically.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Vacate',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    });
    if (!result.isConfirmed) return;
    try {
      await axiosInstance.put(`/hostel/allocations/${item._id}/vacate`);
      toast.success(`${item.studentId?.studentName} vacated successfully`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error vacating student');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Student Bed Allotments</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Manage student room allocations, allotment history and vacations</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Excel
          </button>
          <button onClick={() => setShowAllotModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> New Allotment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><Bed size={18} /></div>
          <div><p className="text-[11px] text-gray-500 font-medium">Total Allotments</p><p className="text-[18px] font-bold text-blue-700">{totalAllotments}</p></div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-green-600"><UserCheck size={18} /></div>
          <div><p className="text-[11px] text-gray-500 font-medium">Active Students</p><p className="text-[18px] font-bold text-green-700">{activeCount}</p></div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600"><LogOut size={18} /></div>
          <div><p className="text-[11px] text-gray-500 font-medium">Vacated</p><p className="text-[18px] font-bold text-gray-700">{vacatedCount}</p></div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-3 flex-wrap bg-gray-50/30">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            placeholder="Search by student name or enrollment no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>
        <select value={filterBlock} onChange={(e) => setFilterBlock(e.target.value)}
          className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
          {blocks.map(b => <option key={b} value={b}>{b === 'All' ? 'All Blocks' : b}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); }}
          className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
          <option value="Active">Active Only</option>
          <option value="Vacated">Vacated Only</option>
          <option value="All">All Allotments</option>
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
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Enrollment No</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Course</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Block / Room</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Allotment Date</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.studentId?.studentId || 'N/A'}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.studentId?.studentName || 'Unknown'}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{item.studentId?.course || 'N/A'}</td>
                  <td className="py-4 px-6 text-[13px] font-medium text-gray-700">
                    <span className="bg-[#0A6C54]/5 text-[#0A6C54] px-2 py-0.5 rounded font-semibold text-[12px]">{item.roomId?.blockName}</span>
                    <span className="text-gray-500 ml-1.5">Room {item.roomId?.roomNumber}</span>
                  </td>
                  <td className="py-4 px-6 text-[13px] text-gray-500">
                    {item.allotmentDate ? new Date(item.allotmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                      item.status === 'Active'
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {item.status === 'Active' ? (
                      <button
                        onClick={() => handleVacate(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[12px] font-semibold transition-colors"
                        title="Vacate student from room"
                      >
                        <LogOut size={12} /> Vacate
                      </button>
                    ) : (
                      <span className="text-[12px] text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-400 text-[13px]">
                    {allotments.length === 0
                      ? 'No allotments yet. Click "New Allotment" to assign rooms to students.'
                      : 'No allotments match your current filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {allotments.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 text-[12px] text-gray-400">
          Showing {filtered.length} of {allotments.length} allotments
        </div>
      )}

      {/* ── New Allotment Modal ─────────────────────────────────── */}
      {showAllotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-800 text-[15px]">New Student Allotment</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">{unallocatedStudents.length} unallocated students · {availableRooms.length} rooms available</p>
              </div>
              <button onClick={() => { setShowAllotModal(false); setNewAllot({ studentId: '', roomId: '' }); }} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleAllot} className="p-6 space-y-4">
              {/* Student select */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">
                  Select Student <span className="text-red-400">*</span>
                  <span className="ml-1 text-gray-400 font-normal">({unallocatedStudents.length} available)</span>
                </label>
                {unallocatedStudents.length === 0 ? (
                  <div className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-[12px] text-yellow-700">
                    ⚠️ All students are already allocated to rooms.
                  </div>
                ) : (
                  <select
                    required
                    value={newAllot.studentId}
                    onChange={(e) => setNewAllot({ ...newAllot, studentId: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="">Select a student...</option>
                    {unallocatedStudents.map(s => (
                      <option key={s._id} value={s._id}>{s.studentName} — {s.studentId}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Room select */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">
                  Select Room <span className="text-red-400">*</span>
                  <span className="ml-1 text-gray-400 font-normal">(available only, excludes Maintenance)</span>
                </label>
                {availableRooms.length === 0 ? (
                  <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-[12px] text-red-700">
                    ⚠️ No rooms available. Add rooms or vacate existing allotments.
                  </div>
                ) : (
                  <select
                    required
                    value={newAllot.roomId}
                    onChange={(e) => setNewAllot({ ...newAllot, roomId: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="">Select a room...</option>
                    {availableRooms.map(r => (
                      <option key={r._id} value={r._id}>
                        {r.blockName} — Room {r.roomNumber} · {r.type} · {r.capacity - r.occupancy} bed{r.capacity - r.occupancy !== 1 ? 's' : ''} free
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAllotModal(false); setNewAllot({ studentId: '', roomId: '' }); }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={unallocatedStudents.length === 0 || availableRooms.length === 0}
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-[13px] font-semibold"
                >
                  Allot Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Allotment;
