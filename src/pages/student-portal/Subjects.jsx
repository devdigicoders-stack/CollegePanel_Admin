import React from 'react';
import { BookOpen, Award } from 'lucide-react';

const Subjects = () => {
  const subjectsList = [
    { code: 'CS-401', name: 'Advanced Computer Networks', credits: 4, faculty: 'Dr. R.S. Rawat', progress: 75 },
    { code: 'CS-402', name: 'Software Engineering Concepts', credits: 3, faculty: 'Er. Amit Sen', progress: 60 },
    { code: 'CS-403L', name: 'Web Technology Lab', credits: 2, faculty: 'Er. Preeti Roy', progress: 90 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[16px] font-bold text-gray-800">My Registered Subjects</h2>
        <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify course syllabus completion logs, reference credit parameters, and assigned faculties</p>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto max-w-3xl">
        {subjectsList.map((sub, idx) => (
          <div key={idx} className="p-5 border border-gray-100 rounded-xl space-y-4 shadow-sm bg-gray-50/30">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold font-mono text-[#0A6C54] bg-[#0A6C54]/5 px-2 py-0.5 rounded border border-[#0A6C54]/10">{sub.code}</span>
                <h4 className="font-bold text-gray-800 text-[14px] mt-2">{sub.name}</h4>
                <p className="text-[12px] text-gray-500 mt-0.5">Faculty: {sub.faculty}</p>
              </div>
              <span className="text-[12px] font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded">Credits: {sub.credits}</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-gray-500 font-semibold">
                <span>Syllabus Completion</span>
                <span>{sub.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-[#0A6C54] h-1.5 rounded-full" 
                  style={{ width: `${sub.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subjects;
