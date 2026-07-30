import React, { useState } from 'react';
import { Search, Save, Calendar, CheckSquare, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const initialStudents = [
  { id: 1, name: 'Aarav Singh', room: '101', block: 'Block A (Boys)', status: 'Present' },
  { id: 2, name: 'Vikram Patel', room: '102', block: 'Block A (Boys)', status: 'Present' },
  { id: 3, name: 'Jayesh Soni', room: '102', block: 'Block A (Boys)', status: 'Present' },
  { id: 4, name: 'Neha Verma', room: '301', block: 'Block C (Girls)', status: 'On Leave' },
  { id: 5, name: 'Aditi Rao', room: '304', block: 'Block C (Girls)', status: 'Present' },
];

const Attendance = () => {
  const [filterBlock, setFilterBlock] = useState('Block A (Boys)');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState(initialStudents);

  const handleStatusChange = (id, newStatus) => {
    setStudents(students.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const handleBulkPresent = () => {
    setStudents(students.map(s => s.block === filterBlock && s.status !== 'On Leave' ? { ...s, status: 'Present' } : s));
    toast.success(`Marked all active students in ${filterBlock} as Present.`);
  };

  const handleSaveAttendance = () => {
    toast.success('Daily Night Attendance logged successfully for date: ' + date);
  };

  const filtered = students.filter(s => s.block === filterBlock);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
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
            <Save size={16} /> Save Attendance Sheet
          </button>
        </div>
      </div>

      {/* Selector and Parameters */}
      <div className="p-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-semibold text-gray-600 mb-1">Select Hostel Block</label>
          <select 
            value={filterBlock} 
            onChange={(e) => setFilterBlock(e.target.value)}
            className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option value="Block A (Boys)">Block A (Boys)</option>
            <option value="Block B (Boys)">Block B (Boys)</option>
            <option value="Block C (Girls)">Block C (Girls)</option>
          </select>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-gray-600 mb-1">Attendance Date</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none"
          />
        </div>
      </div>

      {/* Table List */}
      <div className="overflow-x-auto flex-1">
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
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">Room {item.room}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{item.block}</td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    {['Present', 'Absent', 'On Leave', 'Outing', 'Medical'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(item.id, status)}
                        className={`px-3 py-1 rounded text-[11px] font-bold border transition-colors ${
                          item.status === status
                            ? status === 'Present' ? 'bg-green-50 text-green-700 border-green-200 shadow-sm' :
                              status === 'Absent' ? 'bg-red-50 text-red-700 border-red-200 shadow-sm' :
                              'bg-orange-50 text-orange-700 border-orange-200 shadow-sm'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
