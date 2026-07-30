import React, { useState } from 'react';
import { Search, Eye, CheckCircle, ChevronDown } from 'lucide-react';

const regData = [
  { id: 1, appNo: 'APP/2024/004', name: 'Muskan Jain', course: 'Diploma in EE', dept: 'Electrical', semester: '1st', section: 'A', enrollNo: '', studentId: '', rollNo: '', status: 'Pending Registration' },
  { id: 2, appNo: 'APP/2024/007', name: 'Arjun Kumar', course: 'Diploma in ME', dept: 'Mechanical', semester: '1st', section: 'B', enrollNo: 'OP/24/ME/001', studentId: 'STU2024001', rollNo: '101', status: 'Registered' },
  { id: 3, appNo: 'APP/2024/002', name: 'Neha Verma', course: 'Diploma in IT', dept: 'IT', semester: '1st', section: 'A', enrollNo: '', studentId: '', rollNo: '', status: 'Pending Registration' },
];

const StudentRegistration = () => {
  const [search, setSearch] = useState('');
  const filtered = regData.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.appNo.includes(search));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[18px] font-bold text-gray-800">Student Registration</h2>
        <p className="text-[12px] text-gray-500 mt-0.5">Generate student IDs and enrollment numbers after admission approval</p>
      </div>
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by name or app no..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-100">
              {['App No.','Student Name','Course','Dept','Semester','Section','Enrollment No.','Student ID','Roll No.','Status','Actions'].map(h => (
                <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{r.appNo}</td>
                <td className="py-3 px-4 text-[13px] font-medium text-gray-800">{r.name}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{r.course}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{r.dept}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{r.semester}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{r.section}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{r.enrollNo || <span className="text-gray-400">-</span>}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{r.studentId || <span className="text-gray-400">-</span>}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{r.rollNo || <span className="text-gray-400">-</span>}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${r.status === 'Registered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{r.status}</span>
                </td>
                <td className="py-3 px-4">
                  {r.status === 'Pending Registration' ? (
                    <button className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-3 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1">
                      <CheckCircle size={13} /> Register
                    </button>
                  ) : (
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye size={15} className="text-gray-500" /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentRegistration;
