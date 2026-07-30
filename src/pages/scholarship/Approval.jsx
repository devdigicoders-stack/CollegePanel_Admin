import React, { useState } from 'react';
import { Search, Download, Check, X, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const initialCandidates = [
  { id: 1, name: 'Amit Sharma', enrollNo: 'OP/23/CS/001', scheme: 'Post-Matric Scholarship for OBC', status: 'Pending Coordinator Recommendation' },
  { id: 2, name: 'Vikram Patel', enrollNo: 'OP/23/ME/015', scheme: 'AICTE Pragati Scholarship', status: 'Recommended to Principal' },
];

const Approval = () => {
  const [candidates, setCandidates] = useState(initialCandidates);

  const handleRecommend = (id) => {
    setCandidates(candidates.map(c => c.id === id ? { ...c, status: 'Recommended to Principal' } : c));
    toast.success('Application files forwarded to Principal/Director for final approval!');
  };

  const handleReject = (id) => {
    setCandidates(candidates.map(c => c.id === id ? { ...c, status: 'Coordinator Rejected' } : c));
    toast.error('Application rejected by Coordinator.');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Coordinator Approval & Recommendations</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Recommend student applications to college principal/admin for final sanction approvals</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Enrollment No</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Target Scheme</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Current Phase status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.enrollNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">{item.scheme}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status.includes('Recommended') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6 flex gap-2">
                  {item.status.includes('Pending') && (
                    <>
                      <button onClick={() => handleRecommend(item.id)} className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors" title="Recommend File"><Check size={15} /></button>
                      <button onClick={() => handleReject(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors" title="Reject Application"><X size={15} /></button>
                    </>
                  )}
                  {item.status.includes('Recommended') && (
                    <span className="text-[12px] text-gray-400 italic">Recommended</span>
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

export default Approval;
