import React, { useState } from 'react';
import { FileText, Calendar, Plus, Upload, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const initialAssignments = [
  { id: 1, title: 'Network Architecture Analysis Report', subject: 'Advanced Computer Networks', deadline: '2024-02-20', status: 'Pending' },
  { id: 2, title: 'SRS Document Draft Submission', subject: 'Software Engineering Concepts', deadline: '2024-02-14', status: 'Submitted', grade: 'A', remarks: 'Good specification work' },
];

const Assignments = () => {
  const [assigns, setAssigns] = useState(initialAssignments);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleUpload = (id) => {
    setAssigns(assigns.map(a => a.id === id ? { ...a, status: 'Submitted', remarks: 'File verification pending' } : a));
    toast.success('Assignment PDF package uploaded successfully!');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[16px] font-bold text-gray-800">My Course Assignments</h2>
        <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Upload assignment sheets, check evaluation grades, and review faculty feedback</p>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto max-w-3xl">
        {assigns.map(item => (
          <div key={item.id} className="p-5 border border-gray-100 rounded-xl space-y-4 shadow-sm bg-gray-50/30">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-semibold text-gray-500">{item.subject}</span>
                <h4 className="font-bold text-gray-800 text-[14px] mt-1">{item.title}</h4>
                <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                  <Calendar size={13} /> Last Date: {item.deadline}
                </p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                item.status === 'Submitted' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
              }`}>
                {item.status}
              </span>
            </div>

            {item.status === 'Pending' ? (
              <div className="flex flex-col md:flex-row gap-3 pt-2">
                <input 
                  type="file" 
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="text-[12px] text-gray-500 border border-gray-200 p-2 rounded-lg bg-white flex-1"
                />
                <button onClick={() => handleUpload(item.id)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-4 py-2.5 rounded-lg text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors">
                  <Upload size={14} /> Submit File
                </button>
              </div>
            ) : (
              <div className="p-3 bg-white rounded-lg border border-gray-100 text-[12px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Evaluation Grade:</span>
                  <span className="font-bold text-green-700">{item.grade || 'Pending Grading'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Faculty Remarks:</span>
                  <span className="font-semibold text-gray-700">{item.remarks}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assignments;
