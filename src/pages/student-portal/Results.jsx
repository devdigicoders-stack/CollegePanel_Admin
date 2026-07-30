import React from 'react';
import { Download, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Results = () => {
  const grades = [
    { code: 'CS-301', subject: 'Database Management Systems', type: 'Theory', grade: 'A+', gp: 10 },
    { code: 'CS-302', subject: 'Object Oriented Programming', type: 'Theory', grade: 'A', gp: 9 },
    { code: 'CS-303L', subject: 'Data Structures Laboratory', type: 'Practical', grade: 'O', gp: 10 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">My Grade Card & Semester Results</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify internal marks, practical marks, overall SGPA results, and download marksheets</p>
        </div>
        <button onClick={() => toast.success('Marksheet PDF download triggered!')} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          <Download size={15} /> Download Marksheet
        </button>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50/50 border border-green-100 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">3rd Semester SGPA</span>
              <h4 className="text-[20px] font-bold text-green-700 mt-1">9.60 / 10.0</h4>
            </div>
            <div className="text-[11px] font-bold text-green-800 bg-green-100 px-2 py-1 rounded">PROMOTED</div>
          </div>

          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Cumulative CGPA</span>
              <h4 className="text-[20px] font-bold text-blue-700 mt-1">8.80 / 10.0</h4>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-gray-800 text-[14px]">3rd Semester Subject Grades</h3>
          {grades.map((item, idx) => (
            <div key={idx} className="p-4 border border-gray-100 rounded-xl flex items-center justify-between bg-gray-50/30 shadow-sm text-[13px]">
              <div>
                <span className="text-[11px] font-bold font-mono text-[#0A6C54] bg-[#0A6C54]/5 px-2 py-0.5 rounded border border-[#0A6C54]/10">{item.code}</span>
                <h4 className="font-bold text-gray-800 mt-2">{item.subject}</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Type: {item.type} | Grade Point: {item.gp}</p>
              </div>
              <span className="text-[16px] font-bold text-gray-900 bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center border border-gray-200">{item.grade}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Results;
