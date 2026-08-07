const fs = require('fs');
const path = require('path');

const filepath = path.join('d:', 'Desktop', 'DCT_CLG_CRM', 'admin', 'src', 'pages', 'hostel-warden', 'Attendance.jsx');

const content = `import React, { useState, useEffect } from 'react';
import { Search, Save, Calendar, CheckSquare, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../../utils/axiosInstance';

const blocks = ['All', 'Block A (Boys)', 'Block B (Boys)', 'Block C (Girls)', 'Block D (Girls)'];

const Attendance = () => {
  const [filterBlock, setFilterBlock] = useState('All');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]); // Will hold { studentId, roomId, blockName, roomNumber, name, rollNumber, status }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch active allocations to know who is in the hostel
      const allocRes = await axiosInstance.get('/hostel/allocations');
      const activeAllocs = allocRes.data || [];
      
      // Fetch attendance for the specific date
      const attRes = await axiosInstance.get(\`/hostel/attendance?date=\${date}\`);
      const attendanceLogs = attRes.data || [];
      
      // Merge
      const merged = activeAllocs.map(alloc => {
        const log = attendanceLogs.find(a => a.studentId?._id === alloc.studentId?._id);
        return {
          id: alloc.studentId?._id, // use studentId as unique key
          name: alloc.studentId?.name,
          rollNumber: alloc.studentId?.rollNumber,
          roomId: alloc.roomId?._id,
          block: alloc.roomId?.blockName,
          room: alloc.roomId?.roomNumber,
          status: log ? log.status : 'Absent' // default to Absent if not marked
        };
      });
      
      setStudents(merged);
    } catch (error) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setStudents(students.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const handleBulkPresent = () => {
    setStudents(students.map(s => {
      if ((filterBlock === 'All' || s.block === filterBlock) && s.status !== 'On Leave') {
        return { ...s, status: 'Present' };
      }
      return s;
    }));
    toast.success(\`Marked eligible students as Present.\`);
  };

  const handleSaveAttendance = async () => {
    try {
      const records = students.map(s => ({
        studentId: s.id,
        roomId: s.roomId,
        status: s.status,
        remarks: ''
      }));
      
      await axiosInstance.post('/hostel/attendance', {
        date,
        records
      });
      toast.success('Daily Night Attendance logged successfully for date: ' + date);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving attendance');
    }
  };

  const filtered = students.filter(s => filterBlock === 'All' || s.block === filterBlock);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Daily Night Attendance</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium font-semibold">Perform nightly check-in logs by room and block</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleBulkPresent} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <CheckSquare size={15} /> Bulk Mark Present
          </button>
          <button onClick={handleSaveAttendance} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Save size={16} /> Save Attendance
          </button>
        </div>
      </div>

      <div className="p-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/30">
        <div>
          <label className="block text-[12px] font-semibold text-gray-600 mb-1">Select Hostel Block</label>
          <select 
            value={filterBlock} 
            onChange={(e) => setFilterBlock(e.target.value)}
            className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            {blocks.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-gray-600 mb-1">Attendance Date</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        {loading ? (
           <div className="flex justify-center py-12 text-gray-500">Loading attendance data...</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Room No</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Block</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Attendance Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name} <span className="text-gray-500 text-[11px] font-normal block">{item.rollNumber}</span></td>
                  <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">Room {item.room}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{item.block}</td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      {['Present', 'Absent', 'On Leave'].map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(item.id, status)}
                          className={\`px-3 py-1 rounded text-[11px] font-bold border transition-colors \${
                            item.status === status
                              ? status === 'Present' ? 'bg-green-50 text-green-700 border-green-200 shadow-sm' :
                                status === 'Absent' ? 'bg-red-50 text-red-700 border-red-200 shadow-sm' :
                                'bg-orange-50 text-orange-700 border-orange-200 shadow-sm'
                              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                          }\`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500 text-[13px]">No active students found for this block.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Attendance;
`;

fs.writeFileSync(filepath, content, 'utf-8');
console.log("Rewrote Attendance.jsx");
