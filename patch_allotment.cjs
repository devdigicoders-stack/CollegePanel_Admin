const fs = require('fs');
const path = require('path');

const filepath = path.join('d:', 'Desktop', 'DCT_CLG_CRM', 'admin', 'src', 'pages', 'hostel-warden', 'Allotment.jsx');

const content = `import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, FileText, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../../utils/axiosInstance';

const Allotment = () => {
  const [search, setSearch] = useState('');
  const [allotments, setAllotments] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllotModal, setShowAllotModal] = useState(false);
  const [newAllot, setNewAllot] = useState({
    studentId: '',
    roomId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allocRes, studentsRes, roomsRes] = await Promise.all([
        axiosInstance.get('/hostel/allocations'),
        axiosInstance.get('/students'),
        axiosInstance.get('/hostel/rooms')
      ]);
      setAllotments(allocRes.data || []);
      setStudents(studentsRes.data.students || []);
      setRooms(roomsRes.data.rooms || []);
    } catch (error) {
      toast.error('Failed to load allotments data');
    } finally {
      setLoading(false);
    }
  };

  const filtered = allotments.filter(item => {
    const studentName = item.studentId?.name?.toLowerCase() || '';
    const enrollNo = item.studentId?.rollNumber?.toLowerCase() || '';
    return studentName.includes(search.toLowerCase()) || enrollNo.includes(search.toLowerCase());
  });

  const availableRooms = rooms.filter(r => r.capacity > r.occupancy);

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
      fetchData(); // Refresh list to get populated names
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error allocating room');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Student Bed Allotments</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Manage student room allocations and occupancy</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAllotModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> New Allotment
          </button>
        </div>
      </div>

      <div className="p-6 border-b border-gray-100 bg-gray-50/30">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by student name or enrollment no..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">Loading allotments...</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Enrollment No</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Course</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Block / Room</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Allotment Date</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.studentId?.rollNumber || 'N/A'}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.studentId?.name || 'Unknown'}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.studentId?.course || 'N/A'}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-700 font-bold">{item.roomId?.blockName} - Room {item.roomId?.roomNumber}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-500">{new Date(item.allotmentDate).toLocaleDateString()}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={\`px-2.5 py-1 rounded-full text-[11px] font-semibold \${
                      item.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }\`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500 text-[13px]">No allotments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showAllotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">New Student Allotment</h3>
              <button onClick={() => setShowAllotModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAllot} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Select Student</label>
                <select 
                  required
                  value={newAllot.studentId}
                  onChange={(e) => setNewAllot({...newAllot, studentId: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                >
                  <option value="">Select a student...</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Select Room (Available only)</label>
                <select 
                  required
                  value={newAllot.roomId}
                  onChange={(e) => setNewAllot({...newAllot, roomId: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                >
                  <option value="">Select a room...</option>
                  {availableRooms.map(r => (
                    <option key={r._id} value={r._id}>{r.blockName} - Room {r.roomNumber} ({r.capacity - r.occupancy} beds available)</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAllotModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold"
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
`;

fs.writeFileSync(filepath, content, 'utf-8');
console.log("Rewrote Allotment.jsx");
