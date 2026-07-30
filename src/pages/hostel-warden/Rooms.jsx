import React, { useState } from 'react';
import { Search, Plus, Edit2, Eye, Download, Bed, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const initialRooms = [
  { id: 1, roomNo: '101', block: 'Block A (Boys)', floor: 'Ground Floor', type: 'Double sharing', capacity: 2, occupied: 2, available: 0, status: 'Occupied', fee: 4500, condition: 'Good' },
  { id: 2, roomNo: '102', block: 'Block A (Boys)', floor: 'Ground Floor', type: 'Triple sharing', capacity: 3, occupied: 2, available: 1, status: 'Available', fee: 3800, condition: 'Good' },
  { id: 3, roomNo: '201', block: 'Block B (Boys)', floor: '1st Floor', type: 'Single', capacity: 1, occupied: 0, available: 1, status: 'Available', fee: 6000, condition: 'Requires Cleaning' },
  { id: 4, roomNo: '301', block: 'Block C (Girls)', floor: '2nd Floor', type: 'Double sharing', capacity: 2, occupied: 1, available: 1, status: 'Available', fee: 4500, condition: 'Good' },
  { id: 5, roomNo: '302', block: 'Block C (Girls)', floor: '2nd Floor', type: 'Dormitory', capacity: 6, occupied: 6, available: 0, status: 'Occupied', fee: 2500, condition: 'Good' },
];

const blocks = ['All', 'Block A (Boys)', 'Block B (Boys)', 'Block C (Girls)', 'Block D (Girls)'];
const roomTypes = ['All', 'Single', 'Double sharing', 'Triple sharing', 'Dormitory'];

const Rooms = () => {
  const [search, setSearch] = useState('');
  const [filterBlock, setFilterBlock] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [rooms, setRooms] = useState(initialRooms);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    roomNo: '',
    block: 'Block A (Boys)',
    floor: 'Ground Floor',
    type: 'Double sharing',
    capacity: 2,
    fee: 4500,
    condition: 'Good'
  });

  const filtered = rooms.filter(r => {
    const matchesSearch = r.roomNo.includes(search);
    const matchesBlock = filterBlock === 'All' || r.block === filterBlock;
    const matchesType = filterType === 'All' || r.type === filterType;
    return matchesSearch && matchesBlock && matchesType;
  });

  const handleAddRoom = (e) => {
    e.preventDefault();
    const roomToAdd = {
      id: rooms.length + 1,
      roomNo: newRoom.roomNo,
      block: newRoom.block,
      floor: newRoom.floor,
      type: newRoom.type,
      capacity: parseInt(newRoom.capacity),
      occupied: 0,
      available: parseInt(newRoom.capacity),
      status: 'Available',
      fee: parseInt(newRoom.fee),
      condition: newRoom.condition
    };
    setRooms([...rooms, roomToAdd]);
    setShowAddModal(false);
    toast.success(`Room ${newRoom.roomNo} configured in ${newRoom.block}`);
    setNewRoom({
      roomNo: '',
      block: 'Block A (Boys)',
      floor: 'Ground Floor',
      type: 'Double sharing',
      capacity: 2,
      fee: 4500,
      condition: 'Good'
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Rooms & Bed Configurations</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Configure block details, floor allocations, and monthly fees</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Inventory
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Configure Room
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by Room Number..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>

        <div className="flex gap-3">
          <select 
            value={filterBlock} 
            onChange={(e) => setFilterBlock(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            {blocks.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Room No</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Hostel Block</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Floor</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Sharing Type</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Beds (Occupied/Total)</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Fee (Monthly)</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Condition</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-bold text-gray-900">Room {item.roomNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-medium">{item.block}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.floor}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{item.type}</td>
                <td className="py-4 px-6 text-[13px] text-center font-bold">
                  <span className={item.available === 0 ? 'text-red-500' : 'text-green-600'}>{item.occupied}</span> / {item.capacity}
                </td>
                <td className="py-4 px-6 text-[13px] text-right font-bold text-gray-900">₹{item.fee}</td>
                <td className="py-4 px-6 text-[13px] font-medium text-gray-600">{item.condition}</td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Available' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6 flex gap-2">
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"><Eye size={15} /></button>
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"><Edit2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Configure New Room</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddRoom} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Room Number</label>
                  <input 
                    type="text" 
                    required
                    value={newRoom.roomNo}
                    onChange={(e) => setNewRoom({...newRoom, roomNo: e.target.value})}
                    placeholder="e.g. 104"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Floor</label>
                  <select 
                    value={newRoom.floor} 
                    onChange={(e) => setNewRoom({...newRoom, floor: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Ground Floor">Ground Floor</option>
                    <option value="1st Floor">1st Floor</option>
                    <option value="2nd Floor">2nd Floor</option>
                    <option value="3rd Floor">3rd Floor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Hostel Block</label>
                <select 
                  value={newRoom.block} 
                  onChange={(e) => setNewRoom({...newRoom, block: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                >
                  {blocks.filter(b => b !== 'All').map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Sharing Type</label>
                  <select 
                    value={newRoom.type} 
                    onChange={(e) => setNewRoom({...newRoom, type: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    {roomTypes.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Bed Capacity</label>
                  <input 
                    type="number" 
                    required
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({...newRoom, capacity: e.target.value})}
                    min="1"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Monthly Fee (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={newRoom.fee}
                    onChange={(e) => setNewRoom({...newRoom, fee: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Room Condition</label>
                  <select 
                    value={newRoom.condition} 
                    onChange={(e) => setNewRoom({...newRoom, condition: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Good">Good</option>
                    <option value="Requires Cleaning">Requires Cleaning</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold"
                >
                  Save Configuration
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
