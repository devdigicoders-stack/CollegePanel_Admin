import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const Examinations = () => {
  const [activeTab, setActiveTab] = useState('Marks Entry');
  const [marksData, setMarksData] = useState([
    { id: 1, enrollNo: 'OP/23/CE/001', name: 'Aarav Singh', theory: '72', practical: '18', total: '90', grade: 'A', gradeColor: 'text-orange-500' },
    { id: 2, enrollNo: 'OP/23/CE/002', name: 'Neha Verma', theory: '68', practical: '17', total: '85', grade: 'A', gradeColor: 'text-orange-500' },
    { id: 3, enrollNo: 'OP/23/CE/003', name: 'Vikram Patel', theory: '55', practical: '16', total: '71', grade: 'B', gradeColor: 'text-orange-500' },
    { id: 4, enrollNo: 'OP/23/CE/004', name: 'Muskan Jain', theory: '48', practical: '15', total: '63', grade: 'B', gradeColor: 'text-orange-500' },
    { id: 5, enrollNo: 'OP/23/CE/005', name: 'Rohit Sharma', theory: '35', practical: '12', total: '47', grade: 'C', gradeColor: 'text-red-500' },
  ]);

  const handleInputChange = (id, field, value) => {
    setMarksData(marksData.map(student => {
      if (student.id === id) {
        const updatedStudent = { ...student, [field]: value };
        // Auto calculate total if theory and practical are numbers
        const theoryVal = parseInt(updatedStudent.theory) || 0;
        const practicalVal = parseInt(updatedStudent.practical) || 0;
        updatedStudent.total = (theoryVal + practicalVal).toString();
        
        // Auto calculate grade (just a simple example logic)
        const total = theoryVal + practicalVal;
        if (total >= 80) { updatedStudent.grade = 'A'; updatedStudent.gradeColor = 'text-orange-500'; }
        else if (total >= 60) { updatedStudent.grade = 'B'; updatedStudent.gradeColor = 'text-orange-500'; }
        else if (total >= 40) { updatedStudent.grade = 'C'; updatedStudent.gradeColor = 'text-red-500'; }
        else { updatedStudent.grade = 'F'; updatedStudent.gradeColor = 'text-red-600'; }
        
        return updatedStudent;
      }
      return student;
    }));
  };

  const tabs = ['Exams', 'Marks Entry', 'Result Approval', 'Revaluation'];

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Tabs */}
      <div className="flex overflow-x-auto px-4 md:px-6 border-b border-gray-100 pt-2 flex-shrink-0 custom-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 md:px-6 py-4 whitespace-nowrap text-[13px] md:text-[14px] font-semibold transition-colors relative ${
              activeTab === tab 
                ? 'text-[#0A6C54]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0A6C54] rounded-t-md"></div>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'Marks Entry' && (
        <>
          {/* Filters Top Row */}
          <div className="p-4 md:p-6 border-b border-gray-50 flex flex-col md:flex-row items-stretch md:items-end gap-4 md:gap-6 flex-shrink-0">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  Exam
                </label>
                <div className="relative">
                  <select className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm">
                    <option>Even Semester 2023-24</option>
                    <option>Odd Semester 2023-24</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  Course
                </label>
                <div className="relative">
                  <select className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm">
                    <option>Diploma in CE</option>
                    <option>Diploma in ME</option>
                    <option>Diploma in EE</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  Semester
                </label>
                <div className="relative">
                  <select className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm">
                    <option>4th Semester</option>
                    <option>2nd Semester</option>
                    <option>6th Semester</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  Subject
                </label>
                <div className="relative">
                  <select className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm">
                    <option>Data Structures</option>
                    <option>Database Management</option>
                    <option>Operating Systems</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

            </div>

            <button className="w-full md:w-auto bg-[#0A6C54] hover:bg-[#085a46] text-white px-8 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center transition-colors shadow-sm mb-[2px]">
              Load
            </button>
          </div>

          {/* Table Section */}
          <div className="flex-1 overflow-x-auto p-6 pt-2">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#F9FAFB] border-y border-gray-100">
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[5%] rounded-tl-xl">#</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[15%]">Enrollment No.</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[20%]">Name</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[15%] text-center">Theory (80)</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[15%] text-center">Practical (20)</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[15%] text-center">Total (100)</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[15%] text-center rounded-tr-xl">Grade</th>
                </tr>
              </thead>
              <tbody>
                {marksData.map((student) => (
                  <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-[13px] font-medium text-gray-600">{student.id}</td>
                    <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54] cursor-pointer hover:underline">{student.enrollNo}</td>
                    <td className="py-4 px-6 text-[13px] font-medium text-gray-800">{student.name}</td>
                    <td className="py-4 px-6 text-center">
                      <input 
                        type="text"
                        value={student.theory}
                        onChange={(e) => handleInputChange(student.id, 'theory', e.target.value)}
                        className="w-[70px] text-center border border-gray-200 rounded-md py-1.5 text-[13px] font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                      />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <input 
                        type="text"
                        value={student.practical}
                        onChange={(e) => handleInputChange(student.id, 'practical', e.target.value)}
                        className="w-[70px] text-center border border-gray-200 rounded-md py-1.5 text-[13px] font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                      />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <input 
                        type="text"
                        value={student.total}
                        readOnly
                        className="w-[70px] text-center border border-gray-200 rounded-md py-1.5 text-[13px] font-medium text-gray-800 bg-gray-50 cursor-not-allowed"
                      />
                    </td>
                    <td className={`py-4 px-6 text-[14px] font-bold text-center ${student.gradeColor}`}>
                      {student.grade}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Action Bar */}
          <div className="p-4 md:p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 rounded-b-2xl bg-gray-50/30">
            <button className="w-full sm:w-auto px-6 py-2.5 text-[13px] font-semibold text-white bg-[#0A6C54] hover:bg-[#085a46] rounded-lg transition-colors shadow-sm">
              Save Marks
            </button>
            <button className="w-full sm:w-auto px-6 py-2.5 text-[13px] font-semibold text-white bg-[#0A6C54] hover:bg-[#085a46] rounded-lg transition-colors shadow-sm">
              Publish Result
            </button>
          </div>
        </>
      )}
      
      {activeTab !== 'Marks Entry' && (
        <div className="flex-1 flex items-center justify-center text-gray-500 font-medium">
          {activeTab} module is under development.
        </div>
      )}

    </div>
  );
};

export default Examinations;
