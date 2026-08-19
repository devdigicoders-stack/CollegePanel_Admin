import React, { useState } from 'react';
import { Search, Download, Plus, Edit2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const initialBatches = [
  { id: 1, name: 'Batch W1', dept: 'Mechanical', semester: '1st Sem', section: 'Sec A', studentsCount: 22, sectionName: 'Welding & Fitting Sec', timing: '08:30 AM - 11:30 AM' },
  { id: 2, name: 'Batch W2', dept: 'Mechanical', semester: '3rd Sem', section: 'Sec B', studentsCount: 25, sectionName: 'Turning & Lathe Sec', timing: '12:00 PM - 03:00 PM' },
];

const StudentBatches = () => {
  const [search, setSearch] = useState('');
  const [batches, setBatches] = useState(initialBatches);

  const filtered = batches.filter(b => {
    return b.name.toLowerCase().includes(search.toLowerCase()) || 
           b.dept.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Workshop Student Batches</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Monitor trade sections, department allocations, and batch timings</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={15} /> Export Roster
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by batch name or department..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Batch Code</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Department</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Semester / Academic Section</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Students Registered</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Assigned Workshop Section</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Timings</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-bold text-gray-900">{item.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-semibold">{item.dept}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.semester} - {item.section}</td>
                <td className="py-4 px-6 text-[13px] text-center font-bold text-primary">{item.studentsCount} Studs</td>
                <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">{item.sectionName}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500 font-semibold">{item.timing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentBatches;
