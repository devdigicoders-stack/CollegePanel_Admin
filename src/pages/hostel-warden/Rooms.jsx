import { useState, useEffect } from 'react';
import { Search, Plus, Download, Edit2, Trash2, Bed, CheckSquare, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';
import SkeletonLoader from '../../components/SkeletonLoader';

const ROOM_TYPES = ['AC', 'Non-AC'];
const ROOM_STATUSES = ['Available', 'Full', 'Maintenance'];

const Rooms = () => {
  if (!checkPermission('Manage Rooms')) {
    return <AccessDenied />;
  }
  const [search, setSearch] = useState('');
  const [filterBlock, setFilterBlock] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [rooms, setRooms] = useState([]);
  const [blocks, setBlocks] = useState(['All']);
  const [loading, setLoading] = useState(true);

  // Add Room modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoom, setNewRoom] = useState({ roomNumber: '', blockName: '', type: 'Non-AC', capacity: 2 });
  const [blockSearch, setBlockSearch] = useState('');
  const [showBlockDropdown, setShowBlockDropdown] = useState(false);


  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRoom, setEditRoom] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/hostel/rooms');
      const fetchedRooms = res.data.rooms || [];
      setRooms(fetchedRooms);
      const uniqueBlocks = ['All', ...new Set(fetchedRooms.map(r => r.blockName).filter(Boolean))];
      setBlocks(uniqueBlocks);
    } catch {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────
  const totalRooms = rooms.length;
  const totalBeds = rooms.reduce((s, r) => s + r.capacity, 0);
  const totalOccupied = rooms.reduce((s, r) => s + r.occupancy, 0);
  const totalAvailable = totalBeds - totalOccupied;
  const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance').length;

  // ── Filter ─────────────────────────────────────────────────────────
  const filtered = rooms.filter(r => {
    const matchSearch = r.roomNumber?.toLowerCase().includes(search.toLowerCase()) ||
                        r.blockName?.toLowerCase().includes(search.toLowerCase());
    const matchBlock = filterBlock === 'All' || r.blockName === filterBlock;
    const matchType = filterType === 'All' || r.type === filterType;
    const matchStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchSearch && matchBlock && matchType && matchStatus;
  });

  // ── Export ─────────────────────────────────────────────────────────
  const handleExport = () => {
    if (rooms.length === 0) return toast.error('No rooms to export');
    const data = rooms.map(r => ({
      'Room No': r.roomNumber, 'Block': r.blockName, 'Type': r.type,
      'Capacity': r.capacity, 'Occupancy': r.occupancy,
      'Available Beds': r.capacity - r.occupancy, 'Status': r.status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rooms');
    XLSX.writeFile(wb, 'Hostel_Rooms_Report.xlsx');
  };

  // ── Add Room ───────────────────────────────────────────────────────
  const handleAddRoom = async (e) => {
    e.preventDefault();
    const blockName = newRoom.blockName?.trim();
    if (!blockName) return toast.error('Please select or enter a hostel block name');
    try {
      await axiosInstance.post('/hostel/rooms', {
        roomNumber: newRoom.roomNumber,
        blockName,
        type: newRoom.type,
        capacity: parseInt(newRoom.capacity)
      });
      toast.success(`Room ${newRoom.roomNumber} added to ${blockName}`);
      setShowAddModal(false);
      setNewRoom({ roomNumber: '', blockName: '', type: 'Non-AC', capacity: 2 });
      setBlockSearch('');
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding room');
    }
  };

  // ── Edit Room ──────────────────────────────────────────────────────
  const openEditModal = (room) => {
    setEditRoom({ ...room });
    setShowEditModal(true);
  };

  const handleEditRoom = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/hostel/rooms/${editRoom._id}`, {
        status: editRoom.status,
        type: editRoom.type,
        capacity: parseInt(editRoom.capacity)
      });
      toast.success(`Room ${editRoom.roomNumber} updated`);
      setShowEditModal(false);
      setEditRoom(null);
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating room');
    }
  };

  // ── Delete Room ────────────────────────────────────────────────────
  const handleDeleteRoom = async (room) => {
    if (room.occupancy > 0) {
      return Swal.fire({
        icon: 'warning',
        title: 'Cannot Delete Room',
        html: `Room <strong>${room.roomNumber}</strong> has <strong>${room.occupancy}</strong> active occupant(s).<br/>Please vacate the room before deleting.`,
        confirmButtonText: 'OK',
        confirmButtonColor: 'var(--color-primary)',
      });
    }

    const result = await Swal.fire({
      title: `Delete Room ${room.roomNumber}?`,
      html: `You are about to delete <strong>Room ${room.roomNumber}</strong> from <strong>${room.blockName}</strong>.<br/><span style="color:#ef4444">This action cannot be undone.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await axiosInstance.delete(`/hostel/rooms/${room._id}`);
      toast.success(`Room ${room.roomNumber} deleted successfully`);
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting room');
    }
  };

  const statusColor = (s) => {
    if (s === 'Available') return 'bg-green-50 text-green-700 border-green-100';
    if (s === 'Full') return 'bg-red-50 text-red-700 border-red-100';
    return 'bg-yellow-50 text-yellow-700 border-yellow-100';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Rooms & Bed Configurations</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Configure hostel blocks, rooms and track bed occupancy</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Excel
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Add Room
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><Bed size={18} /></div>
          <div><p className="text-[11px] text-gray-500 font-medium">Total Rooms</p><p className="text-[18px] font-bold text-blue-700">{totalRooms}</p></div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-green-600"><CheckSquare size={18} /></div>
          <div><p className="text-[11px] text-gray-500 font-medium">Available Beds</p><p className="text-[18px] font-bold text-green-700">{totalAvailable} / {totalBeds}</p></div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center text-red-600"><Bed size={18} /></div>
          <div><p className="text-[11px] text-gray-500 font-medium">Occupied Beds</p><p className="text-[18px] font-bold text-red-700">{totalOccupied}</p></div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600"><AlertTriangle size={18} /></div>
          <div><p className="text-[11px] text-gray-500 font-medium">Maintenance</p><p className="text-[18px] font-bold text-yellow-700">{maintenanceRooms}</p></div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-3 flex-wrap bg-gray-50/30">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            placeholder="Search by room number or block..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select value={filterBlock} onChange={(e) => setFilterBlock(e.target.value)}
          className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
          {blocks.map(b => <option key={b} value={b}>{b === 'All' ? 'All Blocks' : b}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
          <option value="All">All Types</option>
          {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
          <option value="All">All Statuses</option>
          {ROOM_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
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
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Room No</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Hostel Block</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Type</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Beds (Occupied / Total)</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Availability</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-bold text-gray-900">Room {item.roomNumber}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-medium">{item.blockName}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${item.type === 'AC' ? 'bg-cyan-50 text-cyan-700' : 'bg-gray-100 text-gray-600'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[13px] text-center font-bold">
                    <span className={item.occupancy >= item.capacity ? 'text-red-500' : 'text-green-600'}>{item.occupancy}</span>
                    <span className="text-gray-400"> / {item.capacity}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex justify-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.occupancy >= item.capacity ? 'bg-red-500' : item.occupancy > item.capacity * 0.7 ? 'bg-orange-400' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(100, (item.occupancy / item.capacity) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">{item.capacity - item.occupancy} free</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(item)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors" title="Edit Room">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDeleteRoom(item)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Delete Room">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-400 text-[13px]">
                    {rooms.length === 0 ? 'No rooms configured yet. Click "Add Room" to get started.' : 'No rooms match your filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer count */}
      {rooms.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 text-[12px] text-gray-400">
          Showing {filtered.length} of {rooms.length} rooms
        </div>
      )}

      {/* ── Add Room Modal ───────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Add New Room</h3>
              <button onClick={() => { setShowAddModal(false); setNewRoom({ roomNumber: '', blockName: '', type: 'Non-AC', capacity: 2 }); setBlockSearch(''); }} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleAddRoom} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Room Number *</label>
                  <input
                    type="text" required
                    value={newRoom.roomNumber}
                    onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                    placeholder="e.g. 101"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="relative">
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Hostel Block *</label>
                  <div className="relative">
                    <input
                      type="text"
                      autoComplete="off"
                      value={newRoom.blockName || blockSearch}
                      placeholder="Type or select a block..."
                      onFocus={() => setShowBlockDropdown(true)}
                      onBlur={() => setTimeout(() => setShowBlockDropdown(false), 150)}
                      onChange={(e) => {
                        setBlockSearch(e.target.value);
                        setNewRoom({ ...newRoom, blockName: e.target.value });
                        setShowBlockDropdown(true);
                      }}
                      className="w-full p-2.5 pr-8 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                    {newRoom.blockName ? (
                      <button
                        type="button"
                        onClick={() => { setNewRoom({ ...newRoom, blockName: '' }); setBlockSearch(''); }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-base leading-none"
                      >×</button>
                    ) : (
                      <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    )}
                  </div>

                  {/* Dropdown */}
                  {showBlockDropdown && (
                    <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                      {/* Existing blocks filtered */}
                      {blocks.filter(b => b !== 'All' && b.toLowerCase().includes((newRoom.blockName || '').toLowerCase())).length > 0 && (
                        <div>
                          <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Existing Blocks</p>
                          {blocks
                            .filter(b => b !== 'All' && b.toLowerCase().includes((newRoom.blockName || '').toLowerCase()))
                            .map(b => (
                              <button
                                key={b}
                                type="button"
                                onMouseDown={() => {
                                  setNewRoom({ ...newRoom, blockName: b });
                                  setBlockSearch(b);
                                  setShowBlockDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-primary/5 hover:text-primary flex items-center gap-2.5 transition-colors"
                              >
                                <span className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold flex-shrink-0">
                                  {b.charAt(0).toUpperCase()}
                                </span>
                                {b}
                              </button>
                            ))}
                        </div>
                      )}

                      {/* Create new option */}
                      {newRoom.blockName?.trim() && !blocks.filter(b => b !== 'All').map(b => b.toLowerCase()).includes(newRoom.blockName.trim().toLowerCase()) && (
                        <div className="border-t border-gray-100">
                          <button
                            type="button"
                            onMouseDown={() => {
                              setShowBlockDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-[13px] flex items-center gap-2.5 text-primary hover:bg-green-50 transition-colors"
                          >
                            <span className="w-6 h-6 rounded-md bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">+</span>
                            <span>Create <strong>"{newRoom.blockName.trim()}"</strong> as new block</span>
                          </button>
                        </div>
                      )}

                      {/* Empty state */}
                      {blocks.filter(b => b !== 'All').length === 0 && !newRoom.blockName?.trim() && (
                        <div className="px-4 py-4 text-[12px] text-gray-400 text-center">
                          No blocks yet. Type a name to create your first block.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Room Type</label>
                  <select
                    value={newRoom.type}
                    onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Bed Capacity</label>
                  <input
                    type="number" required min="1" max="20"
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAddModal(false); setNewRoom({ roomNumber: '', blockName: '', type: 'Non-AC', capacity: 2 }); setBlockSearch(''); }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold">
                  Add Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Room Modal ──────────────────────────────────── */}
      {showEditModal && editRoom && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Edit Room {editRoom.roomNumber} — {editRoom.blockName}</h3>
              <button onClick={() => { setShowEditModal(false); setEditRoom(null); }} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleEditRoom} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Room Type</label>
                  <select
                    value={editRoom.type}
                    onChange={(e) => setEditRoom({ ...editRoom, type: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Bed Capacity</label>
                  <input
                    type="number" required min={editRoom.occupancy || 1}
                    value={editRoom.capacity}
                    onChange={(e) => setEditRoom({ ...editRoom, capacity: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {editRoom.occupancy > 0 && <p className="text-[11px] text-orange-500 mt-1">Min capacity: {editRoom.occupancy} (current occupancy)</p>}
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Room Status</label>
                <select
                  value={editRoom.status}
                  onChange={(e) => setEditRoom({ ...editRoom, status: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {ROOM_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {editRoom.status === 'Maintenance' && (
                  <p className="text-[11px] text-yellow-600 mt-1 bg-yellow-50 p-2 rounded-lg">⚠️ Maintenance rooms won't be available for new allotments.</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowEditModal(false); setEditRoom(null); }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
