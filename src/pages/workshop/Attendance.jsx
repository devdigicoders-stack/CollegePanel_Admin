import React, { useState } from 'react';
import { Search, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const initialStudents = [
  { id: 1, name: 'Aarav Singh', enrollNo: 'OP/23/ME/001', batch: 'Batch W1', status: 'Present' },
  { id: 2, name: 'Vikram Patel', enrollNo: 'OP/23/ME/015', batch: 'Batch W1', status: 'Present' },
  { id: 3, name: 'Jayesh Soni', enrollNo: 'OP/23/ME/104', batch: 'Batch W1', status: 'Late' },
  { id: 4, name: 'Rahul Joshi', enrollNo: 'OP/23/ME/018', batch: 'Batch W1', status: 'Absent' },
];

const PracticalAttendance = () => {
  const [filterBatch, setFilterBatch] = useState('Batch W1');
  const [jobNo, setJobNo] = useState('Job #3 (Arc Butt Joint Welding)');
  const [students, setStudents] = useState(initialStudents);

  const handleStatusChange = (id, newStatus) => {
    setStudents(students.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const handleSave = () => {
    toast.success(`Practical attendance saved for ${jobNo}!`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Practical Attendance Logging</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Record batch attendance logs and link exercises to job sheet numbers</p>
        </div>
        <button onClick={handleSave} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-colors">
          Save Attendance Sheet
        </button>
      </div>

      {/* Selectors */}
      <div className="p-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-semibold text-gray-600 mb-1">Select Batch</label>
          <select 
            value={filterBatch} 
            onChange={(e) => setFilterBatch(e.target.value)}
            className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option value="Batch W1">Batch W1 (1st Sem)</option>
            <option value="Batch W2">Batch W2 (3rd Sem)</option>
          </select>
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-gray-600 mb-1">Current Job / Exercise</label>
          <input 
            type="text" 
            value={jobNo}
            onChange={(e) => setJobNo(e.target.value)}
            className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Enrollment No</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Batch Code</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Workshop Attendance</th>
            </tr>
          </thead>
          <tbody>
            {students.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.enrollNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-semibold">{item.batch}</td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    {['Present', 'Absent', 'Late'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(item.id, status)}
                        className={`px-3 py-1 rounded text-[11px] font-bold border transition-colors ${
                          item.status === status
                            ? status === 'Present' ? 'bg-green-50 text-green-700 border-green-200 shadow-sm' :
                              status === 'Absent' ? 'bg-red-50 text-red-700 border-red-200 shadow-sm' :
                              'bg-yellow-50 text-yellow-700 border-yellow-200 shadow-sm'
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

export default PracticalAttendance;
