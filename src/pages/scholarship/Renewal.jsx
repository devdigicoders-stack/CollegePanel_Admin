import React, { useState } from 'react';
import { Search, Save, Check, X, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const initialRenewals = [
  { id: 1, name: 'Amit Sharma', enrollNo: 'OP/23/CS/001', scheme: 'Post-Matric Scholarship for OBC', prevCgpa: 8.2, attendance: 85, status: 'Pending Coordinator Check' },
  { id: 2, name: 'Vikram Patel', enrollNo: 'OP/23/ME/015', scheme: 'AICTE Pragati Scholarship', prevCgpa: 7.1, attendance: 78, status: 'Renewal Verified' },
];

const Renewal = () => {
  const [renewals, setRenewals] = useState(initialRenewals);

  const handleVerify = (id) => {
    setRenewals(renewals.map(r => r.id === id ? { ...r, status: 'Renewal Verified' } : r));
    toast.success('Renewal eligibility checked and verified!');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Scholarship Renewal Management</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify subsequent academic session CGPA criteria, promotion status, and attendance logs</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Enrollment No</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Renewal Scheme</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Previous CGPA</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Class Attendance</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Renewal Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {renewals.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.enrollNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">{item.scheme}</td>
                <td className="py-4 px-6 text-[13px] text-center font-bold text-gray-900">{item.prevCgpa}</td>
                <td className="py-4 px-6 text-[13px] text-center font-semibold text-gray-700">{item.attendance}%</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status.includes('Verified') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6 flex gap-2">
                  {item.status.includes('Pending') && (
                    <button onClick={() => handleVerify(item.id)} className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors" title="Verify Renewal Eligibility"><Check size={15} /></button>
                  )}
                  {item.status.includes('Verified') && (
                    <span className="text-[12px] text-gray-400 italic">Verified</span>
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

export default Renewal;
