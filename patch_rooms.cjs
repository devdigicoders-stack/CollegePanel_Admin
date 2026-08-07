const fs = require('fs');
const path = require('path');

const filepath = path.join('d:', 'Desktop', 'DCT_CLG_CRM', 'admin', 'src', 'pages', 'hostel-warden', 'Rooms.jsx');

const content = `import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Eye, Download, Bed, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../../utils/axiosInstance';

const blocks = ['All', 'Block A (Boys)', 'Block B (Boys)', 'Block C (Girls)', 'Block D (Girls)'];
const roomTypes = ['All', 'AC', 'Non-AC'];

const Rooms = () => {
  const [search, setSearch] = useState('');
  const [filterBlock, setFilterBlock] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    blockName: 'Block A (Boys)',
    type: 'Non-AC',
    capacity: 2
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/hostel/rooms');
      setRooms(res.data.rooms || []);
    } catch (error) {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const filtered = rooms.filter(r => {
    const matchesSearch = r.roomNumber.toLowerCase().includes(search.toLowerCase());
    const matchesBlock = filterBlock === 'All' || r.blockName === filterBlock;
    const matchesType = filterType === 'All' || r.type === filterType;
    return matchesSearch && matchesBlock && matchesType;
  });

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        roomNumber: newRoom.roomNumber,
        blockName: newRoom.blockName,
        type: newRoom.type,
        capacity: parseInt(newRoom.capacity)
      };
      
      const res = await axiosInstance.post('/hostel/rooms', payload);
      setRooms([...rooms, res.data.room]);
      setShowAddModal(false);
      toast.success(\`Room \${newRoom.roomNumber} added to \${newRoom.blockName}\`);
      
      setNewRoom({
        roomNumber: '',
        blockName: 'Block A (Boys)',
        type: 'Non-AC',
        capacity: 2
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding room');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Rooms & Bed Configurations</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Configure block details and bed allocations</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Configure Room
          </button>
        </div>
      </div>

      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap bg-gray-50/30">
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

      <div className="overflow-x-auto flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">Loading rooms...</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Room No</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Hostel Block</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Type</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Beds (Occupied/Total)</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-bold text-gray-900">Room {item.roomNumber}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-medium">{item.blockName}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{item.type}</td>
                  <td className="py-4 px-6 text-[13px] text-center font-bold">
                    <span className={(item.capacity - item.occupancy) === 0 ? 'text-red-500' : 'text-green-600'}>{item.occupancy}</span> / {item.capacity}
                  </td>
                  <td className="py-4 px-6">
                    <span className={\`px-2.5 py-1 rounded-full text-[11px] font-semibold \${
                      item.status === 'Available' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }\`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500 text-[13px]">No rooms found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

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
                    value={newRoom.roomNumber}
                    onChange={(e) => setNewRoom({...newRoom, roomNumber: e.target.value})}
                    placeholder="e.g. 104"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Hostel Block</label>
                  <select 
                    value={newRoom.blockName} 
                    onChange={(e) => setNewRoom({...newRoom, blockName: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    {blocks.filter(b => b !== 'All').map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
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
`;

fs.writeFileSync(filepath, content, 'utf-8');
console.log("Rewrote Rooms.jsx");
