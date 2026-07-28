import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const Attendance = () => {
  const [students, setStudents] = useState([
    { id: 1, roll: 'CE/23/1001', name: 'Aarav Singh', status: 'Present', remarks: '' },
    { id: 2, roll: 'CE/23/1002', name: 'Pooja Yadav', status: 'Present', remarks: '' },
    { id: 3, roll: 'CE/23/1003', name: 'Mohit Verma', status: 'Absent', remarks: 'Medical Leave' },
    { id: 4, roll: 'CE/23/1004', name: 'Rahul Kumar', status: 'Present', remarks: '' },
    { id: 5, roll: 'CE/23/1005', name: 'Neha Kumari', status: 'Late', remarks: '10 Min Late' },
  ]);

  const handleStatusChange = (id, newStatus) => {
    setStudents(students.map(student => 
      student.id === id ? { ...student, status: newStatus } : student
    ));
  };

  const handleRemarksChange = (id, newRemarks) => {
    setStudents(students.map(student => 
      student.id === id ? { ...student, remarks: newRemarks } : student
    ));
  };

  // Calculate totals
  const totalPresent = students.filter(s => s.status === 'Present').length;
  const totalAbsent = students.filter(s => s.status === 'Absent').length;
  const totalLate = students.filter(s => s.status === 'Late').length;

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Top Filter Section */}
      <div className="p-4 md:p-6 border-b border-gray-50 flex flex-col md:flex-row items-stretch md:items-end gap-4 md:gap-6">
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Select Class<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm">
                <option>CE 2nd Sem - A</option>
                <option>CE 2nd Sem - B</option>
                <option>ME 4th Sem - A</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Select Subject<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm">
                <option>Engineering Mechanics</option>
                <option>Applied Mathematics</option>
                <option>Basic Electrical</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Date
            </label>
            <input 
              type="date" 
              defaultValue="2024-05-21"
              className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] shadow-sm"
            />
          </div>
        </div>

        <button className="w-full md:w-auto bg-[#0A6C54] hover:bg-[#085a46] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm">
          Load Students
        </button>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-x-auto p-6 pt-2">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#F9FAFB] border-y border-gray-100">
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[20%] rounded-tl-xl">Roll No.</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[30%]">Student Name</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[25%]">Status</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[25%] rounded-tr-xl">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-medium text-gray-600">{student.roll}</td>
                <td className="py-4 px-6 text-[13px] font-medium text-gray-800">{student.name}</td>
                <td className="py-4 px-6">
                  <div className="relative w-[130px]">
                    <select 
                      value={student.status}
                      onChange={(e) => handleStatusChange(student.id, e.target.value)}
                      className={`appearance-none w-full bg-white border border-gray-200 py-2 pl-3 pr-8 rounded-lg text-[13px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm
                        ${student.status === 'Present' ? 'text-gray-700' : ''}
                        ${student.status === 'Absent' ? 'text-red-500' : ''}
                        ${student.status === 'Late' ? 'text-orange-500' : ''}
                      `}
                    >
                      <option value="Present" className="text-gray-700">Present</option>
                      <option value="Absent" className="text-red-500">Absent</option>
                      <option value="Late" className="text-orange-500">Late</option>
                    </select>
                    <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none size-4
                      ${student.status === 'Present' ? 'text-gray-400' : ''}
                      ${student.status === 'Absent' ? 'text-red-400' : ''}
                      ${student.status === 'Late' ? 'text-orange-400' : ''}
                    `} />
                  </div>
                </td>
                <td className="py-4 px-6">
                  <input 
                    type="text" 
                    value={student.remarks}
                    onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                    placeholder="Add remarks..."
                    className="w-full bg-transparent border-none text-[13px] text-gray-600 font-medium focus:outline-none focus:ring-0 placeholder:text-gray-300"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Action Bar */}
      <div className="p-4 md:p-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 bg-gray-50/30 rounded-b-2xl">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-[13px] md:text-[14px] font-semibold text-gray-600 w-full md:w-auto">
          <div>Total Present: <span className="text-[#0A6C54] ml-1">{totalPresent}</span></div>
          <div>Absent: <span className="text-red-500 ml-1">{totalAbsent}</span></div>
          <div>Late: <span className="text-orange-500 ml-1">{totalLate}</span></div>
        </div>
        <button className="w-full sm:w-auto bg-[#0A6C54] hover:bg-[#085a46] text-white px-8 py-2.5 rounded-lg text-[13px] font-semibold transition-colors shadow-sm">
          Save Attendance
        </button>
      </div>

    </div>
  );
};

export default Attendance;
